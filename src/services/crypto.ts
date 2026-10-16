/**
 * Serviço de Segurança e Blindagem Criptográfica
 * Gera assinaturas digitais internas mantendo todas as hashes 100% ocultas na interface.
 */

export async function generateAuditHash(payload: {
  action: string;
  ticket: string;
  cpf: string;
  timestamp: string;
  ip?: string;
  details?: string;
}): Promise<string> {
  const normalized = JSON.stringify({
    action: payload.action,
    ticket: payload.ticket,
    cpf: payload.cpf.replace(/\D/g, ''),
    timestamp: payload.timestamp,
    ip: payload.ip || '187.115.82.14',
    details: payload.details || '',
    salt: 'SEJU_PR_GOV_BR_SECURE_2026'
  });

  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Retorna sempre a máscara blindada para que nenhuma hash fique visível na tela.
 */
export function formatShortHash(_hash?: string): string {
  return '••••••••••••••••';
}
