-- =====================================================================
-- Painel SJU · Endurecimento apontado pelo linter do Supabase
-- =====================================================================

-- 1) Diretório: a visão passa a ser "security invoker" e lê de uma função
--    controlada (só colunas não sensíveis, só para quem está ativo).
create or replace function public.diretorio_listar()
returns table (id uuid, nome text, email text, cargo text, telefone text,
               setor_id uuid, setor_sigla text, setor_nome text, papel_id text)
language sql stable security definer set search_path = public
as $$
  select pf.id, pf.nome, pf.email, pf.cargo, pf.telefone,
         pf.setor_id, s.sigla, s.nome, pf.papel_id
  from public.perfis pf
  left join public.setores s on s.id = pf.setor_id
  where pf.ativo and public.meu_perfil_ativo();
$$;
revoke execute on function public.diretorio_listar() from public, anon;
grant execute on function public.diretorio_listar() to authenticated;

drop view if exists public.diretorio;
create view public.diretorio with (security_invoker = true) as
  select * from public.diretorio_listar();
revoke all on public.diretorio from anon;
grant select on public.diretorio to authenticated;

-- 2) search_path fixo nas funções que não tinham
alter function public.tg_atualizado_em() set search_path = public;
alter function public.tg_auditoria_imutavel() set search_path = public;
alter function public.tg_papeis_proteger() set search_path = public;
alter function public.tg_notificacoes_so_lida() set search_path = public;
alter function public.vot_situacao(timestamptz, timestamptz) set search_path = public;
alter function public.cnpj_valido(text) set search_path = public;
alter function public.chave_nfe_valida(text) set search_path = public;

-- 3) Funções de gatilho não são API: ninguém chama pelo /rpc
do $$
declare f record;
begin
  for f in
    select p.oid::regprocedure as assinatura
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prorettype = 'trigger'::regtype
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.assinatura);
  end loop;
end $$;
