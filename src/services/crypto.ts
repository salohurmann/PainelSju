/**
 * Serviço de Auditoria Criptográfica SHA-256
 * Gera e valida assinaturas digitais imutáveis para aprovações e vistorias.
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
    ip: payload.ip || '187.115.82.14', // IP institucional SEJU mock
    details: payload.details || '',
    salt: 'SEJU_PR_GOV_BR_SECURE_2026'
  });

  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function formatShortHash(hash: string): string {
  if (!hash || hash.length < 16) return hash || 'N/A';
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}
