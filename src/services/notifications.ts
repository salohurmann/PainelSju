import { Agendamento, Notificacao } from '../types';

// Envio de e-mail NÃO acontece no navegador: nenhuma chave de API pode ir
// para o JavaScript público. Com o Supabase configurado, o banco enfileira
// os e-mails (tabela email_outbox) e a Edge Function "enviar-emails" envia
// pelo Brevo com a chave guardada no servidor. No modo demonstração local,
// estas funções apenas geram a notificação exibida na interface.

/**
 * Disparos Automáticos de Eventos
 */

// 1. Notifica o Gestor / Chefe sobre nova solicitação
export async function notifyManagerNewRequest(
  ag: Agendamento,
  gestorEmail: string
): Promise<Notificacao> {
  const datasFmt = ag.datas.join(', ');


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
