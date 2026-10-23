import { eventBus } from './eventBus';
import { AuditoriaLog, Notificacao } from '../types';
import { generateAuditHash } from './crypto';

export type LogListener = (log: AuditoriaLog) => void;
export type NotificacaoListener = (notif: Notificacao) => void;

class CrossCuttingService {
  private logListeners: Set<LogListener> = new Set();
  private notifListeners: Set<NotificacaoListener> = new Set();
  private initialized = false;

  public init() {
    if (this.initialized) return;
    this.initialized = true;

    // 1. Viatura Solicitada
    eventBus.subscribe('viatura.solicitada', async ({ payload, timestamp }) => {
      const hash = await generateAuditHash({
        action: 'SOLICITACAO_CRIADA',
        ticket: payload.ticket,
        cpf: payload.cpfSolicitante,
        timestamp,
        details: `Ticket ${payload.ticket} · Veículo ${payload.veiculoPlaca} · Destino: ${payload.destino}`
      });

      const log: AuditoriaLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        time: timestamp,
        user: payload.solicitante,
        cpf: payload.cpfSolicitante,
        ip: '187.115.82.14',
        action: 'SOLICITACAO_CRIADA',
        details: `Ticket ${payload.ticket} — Veículo ${payload.veiculoPlaca} — Destino: ${payload.destino}`,
        hash
      };
      this.dispatchLog(log);

      const notif: Notificacao = {
        id: `notif-${Date.now()}`,
        destinatario: 'Gestão de Frotas SEJU',
        email: 'gestor.frota@seju.pr.gov.br',
        titulo: `Nova solicitação de viatura`,
        mensagem: `${payload.solicitante} solicitou ${payload.veiculoPlaca} para missão em ${payload.destino}.`,
        tipo: 'nova_solicitacao',
        lida: false,
        data: timestamp,
        ticket: payload.ticket
      };
      this.dispatchNotif(notif);
    });

    // 2. Viatura Aprovada
    eventBus.subscribe('viatura.aprovada', async ({ payload, timestamp }) => {
      const hash = await generateAuditHash({
        action: 'SOLICITACAO_APROVADA',
        ticket: payload.ticket,
        cpf: payload.cpfAprovador,
        timestamp,
        details: `Despacho da Chefia de Gabinete com assinatura ICP-PR para ticket ${payload.ticket}`
      });

      const log: AuditoriaLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        time: timestamp,
        user: payload.aprovador,
        cpf: payload.cpfAprovador,
        ip: '187.115.82.14',
        action: 'SOLICITACAO_APROVADA',
        details: `Despacho da Chefia de Gabinete — Ticket ${payload.ticket} aprovado.`,
        hash
      };
      this.dispatchLog(log);

      const notif: Notificacao = {
        id: `notif-${Date.now()}`,
        destinatario: 'Servidor Solicitante',
        email: 'servidor@seju.pr.gov.br',
        titulo: `Missão Autorizada · Ticket ${payload.ticket}`,
        mensagem: `Autorização despachada por ${payload.aprovador}. Veículo liberado para vistoria.`,
        tipo: 'aprovado',
        lida: false,
        data: timestamp,
        ticket: payload.ticket
      };
      this.dispatchNotif(notif);
    });

    // 3. Vistoria Concluída
    eventBus.subscribe('viatura.vistoria_concluida', async ({ payload, timestamp }) => {
      const actionName = payload.tipo === 'checkin' ? 'VISTORIA_CHECKIN' : 'VISTORIA_CHECKOUT';
      const hash = await generateAuditHash({
        action: actionName,
        ticket: payload.agendamentoId,
        cpf: '000.000.000-00',
        timestamp,
        details: `Laudo pericial de ${payload.tipo} registrado com ${payload.km} km no veículo ${payload.veiculoPlaca}`
      });

      const log: AuditoriaLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        time: timestamp,
        user: payload.vistoriador,
        cpf: '000.000.000-00',
        ip: '187.115.82.14',
        action: actionName,
        details: `Laudo de ${payload.tipo} — Veículo ${payload.veiculoPlaca} (${payload.km} km).`,
        hash
      };
      this.dispatchLog(log);
    });

    // 4. Chamado de TI Criado
    eventBus.subscribe('chamado.criado', async ({ payload, timestamp }) => {
      const hash = await generateAuditHash({
        action: 'CHAMADO_TI_ABERTO',
        ticket: payload.chamadoId,
        cpf: '000.000.000-00',
        timestamp,
        details: `Chamado [${payload.prioridade.toUpperCase()}] aberto para setor ${payload.setor}: ${payload.titulo}`
      });

      const log: AuditoriaLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        time: timestamp,
        user: payload.solicitante,
        cpf: '000.000.000-00',
        ip: '187.115.82.14',
        action: 'CHAMADO_TI_ABERTO',
        details: `Demanda de suporte #${payload.chamadoId} — [${payload.prioridade.toUpperCase()}] ${payload.titulo}`,
        hash
      };
      this.dispatchLog(log);

      const notif: Notificacao = {
        id: `notif-${Date.now()}`,
        destinatario: 'Equipe de Suporte NOC SEJU',
        email: 'suporte.ti@seju.pr.gov.br',
        titulo: `Novo chamado de TI #${payload.chamadoId}`,
        mensagem: `Setor ${payload.setor}: ${payload.titulo} (Prioridade: ${payload.prioridade}).`,
        tipo: 'nova_solicitacao',
        lida: false,
        data: timestamp,
        ticket: payload.chamadoId
      };
      this.dispatchNotif(notif);
    });

    // 5. Reserva de Sala Confirmada
    eventBus.subscribe('sala.reservada', async ({ payload, timestamp }) => {
      const hash = await generateAuditHash({
        action: 'RESERVA_SALA_CRIADA',
        ticket: payload.reservaId,
        cpf: '000.000.000-00',
        timestamp,
        details: `Espaço ${payload.salaNome} agendado para ${payload.data} ${payload.horario} — Pauta: ${payload.pauta}`
      });

      const log: AuditoriaLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        time: timestamp,
        user: payload.solicitante,
        cpf: '000.000.000-00',
        ip: '187.115.82.14',
        action: 'RESERVA_SALA_CRIADA',
        details: `Reserva ${payload.salaNome} — ${payload.data} às ${payload.horario} (${payload.pauta}).`,
        hash
      };
      this.dispatchLog(log);
    });

    // 6. NF-e CENSE Lançada
    eventBus.subscribe('cense.nfe_lancada', async ({ payload, timestamp }) => {
      const hash = await generateAuditHash({
        action: 'NFE_CENSE_LANCADA',
        ticket: payload.chaveAcesso.slice(-8),
        cpf: '000.000.000-00',
        timestamp,
        details: `Prestação de contas ${payload.unidade} · Rubrica ${payload.rubrica} · Valor R$ ${payload.valor.toFixed(2)}`
      });

      const log: AuditoriaLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        time: timestamp,
        user: payload.gestor,
        cpf: '000.000.000-00',
        ip: '187.115.82.14',
        action: 'NFE_CENSE_LANCADA',
        details: `DANFE NF-e chave ${payload.chaveAcesso.slice(0, 10)}... — ${payload.unidade} (R$ ${payload.valor.toFixed(2)}).`,
        hash
      };
      this.dispatchLog(log);
    });

    // 7. Auditoria LGPD de revelação de CPF
    eventBus.subscribe('seguranca.cpf_revelado', async ({ payload, timestamp }) => {
      const hash = await generateAuditHash({
        action: 'LGPD_CPF_REVELADO',
        ticket: 'LGPD-AUDIT',
        cpf: payload.cpfConsultado,
        timestamp,
        details: `Acesso visual a dado pessoal realizado por ${payload.servidorConsultor} no contexto: ${payload.contexto}`
      });

      const log: AuditoriaLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        time: timestamp,
        user: payload.servidorConsultor,
        cpf: payload.cpfConsultado,
        ip: '187.115.82.14',
        action: 'LGPD_CPF_REVELADO',
        details: `Visualização auditada de CPF desmascarado em ${payload.contexto}.`,
        hash
      };
      this.dispatchLog(log);
    });
  }

  public onLog(listener: LogListener) {
    this.logListeners.add(listener);
    return () => this.logListeners.delete(listener);
  }

  public onNotificacao(listener: NotificacaoListener) {
    this.notifListeners.add(listener);
    return () => this.notifListeners.delete(listener);
  }

  private dispatchLog(log: AuditoriaLog) {
    this.logListeners.forEach(listener => {
      try {
        listener(log);
      } catch (err) {
        console.error('[CrossCutting] Erro no listener de auditoria:', err);
      }
    });
  }

  private dispatchNotif(notif: Notificacao) {
    this.notifListeners.forEach(listener => {
      try {
        listener(notif);
      } catch (err) {
        console.error('[CrossCutting] Erro no listener de notificações:', err);
      }
    });
  }
}

export const crossCuttingService = new CrossCuttingService();
