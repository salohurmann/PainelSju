-- =====================================================================
-- Painel SJU · Votação de entidades (integração do projeto salohurmann/votacao)
-- =====================================================================
-- Mesmas regras do projeto original (Next.js + Prisma), agora no banco:
-- * Cada entidade tem um login no Painel (perfil ligado à entidade).
-- * A eleição tem abertura, encerramento e "votos por entidade" (N).
-- * A entidade vota uma única vez, em exatamente N candidatas diferentes,
--   podendo incluir a si mesma (no máximo uma vez, pela própria regra de
--   não repetir candidata).
-- * Só entidades ativas e habilitadas votam; só ativas e habilitadas
--   a candidatar entram como candidatas.
-- * Votam as entidades ativas e habilitadas (como no original, não precisa ser candidata).
-- * Resultado: gestão vê a qualquer momento; as demais pessoas só depois
--   do encerramento. Ninguém lê os votos individuais pela API.
-- * O módulo "votacao" fica restrito ao setor UTSC (modulo_setores, no seed).
-- =====================================================================

create table public.vot_entidades (
  id                  uuid primary key default gen_random_uuid(),
  nome                text not null check (length(trim(nome)) >= 2),
  responsavel         text not null default '',
  perfil_id           uuid unique references public.perfis(id) on delete set null, -- login da entidade
  ativa               boolean not null default true,
  pode_votar          boolean not null default true,
  pode_ser_candidata  boolean not null default true,
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now()
);
create trigger vot_entidades_atualizado_em before update on public.vot_entidades
  for each row execute function public.tg_atualizado_em();
create trigger auditar_vot_entidades after insert or update or delete on public.vot_entidades
  for each row execute function public.tg_auditar('vot_entidade');

create table public.vot_eleicoes (
  id                  uuid primary key default gen_random_uuid(),
  titulo              text not null check (length(trim(titulo)) >= 3),
  abre_em             timestamptz not null,
  fecha_em            timestamptz not null,
  votos_por_entidade  integer not null default 3 check (votos_por_entidade between 1 and 50),
  criado_por          uuid default auth.uid() references public.perfis(id),
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now(),
  constraint vot_eleicoes_periodo check (fecha_em > abre_em)
);
create index vot_eleicoes_periodo_idx on public.vot_eleicoes(abre_em, fecha_em);
create trigger vot_eleicoes_atualizado_em before update on public.vot_eleicoes
  for each row execute function public.tg_atualizado_em();
create trigger auditar_vot_eleicoes after insert or update or delete on public.vot_eleicoes
  for each row execute function public.tg_auditar('vot_eleicao');

create table public.vot_candidaturas (
  eleicao_id   uuid not null references public.vot_eleicoes(id) on delete cascade,
  entidade_id  uuid not null references public.vot_entidades(id) on delete cascade,
  criado_em    timestamptz not null default now(),
  primary key (eleicao_id, entidade_id)
);

create table public.vot_votos (
  id            uuid primary key default gen_random_uuid(),
  eleicao_id    uuid not null references public.vot_eleicoes(id) on delete cascade,
  eleitora_id   uuid not null references public.vot_entidades(id) on delete cascade,
  candidata_id  uuid not null references public.vot_entidades(id) on delete cascade,
  criado_em     timestamptz not null default now(),
  unique (eleicao_id, eleitora_id, candidata_id)
);
create index vot_votos_eleicao_idx on public.vot_votos(eleicao_id, candidata_id);

-- Situação calculada pelo relógio do banco (igual a getElectionStatus do original)
create or replace function public.vot_situacao(p_abre timestamptz, p_fecha timestamptz)
returns text language sql stable as $$
  select case when now() < p_abre then 'agendada' when now() <= p_fecha then 'aberta' else 'encerrada' end;
$$;

create or replace function public.vot_minha_entidade()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.vot_entidades where perfil_id = auth.uid();
$$;

-- Eleição não pode mudar depois de receber votos (protege o resultado).
create or replace function public.tg_vot_eleicoes_protecao()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.vot_votos where eleicao_id = old.id) then
    if TG_OP = 'DELETE' then
      raise exception 'Esta eleição já recebeu votos e não pode ser apagada.' using errcode = 'P0001';
    end if;
    if new.votos_por_entidade <> old.votos_por_entidade or new.abre_em <> old.abre_em then
      raise exception 'Esta eleição já recebeu votos: só dá para mudar o título ou adiar o encerramento.' using errcode = 'P0001';
    end if;
    if new.fecha_em < old.fecha_em then
      raise exception 'Esta eleição já recebeu votos: o encerramento só pode ser adiado.' using errcode = 'P0001';
    end if;
  end if;
  return case when TG_OP = 'DELETE' then old else new end;
end $$;
create trigger vot_eleicoes_protecao before update or delete on public.vot_eleicoes
  for each row execute function public.tg_vot_eleicoes_protecao();

create or replace function public.tg_vot_candidaturas_protecao()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_eleicao uuid := coalesce(new.eleicao_id, old.eleicao_id);
begin
  if exists (select 1 from public.vot_votos where eleicao_id = v_eleicao) then
    raise exception 'Esta eleição já recebeu votos: as candidatas não podem mudar.' using errcode = 'P0001';
  end if;
  if TG_OP = 'INSERT' and not exists (
    select 1 from public.vot_entidades where id = new.entidade_id and ativa and pode_ser_candidata
  ) then
    raise exception 'Só entidades ativas e habilitadas podem ser candidatas.' using errcode = 'P0001';
  end if;
  return case when TG_OP = 'DELETE' then old else new end;
end $$;
create trigger vot_candidaturas_protecao before insert or delete on public.vot_candidaturas
  for each row execute function public.tg_vot_candidaturas_protecao();

-- ---------------------------------------------------------------------
-- Votar: tudo validado no banco, numa transação só.
-- ---------------------------------------------------------------------
create or replace function public.vot_votar(p_eleicao uuid, p_candidatas uuid[])
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_eleitora public.vot_entidades;
  e public.vot_eleicoes;
  v_n int := coalesce(array_length(p_candidatas, 1), 0);
begin
  if not public.tem_permissao('votacao:votar') then
    raise exception 'Seu perfil não vota nesta seção.' using errcode = '42501';
  end if;
  select * into v_eleitora from public.vot_entidades where perfil_id = auth.uid();
  if not found then
    raise exception 'Seu login não está ligado a uma entidade.' using errcode = '42501';
  end if;
  if not v_eleitora.ativa or not v_eleitora.pode_votar then
    raise exception 'Sua entidade não está habilitada para votar.' using errcode = '42501';
  end if;

  select * into e from public.vot_eleicoes where id = p_eleicao for share;
  if not found then
    raise exception 'Eleição não encontrada.' using errcode = 'P0002';
  end if;
  if public.vot_situacao(e.abre_em, e.fecha_em) <> 'aberta' then
    raise exception 'Esta eleição não está aberta para votação.' using errcode = 'P0001';
  end if;

  -- trava por entidade+eleição para dois cliques simultâneos não passarem juntos
  perform pg_advisory_xact_lock(hashtextextended(p_eleicao::text || v_eleitora.id::text, 0));
  if exists (select 1 from public.vot_votos where eleicao_id = e.id and eleitora_id = v_eleitora.id) then
    raise exception 'Sua entidade já votou nesta eleição.' using errcode = 'P0001';
  end if;

  if v_n <> e.votos_por_entidade then
    raise exception 'Escolha exatamente % candidata(s).', e.votos_por_entidade using errcode = 'P0001';
  end if;
  if (select count(distinct c) from unnest(p_candidatas) c) <> v_n then
    raise exception 'Não é permitido votar mais de uma vez na mesma entidade.' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from unnest(p_candidatas) c
    where not exists (
      select 1 from public.vot_candidaturas vc
      join public.vot_entidades en on en.id = vc.entidade_id
      where vc.eleicao_id = e.id and vc.entidade_id = c and en.ativa and en.pode_ser_candidata
    )
  ) then
    raise exception 'Há uma candidata inválida na sua escolha.' using errcode = 'P0001';
  end if;

  insert into public.vot_votos (eleicao_id, eleitora_id, candidata_id)
  select e.id, v_eleitora.id, c from unnest(p_candidatas) c;

  perform public.registrar_auditoria('VOTO_REGISTRADO', 'vot_eleicao', e.id::text,
    jsonb_build_object('entidade', v_eleitora.nome, 'votos', v_n));
end $$;

-- ---------------------------------------------------------------------
-- Lista de eleições para quem está logado (com "já votou").
-- ---------------------------------------------------------------------
create or replace function public.vot_eleicoes_visiveis()
returns table (
  id uuid, titulo text, abre_em timestamptz, fecha_em timestamptz, votos_por_entidade int,
  situacao text, ja_votou boolean, total_candidatas int, total_aptas int, total_eleitoras_votaram int, candidatas jsonb
)
language sql stable security definer set search_path = public
as $$
  select e.id, e.titulo, e.abre_em, e.fecha_em, e.votos_por_entidade,
         public.vot_situacao(e.abre_em, e.fecha_em),
         exists (select 1 from public.vot_votos v where v.eleicao_id = e.id and v.eleitora_id = public.vot_minha_entidade()),
         (select count(*)::int from public.vot_candidaturas c where c.eleicao_id = e.id),
         (select count(*)::int from public.vot_entidades en where en.ativa and en.pode_votar),
         (select count(distinct v.eleitora_id)::int from public.vot_votos v where v.eleicao_id = e.id),
         coalesce((select jsonb_agg(jsonb_build_object('id', en.id, 'nome', en.nome) order by en.nome)
                   from public.vot_candidaturas c join public.vot_entidades en on en.id = c.entidade_id
                   where c.eleicao_id = e.id and en.ativa and en.pode_ser_candidata), '[]'::jsonb)
  from public.vot_eleicoes e
  where public.tem_permissao('votacao:ver') or public.tem_permissao('votacao:votar') or public.tem_permissao('votacao:gerenciar')
  order by e.abre_em desc;
$$;

-- ---------------------------------------------------------------------
-- Resultado: só contagens. Gestão vê sempre; demais só após encerrar.
-- ---------------------------------------------------------------------
create or replace function public.vot_resultado(p_eleicao uuid)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare e public.vot_eleicoes; v_sit text; v_total int; v_votaram int;
begin
  select * into e from public.vot_eleicoes where id = p_eleicao;
  if not found then
    raise exception 'Eleição não encontrada.' using errcode = 'P0002';
  end if;
  v_sit := public.vot_situacao(e.abre_em, e.fecha_em);
  if not public.tem_permissao('votacao:gerenciar') then
    if not (public.tem_permissao('votacao:ver') or public.tem_permissao('votacao:votar')) then
      raise exception 'Sem acesso à votação.' using errcode = '42501';
    end if;
    if v_sit <> 'encerrada' then
      raise exception 'O resultado sai quando a eleição encerrar.' using errcode = '42501';
    end if;
  end if;
  -- participação: entidades que votaram / entidades aptas a votar (ativas e habilitadas)
  select count(*) into v_total from public.vot_entidades where ativa and pode_votar;
  select count(distinct eleitora_id) into v_votaram from public.vot_votos where eleicao_id = e.id;
  return jsonb_build_object(
    'eleicao', jsonb_build_object('id', e.id, 'titulo', e.titulo, 'abre_em', e.abre_em, 'fecha_em', e.fecha_em,
                                  'votos_por_entidade', e.votos_por_entidade, 'situacao', v_sit),
    'total_entidades', v_total,
    'total_votaram', v_votaram,
    'participacao', case when v_total > 0 then round(v_votaram * 100.0 / v_total, 1) else 0 end,
    'candidatas', coalesce((
      select jsonb_agg(jsonb_build_object('id', en.id, 'nome', en.nome, 'votos', coalesce(q.n, 0)) order by coalesce(q.n, 0) desc, en.nome)
      from public.vot_candidaturas c
      join public.vot_entidades en on en.id = c.entidade_id
      left join (select candidata_id, count(*) n from public.vot_votos where eleicao_id = e.id group by candidata_id) q on q.candidata_id = en.id
      where c.eleicao_id = e.id), '[]'::jsonb)
  );
end $$;

-- Logins que a gestão pode ligar a uma entidade (papel "entidade votante").
create or replace function public.vot_logins_disponiveis()
returns table (id uuid, nome text, email text)
language sql stable security definer set search_path = public
as $$
  select p.id, p.nome, p.email from public.perfis p
  where public.tem_permissao('votacao:gerenciar') and p.ativo and p.papel_id = 'entidade_votante'
  order by p.nome;
$$;

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table public.vot_entidades enable row level security;
create policy vot_entidades_ler on public.vot_entidades for select to authenticated
  using (public.tem_permissao('votacao:gerenciar') or perfil_id = auth.uid()
         or ((public.tem_permissao('votacao:ver') or public.tem_permissao('votacao:votar')) and ativa));
create policy vot_entidades_gerir on public.vot_entidades for all to authenticated
  using (public.tem_permissao('votacao:gerenciar')) with check (public.tem_permissao('votacao:gerenciar'));

alter table public.vot_eleicoes enable row level security;
create policy vot_eleicoes_ler on public.vot_eleicoes for select to authenticated
  using (public.tem_permissao('votacao:ver') or public.tem_permissao('votacao:votar') or public.tem_permissao('votacao:gerenciar'));
create policy vot_eleicoes_gerir on public.vot_eleicoes for all to authenticated
  using (public.tem_permissao('votacao:gerenciar')) with check (public.tem_permissao('votacao:gerenciar'));

alter table public.vot_candidaturas enable row level security;
create policy vot_candidaturas_ler on public.vot_candidaturas for select to authenticated
  using (public.tem_permissao('votacao:ver') or public.tem_permissao('votacao:votar') or public.tem_permissao('votacao:gerenciar'));
create policy vot_candidaturas_gerir on public.vot_candidaturas for all to authenticated
  using (public.tem_permissao('votacao:gerenciar')) with check (public.tem_permissao('votacao:gerenciar'));

-- Votos individuais não são lidos nem gravados direto: só por vot_votar() e vot_resultado().
alter table public.vot_votos enable row level security;

-- Privilégios (a migration 0800 já roda antes; repetimos o padrão para os objetos novos)
revoke all on public.vot_entidades, public.vot_eleicoes, public.vot_candidaturas, public.vot_votos from anon;
revoke insert, update, delete on public.vot_votos from authenticated;
revoke execute on function public.vot_votar(uuid, uuid[]) from public, anon;
revoke execute on function public.vot_eleicoes_visiveis() from public, anon;
revoke execute on function public.vot_resultado(uuid) from public, anon;
revoke execute on function public.vot_minha_entidade() from public, anon;
revoke execute on function public.vot_situacao(timestamptz, timestamptz) from public, anon;
revoke execute on function public.vot_logins_disponiveis() from public, anon;
revoke execute on function public.tg_vot_eleicoes_protecao() from public, anon, authenticated;
revoke execute on function public.tg_vot_candidaturas_protecao() from public, anon, authenticated;
grant execute on function public.vot_votar(uuid, uuid[]), public.vot_eleicoes_visiveis(), public.vot_resultado(uuid),
  public.vot_minha_entidade(), public.vot_situacao(timestamptz, timestamptz), public.vot_logins_disponiveis() to authenticated, service_role;
