-- =====================================================================
-- Simulação mínima do ambiente Supabase para testar as migrations num
-- Postgres comum (CI e máquina local). NÃO roda no Supabase real.
-- Reproduz: papéis anon/authenticated/service_role, schema auth com
-- auth.users e auth.uid() lendo o JWT da sessão, schema extensions e os
-- privilégios padrão que o Supabase concede ao criar tabelas.
-- =====================================================================
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin noinherit; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin noinherit; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin noinherit bypassrls; end if;
end $$;

create schema if not exists extensions;
create schema if not exists auth;
grant usage on schema auth, extensions, public to anon, authenticated, service_role;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  raw_user_meta_data jsonb default '{}'::jsonb,
  raw_app_meta_data jsonb default '{}'::jsonb,
  encrypted_password text,
  -- Nos testes as contas nascem como "convidadas pelo admin"; o cadastro
  -- público é simulado com invited_at = null (ver 20_acesso.sql).
  invited_at timestamptz default now(),
  created_at timestamptz default now()
);

create or replace function auth.uid() returns uuid language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid;
$$;
create or replace function auth.role() returns text language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text;
$$;
grant execute on function auth.uid(), auth.role() to anon, authenticated, service_role;

-- Privilégios padrão do Supabase (as políticas RLS é que restringem)
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
