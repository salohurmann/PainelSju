-- =====================================================================
-- Painel SJU · Fundo Rotativo CENSE e Guia de Ramais
-- =====================================================================

-- ---------------------------------------------------------------------
-- Validações de documentos fiscais (dígitos verificadores reais)
-- ---------------------------------------------------------------------
create or replace function public.cnpj_valido(p_cnpj text)
returns boolean language plpgsql immutable as $$
declare
  d text := regexp_replace(coalesce(p_cnpj, ''), '\D', '', 'g');
  pesos1 int[] := array[5,4,3,2,9,8,7,6,5,4,3,2];
  pesos2 int[] := array[6,5,4,3,2,9,8,7,6,5,4,3,2];
  s int; r int; i int;
begin
  if length(d) <> 14 or d ~ '^(\d)\1{13}$' then return false; end if;
  s := 0; for i in 1..12 loop s := s + substr(d, i, 1)::int * pesos1[i]; end loop;
  r := s % 11; r := case when r < 2 then 0 else 11 - r end;
  if r <> substr(d, 13, 1)::int then return false; end if;
  s := 0; for i in 1..13 loop s := s + substr(d, i, 1)::int * pesos2[i]; end loop;
  r := s % 11; r := case when r < 2 then 0 else 11 - r end;
  return r = substr(d, 14, 1)::int;
end $$;

-- Chave de acesso NF-e: 44 dígitos, DV módulo 11 (pesos 2..9 da direita)
create or replace function public.chave_nfe_valida(p_chave text)
returns boolean language plpgsql immutable as $$
declare
  d text := regexp_replace(coalesce(p_chave, ''), '\D', '', 'g');
  s int := 0; peso int := 2; i int; r int;
begin
  if length(d) <> 44 then return false; end if;
  for i in reverse 43..1 loop
    s := s + substr(d, i, 1)::int * peso;
    peso := case when peso = 9 then 2 else peso + 1 end;
  end loop;
  r := s % 11;
  r := case when r < 2 then 0 else 11 - r end;
  return r = substr(d, 44, 1)::int;
end $$;

-- ---------------------------------------------------------------------
-- Unidades CENSE
-- ---------------------------------------------------------------------
create table public.cense_unidades (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique check (slug ~ '^[a-z0-9-]{3,60}$'),
  nome             text not null,
  cidade           text not null,
  regional         text not null check (regional in ('Curitiba & RMC', 'Campos Gerais & Litoral',
                                                     'Norte & Noroeste', 'Oeste & Sudoeste')),
  diretor_nome     text not null default '',
  matricula        text,
  responsavel_id   uuid references public.perfis(id) on delete set null,  -- quem lança notas da unidade
  cota_trimestral  numeric(12, 2) not null default 0 check (cota_trimestral >= 0),
  competencia      text not null default to_char(now(), 'YYYY') || '-T' || extract(quarter from now())::int
                   check (competencia ~ '^\d{4}-T[1-4]$'),
  prazo_prestacao  date,
  status_fiscal    text not null default 'regular' check (status_fiscal in ('regular', 'em_analise', 'alerta_glosa')),
  ativo            boolean not null default true,
  atualizado_em    timestamptz not null default now()
);
create trigger cense_unidades_atualizado_em before update on public.cense_unidades
  for each row execute function public.tg_atualizado_em();
create trigger auditar_cense_unidades after insert or update or delete on public.cense_unidades
  for each row execute function public.tg_auditar('cense_unidade');

alter table public.cense_unidades enable row level security;
create policy cense_unidades_ler on public.cense_unidades for select to authenticated
  using (public.tem_permissao('cense:ver'));
create policy cense_unidades_gerenciar on public.cense_unidades for all to authenticated
  using (public.tem_permissao('cense:fiscalizar')) with check (public.tem_permissao('cense:fiscalizar'));

-- ---------------------------------------------------------------------
-- Notas fiscais lançadas no fundo rotativo
-- ---------------------------------------------------------------------
create table public.cense_notas (
  id               uuid primary key default gen_random_uuid(),
  unidade_id       uuid not null references public.cense_unidades(id),
  competencia      text not null check (competencia ~ '^\d{4}-T[1-4]$'),
  numero_nf        text not null check (length(trim(numero_nf)) between 1 and 20),
  chave_acesso     text unique check (chave_acesso is null or public.chave_nfe_valida(chave_acesso)),
  data_emissao     date not null,
  fornecedor       text not null check (length(trim(fornecedor)) >= 2),
  cnpj             text not null check (public.cnpj_valido(cnpj)),
  rubrica          text not null check (rubrica in ('33.90.30', '33.90.39')),
  categoria        text not null default '',
  descricao        text not null default '',
  valor            numeric(12, 2) not null check (valor > 0),
  tres_orcamentos  boolean not null default false,
  comprovante_path text,   -- caminho no bucket "cense-comprovantes"
  status           text not null default 'pendente' check (status in ('pendente', 'aprovada', 'glosada')),
  motivo_glosa     text,
  lancado_por      uuid not null default auth.uid() references public.perfis(id),
  analisado_por    uuid references public.perfis(id),
  analisado_em     timestamptz,
  criado_em        timestamptz not null default now()
);
create index cense_notas_unidade_idx on public.cense_notas(unidade_id, competencia);
create trigger auditar_cense_notas after insert or update on public.cense_notas
  for each row execute function public.tg_auditar('cense_nota');

create or replace function public.pode_lancar_na_unidade(p_unidade uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.tem_permissao('cense:lancar_nfe') and (
    public.tem_permissao('cense:fiscalizar')
    or exists (select 1 from public.cense_unidades u
               where u.id = p_unidade and (u.responsavel_id is null or u.responsavel_id = auth.uid()))
  );
$$;

create or replace function public.tg_cense_notas_antes_inserir()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_chave text;
  v_cnpj  text;
begin
  if auth.uid() is not null then new.lancado_por := auth.uid(); end if;
  new.status := 'pendente'; new.analisado_por := null; new.analisado_em := null; new.motivo_glosa := null;
  new.cnpj := regexp_replace(new.cnpj, '\D', '', 'g');
  if new.chave_acesso is not null then
    v_chave := regexp_replace(new.chave_acesso, '\D', '', 'g');
    new.chave_acesso := v_chave;
    -- A chave carrega o CNPJ do emitente nas posições 7 a 20
    v_cnpj := substr(v_chave, 7, 14);
    if v_cnpj <> new.cnpj then
      raise exception 'O CNPJ informado não corresponde ao emitente da chave de acesso.' using errcode = 'P0001';
    end if;
  end if;
  if new.data_emissao > (now() at time zone 'America/Sao_Paulo')::date then
    raise exception 'A data de emissão não pode ser futura.' using errcode = 'P0001';
  end if;
  if new.competencia is null then
    select competencia into new.competencia from public.cense_unidades where id = new.unidade_id;
  end if;
  return new;
end $$;
create trigger cense_notas_antes_inserir before insert on public.cense_notas
  for each row execute function public.tg_cense_notas_antes_inserir();

alter table public.cense_notas enable row level security;
create policy cense_notas_ler on public.cense_notas for select to authenticated
  using (public.tem_permissao('cense:ver'));
create policy cense_notas_inserir on public.cense_notas for insert to authenticated
  with check (public.pode_lancar_na_unidade(unidade_id) and lancado_por = auth.uid());
-- Sem UPDATE/DELETE direto: análise via analisar_nota_cense().

create or replace function public.analisar_nota_cense(p_id uuid, p_aprovar boolean, p_motivo text default null)
returns public.cense_notas
language plpgsql security definer set search_path = public
as $$
declare n public.cense_notas;
begin
  if not public.tem_permissao('cense:fiscalizar') then
    raise exception 'Seu perfil não pode analisar notas do fundo rotativo.' using errcode = '42501';
  end if;
  select * into n from public.cense_notas where id = p_id for update;
  if not found then
    raise exception 'Nota não encontrada.' using errcode = 'P0002';
  end if;
  if n.lancado_por = auth.uid() then
    raise exception 'Segregação de funções: você não pode analisar uma nota que você mesmo lançou.' using errcode = '42501';
  end if;
  if n.status <> 'pendente' then
    raise exception 'A nota já foi analisada (%).', n.status using errcode = 'P0001';
  end if;
  if not p_aprovar and length(trim(coalesce(p_motivo, ''))) < 5 then
    raise exception 'Informe o motivo da glosa (mínimo 5 caracteres).' using errcode = 'P0001';
  end if;
  update public.cense_notas
     set status = case when p_aprovar then 'aprovada' else 'glosada' end,
         motivo_glosa = case when p_aprovar then null else trim(p_motivo) end,
         analisado_por = auth.uid(), analisado_em = now()
   where id = p_id returning * into n;
  if not p_aprovar then
    update public.cense_unidades set status_fiscal = 'alerta_glosa' where id = n.unidade_id;
    perform public.notificar(n.lancado_por, 'Nota glosada · NF ' || n.numero_nf,
      'Motivo: ' || n.motivo_glosa, 'alerta', '#/cense/' || n.unidade_id, true);
  end if;
  return n;
end $$;

-- Saldo por unidade e competência (notas glosadas não consomem a cota)
create or replace view public.cense_saldos
with (security_invoker = true)
as
  select u.id as unidade_id, u.slug, u.nome, u.competencia, u.cota_trimestral,
         coalesce(sum(n.valor) filter (where n.status <> 'glosada'), 0)::numeric(12, 2) as utilizado,
         (u.cota_trimestral - coalesce(sum(n.valor) filter (where n.status <> 'glosada'), 0))::numeric(12, 2) as saldo,
         count(n.id) filter (where n.status = 'pendente') as notas_pendentes,
         count(n.id) filter (where n.status = 'glosada') as notas_glosadas
  from public.cense_unidades u
  left join public.cense_notas n on n.unidade_id = u.id and n.competencia = u.competencia
  group by u.id;
grant select on public.cense_saldos to authenticated;

-- ---------------------------------------------------------------------
-- Guia de Ramais
-- ---------------------------------------------------------------------
create table public.ramais (
  id               uuid primary key default gen_random_uuid(),
  setor_id         uuid references public.setores(id) on delete set null,
  setor_nome       text not null,
  departamento     text not null default '',
  responsavel      text not null default '',
  cargo            text not null default '',
  ramal            text not null check (ramal ~ '^\d{3,6}$'),
  telefone_direto  text,
  email            text,
  andar            text not null default '',
  ativo            boolean not null default true,
  atualizado_em    timestamptz not null default now()
);
create index ramais_setor_idx on public.ramais(setor_nome);
create trigger ramais_atualizado_em before update on public.ramais
  for each row execute function public.tg_atualizado_em();
create trigger auditar_ramais after insert or update or delete on public.ramais
  for each row execute function public.tg_auditar('ramal');

alter table public.ramais enable row level security;
create policy ramais_ler on public.ramais for select to authenticated
  using (public.tem_permissao('ramais:ver'));
create policy ramais_editar on public.ramais for all to authenticated
  using (public.tem_permissao('ramais:editar')) with check (public.tem_permissao('ramais:editar'));

create table public.ramal_favoritos (
  perfil_id  uuid not null default auth.uid() references public.perfis(id) on delete cascade,
  ramal_id   uuid not null references public.ramais(id) on delete cascade,
  primary key (perfil_id, ramal_id)
);
alter table public.ramal_favoritos enable row level security;
create policy ramal_favoritos_proprios on public.ramal_favoritos for all to authenticated
  using (perfil_id = auth.uid()) with check (perfil_id = auth.uid());
