/**
 * Painel de administração: mesma interface para o banco e para a demonstração.
 * Modelo: pessoa → papel + setor · papel → permissões · módulo → setores.
 */
import * as adminDb from '../supabase/admin';
import { PAPEIS, PERMISSOES, lerAcesso, mudarAcesso, aplicarAcesso, pessoaAtiva } from '../../services/acessoDemo';
import { USUARIOS_MOCK } from '../../services/store';
import { MODULOS_REGISTRY } from '../../modules/moduleRegistry';
import type { UserRole } from '../../types';

export interface PessoaAdm {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  setorSigla: string | null;
  papel: string;
  ativo: boolean;
}
export interface SetorAdm {
  id?: string;
  sigla: string;
  nome: string;
}
export interface ModuloAdm {
  id: string;
  nome: string;
  ativo: boolean;
  /** Siglas dos setores que veem; vazio = todos. */
  setores: string[];
}
export interface PapelAdm {
  id: string;
  nome: string;
  descricao: string;
  sistema: boolean;
}
export interface PermissaoAdm {
  id: string;
  modulo: string;
  descricao: string;
}

export interface DadosAdmin {
  pessoas: PessoaAdm[];
  setores: SetorAdm[];
  modulos: ModuloAdm[];
  papeis: PapelAdm[];
  permissoes: PermissaoAdm[];
  /** papel → permissões */
  matriz: Record<string, string[]>;
}

export interface ApiAdmin {
  /** Contas novas só existem com o banco (convite por e-mail). */
  podeConvidar: boolean;
  carregar(): Promise<DadosAdmin>;
  atualizarPessoa(id: string, m: Partial<Pick<PessoaAdm, 'setorSigla' | 'papel' | 'ativo'>>): Promise<void>;
  convidar(p: { email: string; nome: string; setorSigla: string; papel: string; cargo?: string }): Promise<void>;
  definirSetoresDoModulo(moduloId: string, siglas: string[]): Promise<void>;
  ativarModulo(moduloId: string, ativo: boolean): Promise<void>;
  definirPermissao(papel: string, permissao: string, concedida: boolean): Promise<void>;
  salvarSetor(s: SetorAdm): Promise<void>;
}

// ------------------------------------------------------------ demonstração
const MODULOS_ADM = MODULOS_REGISTRY.filter(m => m.id !== 'admin');

export const apiAdminDemo: ApiAdmin = {
  podeConvidar: false,
  async carregar() {
    const c = lerAcesso();
    return {
      pessoas: USUARIOS_MOCK.map(u => {
        const e = aplicarAcesso(u, c);
        return { id: u.id, nome: u.nome, email: u.email, cargo: u.cargo, setorSigla: e.setorSigla ?? null, papel: e.role, ativo: pessoaAtiva(u, c) };
      }),
      setores: c.setores,
      modulos: MODULOS_ADM.map(m => ({ id: m.id, nome: m.nome, ativo: !c.modulosDesligados.includes(m.id), setores: c.moduloSetores[m.id] ?? [] })),
      papeis: PAPEIS.map(p => ({ ...p, sistema: p.id === 'admin' || p.id === 'servidor' })),
      permissoes: PERMISSOES,
      matriz: c.papelPermissoes,
    };
  },
  async atualizarPessoa(id, m) {
    mudarAcesso(c => ({
      ...c,
      pessoas: {
        ...c.pessoas,
        [id]: {
          ...c.pessoas[id],
          ...(m.setorSigla !== undefined && { setorSigla: m.setorSigla ?? undefined }),
          ...(m.papel !== undefined && { role: m.papel as UserRole }),
          ...(m.ativo !== undefined && { ativo: m.ativo }),
        },
      },
    }));
  },
  async convidar() {
    throw new Error('No modo demonstração não dá para criar contas. Com o banco ligado, o convite chega por e-mail.');
  },
  async definirSetoresDoModulo(moduloId, siglas) {
    mudarAcesso(c => ({ ...c, moduloSetores: { ...c.moduloSetores, [moduloId]: siglas } }));
  },
  async ativarModulo(moduloId, ativo) {
    mudarAcesso(c => ({
      ...c,
      modulosDesligados: ativo ? c.modulosDesligados.filter(x => x !== moduloId) : [...new Set([...c.modulosDesligados, moduloId])],
    }));
  },
  async definirPermissao(papel, permissao, concedida) {
    mudarAcesso(c => {
      const atual = c.papelPermissoes[papel as UserRole] ?? [];
      const nova = concedida ? [...new Set([...atual, permissao])] : atual.filter(p => p !== permissao);
      return { ...c, papelPermissoes: { ...c.papelPermissoes, [papel]: nova } as typeof c.papelPermissoes };
    });
  },
  async salvarSetor(s) {
    const sigla = s.sigla.trim().toUpperCase();
    if (!/^[A-Z0-9]{2,12}$/.test(sigla)) throw new Error('Use uma sigla de 2 a 12 letras ou números, sem espaço.');
    if (s.nome.trim().length < 3) throw new Error('Informe o nome do setor.');
    mudarAcesso(c => {
      const existe = c.setores.some(x => x.sigla === sigla);
      return { ...c, setores: existe ? c.setores.map(x => (x.sigla === sigla ? { sigla, nome: s.nome.trim() } : x)) : [...c.setores, { sigla, nome: s.nome.trim() }] };
    });
  },
};

// ------------------------------------------------------------------- banco
export const apiAdminSupabase: ApiAdmin = {
  podeConvidar: true,
  async carregar() {
    const [pessoas, setores, modulos, papeis, permissoes, matriz] = await Promise.all([
      adminDb.listarPessoas(),
      adminDb.listarSetores(),
      adminDb.listarModulos(),
      adminDb.listarPapeis(),
      adminDb.listarPermissoes(),
      adminDb.matrizPermissoes(),
    ]);
    const siglaDe = new Map(setores.map(s => [s.id, s.sigla]));
    const setoresPorModulo = await Promise.all(modulos.map(m => adminDb.setoresDoModulo(m.id)));
    const mat: Record<string, string[]> = {};
    matriz.forEach(l => (mat[l.papel_id] = [...(mat[l.papel_id] ?? []), l.permissao_id]));
    return {
      pessoas: pessoas.map(p => ({ id: p.id, nome: p.nome, email: p.email, cargo: p.cargo, setorSigla: p.setor_id ? siglaDe.get(p.setor_id) ?? null : null, papel: p.papel_id, ativo: p.ativo })),
      setores: setores.map(s => ({ id: s.id, sigla: s.sigla, nome: s.nome })),
      modulos: modulos.filter(m => m.id !== 'admin').map((m, i) => ({ id: m.id, nome: m.nome, ativo: m.ativo, setores: setoresPorModulo[i].map(id => siglaDe.get(id) ?? '').filter(Boolean) })),
      papeis,
      permissoes,
      matriz: mat,
    };
  },
  async atualizarPessoa(id, m) {
    const mud: Parameters<typeof adminDb.atualizarPessoa>[1] = {};
    if (m.papel !== undefined) mud.papel_id = m.papel;
    if (m.ativo !== undefined) mud.ativo = m.ativo;
    if (m.setorSigla !== undefined) {
      const setores = await adminDb.listarSetores();
      mud.setor_id = setores.find(s => s.sigla === m.setorSigla)?.id ?? null;
    }
    await adminDb.atualizarPessoa(id, mud);
  },
  async convidar(p) {
    await adminDb.convidarPessoa({ email: p.email, nome: p.nome, setor_sigla: p.setorSigla, papel_id: p.papel, cargo: p.cargo });
  },
  async definirSetoresDoModulo(moduloId, siglas) {
    const setores = await adminDb.listarSetores();
    await adminDb.restringirModulo(moduloId, setores.filter(s => siglas.includes(s.sigla)).map(s => s.id));
  },
  ativarModulo: (id, ativo) => adminDb.ativarModulo(id, ativo),
  definirPermissao: (papel, perm, sim) => adminDb.definirPermissao(papel, perm as never, sim),
  async salvarSetor(s) {
    await adminDb.salvarSetor({ id: s.id, sigla: s.sigla, nome: s.nome });
  },
};

/** O que uma pessoa enxerga, pela mesma regra do banco (para mostrar na tela). */
export function modulosDaPessoa(p: PessoaAdm, d: DadosAdmin): string[] {
  if (!p.ativo) return [];
  return d.modulos
    .filter(m => {
      if (p.papel === 'admin') return true;
      if (!m.ativo) return false;
      if (m.setores.length && !m.setores.includes(p.setorSigla ?? '')) return false;
      return d.permissoes.some(perm => perm.modulo === m.id && (d.matriz[p.papel] ?? []).includes(perm.id));
    })
    .map(m => m.id);
}
