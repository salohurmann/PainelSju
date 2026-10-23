import React from 'react';
import { Agendamento, Usuario } from '../../types';
import { PlacaMercosul } from '../ui/PlacaMercosul';

/**
 * Autorização de saída do veículo — o "bilhete" que o motorista mostra
 * na portaria. Só exibe dados; a decisão da chefia acontece na fila.
 */
interface PasseViagemOficialProps {
  agendamento: Agendamento;
  currentUser?: Usuario;
  /** Mantidos por compatibilidade; a aprovação é feita em FilaAprovacao. */
  onAprovar?: (hash: string) => void;
  onReprovar?: (motivo: string) => void;
  modoAprovacao?: boolean;
}

const PERIODO: Record<string, string> = {
  manha: 'Manhã · 08h–12h',
  tarde: 'Tarde · 13h–18h',
  dia_todo: 'Dia todo · 08h–18h',
};

export const PasseViagemOficial: React.FC<PasseViagemOficialProps> = ({ agendamento: ag }) => {
  const autorizado = ['aprovado', 'em_andamento', 'realizado'].includes(ag.status);
  const cidade = ag.destino.split(/[—–\-/,]/)[0].trim() || 'Destino';
  const datas = ag.datas.map(d => d.split('-').reverse().join('/')).join(', ');

  return (
    <article className="mx-auto w-full max-w-md overflow-hidden rounded-[28px] bg-[var(--surface)] font-sans text-[var(--text)]">
      <header className="bg-[#0072BB] px-6 pb-6 pt-5 text-white">
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-bold">
            Seju<span className="text-[#C6E86B]">.</span>
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              autorizado ? 'bg-[#C6E86B] text-[#0B1B2E]' : 'bg-white/15 text-white'
            }`}
          >
            {autorizado ? 'Saída autorizada' : 'Aguardando a chefia'}
          </span>
        </div>
        <div className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">Autorização de saída</div>
        <div className="mt-1 flex items-end justify-between gap-3">
          <div>
            <div className="text-xs text-white/70">De</div>
            <div className="font-display text-2xl font-bold leading-none">Curitiba</div>
          </div>
          <span className="mb-1 flex-1 border-t-2 border-dashed border-white/40" aria-hidden="true" />
          <div className="text-right">
            <div className="text-xs text-white/70">Para</div>
            <div className="font-display text-2xl font-bold leading-none">{cidade}</div>
          </div>
        </div>
      </header>

      <div className="space-y-4 px-6 py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-[var(--text-muted)]">Veículo</div>
            <div className="truncate text-[15px] font-semibold">{ag.veiculoNome}</div>
          </div>
          <PlacaMercosul placa={ag.veiculoPlaca} uf="PR" className="scale-90 origin-right shrink-0" />
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-xs text-[var(--text-muted)]">Dias</dt>
            <dd className="font-semibold tabular-nums">{datas}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-muted)]">Período</dt>
            <dd className="font-semibold">{PERIODO[ag.periodo] ?? ag.periodo}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-muted)]">Responsável</dt>
            <dd className="font-semibold">{ag.nome}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-muted)]">Quem dirige</dt>
            <dd className="font-semibold">{ag.modalidade === 'com_motorista' ? 'Motorista do Transporte' : 'O responsável'}</dd>
          </div>
          {ag.passageiros && ag.passageiros !== ag.nome && (
            <div className="col-span-2">
              <dt className="text-xs text-[var(--text-muted)]">Passageiros</dt>
              <dd className="font-semibold">{ag.passageiros}</dd>
            </div>
          )}
          <div className="col-span-2">
            <dt className="text-xs text-[var(--text-muted)]">Motivo</dt>
            <dd className="text-[var(--text)]">{ag.destino}</dd>
          </div>
        </dl>
      </div>

      <div className="relative border-t-2 border-dashed border-[var(--border)] px-6 py-4">
        <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[#0B1B2E]/60 print:hidden" aria-hidden="true" />
        <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-[#0B1B2E]/60 print:hidden" aria-hidden="true" />
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xs text-[var(--text-muted)]">Protocolo</div>
            <div className="font-display text-lg font-bold tabular-nums">{ag.ticket}</div>
          </div>
          <div className="text-right text-xs text-[var(--text-muted)]">
            {autorizado && ag.aprovadorNome ? (
              <>
                Autorizado por
                <div className="font-semibold text-[var(--text)]">{ag.aprovadorNome}</div>
                {ag.aprovadoEm && new Date(ag.aprovadoEm).toLocaleDateString('pt-BR')}
              </>
            ) : (
              'Sem autorização ainda'
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
