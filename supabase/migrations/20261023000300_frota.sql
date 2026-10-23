-- =====================================================================
-- Painel SJU · Frotas & Viaturas
-- =====================================================================
-- Fluxo: solicitar → (aprovar | reprovar | cancelar) → vistoria de saída
--        → vistoria de retorno.
-- Regras aplicadas no banco:
--   * Ninguém aprova a própria solicitação (segregação de funções).
--   * Um veículo não pode ter duas reservas sobrepostas (mesma data e
--     período), nem estar em manutenção/inativo.
--   * Mudanças de status só acontecem pelas funções deste arquivo
--     (não há UPDATE direto em agendamentos).
--   * Vistoria exige as 4 fotos e quilometragem que não diminui.
-- =====================================================================

-- Protocolos legíveis (ex.: AG-2026-000123)
create or replace function public.gerar_protocolo(p_prefixo text, p_seq regclass)
returns text language sql volatile security definer set search_path = public as $$
  select p_prefixo || '-' || to_char(now() at time zone 'America/Sao_Paulo', 'YYYY') || '-' ||
         lpad(nextval(p_seq)::text, 6, '0');
$$;

-- ---------------------------------------------------------------------
-- Veículos
-- ---------------------------------------------------------------------
create table public.veiculos (
  id                 uuid primary key default gen_random_uuid(),
  modelo             text not null check (length(trim(modelo)) > 0),
  placa              text not null unique check (placa ~ '^[A-Z]{3}-?[0-9][A-Z0-9][0-9]{2}$'),
  cor                text not null default '',
  capacidade         integer not null check (capacidade between 1 and 60),
  ano                integer check (ano between 1980 and 2100),
  status             text not null default 'disponivel'
                     check (status in ('disponivel', 'em_missao', 'manutencao', 'inativo')),
  km_atual           integer not null default 0 check (km_atual >= 0),
  nivel_combustivel  integer not null default 100 check (nivel_combustivel between 0 and 100),
  criado_em          timestamptz not null default now(),
  atualizado_em      timestamptz not null default now()
);
create trigger veiculos_atualizado_em before update on public.veiculos
  for each row execute function public.tg_atualizado_em();
create trigger auditar_veiculos after insert or update or delete on public.veiculos
  for each row execute function public.tg_auditar('veiculo');

alter table public.veiculos enable row level security;
create policy veiculos_ler on public.veiculos for select to authenticated
  using (public.tem_permissao('frotas:ver'));
create policy veiculos_inserir on public.veiculos for insert to authenticated
  with check (public.tem_permissao('frotas:gerenciar'));
create policy veiculos_atualizar on public.veiculos for update to authenticated
  using (public.tem_permissao('frotas:gerenciar')) with check (public.tem_permissao('frotas:gerenciar'));
-- Sem DELETE: veículo sai de uso com status 'inativo' (preserva histórico).

-- ---------------------------------------------------------------------
-- Agendamentos (solicitações de veículo)
-- ---------------------------------------------------------------------
create sequence public.agendamentos_protocolo_seq;

create table public.agendamentos (
  id                uuid primary key default gen_random_uuid(),
  protocolo         text not null unique default public.gerar_protocolo('AG', 'public.agendamentos_protocolo_seq'),
  solicitante_id    uuid not null default auth.uid() references public.perfis(id),
  solicitante_nome  text not null default '',
  telefone          text,
  email             text,
  veiculo_id        uuid not null references public.veiculos(id),
  datas             date[] not null check (cardinality(datas) between 1 and 31),
  periodo           text not null check (periodo in ('manha', 'tarde', 'dia_todo')),
  modalidade        text not null check (modalidade in ('com_motorista', 'sem_motorista')),
  destino           text not null check (length(trim(destino)) >= 3),
  passageiros       text,
  status            text not null default 'pendente'
                    check (status in ('pendente', 'aprovado', 'reprovado', 'cancelado',
                                      'em_andamento', 'realizado', 'nao_compareceu')),
  motivo_decisao    text,
  decidido_por      uuid references public.perfis(id),
  decidido_em       timestamptz,
  criado_em         timestamptz not null default now(),
  atualizado_em     timestamptz not null default now()
);
create index agendamentos_solicitante_idx on public.agendamentos(solicitante_id, criado_em desc);
create index agendamentos_veiculo_idx on public.agendamentos(veiculo_id) where status in ('pendente', 'aprovado', 'em_andamento');
create index agendamentos_status_idx on public.agendamentos(status);
create index agendamentos_datas_idx on public.agendamentos using gin (datas);

create trigger agendamentos_atualizado_em before update on public.agendamentos
  for each row execute function public.tg_atualizado_em();
create trigger auditar_agendamentos after insert or update on public.agendamentos
  for each row execute function public.tg_auditar('agendamento');

-- Conflito de veículo (mesma data e período sobreposto)
create or replace function public.veiculo_conflita(
  p_veiculo uuid, p_datas date[], p_periodo text, p_excluir uuid default null
) returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.agendamentos a
    where a.veiculo_id = p_veiculo
      and a.id is distinct from p_excluir
      and a.status in ('pendente', 'aprovado', 'em_andamento')
      and a.datas && p_datas
      and (a.periodo = 'dia_todo' or p_periodo = 'dia_todo' or a.periodo = p_periodo)
  );
$$;

-- Veículos livres para datas/período (o front usa no formulário)
create or replace function public.veiculos_disponiveis(p_datas date[], p_periodo text)
returns setof public.veiculos
language sql stable security definer set search_path = public
as $$
  select v.* from public.veiculos v
  where public.tem_permissao('frotas:ver')
    and v.status in ('disponivel', 'em_missao')
    and not public.veiculo_conflita(v.id, p_datas, p_periodo)
  order by v.modelo;
$$;

create or replace function public.tg_agendamentos_validar_insercao()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_perfil public.perfis;
  v_veic   public.veiculos;
  v_hoje   date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  if auth.uid() is not null then
    new.solicitante_id := auth.uid();
  end if;
  new.status := 'pendente';
  new.decidido_por := null; new.decidido_em := null; new.motivo_decisao := null;

  select * into v_perfil from public.perfis where id = new.solicitante_id;
  new.solicitante_nome := v_perfil.nome;
  new.email := coalesce(nullif(new.email, ''), v_perfil.email);
  new.telefone := coalesce(nullif(new.telefone, ''), v_perfil.telefone);

  -- Datas: sem duplicatas, ordenadas, nenhuma no passado
  new.datas := array(select distinct d from unnest(new.datas) d order by d);
  if auth.uid() is not null and new.datas[1] < v_hoje then
    raise exception 'Não é possível solicitar veículo para data passada.' using errcode = 'P0001';
  end if;

  -- Trava o veículo para evitar corrida entre duas solicitações simultâneas
  select * into v_veic from public.veiculos where id = new.veiculo_id for update;
  if not found then
    raise exception 'Veículo não encontrado.' using errcode = 'P0001';
  end if;
  if v_veic.status in ('manutencao', 'inativo') then
    raise exception 'O veículo % está indisponível (%).', v_veic.placa, v_veic.status using errcode = 'P0001';
  end if;
  if public.veiculo_conflita(new.veiculo_id, new.datas, new.periodo) then
    raise exception 'O veículo % já está reservado em uma das datas e período escolhidos.', v_veic.placa
      using errcode = '23P01';
  end if;
  return new;
end $$;
create trigger agendamentos_validar_insercao before insert on public.agendamentos
  for each row execute function public.tg_agendamentos_validar_insercao();

create or replace function public.tg_agendamentos_notificar_criacao()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notificar_quem_pode(
    'frotas:aprovar',
    'Nova solicitação de veículo · ' || new.protocolo,
    new.solicitante_nome || ' solicitou veículo para ' || new.destino || '.',
    'acao_necessaria', '#/frota/aprovacoes/' || new.id, new.solicitante_id);
  return new;
end $$;
create trigger agendamentos_notificar_criacao after insert on public.agendamentos
  for each row execute function public.tg_agendamentos_notificar_criacao();

alter table public.agendamentos enable row level security;
create policy agendamentos_ler on public.agendamentos for select to authenticated
  using (
    solicitante_id = auth.uid()
    or public.tem_permissao('frotas:aprovar')
    or public.tem_permissao('frotas:vistoria')
    or public.tem_permissao('frotas:gerenciar')
  );
create policy agendamentos_inserir on public.agendamentos for insert to authenticated
  with check (public.tem_permissao('frotas:solicitar') and solicitante_id = auth.uid());
-- Sem UPDATE/DELETE direto: use as funções abaixo.

-- ---------------------------------------------------------------------
-- Decisão da chefia (aprovar / reprovar) com segregação de funções
-- ---------------------------------------------------------------------
create or replace function public.decidir_agendamento(p_id uuid, p_aprovar boolean, p_motivo text default null)
returns public.agendamentos
language plpgsql security definer set search_path = public
as $$
declare
  a public.agendamentos;
begin
  if not public.tem_permissao('frotas:aprovar') then
    raise exception 'Seu perfil não pode decidir solicitações de veículo.' using errcode = '42501';
  end if;
  select * into a from public.agendamentos where id = p_id for update;
  if not found then
    raise exception 'Solicitação não encontrada.' using errcode = 'P0002';
  end if;
  if a.solicitante_id = auth.uid() then
    raise exception 'Segregação de funções: você não pode decidir a sua própria solicitação.' using errcode = '42501';
  end if;
  if a.status <> 'pendente' then
    raise exception 'Esta solicitação já foi decidida (%).', a.status using errcode = 'P0001';
  end if;
  if not p_aprovar and length(trim(coalesce(p_motivo, ''))) < 5 then
    raise exception 'Informe o motivo da reprovação (mínimo 5 caracteres).' using errcode = 'P0001';
  end if;

  update public.agendamentos
     set status = case when p_aprovar then 'aprovado' else 'reprovado' end,
         motivo_decisao = nullif(trim(coalesce(p_motivo, '')), ''),
         decidido_por = auth.uid(),
         decidido_em = now()
   where id = p_id
  returning * into a;

  perform public.notificar(
    a.solicitante_id,
    case when p_aprovar then 'Solicitação aprovada · ' else 'Solicitação reprovada · ' end || a.protocolo,
    case when p_aprovar
         then 'Sua solicitação para ' || a.destino || ' foi aprovada. Compareça à Central de Transporte com CNH válida para a vistoria de saída.'
         else 'Sua solicitação para ' || a.destino || ' foi reprovada. Motivo: ' || a.motivo_decisao end,
    case when p_aprovar then 'aprovado' else 'reprovado' end,
    '#/frota/historico/' || a.id, true);
  return a;
end $$;

create or replace function public.cancelar_agendamento(p_id uuid, p_motivo text default null)
returns public.agendamentos
language plpgsql security definer set search_path = public
as $$
declare a public.agendamentos;
begin
  select * into a from public.agendamentos where id = p_id for update;
  if not found then
    raise exception 'Solicitação não encontrada.' using errcode = 'P0002';
  end if;
  if a.solicitante_id <> auth.uid() and not public.tem_permissao('frotas:gerenciar') then
    raise exception 'Só o solicitante ou a gestão de frota pode cancelar.' using errcode = '42501';
  end if;
  if a.status not in ('pendente', 'aprovado') then
    raise exception 'Não é possível cancelar uma solicitação com status %.', a.status using errcode = 'P0001';
  end if;
  update public.agendamentos
     set status = 'cancelado', motivo_decisao = nullif(trim(coalesce(p_motivo, '')), '')
   where id = p_id returning * into a;
  return a;
end $$;

create or replace function public.marcar_nao_comparecimento(p_id uuid)
returns public.agendamentos
language plpgsql security definer set search_path = public
as $$
declare a public.agendamentos;
begin
  if not public.tem_permissao('frotas:vistoria') then
    raise exception 'Sem permissão.' using errcode = '42501';
  end if;
  update public.agendamentos set status = 'nao_compareceu'
   where id = p_id and status = 'aprovado' returning * into a;
  if not found then
    raise exception 'Só solicitações aprovadas podem ser marcadas como não comparecimento.' using errcode = 'P0001';
  end if;
  return a;
end $$;

-- ---------------------------------------------------------------------
-- Vistorias (saída e retorno)
-- ---------------------------------------------------------------------
create table public.vistorias (
  id                 uuid primary key default gen_random_uuid(),
  agendamento_id     uuid not null references public.agendamentos(id),
  veiculo_id         uuid not null references public.veiculos(id),
  tipo               text not null check (tipo in ('saida', 'retorno')),
  km                 integer not null check (km >= 0),
  nivel_combustivel  integer not null check (nivel_combustivel between 0 and 100),
  -- Caminhos no bucket "vistorias": {frente, traseira, lateral_direita, lateral_esquerda}
  fotos              jsonb not null,
  observacoes        text,
  vistoriador_id     uuid not null default auth.uid() references public.perfis(id),
  criado_em          timestamptz not null default now(),
  unique (agendamento_id, tipo),
  constraint vistorias_quatro_fotos check (
    fotos ?& array['frente', 'traseira', 'lateral_direita', 'lateral_esquerda']
    and length(coalesce(fotos->>'frente', '')) > 0
    and length(coalesce(fotos->>'traseira', '')) > 0
    and length(coalesce(fotos->>'lateral_direita', '')) > 0
    and length(coalesce(fotos->>'lateral_esquerda', '')) > 0
  )
);
create trigger auditar_vistorias after insert on public.vistorias
  for each row execute function public.tg_auditar('vistoria');

alter table public.vistorias enable row level security;
create policy vistorias_ler on public.vistorias for select to authenticated
  using (
    public.tem_permissao('frotas:vistoria') or public.tem_permissao('frotas:gerenciar')
    or exists (select 1 from public.agendamentos a where a.id = agendamento_id and a.solicitante_id = auth.uid())
  );
-- Sem escrita direta: use registrar_vistoria().

create or replace function public.registrar_vistoria(
  p_agendamento uuid, p_tipo text, p_km integer, p_nivel_combustivel integer,
  p_fotos jsonb, p_observacoes text default null
) returns public.vistorias
language plpgsql security definer set search_path = public
as $$
declare
  a public.agendamentos;
  v public.veiculos;
  s public.vistorias;
  r public.vistorias;
begin
  if not public.tem_permissao('frotas:vistoria') then
    raise exception 'Seu perfil não pode registrar vistorias.' using errcode = '42501';
  end if;
  select * into a from public.agendamentos where id = p_agendamento for update;
  if not found then
    raise exception 'Solicitação não encontrada.' using errcode = 'P0002';
  end if;
  select * into v from public.veiculos where id = a.veiculo_id for update;

  if p_tipo = 'saida' then
    if a.status <> 'aprovado' then
      raise exception 'A vistoria de saída exige solicitação aprovada (status atual: %).', a.status using errcode = 'P0001';
    end if;
    if p_km < v.km_atual then
      raise exception 'Quilometragem informada (%) menor que a registrada no veículo (%).', p_km, v.km_atual using errcode = 'P0001';
    end if;
  elsif p_tipo = 'retorno' then
    if a.status <> 'em_andamento' then
      raise exception 'A vistoria de retorno exige vistoria de saída registrada.' using errcode = 'P0001';
    end if;
    select * into s from public.vistorias where agendamento_id = a.id and tipo = 'saida';
    if p_km < s.km then
      raise exception 'Quilometragem de retorno (%) menor que a de saída (%).', p_km, s.km using errcode = 'P0001';
    end if;
  else
    raise exception 'Tipo de vistoria inválido: %.', p_tipo using errcode = '22023';
  end if;

  insert into public.vistorias (agendamento_id, veiculo_id, tipo, km, nivel_combustivel, fotos, observacoes, vistoriador_id)
  values (a.id, a.veiculo_id, p_tipo, p_km, p_nivel_combustivel, p_fotos, nullif(trim(coalesce(p_observacoes, '')), ''), auth.uid())
  returning * into r;

  update public.agendamentos
     set status = case when p_tipo = 'saida' then 'em_andamento' else 'realizado' end
   where id = a.id;

  update public.veiculos
     set km_atual = p_km,
         nivel_combustivel = p_nivel_combustivel,
         status = case when p_tipo = 'saida' then 'em_missao'
                       when status = 'em_missao' then 'disponivel' else status end
   where id = a.veiculo_id;

  return r;
end $$;
