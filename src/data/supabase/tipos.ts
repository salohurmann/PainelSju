/**
 * Tipos das tabelas e funções do banco (espelham supabase/migrations).
 * Ao mudar o schema, atualize aqui — ou gere automaticamente com
 * `npx supabase gen types typescript --linked`.
 */

export type PapelId = 'servidor' | 'tecnico_ti' | 'gestor_frota' | 'diretor_cense' | 'chefe_gabinete' | 'admin' | (string & {});

export type Permissao =
  | 'frotas:ver' | 'frotas:solicitar' | 'frotas:aprovar' | 'frotas:vistoria' | 'frotas:gerenciar'
  | 'chamados:ver' | 'chamados:abrir' | 'chamados:atender' | 'chamados:gerenciar'
  | 'salas:ver' | 'salas:reservar' | 'salas:cancelar_qualquer' | 'salas:gerenciar'
  | 'diarias:ver' | 'diarias:solicitar' | 'diarias:aprovar' | 'diarias:gerenciar'
  | 'cense:ver' | 'cense:lancar_nfe' | 'cense:fiscalizar'
  | 'ramais:ver' | 'ramais:editar'
  | 'seguranca:auditar' | 'usuarios:gerenciar' | 'admin:configurar';

export interface Setor { id: string; sigla: string; nome: string; ativo: boolean; criado_em: string }

export interface Papel { id: PapelId; nome: string; descricao: string; sistema: boolean }

export interface PermissaoInfo { id: Permissao; modulo: string; descricao: string }

export interface Modulo { id: string; nome: string; descricao: string; ativo: boolean; ordem: number }

export interface Perfil {
  id: string;
  nome: string;
  email: string;
  cpf: string | null;
  telefone: string | null;
  cargo: string;
  setor_id: string | null;
  papel_id: PapelId;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface PessoaDiretorio {
  id: string; nome: string; email: string; cargo: string; telefone: string | null;
  setor_id: string | null; setor_sigla: string | null; setor_nome: string | null; papel_id: PapelId;
}

export interface ContextoSessao {
  perfil: {
    id: string; nome: string; email: string; cargo: string; telefone: string | null;
    papel_id: PapelId; ativo: boolean;
    setor: { id: string; sigla: string; nome: string } | null;
  };
  permissoes: Permissao[];
  modulos: Array<{ id: string; nome: string; descricao: string }>;
  notificacoes_nao_lidas: number;
}

// ---------------------------------------------------------------- Frota
export type StatusVeiculo = 'disponivel' | 'em_missao' | 'manutencao' | 'inativo';
export interface Veiculo {
  id: string; modelo: string; placa: string; cor: string; capacidade: number; ano: number | null;
  status: StatusVeiculo; km_atual: number; nivel_combustivel: number; criado_em: string; atualizado_em: string;
}

export type StatusAgendamento =
  | 'pendente' | 'aprovado' | 'reprovado' | 'cancelado' | 'em_andamento' | 'realizado' | 'nao_compareceu';
export interface Agendamento {
  id: string; protocolo: string; solicitante_id: string; solicitante_nome: string;
  telefone: string | null; email: string | null; veiculo_id: string;
  datas: string[]; periodo: 'manha' | 'tarde' | 'dia_todo'; modalidade: 'com_motorista' | 'sem_motorista';
  destino: string; passageiros: string | null; status: StatusAgendamento;
  motivo_decisao: string | null; decidido_por: string | null; decidido_em: string | null;
  criado_em: string; atualizado_em: string;
}
export type NovoAgendamento = Pick<Agendamento, 'veiculo_id' | 'datas' | 'periodo' | 'modalidade' | 'destino'>
  & Partial<Pick<Agendamento, 'passageiros' | 'telefone'>>;

export interface FotosVistoria { frente: string; traseira: string; lateral_direita: string; lateral_esquerda: string }
export interface Vistoria {
  id: string; agendamento_id: string; veiculo_id: string; tipo: 'saida' | 'retorno';
  km: number; nivel_combustivel: number; fotos: FotosVistoria; observacoes: string | null;
  vistoriador_id: string; criado_em: string;
}

// ------------------------------------------------------------- Chamados
export type TipoChamado = 'ti' | 'manutencao' | 'almoxarifado';
export type PrioridadeChamado = 'urgente' | 'alta' | 'media' | 'baixa';
export type StatusChamado = 'a_fazer' | 'em_andamento' | 'concluido' | 'cancelado';
export interface Chamado {
  id: string; protocolo: string; tipo: TipoChamado; titulo: string; descricao: string;
  solicitante_id: string; solicitante_nome: string; setor_id: string | null;
  prioridade: PrioridadeChamado; status: StatusChamado; tecnico_id: string | null;
  prazo_sla: string; solucao: string | null; aberto_em: string; iniciado_em: string | null;
  concluido_em: string | null; atualizado_em: string;
}
export interface NotaChamado {
  id: string; chamado_id: string; autor_id: string; autor_nome: string; texto: string; interna: boolean; criado_em: string;
}

// ---------------------------------------------------------------- Salas
export interface Sala {
  id: string; codigo: string; nome: string; andar: string; capacidade: number;
  layout: string; equipamentos: string; ativo: boolean;
}
export type RecursoExtra = 'copa' | 'transmissao_hibrida' | 'suporte_ti' | 'gravacao';
export interface Reserva {
  id: string; protocolo: string; sala_id: string; responsavel_id: string; responsavel_nome: string;
  motivo: string; participantes: number | null; inicio: string; fim: string; recursos_extras: RecursoExtra[];
  status: 'ativa' | 'cancelada'; cancelada_por: string | null; cancelada_em: string | null;
  motivo_cancelamento: string | null; criado_em: string;
}

// -------------------------------------------------------------- Diárias
export interface FaixaDiaria { nivel: string; rotulo: string; valor_dia: number; base_legal: string }
export interface CalculoDiaria {
  valor_dia: number; valor_total: number;
  parcela_hospedagem: number; parcela_alimentacao: number; parcela_locomocao: number;
}
export type StatusDiaria = 'pendente' | 'aprovada' | 'reprovada' | 'cancelada' | 'empenhada' | 'prestacao_contas' | 'encerrada';
export interface SolicitacaoDiaria extends CalculoDiaria {
  id: string; protocolo: string; servidor_id: string; servidor_nome: string; nivel: string;
  destino: string; regiao: string | null; distancia_km: number | null;
  data_ida: string; data_volta: string; dias: number; com_pernoite: boolean; motivo: string;
  status: StatusDiaria; motivo_decisao: string | null; decidido_por: string | null; decidido_em: string | null;
  criado_em: string;
}
export type NovaDiaria = Pick<SolicitacaoDiaria, 'nivel' | 'destino' | 'data_ida' | 'data_volta' | 'dias' | 'com_pernoite' | 'motivo'>
  & Partial<Pick<SolicitacaoDiaria, 'regiao' | 'distancia_km'>>;

// ---------------------------------------------------------------- CENSE
export interface UnidadeCense {
  id: string; slug: string; nome: string; cidade: string; regional: string; diretor_nome: string;
  matricula: string | null; responsavel_id: string | null; cota_trimestral: number; competencia: string;
  prazo_prestacao: string | null; status_fiscal: 'regular' | 'em_analise' | 'alerta_glosa'; ativo: boolean;
}
export interface NotaCense {
  id: string; unidade_id: string; competencia: string; numero_nf: string; chave_acesso: string | null;
  data_emissao: string; fornecedor: string; cnpj: string; rubrica: '33.90.30' | '33.90.39';
  categoria: string; descricao: string; valor: number; tres_orcamentos: boolean; comprovante_path: string | null;
  status: 'pendente' | 'aprovada' | 'glosada'; motivo_glosa: string | null;
  lancado_por: string; analisado_por: string | null; analisado_em: string | null; criado_em: string;
}
export type NovaNotaCense = Pick<NotaCense, 'unidade_id' | 'numero_nf' | 'data_emissao' | 'fornecedor' | 'cnpj' | 'rubrica' | 'valor'>
  & Partial<Pick<NotaCense, 'chave_acesso' | 'categoria' | 'descricao' | 'tres_orcamentos' | 'comprovante_path' | 'competencia'>>;
export interface SaldoCense {
  unidade_id: string; slug: string; nome: string; competencia: string; cota_trimestral: number;
  utilizado: number; saldo: number; notas_pendentes: number; notas_glosadas: number;
}

// --------------------------------------------------------------- Ramais
export interface Ramal {
  id: string; setor_id: string | null; setor_nome: string; departamento: string; responsavel: string;
  cargo: string; ramal: string; telefone_direto: string | null; email: string | null; andar: string; ativo: boolean;
}

// -------------------------------------------- Notificações e auditoria
export interface Notificacao {
  id: string; destinatario_id: string; titulo: string; mensagem: string;
  tipo: 'info' | 'acao_necessaria' | 'aprovado' | 'reprovado' | 'alerta';
  link: string | null; lida: boolean; criado_em: string;
}
export interface RegistroAuditoria {
  id: number; ocorrido_em: string; ator_id: string | null; ator_nome: string | null; acao: string;
  entidade: string; entidade_id: string | null; detalhes: Record<string, unknown>;
  hash_anterior: string | null; hash: string;
}
export interface VerificacaoAuditoria { integra: boolean; total: number; primeiro_invalido: number | null }

// ----------------------------------------------------------------- Mesa
export interface Pendencia {
  tipo: 'frota_aprovacao' | 'frota_vistoria' | 'diaria_aprovacao' | 'chamado' | 'cense_analise';
  referencia: string; protocolo: string | null; titulo: string; descricao: string | null;
  solicitante: string | null; desde: string; prazo: string | null;
  urgencia: 'vencida' | 'alta' | 'media' | 'baixa'; link: string;
}
