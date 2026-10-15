import { Agendamento, Notificacao } from '../types';

// Chave Brevo (configurada via variável de ambiente VITE_BREVO_API_KEY)
const BREVO_API_KEY = (import.meta.env.VITE_BREVO_API_KEY as string) || '';
const BREVO_FROM_EMAIL = 'centraldecarroseju@gmail.com';
const BREVO_FROM_NAME = 'SEJU — Gestão Integrada de Frotas';

export async function sendBrevoEmail(toEmail: string, subject: string, bodyText: string): Promise<boolean> {
  if (!toEmail || !BREVO_API_KEY) return false;
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: BREVO_FROM_NAME, email: BREVO_FROM_EMAIL },
        to: [{ email: toEmail }],
        subject,
        textContent: bodyText
      })
    });
    return res.ok;
  } catch (err) {
    console.warn('[Notificações] Falha ao despachar e-mail via Brevo (rede ou CORS):', err);
    return false;
  }
}

/**
 * Disparos Automáticos de Eventos
 */

// 1. Notifica o Gestor / Chefe sobre nova solicitação
export async function notifyManagerNewRequest(
  ag: Agendamento,
  gestorEmail: string
): Promise<Notificacao> {
  const datasFmt = ag.datas.join(', ');
  const subject = `[SEJU] 🔔 Nova Solicitação de Veículo — Protocolo ${ag.ticket}`;
  const body = `🏛️ GOVERNO DO ESTADO DO PARANÁ — SECRETARIA DA JUSTIÇA (SEJU)
SISTEMA INTEGRADO DE GESTÃO DE FROTAS

Prezado(a) Gestor(a),

Uma nova solicitação de veículo oficial foi registrada e aguarda sua validação:

• Protocolo: ${ag.ticket}
• Solicitante: ${ag.nome} (CPF: ${ag.cpf})
• Telefone: ${ag.telefone}
• Veículo Solicitado: ${ag.veiculoNome} (${ag.veiculoPlaca})
• Data(s): ${datasFmt}
• Período: ${ag.periodo.toUpperCase()}
• Modalidade: ${ag.modalidade.replace('_', ' ').toUpperCase()}
• Destino / Finalidade: ${ag.destino}

Acesse o Portal de Gestão para aprovar ou reprovar com 1 clique no celular.`;

  if (gestorEmail) {
    sendBrevoEmail(gestorEmail, subject, body);
  }

  return {
    id: 'notif-' + Date.now(),
    destinatario: 'Gestor de Frota / Gabinete',
    email: gestorEmail || 'gestor@seju.pr.gov.br',
    titulo: `Nova solicitação: ${ag.nome}`,
    mensagem: `Veículo ${ag.veiculoNome} (${ag.veiculoPlaca}) para ${datasFmt}.`,
    tipo: 'nova_solicitacao',
    lida: false,
    data: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    ticket: ag.ticket
  };
}

// 2. Notifica o Solicitante que a viagem foi APROVADA
export async function notifyUserApproved(ag: Agendamento): Promise<Notificacao> {
  const datasFmt = ag.datas.join(', ');
  const subject = `[SEJU] ✅ Solicitação de Veículo APROVADA — Protocolo ${ag.ticket}`;
  const body = `🏛️ GOVERNO DO ESTADO DO PARANÁ — SECRETARIA DA JUSTIÇA (SEJU)

Olá, ${ag.nome}!

Sua solicitação de veículo oficial foi APROVADA com sucesso.

• Protocolo: ${ag.ticket}
• Status: AUTORIZADO (Aprovado por: ${ag.aprovadorNome || 'Chefia Imediata'})
• Veículo: ${ag.veiculoNome} (${ag.veiculoPlaca})
• Período: ${datasFmt} (${ag.periodo.toUpperCase()})
• Destino: ${ag.destino}
• Hash Criptográfico de Auditoria: ${ag.hashAuditoria || 'Autenticado digitalmente'}

INSTRUÇÕES PARA RETIRADA:
Compareça à Central de Transporte no horário agendado munido de CNH válida para a realização do Check-in digital e liberação da chave.`;

  if (ag.email) {
    sendBrevoEmail(ag.email, subject, body);
  }

  return {
    id: 'notif-' + Date.now(),
    destinatario: ag.nome,
    email: ag.email,
    titulo: `Solicitação APROVADA: ${ag.ticket}`,
    mensagem: `Sua viagem para ${ag.destino} foi autorizada pela chefia.`,
    tipo: 'aprovado',
    lida: false,
    data: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    ticket: ag.ticket
  };
}

// 3. Notifica o Solicitante que a viagem foi REPROVADA
export async function notifyUserRejected(ag: Agendamento, motivo: string): Promise<Notificacao> {
  const datasFmt = ag.datas.join(', ');
  const subject = `[SEJU] ❌ Solicitação de Veículo REPROVADA — Protocolo ${ag.ticket}`;
  const body = `🏛️ GOVERNO DO ESTADO DO PARANÁ — SECRETARIA DA JUSTIÇA (SEJU)

Olá, ${ag.nome},

Informamos que a solicitação de veículo oficial referente ao protocolo ${ag.ticket} foi REPROVADA pela chefia.

• Protocolo: ${ag.ticket}
• Veículo: ${ag.veiculoNome} (${ag.veiculoPlaca})
• Período: ${datasFmt}
• Motivo da Não-Autorização: ${motivo || 'Indisponibilidade de frota ou incompatibilidade de agenda institucional.'}

Para esclarecimentos, contate a coordenação ou o setor de frotas da SEJU.`;

  if (ag.email) {
    sendBrevoEmail(ag.email, subject, body);
  }

  return {
    id: 'notif-' + Date.now(),
    destinatario: ag.nome,
    email: ag.email,
    titulo: `Solicitação REPROVADA: ${ag.ticket}`,
    mensagem: `Motivo: ${motivo || 'Indisponibilidade de frota.'}`,
    tipo: 'reprovado',
    lida: false,
    data: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    ticket: ag.ticket
  };
}
