import { supabase } from '../../lib/supabase';
import { exigir, traduzirErro } from './erros';
import type { Agendamento, FotosVistoria, NovoAgendamento, Veiculo, Vistoria } from './tipos';

export async function listarVeiculos(): Promise<Veiculo[]> {
  return exigir(await supabase().from('veiculos').select('*').neq('status', 'inativo').order('modelo'));
}

export async function veiculosDisponiveis(datas: string[], periodo: Agendamento['periodo']): Promise<Veiculo[]> {
  return exigir(await supabase().rpc('veiculos_disponiveis', { p_datas: datas, p_periodo: periodo }));
}

export async function salvarVeiculo(v: Partial<Veiculo> & Pick<Veiculo, 'modelo' | 'placa' | 'capacidade'>): Promise<Veiculo> {
  const dados = { ...v, placa: v.placa.toUpperCase().replace(/[^A-Z0-9]/g, '') };
  const q = v.id
    ? supabase().from('veiculos').update(dados).eq('id', v.id)
    : supabase().from('veiculos').insert(dados);
  return exigir(await q.select().single());
}

/** Solicitações visíveis (as próprias, ou todas para quem aprova/vistoria). */
export async function listarAgendamentos(filtro?: { status?: Agendamento['status'][] }): Promise<Agendamento[]> {
  let q = supabase().from('agendamentos').select('*').order('criado_em', { ascending: false });
  if (filtro?.status?.length) q = q.in('status', filtro.status);
  return exigir(await q);
}

export async function solicitarVeiculo(novo: NovoAgendamento): Promise<Agendamento> {
  return exigir(await supabase().from('agendamentos').insert(novo).select().single());
}

export async function decidirAgendamento(id: string, aprovar: boolean, motivo?: string): Promise<Agendamento> {
  return exigir(await supabase().rpc('decidir_agendamento', { p_id: id, p_aprovar: aprovar, p_motivo: motivo ?? null }));
}

export async function cancelarAgendamento(id: string, motivo?: string): Promise<Agendamento> {
  return exigir(await supabase().rpc('cancelar_agendamento', { p_id: id, p_motivo: motivo ?? null }));
}

export async function marcarNaoComparecimento(id: string): Promise<Agendamento> {
  return exigir(await supabase().rpc('marcar_nao_comparecimento', { p_id: id }));
}

export type AnguloVistoria = keyof FotosVistoria;

/** Envia uma foto ao bucket privado e devolve o caminho a guardar na vistoria. */
export async function enviarFotoVistoria(
  agendamentoId: string, tipo: Vistoria['tipo'], angulo: AnguloVistoria, arquivo: Blob,
): Promise<string> {
  const ext = arquivo.type === 'image/png' ? 'png' : arquivo.type === 'image/webp' ? 'webp' : 'jpg';
  const caminho = `${agendamentoId}/${tipo}/${angulo}.${ext}`;
  const { error } = await supabase().storage.from('vistorias').upload(caminho, arquivo, {
    upsert: true, contentType: arquivo.type || 'image/jpeg',
  });
  if (error) throw traduzirErro(error);
  return caminho;
}

/** URL temporária (10 min) para exibir uma foto privada. */
export async function urlFotoVistoria(caminho: string): Promise<string> {
  const { data, error } = await supabase().storage.from('vistorias').createSignedUrl(caminho, 600);
  if (error) throw traduzirErro(error);
  return data.signedUrl;
}

export async function registrarVistoria(dados: {
  agendamentoId: string; tipo: Vistoria['tipo']; km: number; nivelCombustivel: number;
  fotos: FotosVistoria; observacoes?: string;
}): Promise<Vistoria> {
  return exigir(await supabase().rpc('registrar_vistoria', {
    p_agendamento: dados.agendamentoId, p_tipo: dados.tipo, p_km: dados.km,
    p_nivel_combustivel: dados.nivelCombustivel, p_fotos: dados.fotos, p_observacoes: dados.observacoes ?? null,
  }));
}

export async function listarVistorias(agendamentoId: string): Promise<Vistoria[]> {
  return exigir(await supabase().from('vistorias').select('*').eq('agendamento_id', agendamentoId).order('criado_em'));
}
