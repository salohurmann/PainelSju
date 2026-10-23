-- =====================================================================
-- Painel SJU · Setores reais da SEJU (organograma / Decreto nº 8.807/2025)
-- =====================================================================
-- * Cada setor ganha o bloco do organograma (grupo) e a ordem de exibição.
-- * Os setores fictícios usados na apresentação saem; pessoas que estivessem
--   neles ficam sem setor (o admin escolhe o setor certo no painel).
-- * CENSE continua só para o NFS e a Votação só para a UTSC.
-- =====================================================================

alter table public.setores add column if not exists grupo text not null default '';
alter table public.setores add column if not exists ordem integer not null default 1000;

insert into public.setores (sigla, nome, grupo, ordem) values
  ('GS', 'Gabinete do Secretário', 'Assessoramento', 10),
  ('AT', 'Assessoria Técnica', 'Assessoramento', 20),
  ('DG', 'Diretoria-Geral', 'Direção-Geral', 30),
  ('UTEC', 'Unidade Técnica de Sistemas de Informação e Tecnologia', 'Gerência Geral', 40),
  ('UTCL', 'Unidade Técnica de Contratos e Licitações', 'Gerência Geral', 50),
  ('UTEA', 'Unidade Técnica de Engenharia e Arquitetura', 'Gerência Geral', 60),
  ('UTSC', 'Unidade Técnica de Suporte aos Colegiados', 'Gerência Geral', 70),
  ('UTPA', 'Unidade Técnica do Projeto Paraná em Ação', 'Gerência Geral', 80),
  ('UTCG', 'Unidade Técnica de Corregedoria', 'Gerência Geral', 90),
  ('DJUS', 'Diretoria de Justiça', 'Gerência Técnica', 100),
  ('DCDH', 'Diretoria de Cidadania e Direitos Humanos', 'Gerência Técnica', 110),
  ('CGS', 'Coordenação de Gestão do Sistema Socioeducativo', 'Diretoria de Justiça', 120),
  ('PROCON', 'PROCON/PR · Coordenação Estadual de Proteção e Defesa do Consumidor', 'Diretoria de Justiça', 130),
  ('CPJ', 'Coordenação de Proteção e Justiça', 'Diretoria de Justiça', 140),
  ('NETP', 'Núcleo de Enfrentamento ao Tráfico de Pessoas', 'Diretoria de Justiça', 150),
  ('CAIC', 'CAIC', 'Diretoria de Justiça', 160),
  ('ESEDH', 'Escola de Educação em Direitos Humanos', 'Diretoria de Cidadania e Direitos Humanos', 170),
  ('CODH', 'Coordenação de Direitos Humanos', 'Diretoria de Cidadania e Direitos Humanos', 180),
  ('COCID', 'Coordenação de Cidadania', 'Diretoria de Cidadania e Direitos Humanos', 190),
  ('NPS', 'Núcleo de Planejamento Setorial', 'Atuação sistêmica', 200),
  ('NICS', 'Núcleo de Integridade e Compliance Setorial', 'Atuação sistêmica', 210),
  ('NCS', 'Núcleo de Comunicação Setorial', 'Atuação sistêmica', 220),
  ('NFS', 'Núcleo Fazendário Setorial', 'Atuação sistêmica', 230),
  ('NRHS', 'Núcleo de Recursos Humanos Setorial', 'Atuação sistêmica', 240),
  ('NAS', 'Núcleo Administrativo Setorial', 'Atuação sistêmica', 250)
on conflict (sigla) do update set nome = excluded.nome, grupo = excluded.grupo, ordem = excluded.ordem;

delete from public.setores where sigla in ('GAB', 'DAG', 'TRANSP', 'CDH', 'DEASE', 'JUR', 'OUV', 'RH');

insert into public.modulo_setores (modulo_id, setor_id)
select m.modulo, s.id from (values ('cense', 'NFS'), ('votacao', 'UTSC')) as m(modulo, sigla)
join public.setores s on s.sigla = m.sigla
join public.modulos mo on mo.id = m.modulo
on conflict do nothing;
