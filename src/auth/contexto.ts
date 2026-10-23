import { createContext, useContext } from 'react';
import type { ContextoSessao, Permissao } from '../data/supabase/tipos';
import type { Usuario, UserRole } from '../types';

export type EstadoSessao =
  | { fase: 'demo' }                                   // sem Supabase: dados locais de demonstração
  | { fase: 'carregando' }
  | { fase: 'anonimo' }                                // precisa entrar
  | { fase: 'definir_senha'; motivo: 'invite' | 'recovery' }
  | { fase: 'inativo' }                                // conta desativada pela administração
  | { fase: 'autenticado'; contexto: ContextoSessao }
  | { fase: 'erro'; mensagem: string };

export interface ValorSessao {
  estado: EstadoSessao;
  /** Usuário no formato que as telas atuais esperam (null fora do modo autenticado). */
  usuario: Usuario | null;
  pode: (permissao: Permissao) => boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
  recarregar: () => Promise<void>;
  senhaDefinida: () => Promise<void>;
}

export const ContextoSessaoReact = createContext<ValorSessao | null>(null);

export function useSessao(): ValorSessao {
  const v = useContext(ContextoSessaoReact);
  if (!v) throw new Error('useSessao precisa estar dentro de <SessaoProvider>.');
  return v;
}

const PAPEIS_CONHECIDOS: UserRole[] = ['servidor', 'tecnico_ti', 'gestor_frota', 'diretor_cense', 'chefe_gabinete', 'gestor_votacao', 'entidade_votante', 'admin'];
/** Papel criado no banco que o front ainda não conhece vira "servidor" só para exibição; as permissões vêm do banco. */
function papelLegado(papel: string): UserRole {
  return (PAPEIS_CONHECIDOS as string[]).includes(papel) ? (papel as UserRole) : 'servidor';
}

/** Converte o contexto do banco para o tipo Usuario usado pelas telas atuais. */
export function paraUsuarioLegado(c: ContextoSessao): Usuario {
  return {
    id: c.perfil.id,
    nome: c.perfil.nome,
    username: c.perfil.email.split('@')[0],
    role: papelLegado(c.perfil.papel_id),
    email: c.perfil.email,
    cpf: '',
    setor: c.perfil.setor?.nome ?? '',
    setorSigla: c.perfil.setor?.sigla,
    cargo: c.perfil.cargo,
  };
}
