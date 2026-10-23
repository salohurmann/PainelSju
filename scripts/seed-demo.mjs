#!/usr/bin/env node
// =====================================================================
// Cria as contas FICTÍCIAS de demonstração e alguns registros de exemplo.
// Rode UMA vez depois de aplicar as migrations e o seed.sql.
//
//   SUPABASE_URL=https://xxxx.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=... \
//   DEMO_SENHA='UmaSenhaForte123' \
//   node scripts/seed-demo.mjs
//
// Opcional: DEMO_DOMINIO (padrão: demo.painelsju.dev)
// A service role key é secreta: use só no seu computador, nunca no front.
// O script é idempotente: contas e registros existentes são mantidos.
// =====================================================================
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const senha = process.env.DEMO_SENHA;
const dominio = process.env.DEMO_DOMINIO || 'demo.painelsju.dev';

if (!url || !serviceKey) {
  console.error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}
if (!senha || senha.length < 10 || !/[a-z]/.test(senha) || !/[A-Z]/.test(senha) || !/\d/.test(senha)) {
  console.error('Defina DEMO_SENHA com pelo menos 10 caracteres, maiúscula, minúscula e número.');
  process.exit(1);
}

const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

// Pessoas fictícias (mesmos nomes usados na apresentação)
const PESSOAS = [
  { login: 'lucia.viana',     nome: 'Lúcia Andrade Viana',  setor: 'NAS',    papel: 'servidor',       cargo: 'Técnica Administrativa' },
  { login: 'carlos.silveira', nome: 'Carlos Silveira',      setor: 'CDH',    papel: 'servidor',       cargo: 'Agente Profissional' },
  { login: 'otavio.carvalho', nome: 'Otávio Lins Carvalho', setor: 'UTEC',   papel: 'tecnico_ti',     cargo: 'Analista de Sistemas' },
  { login: 'marcos.viana',    nome: 'Marcos Viana',         setor: 'TRANSP', papel: 'gestor_frota',   cargo: 'Gestor de Transporte' },
  { login: 'maria.helena',    nome: 'Dra. Maria Helena',    setor: 'GAB',    papel: 'chefe_gabinete', cargo: 'Chefe de Gabinete' },
  { login: 'direcao.cense',   nome: 'Direção CENSE Curitiba', setor: 'NFS', papel: 'diretor_cense', cargo: 'Diretor de Unidade' },
  { login: 'admin',           nome: 'Administração do Painel', setor: 'UTEC', papel: 'admin',         cargo: 'Administrador do Sistema' },
  { login: 'utsc.gestao',     nome: 'Fernanda Rocha',       setor: 'UTSC',   papel: 'gestor_votacao', cargo: 'Coordenadora da UTSC' },
  { login: 'entidade.infancia', nome: 'Rosana Telles',      setor: 'UTSC',   papel: 'entidade_votante', cargo: 'Associação Paranaense de Apoio à Infância', entidade: 'Associação Paranaense de Apoio à Infância' },
  { login: 'entidade.reconstruir', nome: 'Paulo Mendes',    setor: 'UTSC',   papel: 'entidade_votante', cargo: 'Instituto Reconstruir Cidadania', entidade: 'Instituto Reconstruir Cidadania' },
];

async function usuariosExistentes() {
  const mapa = new Map();
  for (let page = 1; ; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    for (const u of data.users) mapa.set(u.email.toLowerCase(), u.id);
    if (data.users.length < 200) break;
  }
  return mapa;
}

function dataLocal(diasAFrente) {
  const d = new Date();
  d.setDate(d.getDate() + diasAFrente);
  return d.toISOString().slice(0, 10);
}

function horarioLocal(diasAFrente, hora) {
  // Brasília (UTC-3, sem horário de verão)
  return `${dataLocal(diasAFrente)}T${String(hora).padStart(2, '0')}:00:00-03:00`;
}

async function main() {
  const existentes = await usuariosExistentes();
  const ids = {};

  for (const p of PESSOAS) {
    const email = `${p.login}@${dominio}`;
    if (existentes.has(email)) {
      ids[p.login] = existentes.get(email);
      console.log(`= ${email} já existe`);
      continue;
    }
    const { data, error } = await db.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { nome: p.nome, setor_sigla: p.setor, papel_id: p.papel, cargo: p.cargo },
    });
    if (error) throw new Error(`Falha ao criar ${email}: ${error.message}`);
    ids[p.login] = data.user.id;
    console.log(`+ ${email} (${p.papel})`);
  }

  // Logins das entidades da votação
  for (const p of PESSOAS.filter((x) => x.entidade)) {
    await db.from('vot_entidades').update({ perfil_id: ids[p.login] }).eq('nome', p.entidade);
  }

  // Direção CENSE responde pela unidade de Curitiba
  await db.from('cense_unidades').update({ responsavel_id: ids['direcao.cense'] }).eq('slug', 'cense-curitiba');

  // Registros de exemplo (só se ainda não houver nenhum)
  const { count } = await db.from('agendamentos').select('id', { count: 'exact', head: true });
  if (count) {
    console.log('= dados de exemplo já existem; nada a fazer');
    return;
  }

  const { data: veiculos } = await db.from('veiculos').select('id, placa');
  const veiculo = (placa) => veiculos.find((v) => v.placa === placa).id;
  const { data: salas } = await db.from('salas').select('id, codigo');
  const sala = (codigo) => salas.find((s) => s.codigo === codigo).id;

  const passos = [
    db.from('agendamentos').insert({
      solicitante_id: ids['carlos.silveira'], veiculo_id: veiculo('BCB4A12'), datas: [dataLocal(2)],
      periodo: 'dia_todo', modalidade: 'com_motorista',
      destino: 'Paranaguá/PR — inspeção técnica de unidade socioeducativa',
      passageiros: 'Carlos Silveira e equipe técnica',
    }),
    db.from('agendamentos').insert({
      solicitante_id: ids['lucia.viana'], veiculo_id: veiculo('BDF3J21'), datas: [dataLocal(5), dataLocal(6)],
      periodo: 'dia_todo', modalidade: 'sem_motorista', destino: 'Londrina/PR — capacitação regional',
    }),
    db.from('chamados').insert([
      { solicitante_id: ids['lucia.viana'], tipo: 'ti', prioridade: 'alta',
        titulo: 'Impressora do NAS sem conexão de rede', descricao: 'A impressora do 1º andar não aparece na rede desde ontem.' },
      { solicitante_id: ids['carlos.silveira'], tipo: 'manutencao', prioridade: 'media',
        titulo: 'Ar-condicionado da sala 102 pingando', descricao: 'Vazamento sobre a mesa de atendimento.' },
    ]),
    db.from('reservas').insert({
      responsavel_id: ids['maria.helena'], sala_id: sala('SEJU-GAB-03'), motivo: 'Reunião de planejamento do Gabinete',
      inicio: horarioLocal(1, 9), fim: horarioLocal(1, 11), recursos_extras: ['copa', 'transmissao_hibrida'], participantes: 12,
    }),
    db.from('solicitacoes_diaria').insert({
      servidor_id: ids['carlos.silveira'], nivel: 'superior', destino: 'Cascavel/PR', regiao: 'Oeste',
      distancia_km: 500, data_ida: dataLocal(9), data_volta: dataLocal(10), dias: 2, com_pernoite: true,
      motivo: 'Visita técnica ao CENSE Cascavel',
    }),
  ];
  for (const passo of passos) {
    const { error } = await passo;
    if (error) throw new Error(`Falha ao criar dados de exemplo: ${error.message}`);
  }
  console.log('+ dados de exemplo criados');
}

main()
  .then(() => console.log(`\nPronto. Entre com qualquer conta acima usando a senha definida em DEMO_SENHA.`))
  .catch((e) => {
    console.error(e.message ?? e);
    process.exit(1);
  });
