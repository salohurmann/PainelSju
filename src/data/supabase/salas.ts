import { supabase } from '../../lib/supabase';
import { exigir } from './erros';
import type { RecursoExtra, Reserva, Sala } from './tipos';

export async function listarSalas(): Promise<Sala[]> {
  return exigir(await supabase().from('salas').select('*').eq('ativo', true).order('nome'));
}

/** Reservas ativas num intervalo (ISO 8601). */
export async function listarReservas(inicio: string, fim: string): Promise<Reserva[]> {
  return exigir(await supabase().from('reservas').select('*')
    .eq('status', 'ativa').lt('inicio', fim).gt('fim', inicio).order('inicio'));
}

export async function reservarSala(nova: {
  sala_id: string; motivo: string; inicio: string; fim: string;
  participantes?: number; recursos_extras?: RecursoExtra[];
}): Promise<Reserva> {
  return exigir(await supabase().from('reservas').insert(nova).select().single());
}

export async function cancelarReserva(id: string, motivo?: string): Promise<Reserva> {
  return exigir(await supabase().rpc('cancelar_reserva', { p_id: id, p_motivo: motivo ?? null }));
}

/** Monta o instante em horário de Brasília (UTC-3) a partir de data e hora locais. */
export function horarioBrasilia(dataISO: string, hora: number, minuto = 0): string {
  return `${dataISO}T${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}:00-03:00`;
}
