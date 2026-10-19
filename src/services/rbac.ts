import { Usuario, UserRole } from '../types';

export type Permissao =
  // Frotas
  | 'frotas:ver'
  | 'frotas:solicitar'
  | 'frotas:aprovar'
  | 'frotas:vistoria'
  | 'frotas:gerenciar'
  // Chamados TI
  | 'chamados:ver'
  | 'chamados:abrir'
  | 'chamados:atender'
  | 'chamados:gerenciar'
  // Reserva de Salas
  | 'salas:ver'
  | 'salas:reservar'
  | 'salas:cancelar_qualquer'
  // Diárias
  | 'diarias:ver'
  | 'diarias:calcular'
  | 'diarias:aprovar'
  // CENSE
  | 'cense:ver'
  | 'cense:lancar_nfe'
  | 'cense:fiscalizar'
  // Ramais
  | 'ramais:ver'
  | 'ramais:editar'
  // Segurança & Auditoria
  | 'seguranca:auditar'
  | 'seguranca:administrar';

/**
 * Matriz de Permissões RBAC Oficial SEJU/PR
 */
const MATRIZ_PERMISSOES: Record<UserRole, Permissao[]> = {
  servidor: [
    'frotas:ver',
    'frotas:solicitar',
    'chamados:ver',
    'chamados:abrir',
    'salas:ver',
    'salas:reservar',
    'diarias:ver',
    'diarias:calcular',
    'cense:ver',
    'ramais:ver'
  ],
  gestor_frota: [
    'frotas:ver',
    'frotas:solicitar',
    'frotas:aprovar',
    'frotas:vistoria',
    'frotas:gerenciar',
    'chamados:ver',
    'chamados:abrir',
    'salas:ver',
    'salas:reservar',
    'diarias:ver',
    'diarias:calcular',
    'cense:ver',
    'ramais:ver',
    'seguranca:auditar'
  ],
  chefe_gabinete: [
    'frotas:ver',
    'frotas:solicitar',
    'frotas:aprovar',
    'frotas:vistoria',
    'chamados:ver',
    'chamados:abrir',
    'salas:ver',
    'salas:reservar',
    'salas:cancelar_qualquer',
    'diarias:ver',
    'diarias:calcular',
    'diarias:aprovar',
    'cense:ver',
    'cense:fiscalizar',
    'ramais:ver',
    'seguranca:auditar'
  ],
  admin: [
    'frotas:ver',
    'frotas:solicitar',
    'frotas:aprovar',
    'frotas:vistoria',
    'frotas:gerenciar',
    'chamados:ver',
    'chamados:abrir',
    'chamados:atender',
    'chamados:gerenciar',
    'salas:ver',
    'salas:reservar',
    'salas:cancelar_qualquer',
    'diarias:ver',
    'diarias:calcular',
    'diarias:aprovar',
    'cense:ver',
    'cense:lancar_nfe',
    'cense:fiscalizar',
    'ramais:ver',
    'ramais:editar',
    'seguranca:auditar',
    'seguranca:administrar'
  ]
};

/**
 * Verifica se um usuário possui determinada permissão
 */
export function temPermissao(usuario: Usuario | null | undefined, permissao: Permissao): boolean {
  if (!usuario) return false;
  if (usuario.role === 'admin') return true;
  const permissoes = MATRIZ_PERMISSOES[usuario.role] || [];
  return permissoes.includes(permissao);
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
