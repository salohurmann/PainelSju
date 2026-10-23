-- =====================================================================
-- Painel SJU · Chamados (TI, Manutenção, Almoxarifado)
-- =====================================================================
-- * O prazo de SLA é calculado no banco a partir da tabela sla_prioridades
--   (editável pela administração), e não por um cronômetro no navegador.
-- * O solicitante vê os próprios chamados; a equipe de atendimento vê todos.
-- * Notas internas só aparecem para a equipe de atendimento.
-- =====================================================================

create table public.sla_prioridades (
  prioridade  text primary key check (prioridade in ('urgente', 'alta', 'media', 'baixa')),
  horas       integer not null check (horas between 1 and 24 * 60)
);
alter table public.sla_prioridades enable row level security;
create policy sla_ler on public.sla_prioridades for select to authenticated using (public.meu_perfil_ativo());
create policy sla_admin on public.sla_prioridades for all to authenticated
  using (public.tem_permissao('admin:configurar')) with check (public.tem_permissao('admin:configurar'));

create sequence public.chamados_protocolo_seq;

create table public.chamados (
  id                uuid primary key default gen_random_uuid(),
  protocolo         text not null unique default public.gerar_protocolo('CH', 'public.chamados_protocolo_seq'),
  tipo              text not null check (tipo in ('ti', 'manutencao', 'almoxarifado')),
  titulo            text not null check (length(trim(titulo)) between 3 and 160),
  descricao         text not null default '',
  solicitante_id    uuid not null default auth.uid() references public.perfis(id),
  solicitante_nome  text not null default '',
  setor_id          uuid references public.setores(id),
  prioridade        text not null default 'media' references public.sla_prioridades(prioridade),
  status            text not null default 'a_fazer'
                    check (status in ('a_fazer', 'em_andamento', 'concluido', 'cancelado')),
  tecnico_id        uuid references public.perfis(id),
  prazo_sla         timestamptz not null,
  solucao           text,
  aberto_em         timestamptz not null default now(),
  iniciado_em       timestamptz,
  concluido_em      timestamptz,
  atualizado_em     timestamptz not null default now()
);
create index chamados_status_idx on public.chamados(status, prazo_sla);
create index chamados_solicitante_idx on public.chamados(solicitante_id, aberto_em desc);
create index chamados_tecnico_idx on public.chamados(tecnico_id) where status in ('a_fazer', 'em_andamento');

create or replace function public.pode_atender_chamados()
returns boolean language sql stable security definer set search_path = public as $$
  select public.tem_permissao('chamados:atender') or public.tem_permissao('chamados:gerenciar');
$$;

create or replace function public.tg_chamados_antes_inserir()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_horas integer;
begin
  if auth.uid() is not null then
    new.solicitante_id := auth.uid();
  end if;
  select nome, setor_id into new.solicitante_nome, new.setor_id from public.perfis where id = new.solicitante_id;
  new.status := 'a_fazer';
  new.aberto_em := now();
  new.iniciado_em := null; new.concluido_em := null; new.solucao := null;
  if auth.uid() is not null and not public.pode_atender_chamados() then
    new.tecnico_id := null;
  end if;
  select horas into v_horas from public.sla_prioridades where prioridade = new.prioridade;
  new.prazo_sla := new.aberto_em + make_interval(hours => coalesce(v_horas, 72));
  return new;
end $$;
create trigger chamados_antes_inserir before insert on public.chamados
  for each row execute function public.tg_chamados_antes_inserir();

create or replace function public.tg_chamados_antes_atualizar()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_horas integer;
begin
  new.atualizado_em := now();
  -- campos que nunca mudam
  new.id := old.id; new.protocolo := old.protocolo; new.solicitante_id := old.solicitante_id;
  new.solicitante_nome := old.solicitante_nome; new.aberto_em := old.aberto_em; new.setor_id := old.setor_id;

  if auth.uid() is not null and not public.pode_atender_chamados() then
    -- Solicitante: só edita título/descrição ou cancela, enquanto está "a fazer"
    if old.status <> 'a_fazer' then
      raise exception 'O chamado já está em atendimento e não pode mais ser alterado pelo solicitante.' using errcode = '42501';
    end if;
    if new.status not in ('a_fazer', 'cancelado')
       or new.tecnico_id is distinct from old.tecnico_id
       or new.prioridade is distinct from old.prioridade
       or new.solucao is distinct from old.solucao
       or new.tipo is distinct from old.tipo then
      raise exception 'Você só pode editar o título e a descrição, ou cancelar o chamado.' using errcode = '42501';
    end if;
  end if;

  if new.prioridade is distinct from old.prioridade then
    select horas into v_horas from public.sla_prioridades where prioridade = new.prioridade;
    new.prazo_sla := old.aberto_em + make_interval(hours => coalesce(v_horas, 72));
  else
    new.prazo_sla := old.prazo_sla;
  end if;

  if new.status = 'em_andamento' and old.status = 'a_fazer' then
    new.iniciado_em := coalesce(old.iniciado_em, now());
    new.tecnico_id := coalesce(new.tecnico_id, auth.uid());
  end if;
  if new.status = 'concluido' and old.status <> 'concluido' then
    if length(trim(coalesce(new.solucao, ''))) < 5 then
      raise exception 'Descreva a solução antes de concluir o chamado.' using errcode = 'P0001';
    end if;
    new.concluido_em := now();
  elsif new.status <> 'concluido' then
    new.concluido_em := null;
  end if;
  if old.status in ('concluido', 'cancelado') and new.status <> old.status
     and not public.tem_permissao('chamados:gerenciar') then
    raise exception 'Somente a gestão pode reabrir um chamado encerrado.' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger chamados_antes_atualizar before update on public.chamados
  for each row execute function public.tg_chamados_antes_atualizar();

create or replace function public.tg_chamados_notificar()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    perform public.notificar_quem_pode('chamados:atender',
      'Novo chamado ' || new.protocolo || ' · ' || new.prioridade,
      new.solicitante_nome || ': ' || new.titulo,
      'acao_necessaria', '#/chamados/' || new.id, new.solicitante_id);
  elsif new.status is distinct from old.status and new.solicitante_id is distinct from auth.uid() then
    perform public.notificar(new.solicitante_id,
      'Chamado ' || new.protocolo || ': ' ||
        case new.status when 'em_andamento' then 'em atendimento'
                        when 'concluido' then 'concluído'
                        when 'cancelado' then 'cancelado'
                        else 'reaberto' end,
      coalesce(new.solucao, new.titulo), 'info', '#/chamados/' || new.id, new.status = 'concluido');
  end if;
  return new;
end $$;
create trigger chamados_notificar after insert or update on public.chamados
  for each row execute function public.tg_chamados_notificar();
create trigger auditar_chamados after insert or update on public.chamados
  for each row execute function public.tg_auditar('chamado');

alter table public.chamados enable row level security;
create policy chamados_ler on public.chamados for select to authenticated
  using (solicitante_id = auth.uid() or public.pode_atender_chamados());
create policy chamados_inserir on public.chamados for insert to authenticated
  with check (public.tem_permissao('chamados:abrir') and solicitante_id = auth.uid());
create policy chamados_atualizar on public.chamados for update to authenticated
  using (solicitante_id = auth.uid() or public.pode_atender_chamados())
  with check (solicitante_id = auth.uid() or public.pode_atender_chamados());

-- ---------------------------------------------------------------------
-- Notas / pareceres técnicos
-- ---------------------------------------------------------------------
create table public.chamado_notas (
  id          uuid primary key default gen_random_uuid(),
  chamado_id  uuid not null references public.chamados(id) on delete cascade,
  autor_id    uuid not null default auth.uid() references public.perfis(id),
  autor_nome  text not null default '',
  texto       text not null check (length(trim(texto)) between 1 and 4000),
  interna     boolean not null default false,
  criado_em   timestamptz not null default now()
);
create index chamado_notas_chamado_idx on public.chamado_notas(chamado_id, criado_em);

create or replace function public.pode_ver_chamado(p_chamado uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.chamados c
                 where c.id = p_chamado
                   and (c.solicitante_id = auth.uid() or public.pode_atender_chamados()));
$$;

create or replace function public.tg_chamado_notas_antes_inserir()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null then new.autor_id := auth.uid(); end if;
  select nome into new.autor_nome from public.perfis where id = new.autor_id;
  new.criado_em := now();
  return new;
end $$;
create trigger chamado_notas_antes_inserir before insert on public.chamado_notas
  for each row execute function public.tg_chamado_notas_antes_inserir();

alter table public.chamado_notas enable row level security;
create policy chamado_notas_ler on public.chamado_notas for select to authenticated
  using (public.pode_ver_chamado(chamado_id) and (not interna or public.pode_atender_chamados()));
create policy chamado_notas_inserir on public.chamado_notas for insert to authenticated
  with check (public.pode_ver_chamado(chamado_id) and (not interna or public.pode_atender_chamados()));
-- Notas não são editadas nem apagadas (histórico do atendimento).
