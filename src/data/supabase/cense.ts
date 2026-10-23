import { supabase } from '../../lib/supabase';
import { exigir, traduzirErro } from './erros';
import type { NotaCense, NovaNotaCense, SaldoCense, UnidadeCense } from './tipos';

export async function listarUnidades(): Promise<UnidadeCense[]> {
  return exigir(await supabase().from('cense_unidades').select('*').eq('ativo', true).order('nome'));
}

export async function saldos(): Promise<SaldoCense[]> {
  return exigir(await supabase().from('cense_saldos').select('*').order('nome'));
}

export async function listarNotas(unidadeId: string): Promise<NotaCense[]> {
  return exigir(await supabase().from('cense_notas').select('*').eq('unidade_id', unidadeId).order('data_emissao', { ascending: false }));
}

export async function lancarNota(nota: NovaNotaCense): Promise<NotaCense> {
  return exigir(await supabase().from('cense_notas').insert(nota).select().single());
}

export async function analisarNota(id: string, aprovar: boolean, motivo?: string): Promise<NotaCense> {
  return exigir(await supabase().rpc('analisar_nota_cense', { p_id: id, p_aprovar: aprovar, p_motivo: motivo ?? null }));
}

export async function enviarComprovante(unidadeId: string, arquivo: File): Promise<string> {
  const nome = `${Date.now()}-${arquivo.name.replace(/[^\w.-]+/g, '_')}`;
  const caminho = `${unidadeId}/${nome}`;
  const { error } = await supabase().storage.from('cense-comprovantes').upload(caminho, arquivo, { contentType: arquivo.type });
  if (error) throw traduzirErro(error);
  return caminho;
}

/** Validação local do DV da chave NF-e (o banco valida de novo ao gravar). */
export function chaveNfeValida(chave: string): boolean {
  const d = chave.replace(/\D/g, '');
  if (d.length !== 44) return false;
  let soma = 0;
  let peso = 2;
  for (let i = 42; i >= 0; i--) {
    soma += Number(d[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  const r = soma % 11;
  return (r < 2 ? 0 : 11 - r) === Number(d[43]);
}

/** Validação local de CNPJ (o banco valida de novo ao gravar). */
export function cnpjValido(cnpj: string): boolean {
  const d = cnpj.replace(/\D/g, '');
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const calc = (base: string, pesos: number[]) => {
    const s = pesos.reduce((acc, p, i) => acc + Number(base[i]) * p, 0);
    const r = s % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const dv1 = calc(d, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const dv2 = calc(d, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return dv1 === Number(d[12]) && dv2 === Number(d[13]);
}
