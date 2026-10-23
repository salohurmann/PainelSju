import { supabase } from '../../lib/supabase';
import { exigir } from './erros';
import type { Notificacao } from './tipos';

export async function listarNotificacoes(limite = 50): Promise<Notificacao[]> {
  return exigir(await supabase().from('notificacoes').select('*').order('criado_em', { ascending: false }).limit(limite));
}

export async function marcarComoLida(id: string): Promise<void> {
  exigir(await supabase().from('notificacoes').update({ lida: true }).eq('id', id));
}

export async function marcarTodasComoLidas(): Promise<void> {
  exigir(await supabase().from('notificacoes').update({ lida: true }).eq('lida', false));
}

/** Recebe notificações novas em tempo real. Devolve a função para cancelar. */
export function assinarNotificacoes(perfilId: string, aoChegar: (n: Notificacao) => void): () => void {
  const canal = supabase()
    .channel(`notificacoes:${perfilId}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notificacoes', filter: `destinatario_id=eq.${perfilId}` },
      (payload) => aoChegar(payload.new as Notificacao))
    .subscribe();
  return () => { void supabase().removeChannel(canal); };
}
