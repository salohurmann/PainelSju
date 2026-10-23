import { supabase } from '../../lib/supabase';
import { exigir, traduzirErro } from '../supabase/erros';
import type { ApiVotacao, Eleicao, Entidade, Resultado } from './tipos';

/** Votação com o banco: as regras moram nas funções vot_* (migration 0900). */
export async function loginsDeEntidade(): Promise<Array<{ id: string; nome: string; email: string }>> {
  return exigir(await supabase().rpc('vot_logins_disponiveis')) as Array<{ id: string; nome: string; email: string }>;
}

export const apiVotacaoSupabase: ApiVotacao = {
  async listarEleicoes() {
    return exigir(await supabase().rpc('vot_eleicoes_visiveis')) as Eleicao[];
  },
  async minhaEntidade() {
    const id = exigir(await supabase().rpc('vot_minha_entidade')) as string | null;
    if (!id) return null;
    return exigir(await supabase().from('vot_entidades').select('*').eq('id', id).maybeSingle()) as Entidade | null;
  },
  async votar(eleicaoId, candidatas) {
    exigir(await supabase().rpc('vot_votar', { p_eleicao: eleicaoId, p_candidatas: candidatas }));
  },
  async resultado(eleicaoId) {
    return exigir(await supabase().rpc('vot_resultado', { p_eleicao: eleicaoId })) as Resultado;
  },
  async listarEntidades() {
    return exigir(await supabase().from('vot_entidades').select('*').order('nome')) as Entidade[];
  },
  async salvarEntidade(e) {
    const { id, ...dados } = e;
    const q = id ? supabase().from('vot_entidades').update(dados).eq('id', id) : supabase().from('vot_entidades').insert(dados);
    exigir(await q);
  },
  async excluirEntidade(id) {
    exigir(await supabase().from('vot_entidades').delete().eq('id', id));
  },
  async salvarEleicao(e) {
    const dados = { titulo: e.titulo, abre_em: e.abre_em, fecha_em: e.fecha_em, votos_por_entidade: e.votos_por_entidade };
    let id = e.id;
    if (id) {
      exigir(await supabase().from('vot_eleicoes').update(dados).eq('id', id));
    } else {
      const criada = exigir(await supabase().from('vot_eleicoes').insert(dados).select('id').single()) as { id: string };
      id = criada.id;
    }
    const atuais = (exigir(await supabase().from('vot_candidaturas').select('entidade_id').eq('eleicao_id', id)) as Array<{ entidade_id: string }>).map(
      c => c.entidade_id,
    );
    const remover = atuais.filter(x => !e.candidatas.includes(x));
    const incluir = e.candidatas.filter(x => !atuais.includes(x));
    if (remover.length) exigir(await supabase().from('vot_candidaturas').delete().eq('eleicao_id', id).in('entidade_id', remover));
    if (incluir.length) exigir(await supabase().from('vot_candidaturas').insert(incluir.map(entidade_id => ({ eleicao_id: id, entidade_id }))));
  },
  async excluirEleicao(id) {
    const r = await supabase().from('vot_eleicoes').delete().eq('id', id);
    if (r.error) throw traduzirErro(r.error);
  },
};
