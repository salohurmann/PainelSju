export type SituacaoEleicao = 'agendada' | 'aberta' | 'encerrada';

export interface Entidade {
  id: string;
  nome: string;
  responsavel: string;
  /** Pessoa (login) ligada à entidade. */
  perfil_id: string | null;
  ativa: boolean;
  pode_votar: boolean;
  pode_ser_candidata: boolean;
}

export interface Eleicao {
  id: string;
  titulo: string;
  abre_em: string;
  fecha_em: string;
  votos_por_entidade: number;
  situacao: SituacaoEleicao;
  ja_votou: boolean;
  total_candidatas: number;
  /** Entidades ativas e habilitadas a votar. */
  total_aptas: number;
  total_eleitoras_votaram: number;
  candidatas: Array<{ id: string; nome: string }>;
}

export interface Resultado {
  eleicao: Pick<Eleicao, 'id' | 'titulo' | 'abre_em' | 'fecha_em' | 'votos_por_entidade' | 'situacao'>;
  /** Entidades aptas a votar. */
  total_entidades: number;
  total_votaram: number;
  participacao: number;
  candidatas: Array<{ id: string; nome: string; votos: number }>;
}

export interface NovaEleicao {
  id?: string;
  titulo: string;
  abre_em: string;
  fecha_em: string;
  votos_por_entidade: number;
  candidatas: string[];
}

/** Mesma interface para o banco (Supabase) e para o modo demonstração. */
export interface ApiVotacao {
  listarEleicoes(): Promise<Eleicao[]>;
  minhaEntidade(): Promise<Entidade | null>;
  votar(eleicaoId: string, candidatas: string[]): Promise<void>;
  resultado(eleicaoId: string): Promise<Resultado>;
  listarEntidades(): Promise<Entidade[]>;
  salvarEntidade(e: Omit<Entidade, 'id'> & { id?: string }): Promise<void>;
  excluirEntidade(id: string): Promise<void>;
  salvarEleicao(e: NovaEleicao): Promise<void>;
  excluirEleicao(id: string): Promise<void>;
}

export const situacaoDe = (abre: string, fecha: string, agora = Date.now()): SituacaoEleicao =>
  agora < new Date(abre).getTime() ? 'agendada' : agora <= new Date(fecha).getTime() ? 'aberta' : 'encerrada';
