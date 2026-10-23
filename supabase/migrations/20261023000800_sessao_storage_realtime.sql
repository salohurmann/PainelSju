-- =====================================================================
-- Painel SJU · Sessão, pendências da Mesa, Storage, Realtime e privilégios
-- =====================================================================

-- ---------------------------------------------------------------------
-- Contexto da sessão em uma única chamada (perfil + permissões + módulos)
-- ---------------------------------------------------------------------
create or replace function public.contexto_sessao()
returns jsonb
language sql stable security definer set search_path = public
as $$
  select case when pf.id is null then null else jsonb_build_object(
    'perfil', jsonb_build_object(
      'id', pf.id, 'nome', pf.nome, 'email', pf.email, 'cargo', pf.cargo,
      'telefone', pf.telefone, 'papel_id', pf.papel_id, 'ativo', pf.ativo,
      'setor', case when s.id is null then null
                    else jsonb_build_object('id', s.id, 'sigla', s.sigla, 'nome', s.nome) end
    ),
    'permissoes', coalesce((select jsonb_agg(p) from public.minhas_permissoes() p), '[]'::jsonb),
    'modulos', coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'nome', m.nome, 'descricao', m.descricao) order by m.ordem)
                         from public.meus_modulos() m), '[]'::jsonb),
    'notificacoes_nao_lidas', (select count(*) from public.notificacoes n where n.destinatario_id = pf.id and not n.lida)
  ) end
  from (select auth.uid() as uid) x
  left join public.perfis pf on pf.id = x.uid
  left join public.setores s on s.id = pf.setor_id;
$$;

-- ---------------------------------------------------------------------
-- Pendências da "Mesa de Despacho": o que precisa da ação de quem está
-- logado, já ordenado por urgência e prazo.
-- ---------------------------------------------------------------------
create or replace function public.minhas_pendencias()
returns table (
  tipo        text,
  referencia  uuid,
  protocolo   text,
  titulo      text,
  descricao   text,
  solicitante text,
  desde       timestamptz,
  prazo       timestamptz,
  urgencia    text,
  link        text
)
language sql stable security definer set search_path = public
as $$
  with p as (
    -- Veículos aguardando decisão (exceto os próprios: segregação)
    select 'frota_aprovacao'::text as tipo, a.id as referencia, a.protocolo,
           'Solicitação de veículo'::text as titulo, a.destino as descricao, a.solicitante_nome as solicitante,
           a.criado_em as desde,
           (a.datas[1]::timestamp at time zone 'America/Sao_Paulo') as prazo,
           '#/frota/aprovacoes/' || a.id as link
    from public.agendamentos a
    where a.status = 'pendente' and a.solicitante_id <> auth.uid() and public.tem_permissao('frotas:aprovar')
    union all
    -- Vistorias de saída do dia
    select 'frota_vistoria', a.id, a.protocolo, 'Vistoria de saída', a.destino, a.solicitante_nome,
           coalesce(a.decidido_em, a.criado_em),
           (a.datas[1]::timestamp at time zone 'America/Sao_Paulo'),
           '#/frota/vistoria/' || a.id
    from public.agendamentos a
    where a.status = 'aprovado'
      and a.datas[1] <= (now() at time zone 'America/Sao_Paulo')::date
      and public.tem_permissao('frotas:vistoria')
    union all
    -- Diárias aguardando decisão
    select 'diaria_aprovacao', d.id, d.protocolo, 'Diária para aprovar',
           d.destino || ' · R$ ' || to_char(d.valor_total, 'FM999G999G990D00'), d.servidor_nome,
           d.criado_em, (d.data_ida::timestamp at time zone 'America/Sao_Paulo'),
           '#/diarias/' || d.id
    from public.solicitacoes_diaria d
    where d.status = 'pendente' and d.servidor_id <> auth.uid() and public.tem_permissao('diarias:aprovar')
    union all
    -- Chamados abertos atribuídos a mim ou sem técnico
    select 'chamado', c.id, c.protocolo, c.titulo, c.prioridade, c.solicitante_nome,
           c.aberto_em, c.prazo_sla, '#/chamados/' || c.id
    from public.chamados c
    where c.status in ('a_fazer', 'em_andamento')
      and (c.tecnico_id = auth.uid() or c.tecnico_id is null)
      and public.pode_atender_chamados()
    union all
    -- Notas CENSE aguardando análise (exceto as que eu lancei)
    select 'cense_analise', n.id, 'NF ' || n.numero_nf, 'Nota fiscal para analisar',
           n.fornecedor || ' · R$ ' || to_char(n.valor, 'FM999G999G990D00'), null,
           n.criado_em, null, '#/cense/' || n.unidade_id
    from public.cense_notas n
    where n.status = 'pendente' and n.lancado_por <> auth.uid() and public.tem_permissao('cense:fiscalizar')
  )
  select p.tipo, p.referencia, p.protocolo, p.titulo, p.descricao, p.solicitante, p.desde, p.prazo,
         case when p.prazo is not null and p.prazo < now() then 'vencida'
              when p.prazo is not null and p.prazo < now() + interval '24 hours' then 'alta'
              when p.prazo is not null and p.prazo < now() + interval '72 hours' then 'media'
              else 'baixa' end as urgencia,
         p.link
  from p
  where public.meu_perfil_ativo()
  order by case when p.prazo is null then 1 else 0 end, p.prazo, p.desde;
$$;

-- ---------------------------------------------------------------------
-- Storage: buckets privados para fotos de vistoria e comprovantes CENSE.
-- Só executa onde o schema storage existe (Supabase); ignorado em testes.
-- Convenções de caminho:
--   vistorias/<agendamento_id>/<saida|retorno>/<angulo>.jpg
--   cense-comprovantes/<unidade_id>/<arquivo>
-- ---------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('vistorias', 'vistorias', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
           ('cense-comprovantes', 'cense-comprovantes', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png'])
    on conflict (id) do nothing;

    execute $p$
      create policy vistorias_enviar on storage.objects for insert to authenticated
      with check (bucket_id = 'vistorias' and public.tem_permissao('frotas:vistoria'))
    $p$;
    execute $p$
      create policy vistorias_ler on storage.objects for select to authenticated
      using (bucket_id = 'vistorias' and (
        public.tem_permissao('frotas:vistoria') or public.tem_permissao('frotas:gerenciar')
        or exists (select 1 from public.agendamentos a
                   where a.id::text = (storage.foldername(name))[1] and a.solicitante_id = auth.uid())
      ))
    $p$;
    execute $p$
      create policy cense_comprovantes_enviar on storage.objects for insert to authenticated
      with check (bucket_id = 'cense-comprovantes'
                  and public.pode_lancar_na_unidade(((storage.foldername(name))[1])::uuid))
    $p$;
    execute $p$
      create policy cense_comprovantes_ler on storage.objects for select to authenticated
      using (bucket_id = 'cense-comprovantes' and public.tem_permissao('cense:ver'))
    $p$;
  end if;
end $$;

-- ---------------------------------------------------------------------
-- Realtime: o front recebe mudanças ao vivo (substitui o polling).
-- As políticas RLS continuam valendo para cada assinante.
-- ---------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table
      public.notificacoes, public.agendamentos, public.chamados, public.chamado_notas,
      public.reservas, public.solicitacoes_diaria, public.cense_notas;
  end if;
end $$;

-- ---------------------------------------------------------------------
-- Privilégios finais
-- ---------------------------------------------------------------------
-- anon (visitante sem login) não acessa nada do domínio.
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
-- Funções: o Postgres concede EXECUTE a PUBLIC por padrão; retiramos e
-- concedemos só a quem está logado.
revoke execute on all functions in schema public from public, anon;
grant execute on all functions in schema public to authenticated, service_role;
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke execute on functions from public, anon;

-- Funções internas não podem ser chamadas pelo cliente
revoke execute on function public.registrar_auditoria(text, text, text, jsonb) from authenticated;
revoke execute on function public.notificar(uuid, text, text, text, text, boolean) from authenticated;
revoke execute on function public.notificar_quem_pode(text, text, text, text, text, uuid) from authenticated;

-- Trilha de auditoria: ninguém além do dono das funções escreve
revoke insert, update, delete, truncate on public.auditoria from authenticated, service_role;
