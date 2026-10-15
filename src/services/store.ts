import { Agendamento, AuditoriaLog, Notificacao, Usuario, Veiculo, Vistoria } from '../types';

const STORAGE_KEY = 'portal_seju_gestao_v1';

export const USUARIOS_MOCK: Usuario[] = [
  {
    id: 'u-servidor',
    nome: 'Carlos Silveira',
    username: 'carlos.silveira',
    role: 'servidor',
    email: 'carlos.silveira@seju.pr.gov.br',
    cpf: '123.456.789-00',
    setor: 'Coordenação de Direitos Humanos',
    cargo: 'Agente Profissional'
  },
  {
    id: 'u-chefe',
    nome: 'Dra. Maria Helena',
    username: 'maria.helena',
    role: 'chefe_gabinete',
    email: 'chefia.gabinete@seju.pr.gov.br',
    cpf: '987.654.321-99',
    setor: 'Chefia de Gabinete',
    cargo: 'Chefe de Gabinete'
  },
  {
    id: 'u-transporte',
    nome: 'Marcos Viana',
    username: 'marcos.transporte',
    role: 'gestor_frota',
    email: 'transporte.seju@pr.gov.br',
    cpf: '456.789.123-55',
    setor: 'Setor de Transporte e Frotas',
    cargo: 'Gestor de Transporte'
  },
  {
    id: 'u-admin',
    nome: 'Administrador SEJU',
    username: 'admin',
    role: 'admin',
    email: 'admin.sistema@seju.pr.gov.br',
    cpf: '000.000.000-00',
    setor: 'Tecnologia da Informação',
    cargo: 'Administrador Geral'
  }
];

export const VEICULOS_INICIAIS: Veiculo[] = [
  {
    id: 'V1',
    modelo: 'Toyota Corolla Sedan 2.0',
    placa: 'BCB-4A12',
    cor: 'Prata',
    capacidade: 5,
    status: 'disponivel',
    kmAtual: 34210,
    nivelCombustivel: 85,
    ano: 2023
  },
  {
    id: 'V2',
    modelo: 'Renault Duster Intense 1.6',
    placa: 'RHZ-9D88',
    cor: 'Branco',
    capacidade: 5,
    status: 'em_missao',
    kmAtual: 52800,
    nivelCombustivel: 60,
    ano: 2022
  },
  {
    id: 'V3',
    modelo: 'Chevrolet Spin Premier 7 Lugares',
    placa: 'BDF-3J21',
    cor: 'Cinza',
    capacidade: 7,
    status: 'disponivel',
    kmAtual: 28150,
    nivelCombustivel: 95,
    ano: 2023
  },
  {
    id: 'V4',
    modelo: 'Fiat Toro Freedom 4x4 Diesel',
    placa: 'RHD-1H45',
    cor: 'Preto',
    capacidade: 5,
    status: 'disponivel',
    kmAtual: 64120,
    nivelCombustivel: 45,
    ano: 2021
  }
];

export const AGENDAMENTOS_INICIAIS: Agendamento[] = [
  {
    id: 'AG-1001',
    ticket: 'AG-20261015-8491',
    nome: 'Carlos Silveira',
    cpf: '123.456.789-00',
    telefone: '(41) 99876-5432',
    email: 'carlos.silveira@seju.pr.gov.br',
    veiculoId: 'V1',
    veiculoNome: 'Toyota Corolla Sedan 2.0',
    veiculoPlaca: 'BCB-4A12',
    datas: ['2026-10-16'],
    periodo: 'dia_todo',
    modalidade: 'com_motorista',
    destino: 'Paranaguá/PR — Inspeção técnica da unidade de atendimento socioeducativo.',
    passageiros: 'Carlos Silveira e Ana Beatriz (Psicóloga)',
    status: 'pendente',
    criadoEm: '2026-10-15T09:30:00'
  },
  {
    id: 'AG-1002',
    ticket: 'AG-20261015-7723',
    nome: 'Juliana Mendes',
    cpf: '456.123.789-11',
    telefone: '(41) 98765-4321',
    email: 'juliana.mendes@seju.pr.gov.br',
    veiculoId: 'V2',
    veiculoNome: 'Renault Duster Intense 1.6',
    veiculoPlaca: 'RHZ-9D88',
    datas: ['2026-10-15'],
    periodo: 'dia_todo',
    modalidade: 'sem_motorista',
    destino: 'Ponta Grossa/PR — Audiência pública de conciliação comunitária.',
    passageiros: 'Juliana Mendes',
    status: 'em_andamento',
    criadoEm: '2026-10-14T14:15:00',
    aprovadorNome: 'Dra. Maria Helena',
    aprovadorCpf: '987.654.321-99',
    aprovadoEm: '2026-10-14T16:00:00',
    hashAuditoria: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    checkinId: 'vis-1002-in'
  },
  {
    id: 'AG-1003',
    ticket: 'AG-20261014-6102',
    nome: 'Roberto Antunes',
    cpf: '789.456.123-22',
    telefone: '(41) 99123-4567',
    email: 'roberto.antunes@seju.pr.gov.br',
    veiculoId: 'V3',
    veiculoNome: 'Chevrolet Spin Premier 7 Lugares',
    veiculoPlaca: 'BDF-3J21',
    datas: ['2026-10-14'],
    periodo: 'tarde',
    modalidade: 'com_motorista',
    destino: 'São José dos Pinhais/PR — Transporte de equipe para vistoria de acessibilidade.',
    status: 'realizado',
    criadoEm: '2026-10-13T10:00:00',
    aprovadorNome: 'Dra. Maria Helena',
    aprovadorCpf: '987.654.321-99',
    aprovadoEm: '2026-10-13T11:20:00',
    hashAuditoria: '7d5a99f603f2c13652f11b9ecdcd6f6c04f9ffb6b9d6a36f73a388b17163c45b',
    checkinId: 'vis-1003-in',
    checkoutId: 'vis-1003-out'
  }
];

export const VISTORIAS_INICIAIS: Vistoria[] = [
  {
    id: 'vis-1002-in',
    agendamentoId: 'AG-1002',
    ticket: 'AG-20261015-7723',
    veiculoId: 'V2',
    tipo: 'checkin',
    km: 52710,
    nivelCombustivel: 65,
    fotos: {
      frente: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
      traseira: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80',
      lateralDireita: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80',
      lateralEsquerda: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=400&q=80'
    },
    motoristaNome: 'Juliana Mendes',
    motoristaCpf: '456.123.789-11',
    observacoesAvarias: 'Pequeno risco superficial próximo ao para-choque traseiro direito já catalogado.',
    dataHora: '2026-10-15T08:00:00',
    hashAuditoria: 'a5892c911833b32aaf4ced573168502f8b9fb35221493009d1b1f634642746df'
  }
];

export const AUDITORIA_INICIAL: AuditoriaLog[] = [
  {
    id: 'log-1',
    time: '2026-10-15T09:30:12',
    user: 'Carlos Silveira',
    cpf: '123.456.789-00',
    ip: '187.115.82.14',
    action: 'SOLICITACAO_CRIADA',
    details: 'Ticket AG-20261015-8491 — Destino: Paranaguá/PR',
    hash: 'b12a849f13e792c300fa71b1e9e2467d023f81e3609825b410408544d62cfa01'
  },
  {
    id: 'log-2',
    time: '2026-10-14T16:00:44',
    user: 'Dra. Maria Helena',
    cpf: '987.654.321-99',
    ip: '187.115.82.10',
    action: 'APROVACAO_CHEFIA_1CLIQUE',
    details: 'Ticket AG-20261015-7723 — Aprovado via mobile',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    id: 'log-3',
    time: '2026-10-15T08:05:19',
    user: 'Marcos Viana',
    cpf: '456.789.123-55',
    ip: '187.115.82.20',
    action: 'CHECKIN_VISTORIA_FOTOS',
    details: 'Veículo RHZ-9D88 — Km 52710 — 4 fotos registradas',
    hash: 'a5892c911833b32aaf4ced573168502f8b9fb35221493009d1b1f634642746df'
  }
];

export interface AppState {
  currentUser: Usuario;
  veiculos: Veiculo[];
  agendamentos: Agendamento[];
  vistorias: Vistoria[];
  logs: AuditoriaLog[];
  notificacoes: Notificacao[];
}

export function loadInitialState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        currentUser: parsed.currentUser || USUARIOS_MOCK[0],
        veiculos: parsed.veiculos?.length ? parsed.veiculos : VEICULOS_INICIAIS,
        agendamentos: parsed.agendamentos?.length ? parsed.agendamentos : AGENDAMENTOS_INICIAIS,
        vistorias: parsed.vistorias?.length ? parsed.vistorias : VISTORIAS_INICIAIS,
        logs: parsed.logs?.length ? parsed.logs : AUDITORIA_INICIAL,
        notificacoes: parsed.notificacoes || []
      };
    }
  } catch (e) {
    console.warn('Erro ao ler estado do storage:', e);
  }

  return {
    currentUser: USUARIOS_MOCK[0], // Começa como Servidor
    veiculos: VEICULOS_INICIAIS,
    agendamentos: AGENDAMENTOS_INICIAIS,
    vistorias: VISTORIAS_INICIAIS,
    logs: AUDITORIA_INICIAL,
    notificacoes: [
      {
        id: 'n-1',
        destinatario: 'Carlos Silveira',
        email: 'carlos.silveira@seju.pr.gov.br',
        titulo: 'Bem-vindo ao Portal de Gestão',
        mensagem: 'Utilize o simulador no topo para alternar entre Servidor, Chefe, Transporte e Admin.',
        tipo: 'nova_solicitacao',
        lida: false,
        data: '10:00',
        ticket: 'AG-20261015-8491'
      }
    ]
  };
}

export function saveStateToStorage(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Erro ao salvar estado:', e);
  }
}
