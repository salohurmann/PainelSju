import { supabase } from '../../lib/supabase';
import { ErroPainel, exigir, traduzirErro } from './erros';
import type { FaixaDiaria, Modulo, Papel, PapelId, Perfil, Permissao, PermissaoInfo, Setor } from './tipos';

// ------------------------------------------------------------- Pessoas
export async function listarPessoas(): Promise<Perfil[]> {
  return exigir(await supabase().from('perfis').select('*').order('nome'));
}

export async function atualizarPessoa(
  id: string,
  mudancas: Partial<Pick<Perfil, 'nome' | 'cargo' | 'telefone' | 'setor_id' | 'papel_id' | 'ativo' | 'cpf'>>,
): Promise<Perfil> {
  return exigir(await supabase().from('perfis').update(mudancas).eq('id', id).select().single());
}

async function chamarFuncaoAdmin(corpo: Record<string, unknown>): Promise<void> {
  const { data, error } = await supabase().functions.invoke('admin-usuarios', { body: corpo });
  if (error) {
    let mensagem = 'Não foi possível concluir a operação.';
    try {
      const ctx = (error as { context?: Response }).context;
      const json = ctx ? await ctx.json() : null;
      if (json?.erro) mensagem = json.erro;
    } catch { /* corpo não-JSON */ }
    throw new ErroPainel(mensagem, 'FUNCAO_ADMIN', 'negocio');
  }
  if (data?.erro) throw new ErroPainel(data.erro, 'FUNCAO_ADMIN', 'negocio');
}

/** Cria a conta e envia convite por e-mail para a pessoa definir a senha. */
export const convidarPessoa = (dados: {
  email: string; nome: string; setor_sigla?: string; papel_id?: PapelId; cargo?: string; telefone?: string;
}) => chamarFuncaoAdmin({ acao: 'criar', ...dados });

export const reenviarConvite = (email: string) => chamarFuncaoAdmin({ acao: 'reenviar_convite', email });
export const enviarRedefinicaoSenha = (email: string) => chamarFuncaoAdmin({ acao: 'redefinir_senha', email });

// --------------------------------------------- Papéis e permissões
export async function listarPapeis(): Promise<Papel[]> {
  return exigir(await supabase().from('papeis').select('*').order('nome'));
}

export async function listarPermissoes(): Promise<PermissaoInfo[]> {
  return exigir(await supabase().from('permissoes').select('*').order('modulo').order('id'));
}

export async function matrizPermissoes(): Promise<Array<{ papel_id: PapelId; permissao_id: Permissao }>> {
  return exigir(await supabase().from('papel_permissoes').select('*'));
}

export async function definirPermissao(papelId: PapelId, permissao: Permissao, concedida: boolean): Promise<void> {
  const q = concedida
    ? supabase().from('papel_permissoes').upsert({ papel_id: papelId, permissao_id: permissao })
    : supabase().from('papel_permissoes').delete().eq('papel_id', papelId).eq('permissao_id', permissao);
  exigir(await q);
}

export async function salvarPapel(p: Pick<Papel, 'id' | 'nome' | 'descricao'>): Promise<Papel> {
  return exigir(await supabase().from('papeis').upsert(p).select().single());
}

// --------------------------------------------------------- Setores
export async function listarSetores(): Promise<Setor[]> {
  return exigir(await supabase().from('setores').select('*').order('nome'));
}

export async function salvarSetor(s: Partial<Setor> & Pick<Setor, 'sigla' | 'nome'>): Promise<Setor> {
  const dados = { ...s, sigla: s.sigla.toUpperCase() };
  const q = s.id ? supabase().from('setores').update(dados).eq('id', s.id) : supabase().from('setores').insert(dados);
  return exigir(await q.select().single());
}

// --------------------------------------------- Módulos por setor
export async function listarModulos(): Promise<Modulo[]> {
  return exigir(await supabase().from('modulos').select('*').order('ordem'));
}

export async function ativarModulo(id: string, ativo: boolean): Promise<void> {
  exigir(await supabase().from('modulos').update({ ativo }).eq('id', id));
}

export async function setoresDoModulo(moduloId: string): Promise<string[]> {
  const linhas = exigir(await supabase().from('modulo_setores').select('setor_id').eq('modulo_id', moduloId)) as Array<{ setor_id: string }>;
  return linhas.map((l) => l.setor_id);
}

/** Lista vazia = módulo liberado para todos os setores. */
export async function restringirModulo(moduloId: string, setorIds: string[]): Promise<void> {
  const atuais = new Set(await setoresDoModulo(moduloId));
  const desejados = new Set(setorIds);
  const remover = [...atuais].filter((s) => !desejados.has(s));
  const incluir = [...desejados].filter((s) => !atuais.has(s));
  if (remover.length) {
    exigir(await supabase().from('modulo_setores').delete().eq('modulo_id', moduloId).in('setor_id', remover));
  }
  if (incluir.length) {
    exigir(await supabase().from('modulo_setores').insert(incluir.map((setor_id) => ({ modulo_id: moduloId, setor_id }))));
  }
}

// ----------------------------------------------- Tabelas de apoio
export async function atualizarFaixaDiaria(nivel: string, mudancas: Partial<Omit<FaixaDiaria, 'nivel'>>): Promise<void> {
  exigir(await supabase().from('diarias_tabela').update(mudancas).eq('nivel', nivel));
}

export async function atualizarSla(prioridade: string, horas: number): Promise<void> {
  if (!Number.isInteger(horas) || horas < 1) throw traduzirErro({ code: '22023' });
  exigir(await supabase().from('sla_prioridades').update({ horas }).eq('prioridade', prioridade));
}
