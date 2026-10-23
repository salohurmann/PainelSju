import { supabase } from '../../lib/supabase';
import { exigir } from './erros';
import type { Chamado, NotaChamado, PrioridadeChamado, StatusChamado, TipoChamado } from './tipos';

export async function listarChamados(filtro?: { status?: StatusChamado[] }): Promise<Chamado[]> {
  let q = supabase().from('chamados').select('*').order('prazo_sla');
  if (filtro?.status?.length) q = q.in('status', filtro.status);
  return exigir(await q);
}

export async function abrirChamado(novo: {
  tipo: TipoChamado; titulo: string; descricao: string; prioridade: PrioridadeChamado;
}): Promise<Chamado> {
  return exigir(await supabase().from('chamados').insert(novo).select().single());
}

/** Atualiza campos permitidos (o banco valida o que cada perfil pode mudar). */
export async function atualizarChamado(
  id: string,
  mudancas: Partial<Pick<Chamado, 'titulo' | 'descricao' | 'status' | 'prioridade' | 'tecnico_id' | 'solucao'>>,
): Promise<Chamado> {
  return exigir(await supabase().from('chamados').update(mudancas).eq('id', id).select().single());
}

export const assumirChamado = (id: string) => atualizarChamado(id, { status: 'em_andamento' });
export const concluirChamado = (id: string, solucao: string) => atualizarChamado(id, { status: 'concluido', solucao });
export const cancelarChamado = (id: string) => atualizarChamado(id, { status: 'cancelado' });

export async function listarNotas(chamadoId: string): Promise<NotaChamado[]> {
  return exigir(await supabase().from('chamado_notas').select('*').eq('chamado_id', chamadoId).order('criado_em'));
}

export async function adicionarNota(chamadoId: string, texto: string, interna = false): Promise<NotaChamado> {
  return exigir(await supabase().from('chamado_notas').insert({ chamado_id: chamadoId, texto, interna }).select().single());
}
