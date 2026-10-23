-- =====================================================================
-- Painel SJU · Diárias & Viagens
-- =====================================================================
-- ATENÇÃO: os valores por nível e a divisão hospedagem/alimentação/
-- locomoção reproduzem a regra que já estava no front-end. Eles NÃO foram
-- validados contra a legislação vigente. Antes de uso oficial, a área
-- fazendária deve conferir e atualizar a tabela diarias_tabela (editável
-- pela administração, sem deploy).
-- O cálculo é feito no banco; o valor enviado pelo navegador é ignorado.
-- =====================================================================

create table public.diarias_tabela (
  nivel        text primary key check (nivel ~ '^[a-z_]{3,30}$'),
  rotulo       text not null,
  valor_dia    numeric(10, 2) not null check (valor_dia > 0),
  base_legal   text not null default 'A validar pela área fazendária',
  atualizado_em timestamptz not null default now()
);
create trigger diarias_tabela_atualizado_em before update on public.diarias_tabela
  for each row execute function public.tg_atualizado_em();
create trigger auditar_diarias_tabela after insert or update or delete on public.diarias_tabela
  for each row execute function public.tg_auditar('diaria_tabela');

alter table public.diarias_tabela enable row level security;
create policy diarias_tabela_ler on public.diarias_tabela for select to authenticated
  using (public.tem_permissao('diarias:ver'));
create policy diarias_tabela_admin on public.diarias_tabela for all to authenticated
  using (public.tem_permissao('admin:configurar')) with check (public.tem_permissao('admin:configurar'));

-- Cálculo oficial (o front deve chamar esta função para a prévia)
create or replace function public.calcular_diaria(p_nivel text, p_dias numeric, p_com_pernoite boolean)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare
  v_valor numeric(10, 2);
  v_total numeric(12, 2);
begin
  select valor_dia into v_valor from public.diarias_tabela where nivel = p_nivel;
  if v_valor is null then
    raise exception 'Nível de diária desconhecido: %.', p_nivel using errcode = 'P0001';
  end if;
  if p_dias is null or p_dias <= 0 or p_dias > 30 or (p_dias * 2) <> trunc(p_dias * 2) then
    raise exception 'Quantidade de dias inválida (use múltiplos de 0,5 entre 0,5 e 30).' using errcode = 'P0001';
  end if;
  v_total := round(v_valor * p_dias * case when p_com_pernoite then 1 else 0.5 end, 2);
  return jsonb_build_object(
    'valor_dia', v_valor,
    'valor_total', v_total,
    'parcela_hospedagem',  case when p_com_pernoite then round(v_total * 0.50, 2) else 0 end,
    'parcela_alimentacao', case when p_com_pernoite then round(v_total * 0.35, 2) else round(v_total * 0.70, 2) end,
    'parcela_locomocao',   case when p_com_pernoite then v_total - round(v_total * 0.50, 2) - round(v_total * 0.35, 2)
                                else v_total - round(v_total * 0.70, 2) end
  );
end $$;

create sequence public.diarias_protocolo_seq;

create table public.solicitacoes_diaria (
  id                   uuid primary key default gen_random_uuid(),
  protocolo            text not null unique default public.gerar_protocolo('DI', 'public.diarias_protocolo_seq'),
  servidor_id          uuid not null default auth.uid() references public.perfis(id),
  servidor_nome        text not null default '',
  nivel                text not null references public.diarias_tabela(nivel),
  destino              text not null check (length(trim(destino)) >= 2),
  regiao               text,
  distancia_km         integer check (distancia_km is null or distancia_km between 0 and 5000),
  data_ida             date not null,
  data_volta           date not null,
  dias                 numeric(4, 1) not null,
  com_pernoite         boolean not null default true,
  motivo               text not null check (length(trim(motivo)) >= 5),
  valor_dia            numeric(10, 2) not null default 0,
  valor_total          numeric(12, 2) not null default 0,
  parcela_hospedagem   numeric(12, 2) not null default 0,
  parcela_alimentacao  numeric(12, 2) not null default 0,
  parcela_locomocao    numeric(12, 2) not null default 0,
  status               text not null default 'pendente'
                       check (status in ('pendente', 'aprovada', 'reprovada', 'cancelada',
                                         'empenhada', 'prestacao_contas', 'encerrada')),
  motivo_decisao       text,
  decidido_por         uuid references public.perfis(id),
  decidido_em          timestamptz,
  criado_em            timestamptz not null default now(),
  atualizado_em        timestamptz not null default now(),
  constraint diarias_periodo_valido check (data_volta >= data_ida)
);
create index diarias_servidor_idx on public.solicitacoes_diaria(servidor_id, criado_em desc);
create index diarias_status_idx on public.solicitacoes_diaria(status);
create trigger diarias_atualizado_em before update on public.solicitacoes_diaria
  for each row execute function public.tg_atualizado_em();
create trigger auditar_diarias after insert or update on public.solicitacoes_diaria
  for each row execute function public.tg_auditar('diaria');

create or replace function public.tg_diarias_antes_inserir()
returns trigger language plpgsql security definer set search_path = public as $$
declare c jsonb;
begin
  if auth.uid() is not null then
    new.servidor_id := auth.uid();
  end if;
  select nome into new.servidor_nome from public.perfis where id = new.servidor_id;
  new.status := 'pendente'; new.decidido_por := null; new.decidido_em := null; new.motivo_decisao := null;
  if new.dias > (new.data_volta - new.data_ida + 1) then
    raise exception 'A quantidade de diárias (%) excede o período da viagem (% dia(s)).',
      new.dias, (new.data_volta - new.data_ida + 1) using errcode = 'P0001';
  end if;
  c := public.calcular_diaria(new.nivel, new.dias, new.com_pernoite);
  new.valor_dia := (c->>'valor_dia')::numeric;
  new.valor_total := (c->>'valor_total')::numeric;
  new.parcela_hospedagem := (c->>'parcela_hospedagem')::numeric;
  new.parcela_alimentacao := (c->>'parcela_alimentacao')::numeric;
  new.parcela_locomocao := (c->>'parcela_locomocao')::numeric;
  return new;
end $$;
create trigger diarias_antes_inserir before insert on public.solicitacoes_diaria
  for each row execute function public.tg_diarias_antes_inserir();

create or replace function public.tg_diarias_notificar_criacao()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notificar_quem_pode('diarias:aprovar',
    'Diária aguardando aprovação · ' || new.protocolo,
    new.servidor_nome || ' · ' || new.destino || ' · R$ ' || to_char(new.valor_total, 'FM999G999G990D00'),
    'acao_necessaria', '#/diarias/' || new.id, new.servidor_id);
  return new;
end $$;
create trigger diarias_notificar_criacao after insert on public.solicitacoes_diaria
  for each row execute function public.tg_diarias_notificar_criacao();

alter table public.solicitacoes_diaria enable row level security;
create policy diarias_ler on public.solicitacoes_diaria for select to authenticated
  using (servidor_id = auth.uid() or public.tem_permissao('diarias:aprovar') or public.tem_permissao('diarias:gerenciar'));
create policy diarias_inserir on public.solicitacoes_diaria for insert to authenticated
  with check (public.tem_permissao('diarias:solicitar') and servidor_id = auth.uid());
-- Sem UPDATE/DELETE direto: use as funções abaixo.

create or replace function public.decidir_diaria(p_id uuid, p_aprovar boolean, p_motivo text default null)
returns public.solicitacoes_diaria
language plpgsql security definer set search_path = public
as $$
declare d public.solicitacoes_diaria;
begin
  if not public.tem_permissao('diarias:aprovar') then
    raise exception 'Seu perfil não pode aprovar diárias.' using errcode = '42501';
  end if;
  select * into d from public.solicitacoes_diaria where id = p_id for update;
  if not found then
    raise exception 'Solicitação não encontrada.' using errcode = 'P0002';
  end if;
  if d.servidor_id = auth.uid() then
    raise exception 'Segregação de funções: você não pode aprovar a sua própria diária.' using errcode = '42501';
  end if;
  if d.status <> 'pendente' then
    raise exception 'Esta solicitação já foi decidida (%).', d.status using errcode = 'P0001';
  end if;
  if not p_aprovar and length(trim(coalesce(p_motivo, ''))) < 5 then
    raise exception 'Informe o motivo da reprovação (mínimo 5 caracteres).' using errcode = 'P0001';
  end if;
  update public.solicitacoes_diaria
     set status = case when p_aprovar then 'aprovada' else 'reprovada' end,
         motivo_decisao = nullif(trim(coalesce(p_motivo, '')), ''),
         decidido_por = auth.uid(), decidido_em = now()
   where id = p_id returning * into d;
  perform public.notificar(d.servidor_id,
    case when p_aprovar then 'Diária aprovada · ' else 'Diária reprovada · ' end || d.protocolo,
    case when p_aprovar then 'Sua diária para ' || d.destino || ' foi aprovada.'
         else 'Motivo: ' || d.motivo_decisao end,
    case when p_aprovar then 'aprovado' else 'reprovado' end, '#/diarias/' || d.id, true);
  return d;
end $$;

create or replace function public.cancelar_diaria(p_id uuid)
returns public.solicitacoes_diaria
language plpgsql security definer set search_path = public
as $$
declare d public.solicitacoes_diaria;
begin
  update public.solicitacoes_diaria set status = 'cancelada'
   where id = p_id and servidor_id = auth.uid() and status = 'pendente'
  returning * into d;
  if not found then
    raise exception 'Só é possível cancelar a própria solicitação enquanto pendente.' using errcode = 'P0001';
  end if;
  return d;
end $$;

-- Etapas financeiras: aprovada → empenhada → prestacao_contas → encerrada
create or replace function public.avancar_diaria(p_id uuid)
returns public.solicitacoes_diaria
language plpgsql security definer set search_path = public
as $$
declare d public.solicitacoes_diaria; v_prox text;
begin
  if not public.tem_permissao('diarias:gerenciar') then
    raise exception 'Seu perfil não pode movimentar etapas financeiras.' using errcode = '42501';
  end if;
  select * into d from public.solicitacoes_diaria where id = p_id for update;
  if not found then
    raise exception 'Solicitação não encontrada.' using errcode = 'P0002';
  end if;
  v_prox := case d.status when 'aprovada' then 'empenhada'
                          when 'empenhada' then 'prestacao_contas'
                          when 'prestacao_contas' then 'encerrada' end;
  if v_prox is null then
    raise exception 'Não há próxima etapa para o status %.', d.status using errcode = 'P0001';
  end if;
  update public.solicitacoes_diaria set status = v_prox where id = p_id returning * into d;
  return d;
end $$;
