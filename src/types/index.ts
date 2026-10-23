export type UserRole =
  | 'servidor'
  | 'tecnico_ti'
  | 'gestor_frota'
  | 'diretor_cense'
  | 'chefe_gabinete'
  | 'gestor_votacao'
  | 'entidade_votante'
  | 'admin';

export interface Usuario {
  id: string;
  nome: string;
  username: string;
  role: UserRole;
  email: string;
  cpf: string;
  setor: string;
  /** Sigla do setor (NAS, GAB, UTSC...). Decide quais módulos a pessoa vê. */
  setorSigla?: string;
  cargo: string;
}

export type StatusVeiculo = 'disponivel' | 'em_missao' | 'manutencao';

export interface Veiculo {
  id: string;
  modelo: string;
  placa: string;
  cor: string;
  capacidade: number;
  status: StatusVeiculo;
  kmAtual: number;
  nivelCombustivel: number; // 0 a 100
  ano?: number;
}

export type PeriodoAgendamento = 'manha' | 'tarde' | 'dia_todo';
export type ModalidadeAgendamento = 'com_motorista' | 'sem_motorista';
export type StatusAgendamento = 
  | 'pendente' 
  | 'aprovado' 
  | 'reprovado' 
  | 'em_andamento' 
  | 'realizado' 
  | 'nao_compareceu';

export interface Agendamento {
  id: string;
  ticket: string; // Ex: AG-20261015-8491
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  veiculoId: string;
  veiculoNome: string;
  veiculoPlaca: string;
  datas: string[]; // YYYY-MM-DD
  periodo: PeriodoAgendamento;
  modalidade: ModalidadeAgendamento;
  destino: string;
  passageiros?: string;
  status: StatusAgendamento;
  criadoEm: string;
  obs?: string;
  aprovadorNome?: string;
  aprovadorCpf?: string;
  aprovadoEm?: string;
  hashAuditoria?: string;
  // Vistoria refs
  checkinId?: string;
  checkoutId?: string;
}

export interface VistoriaFotos {
  frente?: string;
  traseira?: string;
  lateralDireita?: string;
  lateralEsquerda?: string;
}

export interface Vistoria {
  id: string;
  agendamentoId: string;
  ticket: string;
  veiculoId: string;
  tipo: 'checkin' | 'checkout';
  km: number;
  nivelCombustivel: number;
  fotos: VistoriaFotos;
  motoristaNome: string;
  motoristaCpf: string;
  observacoesAvarias?: string;
  dataHora: string;
  hashAuditoria: string;
}

export interface AuditoriaLog {
  id: string;
  time: string;
  user: string;
  cpf: string;
  ip: string;
  action: string;
  details?: string;
  hash: string;
}

export interface Notificacao {
  id: string;
  destinatario: string;
  email: string;
  titulo: string;
  mensagem: string;
  tipo: 'nova_solicitacao' | 'aprovado' | 'reprovado' | 'checkin' | 'checkout';
  lida: boolean;
  data: string;
  ticket?: string;
}

/** Módulos que abrem dentro do Painel (a Mesa é 'hub'). */
export type AppModuleId = 'frota' | 'chamados' | 'salas' | 'diarias' | 'cense' | 'ramais' | 'votacao' | 'admin';
