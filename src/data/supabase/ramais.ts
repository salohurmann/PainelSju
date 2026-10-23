import { supabase } from '../../lib/supabase';
import { exigir } from './erros';
import type { Ramal } from './tipos';

export async function listarRamais(): Promise<Ramal[]> {
  return exigir(await supabase().from('ramais').select('*').eq('ativo', true).order('setor_nome'));
}

export async function salvarRamal(r: Partial<Ramal> & Pick<Ramal, 'setor_nome' | 'ramal'>): Promise<Ramal> {
  const q = r.id ? supabase().from('ramais').update(r).eq('id', r.id) : supabase().from('ramais').insert(r);
  return exigir(await q.select().single());
}

export async function meusFavoritos(): Promise<string[]> {
  const linhas = exigir(await supabase().from('ramal_favoritos').select('ramal_id')) as Array<{ ramal_id: string }>;
  return linhas.map((l) => l.ramal_id);
}

export async function alternarFavorito(ramalId: string, favorito: boolean): Promise<void> {
  if (favorito) {
    exigir(await supabase().from('ramal_favoritos').upsert({ ramal_id: ramalId }));
  } else {
    exigir(await supabase().from('ramal_favoritos').delete().eq('ramal_id', ramalId));
  }
}
