import type { Usuario } from '../types';

import { temPermissaoDemo, type PermissaoDemo } from './acessoDemo';

export type Permissao = PermissaoDemo;

/**
 * Com login real, quem responde é o banco (contexto da sessão). O SessaoProvider
 * registra aqui a função "pode" do usuário logado.
 */
type FonteReal = { usuarioId: string; pode: (permissao: string) => boolean };
let fonteReal: FonteReal | null = null;
export function definirFontePermissoes(f: FonteReal | null): void {
  fonteReal = f;
}

// Nomes que mudaram entre o front antigo e o banco.
const NO_BANCO: Partial<Record<Permissao, string[]>> = {
  'diarias:calcular': ['diarias:solicitar'],
  'seguranca:administrar': ['usuarios:gerenciar', 'admin:configurar'],
};

/**
 * Verifica se um usuário possui determinada permissão
 * (papel + módulo liberado para o setor dele).
 */
export function temPermissao(usuario: Usuario | null | undefined, permissao: Permissao): boolean {
  if (!usuario) return false;
  if (fonteReal && fonteReal.usuarioId === usuario.id) {
    const nomes = NO_BANCO[permissao] ?? [permissao];
    return nomes.some(n => fonteReal!.pode(n));
  }
  return temPermissaoDemo(usuario, permissao);
}

/**
 * Regra de Separação de Funções (Segurança & Governança Pública):
 * Um servidor NUNCA pode aprovar sua própria solicitação de viagem ou diária.
 */
export function podeAprovarSolicitacao(
  usuario: Usuario,
  solicitanteCpf: string,
  tipo: 'frotas' | 'diarias' = 'frotas'
): { permitido: boolean; motivo?: string } {
  const permissaoNecessaria: Permissao = tipo === 'frotas' ? 'frotas:aprovar' : 'diarias:aprovar';

  if (!temPermissao(usuario, permissaoNecessaria)) {
    return {
      permitido: false,
      motivo: 'Seu perfil não possui atribuição de despacho para este módulo.'
    };
  }

  // Compara os dígitos limpos do CPF
  const cpfAprovador = usuario.cpf.replace(/\D/g, '');
  const cpfSolicitante = solicitanteCpf.replace(/\D/g, '');

  if (cpfAprovador && cpfSolicitante && cpfAprovador === cpfSolicitante) {
    return {
      permitido: false,
      motivo: 'Conflito de interesse (Segregação de Funções): Você não pode aprovar a sua própria solicitação.'
    };
  }

  return { permitido: true };
}
