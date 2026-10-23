-- Votação de entidades (módulo restrito ao setor UTSC)
\ir vars.psql

:como_sistema
insert into auth.users (id, email, raw_user_meta_data) values
  ('a1111111-0000-0000-0000-000000000001', 'gestao@utsc.gov',  '{"nome":"Gestão UTSC","setor_sigla":"UTSC","papel_id":"gestor_votacao"}'),
  ('a1111111-0000-0000-0000-000000000002', 'ent.a@utsc.gov',   '{"nome":"Entidade A","setor_sigla":"UTSC","papel_id":"entidade_votante"}'),
  ('a1111111-0000-0000-0000-000000000003', 'ent.b@utsc.gov',   '{"nome":"Entidade B","setor_sigla":"UTSC","papel_id":"entidade_votante"}'),
  ('a1111111-0000-0000-0000-000000000004', 'serv@utsc.gov',    '{"nome":"Servidor UTSC","setor_sigla":"UTSC"}');
\set como_gestao 'reset role; select set_config(''request.jwt.claims'', ''{"sub":"a1111111-0000-0000-0000-000000000001","role":"authenticated"}'', false); set role authenticated;'
\set como_ent_a 'reset role; select set_config(''request.jwt.claims'', ''{"sub":"a1111111-0000-0000-0000-000000000002","role":"authenticated"}'', false); set role authenticated;'
\set como_ent_b 'reset role; select set_config(''request.jwt.claims'', ''{"sub":"a1111111-0000-0000-0000-000000000003","role":"authenticated"}'', false); set role authenticated;'
\set como_serv_utsc 'reset role; select set_config(''request.jwt.claims'', ''{"sub":"a1111111-0000-0000-0000-000000000004","role":"authenticated"}'', false); set role authenticated;'

-- ----------------------------- visibilidade
:como_lucia
select teste.ok(not (public.contexto_sessao()->'modulos' @> '[{"id":"votacao"}]'), 'servidora de outro setor não vê a aba Votação');
select teste.ok((select count(*) from public.vot_eleicoes) = 0, 'outro setor não lê eleições');
select teste.ok((select count(*) from public.vot_eleicoes_visiveis()) = 0, 'outro setor não lista eleições pela função');
select teste.ok(not (public.contexto_sessao()->'modulos' @> '[{"id":"cense"}]'), 'servidora de outro setor não vê a aba CENSE');

:como_diretor
select teste.ok(public.contexto_sessao()->'modulos' @> '[{"id":"cense"}]', 'financeiro (NFS) vê a aba CENSE');
select teste.ok(not (public.contexto_sessao()->'modulos' @> '[{"id":"votacao"}]'), 'financeiro não vê a aba Votação');

:como_serv_utsc
select teste.ok(public.contexto_sessao()->'modulos' @> '[{"id":"votacao"}]', 'servidor da UTSC vê a aba Votação');
select teste.ok((select count(*) from public.vot_eleicoes_visiveis()) = 1, 'servidor da UTSC lista a eleição do seed');
select teste.falha($$insert into public.vot_eleicoes (titulo, abre_em, fecha_em) values ('X x x', now(), now() + interval '1 day')$$,
  'row-level security', 'servidor comum não cria eleição');

:como_ent_a
select teste.ok(public.contexto_sessao()->'modulos' = '[{"id":"votacao","nome":"Votação","descricao":"Eleições de entidades (setor UTSC)"}]'::jsonb,
  'login de entidade só enxerga a aba Votação');

-- ----------------------------- preparação pela gestão
:como_serv_utsc
select teste.ok((select count(*) from public.vot_logins_disponiveis()) = 0, 'só a gestão lista os logins de entidade');
:como_gestao
select teste.ok((select count(*) from public.vot_logins_disponiveis()) = 2, 'gestão lista os logins de entidade para ligar');
update public.vot_entidades set perfil_id = 'a1111111-0000-0000-0000-000000000002' where nome = 'Associação Paranaense de Apoio à Infância';
update public.vot_entidades set perfil_id = 'a1111111-0000-0000-0000-000000000003' where nome = 'Instituto Reconstruir Cidadania';
insert into public.vot_eleicoes (titulo, abre_em, fecha_em, votos_por_entidade)
values ('Eleição de teste', now() - interval '1 hour', now() + interval '1 day', 2);
insert into public.vot_candidaturas (eleicao_id, entidade_id)
select e.id, en.id from public.vot_eleicoes e, public.vot_entidades en
where e.titulo = 'Eleição de teste' and en.nome in ('Associação Paranaense de Apoio à Infância', 'Instituto Reconstruir Cidadania', 'Rede Mulheres do Litoral');
update public.vot_entidades set pode_ser_candidata = false where nome = 'Coletivo Direitos no Campo';
select teste.falha($$insert into public.vot_candidaturas (eleicao_id, entidade_id)
  select e.id, en.id from public.vot_eleicoes e, public.vot_entidades en where e.titulo = 'Eleição de teste' and en.nome = 'Coletivo Direitos no Campo'$$,
  'habilitadas podem ser candidatas', 'entidade sem habilitação não vira candidata');
select teste.falha($$insert into public.vot_eleicoes (titulo, abre_em, fecha_em) values ('Datas trocadas', now(), now() - interval '1 day')$$,
  'vot_eleicoes_periodo', 'encerramento precisa ser depois da abertura');
select teste.ok((public.vot_resultado((select id from public.vot_eleicoes where titulo = 'Eleição de teste'))->>'total_votaram')::int = 0,
  'gestão vê o resultado com a eleição aberta');

-- ----------------------------- votar
:como_ent_a
create temp table ids as select
  (select id from public.vot_eleicoes where titulo = 'Eleição de teste') as eleicao,
  (select id from public.vot_entidades where nome = 'Associação Paranaense de Apoio à Infância') as a,
  (select id from public.vot_entidades where nome = 'Instituto Reconstruir Cidadania') as b,
  (select id from public.vot_entidades where nome = 'Rede Mulheres do Litoral') as c,
  (select id from public.vot_entidades where nome = 'Fórum da Juventude de Londrina') as fora;
select teste.falha($$select public.vot_votar((select eleicao from ids), array[(select a from ids)])$$, 'exatamente 2', 'precisa escolher exatamente N candidatas');
select teste.falha($$select public.vot_votar((select eleicao from ids), array[(select b from ids), (select b from ids)])$$, 'mesma entidade', 'não repete candidata');
select teste.falha($$select public.vot_votar((select eleicao from ids), array[(select b from ids), (select fora from ids)])$$, 'candidata inválida', 'só vota em quem é candidata');
select teste.falha($$select public.vot_resultado((select eleicao from ids))$$, 'quando a eleição encerrar', 'entidade não vê resultado antes do fim');
select public.vot_votar((select eleicao from ids), array[(select a from ids), (select b from ids)]);
select teste.ok((select ja_votou from public.vot_eleicoes_visiveis() where id = (select eleicao from ids)), 'lista mostra que já votou');
select teste.falha($$select public.vot_votar((select eleicao from ids), array[(select b from ids), (select c from ids)])$$, 'já votou', 'entidade vota uma vez só');
select teste.ok((select count(*) from public.vot_votos) = 0, 'ninguém lê os votos individuais, nem os próprios');
select teste.falha($$insert into public.vot_votos (eleicao_id, eleitora_id, candidata_id) select eleicao, a, c from ids$$, 'permission denied', 'voto não é gravado direto na tabela');

:como_ent_b
select public.vot_votar((select eleicao from ids), array[(select a from ids), (select c from ids)]);

:como_gestao
select teste.falha($$update public.vot_eleicoes set votos_por_entidade = 3 where titulo = 'Eleição de teste'$$, 'já recebeu votos', 'regra não muda depois do primeiro voto');
select teste.falha($$delete from public.vot_candidaturas where eleicao_id = (select id from public.vot_eleicoes where titulo = 'Eleição de teste')$$,
  'já recebeu votos', 'candidatas não mudam depois do primeiro voto');
update public.vot_eleicoes set fecha_em = fecha_em + interval '1 day' where titulo = 'Eleição de teste';
select teste.ok(true, 'encerramento pode ser adiado');
select teste.ok((public.vot_resultado((select id from public.vot_eleicoes where titulo = 'Eleição de teste'))->'candidatas'->0->>'votos')::int = 2,
  'a mais votada tem 2 votos');
select teste.ok((public.vot_resultado((select id from public.vot_eleicoes where titulo = 'Eleição de teste'))->>'participacao')::numeric = 33.3,
  'participação = quem votou / entidades aptas a votar (2 de 6)');

:como_sistema
-- simula o relógio passando do encerramento
alter table public.vot_eleicoes disable trigger vot_eleicoes_protecao;
update public.vot_eleicoes set fecha_em = now() - interval '1 minute', abre_em = now() - interval '2 days' where titulo = 'Eleição de teste';
alter table public.vot_eleicoes enable trigger vot_eleicoes_protecao;
:como_ent_a
select teste.ok((public.vot_resultado((select eleicao from ids))->>'total_votaram')::int = 2, 'resultado abre para todas depois do encerramento');
select teste.falha($$select public.vot_votar((select eleicao from ids), array[(select b from ids), (select c from ids)])$$, 'não está aberta', 'não vota depois do encerramento');
:como_sistema
select teste.ok((select count(*) from public.auditoria where acao = 'VOTO_REGISTRADO') = 2, 'cada voto fica na auditoria (sem dizer em quem)');
