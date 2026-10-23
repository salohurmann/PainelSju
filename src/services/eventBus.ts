/**
 * Barramento de Eventos de Domínio do SEJU · Gestão Integrada
 * Padrão Publisher/Subscriber fortemente tipado em memória.
 * Desacopla a emissão de ações de negócio dos serviços transversais
 * (Auditoria Criptográfica SHA-256, Notificações e Métricas).
 */

export interface EventosDominio {
  'viatura.solicitada': {
    agendamentoId: string;
    veiculoPlaca: string;
    solicitante: string;
    cpfSolicitante: string;
    destino: string;
    ticket: string;
  };
  'viatura.aprovada': {
    agendamentoId: string;
    ticket: string;
    aprovador: string;
    cpfAprovador: string;
    hashAprovacao: string;
  };
  'viatura.vistoria_concluida': {
    vistoriaId: string;
    agendamentoId: string;
    veiculoPlaca: string;
    tipo: 'checkin' | 'checkout';
    km: number;
    vistoriador: string;
  };
  'chamado.criado': {
    chamadoId: string;
    titulo: string;
    prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
    setor: string;
    solicitante: string;
  };
  'chamado.status_alterado': {
    chamadoId: string;
    titulo: string;
    statusAnterior: string;
    novoStatus: string;
    responsavel?: string;
  };
  'sala.reservada': {
    reservaId: string;
    salaNome: string;
    horario: string;
    data: string;
    solicitante: string;
    pauta: string;
  };
  'diaria.calculada': {
    municipio: string;
    dias: number;
    valorTotal: number;
    solicitante: string;
  };
  'cense.nfe_lancada': {
    chaveAcesso: string;
    unidade: string;
    valor: number;
    rubrica: string;
    gestor: string;
  };
  'votacao.voto_registrado': {
    eleicaoId: string;
    titulo: string;
    entidade: string;
  };
  'seguranca.cpf_revelado': {
    servidorConsultor: string;
    cpfConsultado: string;
    contexto: string;
  };
}

export type TipoEvento = keyof EventosDominio;

export interface EventoEnvelope<T extends TipoEvento = TipoEvento> {
  id: string;
  tipo: T;
  payload: EventosDominio[T];
  timestamp: string;
}

type EventListener<T extends TipoEvento> = (evento: EventoEnvelope<T>) => void | Promise<void>;

class DomainEventBus {
  private listeners: Map<TipoEvento, Set<EventListener<any>>> = new Map();
  private historico: EventoEnvelope<any>[] = [];
  private maxHistorico = 100;

  /**
   * Inscreve um ouvinte para um tipo específico de evento
   */
  public subscribe<T extends TipoEvento>(
    tipo: T,
    listener: EventListener<T>
  ): () => void {
    if (!this.listeners.has(tipo)) {
      this.listeners.set(tipo, new Set());
    }
    const set = this.listeners.get(tipo)!;
    set.add(listener);

    // Retorna função de unsubscribe
    return () => {
      set.delete(listener);
    };
  }

  /**
   * Emite um evento de domínio de forma síncrona/assíncrona para todos os ouvintes
   */
  public emit<T extends TipoEvento>(tipo: T, payload: EventosDominio[T]): EventoEnvelope<T> {
    const envelope: EventoEnvelope<T> = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tipo,
      payload,
      timestamp: new Date().toISOString()
    };

    // Armazena no buffer circular de histórico
    this.historico.unshift(envelope);
    if (this.historico.length > this.maxHistorico) {
      this.historico.pop();
    }

    const callbacks = this.listeners.get(tipo);
    if (callbacks && callbacks.size > 0) {
      callbacks.forEach(cb => {
        try {
          cb(envelope);
        } catch (err) {
          console.error(`[EventBus] Erro ao processar ouvinte do evento ${tipo}:`, err);
        }
      });
    }

    return envelope;
  }

  /**
   * Obtém os últimos eventos registrados para diagnóstico e suporte
   */
  public getHistorico(): readonly EventoEnvelope<any>[] {
    return this.historico;
  }

  /**
   * Limpa todos os ouvintes (útil para testes unitários)
   */
  public clear(): void {
    this.listeners.clear();
    this.historico = [];
  }
}

// Instância singleton do barramento
export const eventBus = new DomainEventBus();
