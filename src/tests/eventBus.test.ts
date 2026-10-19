import { describe, it, expect, beforeEach } from 'vitest';
import { eventBus } from '../services/eventBus';

describe('Barramento de Eventos de Domínio · DomainEventBus', () => {
  beforeEach(() => {
    eventBus.clear();
  });

  it('deve emitir e receber eventos fortemente tipados', () => {
    let recebido: any = null;

    const unsubscribe = eventBus.subscribe('viatura.solicitada', (envelope) => {
      recebido = envelope;
    });

    eventBus.emit('viatura.solicitada', {
      agendamentoId: 'ag-101',
      veiculoPlaca: 'BEE4R22',
      solicitante: 'Dra. Maria Fernanda',
      cpfSolicitante: '123.456.789-00',
      destino: 'Londrina/PR',
      ticket: 'AG-20261019-9999'
    });

    expect(recebido).not.toBeNull();
    expect(recebido.tipo).toBe('viatura.solicitada');
    expect(recebido.payload.ticket).toBe('AG-20261019-9999');
    expect(recebido.payload.veiculoPlaca).toBe('BEE4R22');

    unsubscribe();
  });

  it('deve respeitar a função de desinscrição (unsubscribe)', () => {
    let chamadas = 0;

    const unsub = eventBus.subscribe('chamado.criado', () => {
      chamadas++;
    });

    eventBus.emit('chamado.criado', {
      chamadoId: 'TI-2026-101',
      titulo: 'Troca de Switch',
      prioridade: 'alta',
      setor: 'NOC',
      solicitante: 'Carlos'
    });
    expect(chamadas).toBe(1);

    // Remove ouvinte
    unsub();

    eventBus.emit('chamado.criado', {
      chamadoId: 'TI-2026-102',
      titulo: 'Fibra Óptica Rompida',
      prioridade: 'urgente',
      setor: 'NOC',
      solicitante: 'Carlos'
    });
    expect(chamadas).toBe(1); // Não deve ter incrementado
  });

  it('deve registrar histórico circular de eventos para auditoria e diagnóstico', () => {
    eventBus.emit('sala.reservada', {
      reservaId: 'res-1',
      salaNome: 'Auditório',
      horario: '10:00 - 11:00',
      data: '2026-10-20',
      solicitante: 'Gabinete',
      pauta: 'Reunião Colegiada'
    });

    eventBus.emit('sala.reservada', {
      reservaId: 'res-2',
      salaNome: 'Sala de Atos',
      horario: '14:00 - 15:00',
      data: '2026-10-20',
      solicitante: 'Diretoria',
      pauta: 'Planejamento'
    });

    const historico = eventBus.getHistorico();
    expect(historico.length).toBe(2);
    expect(historico[0].payload.reservaId).toBe('res-2');
    expect(historico[1].payload.reservaId).toBe('res-1');
  });
});
