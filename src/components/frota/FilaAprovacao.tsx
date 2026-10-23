import React, { useState } from 'react';
import { Agendamento, Usuario } from '../../types';
import { generateAuditHash, formatShortHash } from '../../services/crypto';
import { podeAprovarSolicitacao } from '../../services/rbac';
import { PlacaMercosul } from '../ui/PlacaMercosul';
import { MascaraCpfLgpd } from '../ui/MascaraCpfLgpd';
import { PasseViagemOficial } from './PasseViagemOficial';
import { soundFX } from '../../services/soundFx';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Clock,
  Car,
  MapPin,
  Calendar,
  Search,
  CreditCard,
  List,
  FileCheck2,
  Fingerprint,
  Gauge,
  Navigation,
  Award,
  Lock
} from 'lucide-react';

interface FilaAprovacaoProps {
  agendamentos: Agendamento[];
  currentUser: Usuario;
  onAprovar: (agId: string, hash: string, aprovador: Usuario) => void;
  onReprovar: (agId: string, motivo: string, aprovador: Usuario) => void;
}

export const FilaAprovacao: React.FC<FilaAprovacaoProps> = ({
  agendamentos,
  currentUser,
  onAprovar,
  onReprovar
}) => {
  const [filtroStatus, setFiltroStatus] = useState<string>('pendente');
  const [busca, setBusca] = useState('');
  const [visualizacao, setVisualizacao] = useState<'cards' | 'passe'>('cards');
  const [modalReprovarId, setModalReprovarId] = useState<string | null>(null);
  const [motivoReprovacao, setMotivoReprovacao] = useState('');
  const [processandoId, setProcessandoId] = useState<string | null>(null);

  const totalPendentes = agendamentos.filter(a => a.status === 'pendente').length;
  const totalAprovados = agendamentos.filter(
    a => a.status === 'aprovado' || a.status === 'em_andamento' || a.status === 'realizado'
  ).length;
  const totalReprovados = agendamentos.filter(a => a.status === 'reprovado').length;

  const listaFiltrada = agendamentos.filter(a => {
    const matchStatus = filtroStatus === 'todos' || a.status === filtroStatus;
    const matchBusca =
      a.nome.toLowerCase().includes(busca.toLowerCase()) ||
      a.ticket.toLowerCase().includes(busca.toLowerCase()) ||
      a.destino.toLowerCase().includes(busca.toLowerCase()) ||
      a.veiculoNome.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  const handleAprovar1Clique = async (ag: Agendamento) => {
    setProcessandoId(ag.id);
    try {
      const timestamp = new Date().toISOString();
      const hash = await generateAuditHash({
        action: 'APROVACAO_CHEFIA_1CLIQUE',
        ticket: ag.ticket,
        cpf: currentUser.cpf,
        timestamp,
        ip: '187.115.82.10',
        details: `Aprovado por ${currentUser.nome} (${currentUser.cargo})`
      });

      await onAprovar(ag.id, hash, currentUser);
      soundFX.playSuccess();
    } finally {
      setProcessandoId(null);
    }
  };

  const handleConfirmarReprovar = () => {
    if (!modalReprovarId) return;
    soundFX.playWarning();
    onReprovar(modalReprovarId, motivoReprovacao.trim(), currentUser);
    setModalReprovarId(null);
    setMotivoReprovacao('');
  };

  return (
    <div className="space-y-6">
      {/* Seção 1: Mesa de Despacho Executivo & KPI Strip */}
      <div className="bg-[var(--surface)] rounded-[18px] p-6 border border-[var(--border)]/90 space-y-6 relative overflow-hidden">
        {/* Filete Superior Institucional Dourado / Azul Paraná */}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0B1B2E]  " />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#0B1B2E] text-white flex items-center justify-center shrink-0 shadow-xs ring-2 ring-[var(--warning)]/30">
              <ShieldCheck size={21} className="text-[#FFE2A8]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] tabular-nums uppercase tracking-wider text-[var(--text-muted)] font-bold">
                  MESA DE DESPACHO EXECUTIVO · CHEFIA DE GABINETE
                </span>
                <span className="text-[10px] tabular-nums font-bold bg-[var(--verde-soft)] text-[var(--verde)] px-2.5 py-0.5 rounded-full border border-[var(--verde-border)]/80 flex items-center gap-1">
                  <Fingerprint size={11} className="text-[var(--verde)]" /> ICP-PR · Token A3 Ativo
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--text)] tracking-tight mt-0.5">
                Deliberação e Homologação de Missões Oficiais
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Chancela eletrônica em 1 clique com selo ICP-PR, resumo de telemetria de rota e emissão de Passe Diplomático.
              </p>
            </div>
          </div>

          {/* Alternador de Modo de Visualização */}
          <div className="flex items-center gap-1 bg-[var(--surface-2)]/90 p-1 rounded-xl border border-[var(--border)]/90 self-start md:self-center shrink-0">
            <button
              type="button"
              onClick={() => setVisualizacao('cards')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                visualizacao === 'cards'
                  ? 'bg-[var(--surface)] text-[var(--text)] shadow-2xs border border-[var(--border)]/80 font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <List size={14} /> Mesa de Despacho
            </button>
            <button
              type="button"
              onClick={() => setVisualizacao('passe')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                visualizacao === 'passe'
                  ? 'bg-[var(--surface)] text-[var(--text)] shadow-2xs border border-[var(--border)]/80 font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <CreditCard size={14} /> Credenciais Digitais
            </button>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[var(--surface-2)]/80 border border-[var(--border)]/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[var(--text-muted)] block">Protocolos na Pauta</span>
              <span className="text-xl font-bold text-[var(--text)] tabular-nums mt-0.5 block">
                {agendamentos.length}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[var(--surface)] border border-[var(--border)]/90 flex items-center justify-center text-[var(--text)] shadow-2xs">
              <FileCheck2 size={17} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--warning-soft)]/60 border border-[var(--warning-border)]/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[var(--warning)]/80 block">Aguardando Despacho</span>
              <span className="text-xl font-bold text-[var(--warning)] tabular-nums mt-0.5 block">
                {totalPendentes}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[var(--surface)] border border-[var(--warning-border)]/90 flex items-center justify-center text-[var(--warning)] shadow-2xs">
              <Clock size={17} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--verde-soft)]/60 border border-[var(--verde-border)]/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[var(--verde)]/80 block">Homologadas ICP-PR</span>
              <span className="text-xl font-bold text-[var(--verde)] tabular-nums mt-0.5 block">
                {totalAprovados}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[var(--surface)] border border-[var(--verde-border)]/90 flex items-center justify-center text-[var(--verde)] shadow-2xs">
              <CheckCircle2 size={17} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--surface-2)]/80 border border-[var(--border)]/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[var(--text-muted)] block">Indeferidas</span>
              <span className="text-xl font-bold text-[var(--text)] tabular-nums mt-0.5 block">
                {totalReprovados}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[var(--surface)] border border-[var(--border)]/90 flex items-center justify-center text-[var(--text-subtle)] shadow-2xs">
              <XCircle size={17} />
            </div>
          </div>
        </div>
      </div>

      {/* Seção 2: Barra de Filtros e Busca */}
      <div className="bg-[var(--surface)] rounded-[18px] p-4 border border-[var(--border)]/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'pendente', label: 'Pendentes' },
            { id: 'aprovado', label: 'Aprovados' },
            { id: 'reprovado', label: 'Reprovados' },
            { id: 'todos', label: 'Todos' }
          ].map(tab => {
            const count =
              tab.id === 'todos'
                ? agendamentos.length
                : agendamentos.filter(a => a.status === tab.id).length;
            const active = filtroStatus === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFiltroStatus(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition flex items-center gap-2 shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#0B1B2E] text-white shadow-2xs font-bold'
                    : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] border border-[var(--border)]/80'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md tabular-nums font-bold ${
                    active ? 'bg-white/15 text-white' : 'bg-[var(--surface-3)]/80 text-[var(--text)]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-2.5 text-[var(--text-subtle)]" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar servidor, protocolo ou destino..."
            className="w-full text-xs pl-9 pr-3.5 py-2 bg-[var(--surface-2)]/80 border border-[var(--border)]/90 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#22324C]/10 focus:border-[#22324C] focus:bg-[var(--surface)] transition"
          />
        </div>
      </div>

      {/* Seção 3: Lista de Cards de Deliberação ou Passes Digitais */}
      {visualizacao === 'passe' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listaFiltrada.map(ag => (
            <PasseViagemOficial
              key={ag.id}
              agendamento={ag}
              currentUser={currentUser}
              onAprovar={() => handleAprovar1Clique(ag)}
              onReprovar={m => onReprovar(ag.id, m, currentUser)}
              modoAprovacao={ag.status === 'pendente'}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {listaFiltrada.length === 0 ? (
            <div className="bg-[var(--surface)] rounded-[18px] p-12 text-center border border-[var(--border)]/80 shadow-2xs text-[var(--text-subtle)] text-xs">
              Nenhuma solicitação correspondente aos filtros aplicados.
            </div>
          ) : (
            listaFiltrada.map(ag => {
              const isPendente = ag.status === 'pendente';
              const isProcessando = processandoId === ag.id;
              const isAutorizado =
                ag.status === 'aprovado' ||
                ag.status === 'em_andamento' ||
                ag.status === 'realizado';

              const statusStripeClass = isPendente
                ? 'bg-[#D98A00]'
                : isAutorizado
                ? 'bg-[#00A859]'
                : 'bg-[#C8372D]';

              const kmEstimado = ag.datas.length * 145;

              return (
                <div
                  key={ag.id}
                  className="bg-[var(--surface)] rounded-[18px] border border-[var(--border)]/90 hover:border-[var(--border-strong)] transition relative overflow-hidden pl-6 pr-6 py-5 space-y-4"
                >
                  {/* Faixa Lateral Esquerda de Status Executivo */}
                  <div className={`absolute inset-y-0 left-0 w-1.5 ${statusStripeClass}`} />

                  {/* Topo do Card: Solicitante, Placa e Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-[#0B1B2E] text-white border border-[#22324C] flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                        {ag.nome.charAt(0)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-[var(--text)] text-sm">{ag.nome}</span>
                          <span className="tabular-nums text-[11px] bg-[var(--surface-2)] border border-[var(--border)]/90 px-2 py-0.5 rounded-md text-[var(--text)] font-bold">
                            {ag.ticket}
                          </span>
                          <span className="text-[10px] tabular-nums uppercase bg-[var(--brand-soft)] text-[var(--brand)] border border-[var(--brand-border)]/70 px-2 py-0.5 rounded-md font-semibold">
                            Despacho Gabinete
                          </span>
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] mt-0.5 tabular-nums flex items-center gap-1.5">
                          <span>CPF:</span>
                          <MascaraCpfLgpd
                            cpf={ag.cpf}
                            servidorConsultorNome={currentUser.nome}
                            contexto="Fila de Aprovação de Frota"
                          />
                          <span>· Contato: {ag.telefone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-center">
                      <PlacaMercosul placa={ag.veiculoPlaca} uf="PR" />
                      {ag.status === 'pendente' && (
                        <span className="text-[11px] font-bold bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning-border)]/80 px-3 py-1 rounded-full flex items-center gap-1.5">
                          <Clock size={12} /> Aguardando Despacho
                        </span>
                      )}
                      {isAutorizado && (
                        <span className="text-[11px] font-bold bg-[var(--verde-soft)] text-[var(--verde)] border border-[var(--verde-border)]/80 px-3 py-1 rounded-full flex items-center gap-1.5">
                          <CheckCircle2 size={12} /> Homologado ICP-PR
                        </span>
                      )}
                      {ag.status === 'reprovado' && (
                        <span className="text-[11px] font-bold bg-[var(--danger-soft)] text-[var(--danger)] border border-[var(--danger-border)]/80 px-3 py-1 rounded-full flex items-center gap-1.5">
                          <XCircle size={12} /> Indeferido
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Corpo Principal: Detalhes da Missão */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-[var(--surface-2)]/80 p-4 rounded-xl border border-[var(--border)]/80">
                    <div className="space-y-1">
                      <span className="text-[10px] tabular-nums uppercase font-semibold text-[var(--text-subtle)] flex items-center gap-1">
                        <Car size={11} className="text-[var(--brand)]" /> Viatura Oficial Designada
                      </span>
                      <div className="font-bold text-[var(--text)]">{ag.veiculoNome}</div>
                      <div className="text-[11px] text-[var(--text-muted)] font-medium">
                        {ag.modalidade === 'com_motorista' ? 'Com Motorista Oficial SEJU' : 'Condução Própria Autorizada'}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] tabular-nums uppercase font-semibold text-[var(--text-subtle)] flex items-center gap-1">
                        <Calendar size={11} className="text-[var(--brand)]" /> Cronograma & Turno
                      </span>
                      <div className="tabular-nums font-bold text-[var(--text)]">
                        {ag.datas.map(d => d.split('-').reverse().join('/')).join(', ')}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] capitalize font-medium">
                        Regime: {ag.periodo.replace('_', ' ')} ({ag.datas.length}{' '}
                        {ag.datas.length === 1 ? 'diária' : 'diárias'})
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] tabular-nums uppercase font-semibold text-[var(--text-subtle)] flex items-center gap-1">
                        <MapPin size={11} className="text-[var(--brand)]" /> Itinerário & Finalidade
                      </span>
                      <div className="text-[var(--text)] font-semibold line-clamp-2 leading-relaxed">
                        {ag.destino}
                      </div>
                    </div>
                  </div>

                  {/* Faixa de Resumo de Telemetria da Viagem */}
                  <div className="px-3.5 py-2.5 rounded-xl bg-[#0B1B2E] text-white border border-[#22324C] flex flex-wrap items-center justify-between gap-3 text-[11px] tabular-nums">
                    <div className="flex items-center gap-2">
                      <Gauge size={13} className="text-[var(--brand)] shrink-0" />
                      <span className="text-[#DCEEFB] font-bold uppercase">Telemetria da Missão:</span>
                      <span className="text-[var(--ink-muted)]">
                        Rota CWB ➔ PR · Alcance Est. ~{kmEstimado} km
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[10px]">
                      <span className="flex items-center gap-1 text-[var(--ink-muted)]">
                        <Navigation size={11} className="text-[var(--verde)]" /> GPS PR Ativo
                      </span>
                      <span className="text-[var(--text-muted)]">|</span>
                      <span className="text-[#FFE2A8] font-semibold">
                        Cautela 360° Obrigatória
                      </span>
                    </div>
                  </div>

                  {/* Rodapé de Auditoria ICP-PR ou Botões de Deliberação em 1 Clique */}
                  {ag.hashAuditoria && (
                    <div className="px-4 py-3 bg-[var(--verde-soft)]/70 rounded-xl border border-[var(--verde-border)]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--verde)]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#00703C] text-white flex items-center justify-center shrink-0">
                          <Award size={14} />
                        </div>
                        <div>
                          <span className="font-bold block sm:inline">
                            Chancela Digital ICP-PR Homologada:{' '}
                          </span>
                          <span className="text-[var(--verde)] inline-flex items-center gap-1.5 flex-wrap">
                            Despacho assinado por <strong>{ag.aprovadorNome}</strong> (
                            <MascaraCpfLgpd
                              cpf={ag.aprovadorCpf || ''}
                              servidorConsultorNome={currentUser.nome}
                              contexto="Chancela de Aprovador ICP-PR"
                            />
                            )
                          </span>
                        </div>
                      </div>
                      <span className="tabular-nums text-[10px] font-bold bg-[var(--surface)] text-[var(--verde)] px-2.5 py-1 rounded-md border border-[var(--verde-border)]/80 flex items-center gap-1 self-start sm:self-center shrink-0">
                        <Lock size={10} /> SHA-256: {formatShortHash(ag.hashAuditoria)}
                      </span>
                    </div>
                  )}

                  {isPendente && (
                    <div className="pt-2 flex flex-col gap-3 border-t border-[var(--border-subtle)]">
                      {/* Alerta de Segregação de Funções caso o usuário tente aprovar a si mesmo */}
                      {!podeAprovarSolicitacao(currentUser, ag.cpf, 'frotas').permitido && (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning-border)] text-xs">
                          <ShieldCheck size={16} className="text-[var(--warning)] shrink-0" />
                          <span>{podeAprovarSolicitacao(currentUser, ag.cpf, 'frotas').motivo}</span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Selo de Assinatura Digital ICP-PR */}
                        <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] bg-[var(--surface-2)] px-3 py-1.5 rounded-xl border border-[var(--border)]/80">
                          <Fingerprint size={15} className="text-[var(--brand)] shrink-0" />
                          <span>
                            Selo Digital <strong>ICP-PR · A3</strong> pronto para chancela de{' '}
                            <strong className="text-[var(--text)]">{currentUser.nome}</strong>
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setModalReprovarId(ag.id)}
                            disabled={isProcessando || !podeAprovarSolicitacao(currentUser, ag.cpf, 'frotas').permitido}
                            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[var(--border)]/90 text-xs font-bold transition ${
                              !podeAprovarSolicitacao(currentUser, ag.cpf, 'frotas').permitido
                                ? 'opacity-40 cursor-not-allowed bg-[var(--surface-2)] text-[var(--text-subtle)]'
                                : 'bg-[var(--surface)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] hover:border-[var(--danger-border)] text-[var(--text-muted)] cursor-pointer'
                            }`}
                          >
                            Indeferir Pedido
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAprovar1Clique(ag)}
                            disabled={isProcessando || !podeAprovarSolicitacao(currentUser, ag.cpf, 'frotas').permitido}
                            title={podeAprovarSolicitacao(currentUser, ag.cpf, 'frotas').motivo}
                            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 ${
                              !podeAprovarSolicitacao(currentUser, ag.cpf, 'frotas').permitido
                                ? 'opacity-40 cursor-not-allowed bg-[var(--border-strong)] text-[var(--text-muted)]'
                                : ' bg-[#0B1B2E]   hover:brightness-110 text-white ring-1 ring-[var(--warning)]/40 cursor-pointer'
                            }`}
                          >
                            <Fingerprint size={15} className={!podeAprovarSolicitacao(currentUser, ag.cpf, 'frotas').permitido ? 'text-[var(--text-subtle)]' : 'text-[#FFE2A8]'} />
                            {isProcessando
                              ? 'Chancelando ICP-PR...'
                              : !podeAprovarSolicitacao(currentUser, ag.cpf, 'frotas').permitido
                              ? 'Aprovação Bloqueada'
                              : 'Assinar ICP-PR · Aprovar em 1 Clique'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal Justificativa Reprovar */}
      {modalReprovarId && (
        <div className="fixed inset-0 bg-[#0B1B2E]/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-[18px] max-w-md w-full p-6 text-[var(--text)] border border-[var(--border)]/80 animate-in zoom-in-95">
            <h4 className="font-bold text-sm text-[var(--text)] mb-1">Reprovar Solicitação Oficial</h4>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Informe o motivo institucional que será registrado no protocolo e enviado ao servidor:
            </p>
            <textarea
              rows={3}
              value={motivoReprovacao}
              onChange={e => setMotivoReprovacao(e.target.value)}
              placeholder="Ex: Viatura realocada para atendimento prioritário de escolta..."
              className="w-full text-xs p-3 bg-[var(--surface-2)]/70 border border-[var(--border)]/90 rounded-xl mb-4 focus:ring-2 focus:ring-[#22324C]/10 focus:border-[#22324C] focus:bg-[var(--surface)] outline-hidden"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setModalReprovarId(null)}
                className="px-4 py-2 text-[var(--text-muted)] hover:bg-[var(--surface-2)] rounded-xl font-medium cursor-pointer transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarReprovar}
                className="px-4 py-2 bg-[#B42318] hover:bg-[#9B1C12] text-white font-semibold rounded-xl shadow-2xs cursor-pointer transition"
              >
                Confirmar Reprovação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
