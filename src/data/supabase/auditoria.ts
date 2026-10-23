import { supabase } from '../../lib/supabase';
import { exigir } from './erros';
import type { RegistroAuditoria, VerificacaoAuditoria } from './tipos';

export async function listarAuditoria(opcoes: { pagina?: number; porPagina?: number; entidade?: string } = {}): Promise<RegistroAuditoria[]> {
  const porPagina = opcoes.porPagina ?? 50;
  const de = (opcoes.pagina ?? 0) * porPagina;
  let q = supabase().from('auditoria').select('*').order('id', { ascending: false }).range(de, de + porPagina - 1);
  if (opcoes.entidade) q = q.eq('entidade', opcoes.entidade);
  return exigir(await q);
}

/** Recalcula a cadeia de hash no servidor e aponta o primeiro registro adulterado. */
export async function verificarAuditoria(): Promise<VerificacaoAuditoria> {
  return exigir(await supabase().rpc('verificar_auditoria'));
}
