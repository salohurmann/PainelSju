import React, { useState } from 'react';
import { Agendamento, Usuario } from '../../types';
import { generateAuditHash } from '../../services/crypto';
import { podeAprovarSolicitacao } from '../../services/rbac';
import { PlacaMercosul } from '../ui/PlacaMercosul';
import { MascaraCpfLgpd } from '../ui/MascaraCpfLgpd';
import { PasseViagemOficial } from './PasseViagemOficial';
import { soundFX } from '../../services/soundFx';
import { Check, X, Search, CalendarDays, MapPin, Users, Info, Ticket } from 'lucide-react';

interface FilaAprovacaoProps {
  agendamentos: Agendamento[];
  currentUser: Usuario;
  onAprovar: (agId: string, hash: string, aprovador: Usuario) => void;
  onReprovar: (agId: string, motivo: string, aprovador: Usuario) => void;
}

type Filtro = 'pendente' | 'aprovado' | 'reprovado' | 'todos';

const AUTORIZADOS = ['aprovado', 'em_andamento', 'realizado'];

const SITUACAO: Record<string, { texto: string; cls: string }> = {
  pendente: { texto: 'Aguardando você', cls: 'bg-[var(--warning-soft)] text-[var(--warning)]' },
  aprovado: { texto: 'Autorizado', cls: 'bg-[var(--verde-soft)] text-[var(--verde)]' },
  em_andamento: { texto: 'Em viagem', cls: 'bg-[var(--brand-soft)] text-[var(--brand)]' },
  realizado: { texto: 'Concluído', cls: 'bg-[var(--surface-2)] text-[var(--text-muted)]' },
  reprovado: { texto: 'Não autorizado', cls: 'bg-[var(--danger-soft)] text-[var(--danger)]' },
  cancelado: { texto: 'Cancelado', cls: 'bg-[var(--surface-2)] text-[var(--text-muted)]' },
};

const PERIODO: Record<string, string> = { manha: 'Manhã', tarde: 'Tarde', dia_todo: 'Dia todo' };

const formatarData = (d: string) => d.split('-').reverse().slice(0, 2).join('/');

export const FilaAprovacao: React.FC<FilaAprovacaoProps> = ({ agendamentos, currentUser, onAprovar, onReprovar }) => {
  const [filtro, setFiltro] = useState<Filtro>('pendente');
  const [busca, setBusca] = useState('');
  const [reprovando, setReprovando] = useState<Agendamento | null>(null);
  const [motivo, setMotivo] = useState('');
  const [processandoId, setProcessandoId] = useState<string | null>(null);
  const [passe, setPasse] = useState<Agendamento | null>(null);

  const contagem: Record<Filtro, number> = {
    pendente: agendamentos.filter(a => a.status === 'pendente').length,
    aprovado: agendamentos.filter(a => AUTORIZADOS.includes(a.status)).length,
    reprovado: agendamentos.filter(a => a.status === 'reprovado').length,
    todos: agendamentos.length,
  };

  const termo = busca.trim().toLowerCase();
  const lista = agendamentos
    .filter(a => {
      const okFiltro =
        filtro === 'todos' ||
        (filtro === 'aprovado' ? AUTORIZADOS.includes(a.status) : a.status === filtro);
      const okBusca =
        !termo ||
        [a.nome, a.ticket, a.destino, a.veiculoNome, a.veiculoPlaca].some(c => c.toLowerCase().includes(termo));
      return okFiltro && okBusca;
    })
    .sort((a, b) => (a.datas[0] ?? '').localeCompare(b.datas[0] ?? ''));

  const aprovar = async (ag: Agendamento) => {
    setProcessandoId(ag.id);
    try {
      const hash = await generateAuditHash({
        action: 'APROVACAO_FROTA',
        ticket: ag.ticket,
        cpf: currentUser.cpf,
        timestamp: new Date().toISOString(),
        details: `Aprovado por ${currentUser.nome} (${currentUser.cargo})`,
      });
      await onAprovar(ag.id, hash, currentUser);
      soundFX.playSuccess();
    } finally {
      setProcessandoId(null);
    }
  };

  const confirmarReprovacao = () => {
    if (!reprovando || motivo.trim().length < 5) return;
    soundFX.playWarning();
    onReprovar(reprovando.id, motivo.trim(), currentUser);
    setReprovando(null);
    setMotivo('');
  };

  const filtros: Array<{ id: Filtro; rotulo: string }> = [
    { id: 'pendente', rotulo: 'Aguardando' },
    { id: 'aprovado', rotulo: 'Autorizados' },
    { id: 'reprovado', rotulo: 'Não autorizados' },
    { id: 'todos', rotulo: 'Todos' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5" role="tablist" aria-label="Filtrar pedidos">
          {filtros.map(f => {
            const ativo = filtro === f.id;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={ativo}
                onClick={() => setFiltro(f.id)}
                className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-semibold transition-colors cursor-pointer ${
                  ativo
                    ? 'bg-[#00385E] text-white'
                    : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-2)]'
                }`}
              >
                {f.rotulo}
                <span
                  className={`rounded-full px-1.5 text-[11px] font-bold tabular-nums ${
                    ativo ? 'bg-[#C6E86B] text-[#0B1B2E]' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                  }`}
                >
                  {contagem[f.id]}
                </span>
              </button>
            );
          })}
        </div>
        <label className="relative block w-full lg:w-80">
          <span className="sr-only">Buscar pedido</span>
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, protocolo ou destino"
            className="h-11 w-full rounded-full border border-[var(--border)] bg-[var(--surface)] pl-11 pr-4 text-sm text-[var(--text)] placeholder:text-[var(--text-subtle)] outline-none focus:border-[var(--brand)]"
          />
        </label>
      </div>

      {lista.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-6 py-14 text-center">
          <div className="font-display text-xl font-bold text-[var(--text)]">
            {filtro === 'pendente' && !termo ? 'Nada esperando por você.' : 'Nenhum pedido encontrado.'}
          </div>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {filtro === 'pendente' && !termo
              ? 'Quando alguém pedir um veículo, o pedido aparece aqui.'
              : 'Tente outro filtro ou outra busca.'}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {lista.map(ag => {
            const situacao = SITUACAO[ag.status] ?? SITUACAO.pendente;
            const pendente = ag.status === 'pendente';
            const regra = podeAprovarSolicitacao(currentUser, ag.cpf, 'frotas');
            const ocupado = processandoId === ag.id;
            return (
              <li key={ag.id} className="flex flex-col rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-sm font-bold text-[var(--brand)]">
                      {ag.nome.replace(/^(Dra?\.)\s*/, '').charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-[15px] font-semibold text-[var(--text)]">{ag.nome}</div>
                      <div className="flex flex-wrap items-center gap-x-2 text-xs text-[var(--text-muted)]">
                        <span className="tabular-nums">{ag.ticket}</span>
                        <span aria-hidden="true">·</span>
                        <MascaraCpfLgpd cpf={ag.cpf} servidorConsultorNome={currentUser.nome} contexto="Aprovação de frota" mostrarIcone={false} />
                      </div>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${situacao.cls}`}>{situacao.texto}</span>
                </div>

                <div className="mt-4 rounded-[18px] bg-[var(--surface-2)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[var(--text)]">{ag.veiculoNome}</div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {ag.modalidade === 'com_motorista' ? 'Com motorista do Transporte' : 'O próprio servidor dirige'}
                      </div>
                    </div>
                    <PlacaMercosul placa={ag.veiculoPlaca} uf="PR" className="scale-90 origin-right shrink-0" />
                  </div>
                  <dl className="mt-3 grid grid-cols-1 gap-2 text-[13px] sm:grid-cols-2">
                    <div className="flex items-start gap-2">
                      <CalendarDays size={15} className="mt-0.5 shrink-0 text-[var(--text-subtle)]" />
                      <dd className="text-[var(--text)]">
                        <span className="font-semibold tabular-nums">{ag.datas.map(formatarData).join(', ')}</span>
                        <span className="text-[var(--text-muted)]"> · {PERIODO[ag.periodo] ?? ag.periodo}</span>
                      </dd>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users size={15} className="mt-0.5 shrink-0 text-[var(--text-subtle)]" />
                      <dd className="truncate text-[var(--text)]">{ag.passageiros || ag.nome}</dd>
                    </div>
                    <div className="flex items-start gap-2 sm:col-span-2">
                      <MapPin size={15} className="mt-0.5 shrink-0 text-[var(--text-subtle)]" />
                      <dd className="text-[var(--text)] line-clamp-2">{ag.destino}</dd>
                    </div>
                  </dl>
                </div>

                {ag.status === 'reprovado' && ag.obs && (
                  <p className="mt-3 rounded-[14px] bg-[var(--danger-soft)] px-3.5 py-2.5 text-[13px] text-[var(--danger)]">
                    <strong>Motivo:</strong> {ag.obs}
                  </p>
                )}
                {AUTORIZADOS.includes(ag.status) && ag.aprovadorNome && (
                  <p className="mt-3 text-xs text-[var(--text-muted)]">
                    Autorizado por <strong className="text-[var(--text)]">{ag.aprovadorNome}</strong>
                    {ag.aprovadoEm && ` em ${new Date(ag.aprovadoEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}`}
                  </p>
                )}

                <div className="mt-auto pt-4">
                  {pendente ? (
                    <>
                      {!regra.permitido && (
                        <p className="mb-3 flex items-start gap-2 rounded-[14px] bg-[var(--surface-2)] px-3.5 py-2.5 text-[13px] text-[var(--text-muted)]">
                          <Info size={15} className="mt-0.5 shrink-0" />
                          {regra.motivo}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={ocupado || !regra.permitido}
                          onClick={() => setReprovando(ag)}
                          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--border)] text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <X size={16} /> Não autorizar
                        </button>
                        <button
                          type="button"
                          disabled={ocupado || !regra.permitido}
                          onClick={() => aprovar(ag)}
                          className="inline-flex h-11 flex-[1.4] items-center justify-center gap-2 rounded-full bg-[#00703C] text-sm font-semibold text-white hover:bg-[#005C31] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Check size={16} strokeWidth={3} /> {ocupado ? 'Autorizando…' : 'Autorizar'}
                        </button>
                      </div>
                    </>
                  ) : (
                    AUTORIZADOS.includes(ag.status) && (
                      <button
                        type="button"
                        onClick={() => setPasse(ag)}
                        className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--surface-2)] px-4 text-[13px] font-semibold text-[var(--text)] hover:bg-[var(--surface-3)] cursor-pointer"
                      >
                        <Ticket size={15} /> Ver autorização de saída
                      </button>
                    )
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {reprovando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1B2E]/60 p-4" role="dialog" aria-modal="true" aria-labelledby="reprovar-titulo">
          <div className="w-full max-w-md rounded-[28px] bg-[var(--surface)] p-6 sm:p-7">
            <h3 id="reprovar-titulo" className="font-display text-2xl font-bold text-[var(--text)]">Não autorizar.</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {reprovando.nome} vai receber o motivo junto com o aviso. Seja claro sobre o que mudar para pedir de novo.
            </p>
            <label htmlFor="motivo-reprovar" className="mt-4 block text-[13px] font-semibold text-[var(--text)]">Motivo</label>
            <textarea
              id="motivo-reprovar"
              rows={3}
              autoFocus
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Ex.: veículo reservado para o Secretário nesta data; escolha outro dia."
              className="mt-1.5 w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--brand)]"
            />
            <p className="mt-1 text-xs text-[var(--text-subtle)]">Pelo menos 5 letras.</p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setReprovando(null);
                  setMotivo('');
                }}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-[var(--border)] text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={motivo.trim().length < 5}
                onClick={confirmarReprovacao}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-[#B42318] text-sm font-semibold text-white hover:bg-[#9B1C12] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
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
            <PasseViagemOficial agendamento={passe} currentUser={currentUser} modoAprovacao={false} />
            <div className="mt-3 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-[#0B1B2E] cursor-pointer"
              >
                Imprimir
              </button>
              <button
                type="button"
                onClick={() => setPasse(null)}
                className="inline-flex h-11 items-center rounded-full bg-white/15 px-5 text-sm font-semibold text-white cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
