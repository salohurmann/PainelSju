import React, { useState } from 'react';
import { Agendamento, Usuario } from '../../types';
import { PasseViagemOficial } from './PasseViagemOficial';
import { soundFX } from '../../services/soundFx';
import { Search, Ticket, Check, X, CalendarDays, MapPin } from 'lucide-react';

interface ConsultaCpfProps {
  agendamentos: Agendamento[];
  currentUser?: Usuario;
}

const ETAPAS = ['Pedido feito', 'Chefia decidiu', 'Saiu', 'Voltou'];
const AUTORIZADOS = ['aprovado', 'em_andamento', 'realizado'];

/** Quantas etapas já foram cumpridas (0–4) e se houve recusa. */
const progresso = (s: string): { feitas: number; recusado: boolean } => {
  if (s === 'reprovado') return { feitas: 2, recusado: true };
  return { feitas: { pendente: 1, aprovado: 2, em_andamento: 3, realizado: 4 }[s] ?? 1, recusado: false };
};

const SITUACAO: Record<string, { texto: string; cls: string }> = {
  pendente: { texto: 'Aguardando a chefia', cls: 'bg-[var(--warning-soft)] text-[var(--warning)]' },
  aprovado: { texto: 'Autorizado', cls: 'bg-[var(--verde-soft)] text-[var(--verde)]' },
  em_andamento: { texto: 'Em viagem', cls: 'bg-[var(--brand-soft)] text-[var(--brand)]' },
  realizado: { texto: 'Concluído', cls: 'bg-[var(--surface-2)] text-[var(--text-muted)]' },
  reprovado: { texto: 'Não autorizado', cls: 'bg-[var(--danger-soft)] text-[var(--danger)]' },
  cancelado: { texto: 'Cancelado', cls: 'bg-[var(--surface-2)] text-[var(--text-muted)]' },
};

const soDigitos = (v: string) => v.replace(/\D/g, '');
const formatarCpf = (v: string) =>
  soDigitos(v)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
const formatarData = (d: string) => d.split('-').reverse().slice(0, 2).join('/');

export const ConsultaCpf: React.FC<ConsultaCpfProps> = ({ agendamentos, currentUser }) => {
  const meuCpf = soDigitos(currentUser?.cpf ?? '');
  const [cpfBusca, setCpfBusca] = useState('');
  const [cpfAtivo, setCpfAtivo] = useState(meuCpf);
  const [passe, setPasse] = useState<Agendamento | null>(null);

  const meus = cpfAtivo === meuCpf;
  const lista = agendamentos
    .filter(a => soDigitos(a.cpf) === cpfAtivo)
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));

  const consultar = (e: React.FormEvent) => {
    e.preventDefault();
    const d = soDigitos(cpfBusca);
    if (d.length !== 11) return;
    soundFX.playClick();
    setCpfAtivo(d);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="font-display text-2xl font-bold text-[var(--text)]">
            {meus ? 'Seus pedidos' : `Pedidos do CPF ${formatarCpf(cpfAtivo)}`}
          </h3>
          <p className="text-sm text-[var(--text-muted)]">
            {meus ? 'Acompanhe cada pedido até a volta do veículo.' : (
              <button type="button" onClick={() => setCpfAtivo(meuCpf)} className="font-semibold text-[var(--brand)] hover:underline cursor-pointer">
                Voltar para os seus pedidos
              </button>
            )}
          </p>
        </div>
        <form onSubmit={consultar} className="flex gap-2">
          <label className="relative block flex-1 lg:w-64">
            <span className="sr-only">CPF para consultar</span>
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
            <input
              inputMode="numeric"
              value={cpfBusca}
              onChange={e => setCpfBusca(formatarCpf(e.target.value))}
              placeholder="Consultar outro CPF"
              className="h-11 w-full rounded-full border border-[var(--border)] bg-[var(--surface)] pl-11 pr-4 text-sm tabular-nums text-[var(--text)] placeholder:text-[var(--text-subtle)] outline-none focus:border-[var(--brand)]"
            />
          </label>
          <button
            type="submit"
            disabled={soDigitos(cpfBusca).length !== 11}
            className="h-11 shrink-0 rounded-full bg-[#0072BB] px-5 text-sm font-semibold text-white hover:bg-[#005A9C] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Consultar
          </button>
        </form>
      </div>

      {lista.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-6 py-14 text-center">
          <div className="font-display text-xl font-bold text-[var(--text)]">
            {meus ? 'Você ainda não pediu nenhum veículo.' : 'Nenhum pedido para este CPF.'}
          </div>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Os pedidos aparecem aqui assim que são enviados.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {lista.map(ag => {
            const { feitas, recusado } = progresso(ag.status);
            const sit = SITUACAO[ag.status] ?? SITUACAO.pendente;
            return (
              <li key={ag.id} className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${sit.cls}`}>{sit.texto}</span>
                      <span className="text-xs font-semibold tabular-nums text-[var(--text-muted)]">{ag.ticket}</span>
                    </div>
                    <div className="mt-2 text-[15px] font-semibold text-[var(--text)]">
                      {ag.veiculoNome} <span className="font-normal text-[var(--text-muted)]">· {ag.veiculoPlaca}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[var(--text-muted)]">
                      <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> <span className="tabular-nums">{ag.datas.map(formatarData).join(', ')}</span></span>
                      <span className="inline-flex min-w-0 items-center gap-1.5"><MapPin size={14} /> <span className="truncate">{ag.destino}</span></span>
                    </div>
                  </div>
                  {AUTORIZADOS.includes(ag.status) && (
                    <button
                      type="button"
                      onClick={() => setPasse(ag)}
                      className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-full bg-[var(--surface-2)] px-4 text-[13px] font-semibold text-[var(--text)] hover:bg-[var(--surface-3)] cursor-pointer lg:self-center"
                    >
                      <Ticket size={15} /> Autorização de saída
                    </button>
                  )}
                </div>

                <ol className="mt-5 grid grid-cols-4 gap-2" aria-label="Andamento do pedido">
                  {ETAPAS.map((etapa, i) => {
                    const cumprida = i < feitas;
                    const negada = recusado && i === 1;
                    const rotulo = negada ? 'Não autorizado' : etapa;
                    return (
                      <li key={etapa} className="min-w-0">
                        <div
                          className={`h-1.5 rounded-full ${
                            negada ? 'bg-[#C8372D]' : cumprida ? 'bg-[#00A859]' : 'bg-[var(--surface-3)]'
                          }`}
                        />
                        <div className={`mt-2 flex items-center gap-1 text-xs ${cumprida || negada ? 'font-semibold text-[var(--text)]' : 'text-[var(--text-subtle)]'}`}>
                          {negada ? <X size={12} className="shrink-0 text-[var(--danger)]" /> : cumprida ? <Check size={12} className="shrink-0 text-[var(--verde)]" /> : null}
                          <span className="truncate">{rotulo}</span>
                        </div>
                      </li>
                    );
                  })}
                </ol>

                {ag.status === 'reprovado' && ag.obs && (
                  <p className="mt-4 rounded-[14px] bg-[var(--danger-soft)] px-3.5 py-2.5 text-[13px] text-[var(--danger)]">
                    <strong>Motivo da chefia:</strong> {ag.obs}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {passe && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0B1B2E]/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Autorização de saída"
          onClick={e => e.target === e.currentTarget && setPasse(null)}
        >
          <div className="w-full max-w-md">
            <PasseViagemOficial agendamento={passe} currentUser={currentUser} />
            <div className="mt-3 flex justify-center gap-2">
              <button type="button" onClick={() => window.print()} className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-[#0B1B2E] cursor-pointer">
                Imprimir
              </button>
              <button type="button" onClick={() => setPasse(null)} className="inline-flex h-11 items-center rounded-full bg-white/15 px-5 text-sm font-semibold text-white cursor-pointer">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
