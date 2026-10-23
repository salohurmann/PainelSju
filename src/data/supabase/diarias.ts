import { supabase } from '../../lib/supabase';
import { exigir } from './erros';
import type { CalculoDiaria, FaixaDiaria, NovaDiaria, SolicitacaoDiaria } from './tipos';

export async function tabelaDiarias(): Promise<FaixaDiaria[]> {
  return exigir(await supabase().from('diarias_tabela').select('*').order('valor_dia'));
}

/** Cálculo oficial feito no banco (o mesmo usado ao gravar a solicitação). */
export async function calcularDiaria(nivel: string, dias: number, comPernoite: boolean): Promise<CalculoDiaria> {
  return exigir(await supabase().rpc('calcular_diaria', { p_nivel: nivel, p_dias: dias, p_com_pernoite: comPernoite }));
}

export async function listarDiarias(): Promise<SolicitacaoDiaria[]> {
  return exigir(await supabase().from('solicitacoes_diaria').select('*').order('criado_em', { ascending: false }));
}

export async function solicitarDiaria(nova: NovaDiaria): Promise<SolicitacaoDiaria> {
  return exigir(await supabase().from('solicitacoes_diaria').insert(nova).select().single());
}

export async function decidirDiaria(id: string, aprovar: boolean, motivo?: string): Promise<SolicitacaoDiaria> {
  return exigir(await supabase().rpc('decidir_diaria', { p_id: id, p_aprovar: aprovar, p_motivo: motivo ?? null }));
}

export async function cancelarDiaria(id: string): Promise<SolicitacaoDiaria> {
  return exigir(await supabase().rpc('cancelar_diaria', { p_id: id }));
}

export async function avancarEtapaDiaria(id: string): Promise<SolicitacaoDiaria> {
  return exigir(await supabase().rpc('avancar_diaria', { p_id: id }));
}
