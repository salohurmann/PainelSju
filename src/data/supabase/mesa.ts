import { supabase } from '../../lib/supabase';
import { exigir } from './erros';
import type { Pendencia } from './tipos';

/** O que precisa da ação de quem está logado, ordenado por prazo. */
export async function minhasPendencias(): Promise<Pendencia[]> {
  return exigir(await supabase().rpc('minhas_pendencias'));
}
