/**
 * Controle de acesso do MODO DEMONSTRAÇÃO, com o mesmo desenho do banco:
 *   pessoa → papel + setor
 *   papel  → permissões
 *   módulo → setores que o veem (lista vazia = todos)
 * O admin muda isso na aba Administração; fica salvo neste navegador.
 * Com o Supabase ligado, quem decide é o banco (tem_permissao / meus_modulos).
 */
import { useSyncExternalStore } from 'react';
import type { UserRole, Usuario } from '../types';

export type PermissaoDemo =
  | 'frotas:ver' | 'frotas:solicitar' | 'frotas:aprovar' | 'frotas:vistoria' | 'frotas:gerenciar'
  | 'chamados:ver' | 'chamados:abrir' | 'chamados:atender' | 'chamados:gerenciar'
  | 'salas:ver' | 'salas:reservar' | 'salas:cancelar_qualquer'
  | 'diarias:ver' | 'diarias:calcular' | 'diarias:aprovar'
  | 'cense:ver' | 'cense:lancar_nfe' | 'cense:fiscalizar'
  | 'ramais:ver' | 'ramais:editar'
  | 'votacao:ver' | 'votacao:votar' | 'votacao:gerenciar'
  | 'seguranca:auditar' | 'seguranca:administrar';

export interface SetorDemo {
  sigla: string;
  nome: string;
}

export interface ConfigAcesso {
  setores: SetorDemo[];
  papelPermissoes: Record<UserRole, PermissaoDemo[]>;
  /** módulo → siglas dos setores que veem. Ausente ou vazio = todos. */
  moduloSetores: Record<string, string[]>;
  modulosDesligados: string[];
  /** Mudanças feitas pelo admin em cada pessoa (por id). */
  pessoas: Record<string, { role?: UserRole; setorSigla?: string; ativo?: boolean }>;
}

export const PAPEIS: Array<{ id: UserRole; nome: string; descricao: string }> = [
  { id: 'servidor', nome: 'Servidor(a)', descricao: 'Acesso padrão de quem trabalha na Secretaria' },
  { id: 'tecnico_ti', nome: 'Técnico(a) de TI', descricao: 'Atende chamados de suporte' },
  { id: 'gestor_frota', nome: 'Gestão de Frota', descricao: 'Vistorias e cadastro de veículos' },
  { id: 'diretor_cense', nome: 'Direção / financeiro CENSE', descricao: 'Lança notas fiscais das unidades' },
  { id: 'chefe_gabinete', nome: 'Chefia de Gabinete', descricao: 'Autoriza viagens e diárias, fiscaliza notas' },
  { id: 'gestor_votacao', nome: 'Gestão da Votação', descricao: 'Organiza eleições e entidades' },
  { id: 'entidade_votante', nome: 'Entidade votante', descricao: 'Login de entidade: só vota' },
  { id: 'admin', nome: 'Administração', descricao: 'Acesso total, inclusive a esta tela' },
];

export const PERMISSOES: Array<{ id: PermissaoDemo; modulo: string; descricao: string }> = [
  { id: 'frotas:ver', modulo: 'frota', descricao: 'Ver veículos e o próprio histórico' },
  { id: 'frotas:solicitar', modulo: 'frota', descricao: 'Pedir veículo' },
  { id: 'frotas:aprovar', modulo: 'frota', descricao: 'Autorizar ou recusar pedidos' },
  { id: 'frotas:vistoria', modulo: 'frota', descricao: 'Registrar saída e volta' },
  { id: 'frotas:gerenciar', modulo: 'frota', descricao: 'Cadastrar e editar veículos' },
  { id: 'chamados:ver', modulo: 'chamados', descricao: 'Ver os próprios chamados' },
  { id: 'chamados:abrir', modulo: 'chamados', descricao: 'Abrir chamados' },
  { id: 'chamados:atender', modulo: 'chamados', descricao: 'Atender chamados' },
  { id: 'chamados:gerenciar', modulo: 'chamados', descricao: 'Reabrir e redistribuir' },
  { id: 'salas:ver', modulo: 'salas', descricao: 'Ver a agenda das salas' },
  { id: 'salas:reservar', modulo: 'salas', descricao: 'Reservar salas' },
  { id: 'salas:cancelar_qualquer', modulo: 'salas', descricao: 'Cancelar reserva de outras pessoas' },
  { id: 'diarias:ver', modulo: 'diarias', descricao: 'Ver diárias' },
  { id: 'diarias:calcular', modulo: 'diarias', descricao: 'Pedir diária' },
  { id: 'diarias:aprovar', modulo: 'diarias', descricao: 'Aprovar diárias' },
  { id: 'cense:ver', modulo: 'cense', descricao: 'Ver o fundo rotativo' },
  { id: 'cense:lancar_nfe', modulo: 'cense', descricao: 'Lançar notas fiscais' },
  { id: 'cense:fiscalizar', modulo: 'cense', descricao: 'Aprovar ou recusar notas' },
  { id: 'ramais:ver', modulo: 'ramais', descricao: 'Consultar ramais' },
  { id: 'ramais:editar', modulo: 'ramais', descricao: 'Editar ramais' },
  { id: 'votacao:ver', modulo: 'votacao', descricao: 'Ver eleições e resultados encerrados' },
  { id: 'votacao:votar', modulo: 'votacao', descricao: 'Votar pela própria entidade' },
  { id: 'votacao:gerenciar', modulo: 'votacao', descricao: 'Criar eleições e cadastrar entidades' },
  { id: 'seguranca:auditar', modulo: 'auditoria', descricao: 'Ver o registro de ações' },
  { id: 'seguranca:administrar', modulo: 'admin', descricao: 'Administrar pessoas e acessos' },
];

const BASE_SERVIDOR: PermissaoDemo[] = [
  'frotas:ver', 'frotas:solicitar', 'chamados:ver', 'chamados:abrir', 'salas:ver', 'salas:reservar',
  'diarias:ver', 'diarias:calcular', 'cense:ver', 'ramais:ver', 'votacao:ver',
];

export const CONFIG_PADRAO: ConfigAcesso = {
  setores: [
    { sigla: 'GAB', nome: 'Chefia de Gabinete' },
    { sigla: 'UTEC', nome: 'Unidade Técnica de TI' },
    { sigla: 'NAS', nome: 'Núcleo Administrativo Setorial' },
    { sigla: 'DAG', nome: 'Departamento de Administração Geral' },
    { sigla: 'TRANSP', nome: 'Setor de Transporte e Frotas' },
    { sigla: 'CDH', nome: 'Coordenação de Direitos Humanos' },
    { sigla: 'DEASE', nome: 'Departamento de Atendimento Socioeducativo' },
    { sigla: 'JUR', nome: 'Assessoria Jurídica' },
    { sigla: 'OUV', nome: 'Ouvidoria e Protocolo' },
    { sigla: 'RH', nome: 'Recursos Humanos' },
    { sigla: 'NFS', nome: 'Núcleo Financeiro' },
    { sigla: 'UTSC', nome: 'Unidade Técnica (UTSC)' },
  ],
  papelPermissoes: {
    servidor: BASE_SERVIDOR,
    tecnico_ti: [...BASE_SERVIDOR, 'chamados:atender', 'ramais:editar'],
    gestor_frota: [...BASE_SERVIDOR, 'frotas:aprovar', 'frotas:vistoria', 'frotas:gerenciar', 'seguranca:auditar'],
    diretor_cense: [...BASE_SERVIDOR, 'cense:lancar_nfe'],
    chefe_gabinete: [
      ...BASE_SERVIDOR, 'frotas:aprovar', 'frotas:vistoria', 'salas:cancelar_qualquer', 'diarias:aprovar',
      'cense:fiscalizar', 'seguranca:auditar',
    ],
    gestor_votacao: [...BASE_SERVIDOR, 'votacao:gerenciar'],
    entidade_votante: ['votacao:votar'],
    admin: PERMISSOES.map(p => p.id),
  },
  moduloSetores: { cense: ['NFS'], votacao: ['UTSC'] },
  modulosDesligados: [],
  pessoas: {},
};

const CHAVE = 'seju_acesso_demo_v1';
const ouvintes = new Set<() => void>();

function carregar(): ConfigAcesso {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? 'null') as Partial<ConfigAcesso> | null;
    if (salvo && typeof salvo === 'object') {
      return {
        ...CONFIG_PADRAO,
        ...salvo,
        papelPermissoes: { ...CONFIG_PADRAO.papelPermissoes, ...(salvo.papelPermissoes ?? {}) },
        moduloSetores: { ...CONFIG_PADRAO.moduloSetores, ...(salvo.moduloSetores ?? {}) },
      };
    }
  } catch {
    /* usa o padrão */
  }
  return CONFIG_PADRAO;
}

let config: ConfigAcesso = carregar();

export function lerAcesso(): ConfigAcesso {
  return config;
}

export function mudarAcesso(mudar: (c: ConfigAcesso) => ConfigAcesso): void {
  config = mudar(config);
  try {
    localStorage.setItem(CHAVE, JSON.stringify(config));
  } catch {
    /* segue só em memória */
  }
  ouvintes.forEach(f => f());
}

export function restaurarAcessoPadrao(): void {
  mudarAcesso(() => CONFIG_PADRAO);
}

export function useAcessoDemo(): ConfigAcesso {
  return useSyncExternalStore(
    f => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    () => config,
    () => config,
  );
}

/** Aplica as mudanças do admin (papel, setor) sobre a pessoa de demonstração. */
export function aplicarAcesso(u: Usuario, c: ConfigAcesso = config): Usuario {
  const mud = c.pessoas[u.id];
  if (!mud) return u;
  const sigla = mud.setorSigla ?? u.setorSigla;
  const setor = c.setores.find(s => s.sigla === sigla);
  return { ...u, role: mud.role ?? u.role, setorSigla: sigla, setor: setor?.nome ?? u.setor };
}

export function pessoaAtiva(u: Usuario, c: ConfigAcesso = config): boolean {
  return c.pessoas[u.id]?.ativo !== false;
}

const MODULO_DA_PERMISSAO = (p: string) => (p.startsWith('frotas:') ? 'frota' : p.startsWith('seguranca:auditar') ? 'auditoria' : p.startsWith('seguranca:') ? 'admin' : p.split(':')[0]);

export function moduloVisivelDemo(modulo: string, u: Usuario, c: ConfigAcesso = config): boolean {
  const efetivo = aplicarAcesso(u, c);
  if (efetivo.role === 'admin') return true;
  if (c.modulosDesligados.includes(modulo)) return false;
  const setores = c.moduloSetores[modulo];
  return !setores || setores.length === 0 || setores.includes(efetivo.setorSigla ?? '');
}

/** Mesmo teste do banco: o papel dá a permissão E o módulo dela aparece para o setor da pessoa. */
export function temPermissaoDemo(u: Usuario, permissao: string, c: ConfigAcesso = config): boolean {
  const efetivo = aplicarAcesso(u, c);
  if (!pessoaAtiva(u, c)) return false;
  if (efetivo.role === 'admin') return true;
  const doPapel = c.papelPermissoes[efetivo.role] ?? [];
  if (!doPapel.includes(permissao as PermissaoDemo)) return false;
  return moduloVisivelDemo(MODULO_DA_PERMISSAO(permissao), u, c);
}
