-- =====================================================================
-- Painel SJU · Base: setores, papéis, permissões, perfis e módulos
-- =====================================================================
-- Modelo de acesso:
--   * Cada pessoa tem UM papel (servidor, técnico de TI, gestor etc.) e
--     pertence a UM setor.
--   * O que cada papel pode fazer fica na tabela papel_permissoes, que o
--     admin edita sem precisar de deploy.
--   * Módulos podem ser restritos a setores (modulo_setores). É assim que
--     módulos exclusivos de um setor (ex.: a votação) se encaixam depois.
--   * Toda regra de acesso é aplicada no banco (RLS). O front só reflete.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;
create extension if not exists btree_gist with schema extensions;

-- ---------------------------------------------------------------------
-- Setores
-- ---------------------------------------------------------------------
create table public.setores (
  id          uuid primary key default gen_random_uuid(),
  sigla       text not null unique check (sigla ~ '^[A-Z0-9_]{2,20}$'),
  nome        text not null check (length(trim(nome)) > 0),
  ativo       boolean not null default true,
  criado_em   timestamptz not null default now()
);
comment on table public.setores is 'Unidades organizacionais da SEJU.';

-- ---------------------------------------------------------------------
-- Papéis e permissões
-- ---------------------------------------------------------------------
create table public.papeis (
  id         text primary key check (id ~ '^[a-z_]{3,40}$'),
  nome       text not null,
  descricao  text not null default '',
  sistema    boolean not null default false  -- papéis de sistema não podem ser apagados
);

create table public.permissoes (
  id         text primary key check (id ~ '^[a-z_]+:[a-z_]+$'),  -- formato modulo:acao
  modulo     text not null,
  descricao  text not null default ''
);

create table public.papel_permissoes (
  papel_id      text not null references public.papeis(id) on delete cascade,
  permissao_id  text not null references public.permissoes(id) on delete cascade,
  primary key (papel_id, permissao_id)
);

-- ---------------------------------------------------------------------
-- Perfis (1:1 com auth.users)
-- ---------------------------------------------------------------------
create table public.perfis (
  id          uuid primary key references auth.users(id) on delete cascade,
  nome        text not null check (length(trim(nome)) > 0),
  email       text not null unique,
  cpf         text check (cpf is null or cpf ~ '^\d{11}$'),  -- só dígitos
  telefone    text,
  cargo       text not null default '',
  setor_id    uuid references public.setores(id) on delete set null,
  papel_id    text not null default 'servidor' references public.papeis(id),
  ativo       boolean not null default true,
  criado_em   timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index perfis_setor_idx on public.perfis(setor_id);
comment on column public.perfis.cpf is 'Dado pessoal: visível apenas para o próprio servidor e para quem tem usuarios:gerenciar.';

-- ---------------------------------------------------------------------
-- Módulos e restrição por setor
-- ---------------------------------------------------------------------
create table public.modulos (
  id         text primary key check (id ~ '^[a-z_]{2,40}$'),
  nome       text not null,
  descricao  text not null default '',
  ativo      boolean not null default true,
  ordem      integer not null default 100
);

-- Sem linhas para um módulo = visível para todos os setores.
-- Com linhas = visível apenas para os setores listados.
create table public.modulo_setores (
  modulo_id  text not null references public.modulos(id) on delete cascade,
  setor_id   uuid not null references public.setores(id) on delete cascade,
  primary key (modulo_id, setor_id)
);

-- =====================================================================
-- Funções auxiliares de acesso (usadas pelas políticas RLS)
-- SECURITY DEFINER para não depender das políticas da própria perfis.
-- =====================================================================

create or replace function public.meu_perfil_ativo()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select ativo from public.perfis where id = auth.uid()), false);
$$;

create or replace function public.meu_papel()
returns text
language sql stable security definer set search_path = public
as $$
  select papel_id from public.perfis where id = auth.uid() and ativo;
$$;

create or replace function public.meu_setor()
returns uuid
language sql stable security definer set search_path = public
as $$
  select setor_id from public.perfis where id = auth.uid() and ativo;
$$;

create or replace function public.modulo_visivel(p_modulo text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.modulos m
    where m.id = p_modulo
      and m.ativo
      and public.meu_perfil_ativo()
      and (
        public.meu_papel() = 'admin'
        or not exists (select 1 from public.modulo_setores ms where ms.modulo_id = m.id)
        or exists (select 1 from public.modulo_setores ms
                   where ms.modulo_id = m.id and ms.setor_id = public.meu_setor())
      )
  );
$$;

-- Permissão efetiva = papel tem a permissão E o módulo dela está ativo e
-- liberado para o setor da pessoa. Admin tem todas.
-- Assim, desligar um módulo ou restringi-lo a um setor no painel admin
-- bloqueia também o acesso aos dados, não só o item de menu.
create or replace function public.tem_permissao(p_permissao text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select case
    when public.meu_papel() is null then false
    when public.meu_papel() = 'admin' then true
    else exists (
      select 1
      from public.perfis pf
      join public.papel_permissoes pp on pp.papel_id = pf.papel_id and pp.permissao_id = p_permissao
      join public.permissoes p on p.id = pp.permissao_id
      where pf.id = auth.uid()
        and pf.ativo
        and (not exists (select 1 from public.modulos m where m.id = p.modulo)
             or public.modulo_visivel(p.modulo))
    )
  end;
$$;

-- Lista das permissões do usuário logado (o front usa para montar menus).
create or replace function public.minhas_permissoes()
returns setof text
language sql stable security definer set search_path = public
as $$
  select p.id from public.permissoes p
  where public.tem_permissao(p.id);
$$;

-- Módulos do menu: visíveis para o setor E com ao menos uma permissão
-- do módulo (ex.: "Administração" só aparece para quem administra).
create or replace function public.meus_modulos()
returns setof public.modulos
language sql stable security definer set search_path = public
as $$
  select m.* from public.modulos m
  where public.modulo_visivel(m.id)
    and (
      public.meu_papel() = 'admin'
      or exists (select 1 from public.permissoes p where p.modulo = m.id and public.tem_permissao(p.id))
    )
  order by m.ordem, m.nome;
$$;

-- ---------------------------------------------------------------------
-- Atualizado_em automático
-- ---------------------------------------------------------------------
create or replace function public.tg_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em := now();
  return new;
end $$;

create trigger perfis_atualizado_em before update on public.perfis
  for each row execute function public.tg_atualizado_em();

-- ---------------------------------------------------------------------
-- Proteção de campos sensíveis do perfil:
-- o próprio servidor só altera nome e telefone; papel, setor, ativo,
-- e-mail e CPF só por quem tem usuarios:gerenciar.
-- ---------------------------------------------------------------------
create or replace function public.tg_perfis_proteger_campos()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    return new;  -- service_role / migrations
  end if;
  if public.tem_permissao('usuarios:gerenciar') then
    if new.id = auth.uid() and (new.papel_id <> 'admin' or not new.ativo) and old.papel_id = 'admin' then
      raise exception 'Você não pode remover o próprio acesso de administrador.'
        using errcode = 'P0001';
    end if;
    return new;
  end if;
  if new.papel_id is distinct from old.papel_id
     or new.setor_id is distinct from old.setor_id
     or new.ativo    is distinct from old.ativo
     or new.email    is distinct from old.email
     or new.cpf      is distinct from old.cpf
     or new.cargo    is distinct from old.cargo then
    raise exception 'Somente a administração pode alterar papel, setor, cargo, situação, e-mail ou CPF.'
      using errcode = '42501';
  end if;
  return new;
end $$;

create trigger perfis_proteger_campos before update on public.perfis
  for each row execute function public.tg_perfis_proteger_campos();

-- ---------------------------------------------------------------------
-- Criação automática do perfil quando um usuário é criado no Auth.
-- Metadados aceitos: nome, cargo, cpf, telefone (user_metadata).
-- Papel e setor só valem quando vêm de quem pode decidir:
--   * app_metadata (gravado apenas com a service role), ou
--   * convite feito pelo admin (invited_at preenchido pela Edge Function).
-- Quem se cadastra sozinho entra como "servidor", sem setor: assim ninguém
-- vira admin nem ganha acesso a CENSE/Votação mandando metadados no cadastro.
-- ---------------------------------------------------------------------
create or replace function public.tg_novo_usuario()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_meta  jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_app   jsonb := coalesce(new.raw_app_meta_data, '{}'::jsonb);
  v_conf  jsonb;
  v_setor uuid;
  v_papel text;
begin
  -- Fonte confiável para papel/setor.
  v_conf := case
    when v_app ? 'papel_id' or v_app ? 'setor_sigla' then v_app
    when new.invited_at is not null then v_meta
    else '{}'::jsonb
  end;
  v_papel := coalesce(nullif(v_conf->>'papel_id', ''), 'servidor');
  select id into v_setor from public.setores where sigla = upper(v_conf->>'setor_sigla');
  if not exists (select 1 from public.papeis where id = v_papel) then
    v_papel := 'servidor';
  end if;
  insert into public.perfis (id, nome, email, cpf, telefone, cargo, setor_id, papel_id)
  values (
    new.id,
    coalesce(nullif(trim(v_meta->>'nome'), ''), split_part(new.email, '@', 1)),
    lower(new.email),
    nullif(regexp_replace(coalesce(v_meta->>'cpf', ''), '\D', '', 'g'), ''),
    nullif(v_meta->>'telefone', ''),
    coalesce(v_meta->>'cargo', ''),
    v_setor,
    v_papel
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.tg_novo_usuario();

-- =====================================================================
-- Diretório público (sem dados pessoais sensíveis)
-- =====================================================================
create or replace view public.diretorio
with (security_barrier = true)
as
  select pf.id, pf.nome, pf.email, pf.cargo, pf.telefone,
         pf.setor_id, s.sigla as setor_sigla, s.nome as setor_nome, pf.papel_id
  from public.perfis pf
  left join public.setores s on s.id = pf.setor_id
  where pf.ativo and public.meu_perfil_ativo();

-- =====================================================================
-- RLS
-- =====================================================================
alter table public.setores          enable row level security;
alter table public.papeis           enable row level security;
alter table public.permissoes       enable row level security;
alter table public.papel_permissoes enable row level security;
alter table public.perfis           enable row level security;
alter table public.modulos          enable row level security;
alter table public.modulo_setores   enable row level security;

-- Leitura de catálogos: qualquer servidor ativo
create policy setores_ler on public.setores for select to authenticated
  using (public.meu_perfil_ativo());
create policy papeis_ler on public.papeis for select to authenticated
  using (public.meu_perfil_ativo());
create policy permissoes_ler on public.permissoes for select to authenticated
  using (public.meu_perfil_ativo());
create policy papel_permissoes_ler on public.papel_permissoes for select to authenticated
  using (public.meu_perfil_ativo());
create policy modulos_ler on public.modulos for select to authenticated
  using (public.meu_perfil_ativo());
create policy modulo_setores_ler on public.modulo_setores for select to authenticated
  using (public.meu_perfil_ativo());

-- Escrita de catálogos: administração
create policy setores_admin on public.setores for all to authenticated
  using (public.tem_permissao('admin:configurar')) with check (public.tem_permissao('admin:configurar'));
create policy papeis_admin on public.papeis for all to authenticated
  using (public.tem_permissao('admin:configurar')) with check (public.tem_permissao('admin:configurar'));
create policy papel_permissoes_admin on public.papel_permissoes for all to authenticated
  using (public.tem_permissao('admin:configurar')) with check (public.tem_permissao('admin:configurar'));
create policy modulos_admin on public.modulos for all to authenticated
  using (public.tem_permissao('admin:configurar')) with check (public.tem_permissao('admin:configurar'));
create policy modulo_setores_admin on public.modulo_setores for all to authenticated
  using (public.tem_permissao('admin:configurar')) with check (public.tem_permissao('admin:configurar'));
-- permissoes: catálogo fixo, alterado só por migration.

-- Perfis: o próprio, ou quem gerencia usuários
create policy perfis_ler on public.perfis for select to authenticated
  using (id = auth.uid() or public.tem_permissao('usuarios:gerenciar'));
create policy perfis_atualizar on public.perfis for update to authenticated
  using (id = auth.uid() or public.tem_permissao('usuarios:gerenciar'))
  with check (id = auth.uid() or public.tem_permissao('usuarios:gerenciar'));
-- Inserção e exclusão de perfis: apenas via Auth (trigger) / service_role.

-- Papéis de sistema não podem ser apagados
create or replace function public.tg_papeis_proteger()
returns trigger language plpgsql as $$
begin
  if old.sistema then
    raise exception 'O papel "%" é de sistema e não pode ser removido.', old.id using errcode = 'P0001';
  end if;
  return old;
end $$;
create trigger papeis_proteger before delete on public.papeis
  for each row execute function public.tg_papeis_proteger();

-- Privilégios: anon não acessa nada do domínio
revoke all on all tables in schema public from anon;
revoke execute on all functions in schema public from anon;
grant select on public.diretorio to authenticated;
