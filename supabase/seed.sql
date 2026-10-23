-- =====================================================================
-- Painel SJU · Dados iniciais (catálogos + DADOS FICTÍCIOS de demonstração)
-- =====================================================================
-- Catálogos (papéis, permissões, módulos, SLA) são necessários em produção.
-- Veículos, salas, ramais, unidades CENSE e valores de diária são FICTÍCIOS,
-- para apresentação. Substitua pelos dados oficiais antes do uso real.
-- Usuários de demonstração são criados por scripts/seed-usuarios.mjs
-- (precisa da service role key; não dá para criar contas de Auth por SQL
-- de forma suportada).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Permissões (catálogo fixo)
-- ---------------------------------------------------------------------
insert into public.permissoes (id, modulo, descricao) values
  ('frotas:ver',               'frota',     'Ver veículos e o próprio histórico'),
  ('frotas:solicitar',         'frota',     'Solicitar veículo oficial'),
  ('frotas:aprovar',           'frota',     'Aprovar ou reprovar solicitações de veículo'),
  ('frotas:vistoria',          'frota',     'Registrar vistorias de saída e retorno'),
  ('frotas:gerenciar',         'frota',     'Cadastrar e editar veículos'),
  ('chamados:ver',             'chamados',  'Ver os próprios chamados'),
  ('chamados:abrir',           'chamados',  'Abrir chamados'),
  ('chamados:atender',         'chamados',  'Atender chamados (equipe técnica)'),
  ('chamados:gerenciar',       'chamados',  'Reabrir, redistribuir e gerir a fila'),
  ('salas:ver',                'salas',     'Ver agenda das salas'),
  ('salas:reservar',           'salas',     'Reservar salas'),
  ('salas:cancelar_qualquer',  'salas',     'Cancelar reservas de outras pessoas'),
  ('salas:gerenciar',          'salas',     'Cadastrar e editar salas'),
  ('diarias:ver',              'diarias',   'Ver tabela e as próprias diárias'),
  ('diarias:solicitar',        'diarias',   'Solicitar diárias'),
  ('diarias:aprovar',          'diarias',   'Aprovar ou reprovar diárias'),
  ('diarias:gerenciar',        'diarias',   'Movimentar etapas financeiras (empenho, prestação de contas)'),
  ('cense:ver',                'cense',     'Ver o fundo rotativo das unidades'),
  ('cense:lancar_nfe',         'cense',     'Lançar notas fiscais da unidade'),
  ('cense:fiscalizar',         'cense',     'Analisar notas e gerir unidades'),
  ('ramais:ver',               'ramais',    'Consultar o guia de ramais'),
  ('ramais:editar',            'ramais',    'Editar o guia de ramais'),
  ('seguranca:auditar',        'auditoria', 'Consultar e verificar a trilha de auditoria'),
  ('usuarios:gerenciar',       'admin',     'Gerir contas, papéis e setores das pessoas'),
  ('admin:configurar',         'admin',     'Configurar papéis, permissões, módulos e tabelas'),
  ('votacao:ver',              'votacao',   'Ver eleições e resultados encerrados'),
  ('votacao:votar',            'votacao',   'Votar em nome da própria entidade'),
  ('votacao:gerenciar',        'votacao',   'Criar eleições, cadastrar entidades e ver resultados')
on conflict (id) do update set modulo = excluded.modulo, descricao = excluded.descricao;

-- ---------------------------------------------------------------------
-- Papéis
-- ---------------------------------------------------------------------
insert into public.papeis (id, nome, descricao, sistema) values
  ('servidor',        'Servidor(a)',            'Acesso padrão de quem trabalha na Secretaria', true),
  ('tecnico_ti',      'Técnico(a) de TI',       'Atende chamados de suporte', false),
  ('gestor_frota',    'Gestão de Frota',        'Vistorias e cadastro de veículos', false),
  ('diretor_cense',   'Direção de Unidade CENSE', 'Lança notas fiscais da própria unidade', false),
  ('chefe_gabinete',  'Chefia de Gabinete',     'Aprova viagens, diárias e fiscaliza o fundo rotativo', false),
  ('gestor_votacao',  'Gestão da Votação',      'Organiza eleições e entidades (setor UTSC)', false),
  ('entidade_votante','Entidade votante',       'Login de entidade: só vota nas eleições', false),
  ('admin',           'Administração',          'Acesso total ao sistema', true)
on conflict (id) do update set nome = excluded.nome, descricao = excluded.descricao;

-- Matriz papel → permissões (admin tem tudo implicitamente)
insert into public.papel_permissoes (papel_id, permissao_id)
select papel, perm from (values
  -- servidor
  ('servidor','frotas:ver'),('servidor','frotas:solicitar'),
  ('servidor','chamados:ver'),('servidor','chamados:abrir'),
  ('servidor','salas:ver'),('servidor','salas:reservar'),
  ('servidor','diarias:ver'),('servidor','diarias:solicitar'),
  ('servidor','cense:ver'),('servidor','ramais:ver'),
  -- técnico de TI
  ('tecnico_ti','frotas:ver'),('tecnico_ti','frotas:solicitar'),
  ('tecnico_ti','chamados:ver'),('tecnico_ti','chamados:abrir'),('tecnico_ti','chamados:atender'),
  ('tecnico_ti','salas:ver'),('tecnico_ti','salas:reservar'),
  ('tecnico_ti','diarias:ver'),('tecnico_ti','diarias:solicitar'),
  ('tecnico_ti','cense:ver'),('tecnico_ti','ramais:ver'),('tecnico_ti','ramais:editar'),
  -- gestão de frota
  ('gestor_frota','frotas:ver'),('gestor_frota','frotas:solicitar'),('gestor_frota','frotas:vistoria'),
  ('gestor_frota','frotas:gerenciar'),
  ('gestor_frota','chamados:ver'),('gestor_frota','chamados:abrir'),
  ('gestor_frota','salas:ver'),('gestor_frota','salas:reservar'),
  ('gestor_frota','diarias:ver'),('gestor_frota','diarias:solicitar'),
  ('gestor_frota','cense:ver'),('gestor_frota','ramais:ver'),('gestor_frota','seguranca:auditar'),
  -- direção CENSE
  ('diretor_cense','frotas:ver'),('diretor_cense','frotas:solicitar'),
  ('diretor_cense','chamados:ver'),('diretor_cense','chamados:abrir'),
  ('diretor_cense','salas:ver'),('diretor_cense','salas:reservar'),
  ('diretor_cense','diarias:ver'),('diretor_cense','diarias:solicitar'),
  ('diretor_cense','cense:ver'),('diretor_cense','cense:lancar_nfe'),('diretor_cense','ramais:ver'),
  -- chefia de gabinete
  ('chefe_gabinete','frotas:ver'),('chefe_gabinete','frotas:solicitar'),('chefe_gabinete','frotas:aprovar'),
  ('chefe_gabinete','frotas:vistoria'),
  ('chefe_gabinete','chamados:ver'),('chefe_gabinete','chamados:abrir'),
  ('chefe_gabinete','salas:ver'),('chefe_gabinete','salas:reservar'),('chefe_gabinete','salas:cancelar_qualquer'),
  ('chefe_gabinete','diarias:ver'),('chefe_gabinete','diarias:solicitar'),('chefe_gabinete','diarias:aprovar'),
  ('chefe_gabinete','cense:ver'),('chefe_gabinete','cense:fiscalizar'),
  ('chefe_gabinete','ramais:ver'),('chefe_gabinete','seguranca:auditar'),
  -- votação: servidor vê (o módulo só aparece para o setor UTSC)
  ('servidor','votacao:ver'),
  -- gestão da votação
  ('gestor_votacao','frotas:ver'),('gestor_votacao','frotas:solicitar'),
  ('gestor_votacao','chamados:ver'),('gestor_votacao','chamados:abrir'),
  ('gestor_votacao','salas:ver'),('gestor_votacao','salas:reservar'),
  ('gestor_votacao','diarias:ver'),('gestor_votacao','diarias:solicitar'),
  ('gestor_votacao','ramais:ver'),
  ('gestor_votacao','votacao:ver'),('gestor_votacao','votacao:gerenciar'),
  -- entidade: só vota
  ('entidade_votante','votacao:votar')
) as m(papel, perm)
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Módulos
-- ---------------------------------------------------------------------
insert into public.modulos (id, nome, descricao, ordem) values
  ('frota',     'Frotas & Viaturas',    'Solicitação, aprovação e vistoria de veículos oficiais', 10),
  ('chamados',  'Chamados',             'Suporte de TI, manutenção e almoxarifado', 20),
  ('salas',     'Reserva de Salas',     'Agenda de salas e auditórios', 30),
  ('diarias',   'Diárias & Viagens',    'Cálculo e solicitação de diárias', 40),
  ('cense',     'Fundo Rotativo CENSE', 'Prestação de contas das unidades socioeducativas', 50),
  ('ramais',    'Ramais',               'Guia telefônico da Secretaria', 60),
  ('votacao',   'Votação',              'Eleições de entidades (setor UTSC)', 70),
  ('auditoria', 'Auditoria',            'Trilha de registros do sistema', 90),
  ('admin',     'Administração',        'Pessoas, papéis, módulos e tabelas', 99)
on conflict (id) do update set nome = excluded.nome, descricao = excluded.descricao, ordem = excluded.ordem;

-- ---------------------------------------------------------------------
-- Setores reais da SEJU (organograma / Decreto nº 8.807/2025)
-- ---------------------------------------------------------------------
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

-- Módulos restritos por setor (o admin muda isso no painel de administração):
-- CENSE só para o financeiro (NFS); Votação só para a UTSC.
insert into public.modulo_setores (modulo_id, setor_id)
select 'cense', id from public.setores where sigla = 'NFS'
on conflict do nothing;
insert into public.modulo_setores (modulo_id, setor_id)
select 'votacao', id from public.setores where sigla = 'UTSC'
on conflict do nothing;

-- ---------------------------------------------------------------------
-- SLA por prioridade (horas corridas)
-- ---------------------------------------------------------------------
insert into public.sla_prioridades (prioridade, horas) values
  ('urgente', 4), ('alta', 8), ('media', 24), ('baixa', 72)
on conflict (prioridade) do update set horas = excluded.horas;

-- ---------------------------------------------------------------------
-- Tabela de diárias (VALORES DE DEMONSTRAÇÃO — validar com a área fazendária)
-- ---------------------------------------------------------------------
insert into public.diarias_tabela (nivel, rotulo, valor_dia, base_legal) values
  ('medio',    'Apoio / Nível Médio',          280.00, 'Valor de demonstração — validar'),
  ('superior', 'Técnico / Nível Superior',     380.00, 'Valor de demonstração — validar'),
  ('direcao',  'Direção Superior / Gabinete',  520.00, 'Valor de demonstração — validar')
on conflict (nivel) do nothing;

-- ---------------------------------------------------------------------
-- Veículos (fictícios)
-- ---------------------------------------------------------------------
insert into public.veiculos (modelo, placa, cor, capacidade, ano, km_atual, nivel_combustivel) values
  ('Toyota Corolla Sedan 2.0',          'BCB4A12', 'Prata',  5, 2023, 34210, 85),
  ('Renault Duster Intense 1.6',        'RHZ9D88', 'Branco', 5, 2022, 52800, 60),
  ('Chevrolet Spin Premier 7 Lugares',  'BDF3J21', 'Cinza',  7, 2023, 28150, 95),
  ('Fiat Toro Freedom 4x4 Diesel',      'RHD1H45', 'Preto',  5, 2021, 64120, 45)
on conflict (placa) do nothing;

-- ---------------------------------------------------------------------
-- Salas (fictícias)
-- ---------------------------------------------------------------------
insert into public.salas (codigo, nome, andar, capacidade, layout, equipamentos) values
  ('SEJU-AUD-01', 'Auditório Principal',            'Térreo · Ala Norte',        120, 'Auditório / Plenária',        'Projetor, microfones sem fio, sistema de som'),
  ('SEJU-GAB-03', 'Sala de Reunião do Gabinete',    '3º Andar · Ala Executiva',   18, 'Mesa em U',                   'Kit de videoconferência, TV 75", lousa de vidro'),
  ('SEJU-MED-02', 'Sala Técnica de Conciliação',    '2º Andar · Bloco B',          8, 'Mesa circular',               'Isolamento acústico, climatização'),
  ('SEJU-LAB-01', 'Laboratório de Treinamento',     '1º Andar · Bloco Técnico',   35, 'Bancadas com 20 computadores','Projetor interativo, lousa digital')
on conflict (codigo) do nothing;

-- ---------------------------------------------------------------------
-- Ramais (fictícios)
-- ---------------------------------------------------------------------
insert into public.ramais (setor_id, setor_nome, departamento, responsavel, cargo, ramal, telefone_direto, email, andar)
select s.id, r.setor_nome, r.departamento, r.responsavel, r.cargo, r.ramal, r.tel, r.email, r.andar
from (values
  ('GS',     'Gabinete do Secretário',          'Assessoramento',                'Gabinete',                          'Chefia de Gabinete',          '8201', '(41) 3310-8201', 'gabinete@exemplo.pr.gov.br',      '3º Andar · Sala 301'),
  ('AT',     'Assessoria Técnica',              'Assessoramento',                'Recepção e Despachos',              'Assessoria de Expediente',    '8202', '(41) 3310-8202', 'expediente@exemplo.pr.gov.br',    '3º Andar · Sala 302'),
  ('NAS',    'Núcleo Administrativo Setorial',  'Atuação sistêmica',             'Central de Transporte',             'Gestão de Frotas',            '8245', '(41) 3310-8245', 'transporte@exemplo.pr.gov.br',    'Térreo · Pátio'),
  ('CODH',   'Coordenação de Direitos Humanos', 'DCDH',                          'Atendimento da Coordenação',        'Coordenação',                 '8230', '(41) 3310-8230', 'cdh@exemplo.pr.gov.br',           '1º Andar · Bloco B'),
  ('UTEC',   'Suporte Técnico de TI',           'Gerência Geral',               'Central de Suporte',                'Atendimento aos usuários',    '8299', '(41) 3310-8299', 'suporte.ti@exemplo.pr.gov.br',    '2º Andar · Sala 201'),
  ('NRHS',   'Núcleo de Recursos Humanos Setorial', 'Atuação sistêmica',         'Atendimento Funcional',             'Coordenação de RH',           '8215', '(41) 3310-8215', 'rh@exemplo.pr.gov.br',            '1º Andar · Sala 102'),
  ('NAS',    'Protocolo Geral',                 'Atuação sistêmica',             'Atendimento ao Cidadão',            'Recepção Geral',              '8200', '(41) 3310-8200', 'ouvidoria@exemplo.pr.gov.br',     'Térreo · Entrada'),
  ('NICS',   'Integridade e Compliance',        'Atuação sistêmica',             'Assessoria Jurídica',               'Assessoria',                  '8220', '(41) 3310-8220', 'juridico@exemplo.pr.gov.br',      '3º Andar · Sala 305')
) as r(sigla, setor_nome, departamento, responsavel, cargo, ramal, tel, email, andar)
left join public.setores s on s.sigla = r.sigla
where not exists (select 1 from public.ramais x where x.ramal = r.ramal);

-- ---------------------------------------------------------------------
-- Unidades CENSE (nomes reais das unidades; diretores e cotas FICTÍCIOS)
-- ---------------------------------------------------------------------
insert into public.cense_unidades (slug, nome, cidade, regional, diretor_nome, cota_trimestral)
values
  ('cense-curitiba',              'CENSE Curitiba',                 'Curitiba',                 'Curitiba & RMC',           'Direção (fictícia)', 36000),
  ('cense-sao-francisco',         'CENSE São Francisco',            'Piraquara',                'Curitiba & RMC',           'Direção (fictícia)', 42000),
  ('cense-joana-richa',           'CENSE Joana Richa',              'Curitiba',                 'Curitiba & RMC',           'Direção (fictícia)', 32000),
  ('cense-fazenda-rio-grande',    'CENSE Fazenda Rio Grande',       'Fazenda Rio Grande',       'Curitiba & RMC',           'Direção (fictícia)', 36000),
  ('cense-ponta-grossa',          'CENSE Ponta Grossa',             'Ponta Grossa',             'Campos Gerais & Litoral',  'Direção (fictícia)', 32000),
  ('cense-paranagua',             'CENSE Paranaguá',                'Paranaguá',                'Campos Gerais & Litoral',  'Direção (fictícia)', 28000),
  ('cense-londrina-1',            'CENSE Londrina I',               'Londrina',                 'Norte & Noroeste',         'Direção (fictícia)', 38000),
  ('cense-londrina-2',            'CENSE Londrina II',              'Londrina',                 'Norte & Noroeste',         'Direção (fictícia)', 36000),
  ('cense-maringa',               'CENSE Maringá',                  'Maringá',                  'Norte & Noroeste',         'Direção (fictícia)', 32000),
  ('cense-paranavai',             'CENSE Paranavaí',                'Paranavaí',                'Norte & Noroeste',         'Direção (fictícia)', 28000),
  ('cense-umuarama',              'CENSE Umuarama',                 'Umuarama',                 'Norte & Noroeste',         'Direção (fictícia)', 30000),
  ('cense-campo-mourao',          'CENSE Campo Mourão',             'Campo Mourão',             'Norte & Noroeste',         'Direção (fictícia)', 28000),
  ('cense-santo-antonio-platina', 'CENSE Santo Antônio da Platina', 'Santo Antônio da Platina', 'Norte & Noroeste',         'Direção (fictícia)', 28000),
  ('cense-cascavel-1',            'CENSE Cascavel I',               'Cascavel',                 'Oeste & Sudoeste',         'Direção (fictícia)', 34000),
  ('cense-cascavel-2',            'CENSE Cascavel II',              'Cascavel',                 'Oeste & Sudoeste',         'Direção (fictícia)', 36000),
  ('cense-foz',                   'CENSE Foz do Iguaçu',            'Foz do Iguaçu',            'Oeste & Sudoeste',         'Direção (fictícia)', 36000),
  ('cense-toledo',                'CENSE Toledo',                   'Toledo',                   'Oeste & Sudoeste',         'Direção (fictícia)', 28000),
  ('cense-pato-branco',           'CENSE Pato Branco',              'Pato Branco',              'Oeste & Sudoeste',         'Direção (fictícia)', 30000),
  ('cense-laranjeiras-do-sul',    'CENSE Laranjeiras do Sul',       'Laranjeiras do Sul',       'Oeste & Sudoeste',         'Direção (fictícia)', 28000)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- Votação: entidades e uma eleição de exemplo (FICTÍCIAS)
-- Os logins das entidades são ligados por scripts/seed-demo.mjs.
-- ---------------------------------------------------------------------
insert into public.vot_entidades (nome, responsavel)
select v.nome, v.resp from (values
  ('Associação Paranaense de Apoio à Infância', 'Rosana Telles'),
  ('Instituto Reconstruir Cidadania',           'Paulo Mendes'),
  ('Rede Mulheres do Litoral',                  'Ivone Prado'),
  ('Coletivo Direitos no Campo',                'Jorge Albuquerque'),
  ('Fórum da Juventude de Londrina',            'Bianca Farias'),
  ('Centro de Defesa dos Direitos Humanos de Maringá', 'Hélio Ramos')
) as v(nome, resp)
where not exists (select 1 from public.vot_entidades e where e.nome = v.nome);

insert into public.vot_eleicoes (titulo, abre_em, fecha_em, votos_por_entidade)
select 'Conselho Estadual · vagas da sociedade civil', now() - interval '1 day', now() + interval '6 days', 3
where not exists (select 1 from public.vot_eleicoes);

insert into public.vot_candidaturas (eleicao_id, entidade_id)
select e.id, en.id from public.vot_eleicoes e cross join public.vot_entidades en
on conflict do nothing;
