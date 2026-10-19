import React, { useState } from 'react';
import { Agendamento, Usuario } from '../../types';
import { generateAuditHash, formatShortHash } from '../../services/crypto';
import { podeAprovarSolicitacao } from '../../services/rbac';
import { PlacaMercosul } from '../ui/PlacaMercosul';
import { MascaraCpfLgpd } from '../ui/MascaraCpfLgpd';
import { PasseViagemOficial } from './PasseViagemOficial';
import { soundFX } from '../../services/soundFx';
import confetti from 'canvas-confetti';
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
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Seção 1: Mesa de Despacho Executivo & KPI Strip */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.08)] space-y-6 relative overflow-hidden">
        {/* Filete Superior Institucional Dourado / Azul Paraná */}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-[#0A192F] via-[#005A9C] to-amber-500" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-linear-to-br from-[#0A192F] to-[#004B87] text-white flex items-center justify-center shrink-0 shadow-xs ring-2 ring-amber-400/30">
              <ShieldCheck size={21} className="text-amber-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                  MESA DE DESPACHO EXECUTIVO · CHEFIA DE GABINETE
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300/80 flex items-center gap-1">
                  <Fingerprint size={11} className="text-emerald-600" /> ICP-PR · Token A3 Ativo
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                Deliberação e Homologação de Missões Oficiais
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Chancela eletrônica em 1 clique com selo ICP-PR, resumo de telemetria de rota e emissão de Passe Diplomático.
              </p>
            </div>
          </div>

          {/* Alternador de Modo de Visualização */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/90 self-start md:self-center shrink-0">
            <button
              type="button"
              onClick={() => setVisualizacao('cards')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                visualizacao === 'cards'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List size={14} /> Mesa de Despacho
            </button>
            <button
              type="button"
              onClick={() => setVisualizacao('passe')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                visualizacao === 'passe'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard size={14} /> Credenciais Digitais
            </button>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block">Protocolos na Pauta</span>
              <span className="text-xl font-bold text-slate-900 font-mono mt-0.5 block">
                {agendamentos.length}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center text-slate-700 shadow-2xs">
              <FileCheck2 size={17} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-amber-900/80 block">Aguardando Despacho</span>
              <span className="text-xl font-bold text-amber-900 font-mono mt-0.5 block">
                {totalPendentes}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white border border-amber-200/90 flex items-center justify-center text-amber-600 shadow-2xs">
              <Clock size={17} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-emerald-900/80 block">Homologadas ICP-PR</span>
              <span className="text-xl font-bold text-emerald-900 font-mono mt-0.5 block">
                {totalAprovados}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white border border-emerald-200/90 flex items-center justify-center text-emerald-600 shadow-2xs">
              <CheckCircle2 size={17} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block">Indeferidas</span>
              <span className="text-xl font-bold text-slate-700 font-mono mt-0.5 block">
                {totalReprovados}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center text-slate-400 shadow-2xs">
              <XCircle size={17} />
            </div>
          </div>
        </div>
      </div>

      {/* Seção 2: Barra de Filtros e Busca */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
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
                    ? 'bg-slate-900 text-white shadow-2xs font-bold'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                    active ? 'bg-white/15 text-white' : 'bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar servidor, protocolo ou destino..."
            className="w-full text-xs pl-9 pr-3.5 py-2 bg-slate-50/80 border border-slate-200/90 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white transition"
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
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-2xs text-slate-400 text-xs">
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
                ? 'bg-amber-500'
                : isAutorizado
                ? 'bg-emerald-500'
                : 'bg-red-500';

              const kmEstimado = ag.datas.length * 145;

              return (
                <div
                  key={ag.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)] hover:border-slate-300 transition relative overflow-hidden pl-6 pr-6 py-5 space-y-4"
                >
                  {/* Faixa Lateral Esquerda de Status Executivo */}
                  <div className={`absolute inset-y-0 left-0 w-1.5 ${statusStripeClass}`} />

                  {/* Topo do Card: Solicitante, Placa e Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-slate-900 text-white border border-slate-800 flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                        {ag.nome.charAt(0)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{ag.nome}</span>
                          <span className="font-mono text-[11px] bg-slate-100 border border-slate-200/90 px-2 py-0.5 rounded-md text-slate-800 font-bold">
                            {ag.ticket}
                          </span>
                          <span className="text-[10px] font-mono uppercase bg-sky-50 text-[#005A9C] border border-sky-200/70 px-2 py-0.5 rounded-md font-semibold">
                            Despacho Gabinete
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 font-mono flex items-center gap-1.5">
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
                        <span className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300/80 px-3 py-1 rounded-full flex items-center gap-1.5">
                          <Clock size={12} /> Aguardando Despacho
                        </span>
                      )}
                      {isAutorizado && (
                        <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300/80 px-3 py-1 rounded-full flex items-center gap-1.5">
                          <CheckCircle2 size={12} /> Homologado ICP-PR
                        </span>
                      )}
                      {ag.status === 'reprovado' && (
                        <span className="text-[11px] font-bold bg-red-50 text-red-700 border border-red-300/80 px-3 py-1 rounded-full flex items-center gap-1.5">
                          <XCircle size={12} /> Indeferido
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Corpo Principal: Detalhes da Missão */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase font-semibold text-slate-400 flex items-center gap-1">
                        <Car size={11} className="text-[#005A9C]" /> Viatura Oficial Designada
                      </span>
                      <div className="font-bold text-slate-900">{ag.veiculoNome}</div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {ag.modalidade === 'com_motorista' ? 'Com Motorista Oficial SEJU' : 'Condução Própria Autorizada'}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase font-semibold text-slate-400 flex items-center gap-1">
                        <Calendar size={11} className="text-[#005A9C]" /> Cronograma & Turno
                      </span>
                      <div className="font-mono font-bold text-slate-900">
                        {ag.datas.map(d => d.split('-').reverse().join('/')).join(', ')}
                      </div>
                      <div className="text-[11px] text-slate-500 capitalize font-medium">
                        Regime: {ag.periodo.replace('_', ' ')} ({ag.datas.length}{' '}
                        {ag.datas.length === 1 ? 'diária' : 'diárias'})
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase font-semibold text-slate-400 flex items-center gap-1">
                        <MapPin size={11} className="text-[#005A9C]" /> Itinerário & Finalidade
                      </span>
                      <div className="text-slate-800 font-semibold line-clamp-2 leading-relaxed">
                        {ag.destino}
                      </div>
                    </div>
                  </div>

                  {/* Faixa de Resumo de Telemetria da Viagem */}
                  <div className="px-3.5 py-2.5 rounded-xl bg-slate-900 text-white border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
                    <div className="flex items-center gap-2">
                      <Gauge size={13} className="text-sky-400 shrink-0" />
                      <span className="text-sky-300 font-bold uppercase">Telemetria da Missão:</span>
                      <span className="text-slate-300">
                        Rota CWB ➔ PR · Alcance Est. ~{kmEstimado} km
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[10px]">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Navigation size={11} className="text-emerald-400" /> GPS PR Ativo
                      </span>
                      <span className="text-slate-600">|</span>
                      <span className="text-amber-300 font-semibold">
                        Cautela 360° Obrigatória
                      </span>
                    </div>
                  </div>

                  {/* Rodapé de Auditoria ICP-PR ou Botões de Deliberação em 1 Clique */}
                  {ag.hashAuditoria && (
                    <div className="px-4 py-3 bg-emerald-50/70 rounded-xl border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-950">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <Award size={14} />
                        </div>
                        <div>
                          <span className="font-bold block sm:inline">
                            Chancela Digital ICP-PR Homologada:{' '}
                          </span>
                          <span className="text-emerald-800 inline-flex items-center gap-1.5 flex-wrap">
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
                      <span className="font-mono text-[10px] font-bold bg-white text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-300/80 flex items-center gap-1 self-start sm:self-center shrink-0">
                        <Lock size={10} /> SHA-256: {formatShortHash(ag.hashAuditoria)}
                      </span>
                    </div>
                  )}

                  {isPendente && (
                    <div className="pt-2 flex flex-col gap-3 border-t border-slate-100">
                      {/* Alerta de Segregação de Funções caso o usuário tente aprovar a si mesmo */}
                      {!podeAprovarSolicitacao(currentUser, ag.cpf, 'frotas').permitido && (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs">
                          <ShieldCheck size={16} className="text-amber-600 shrink-0" />
                          <span>{podeAprovarSolicitacao(currentUser, ag.cpf, 'frotas').motivo}</span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Selo de Assinatura Digital ICP-PR */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
                          <Fingerprint size={15} className="text-[#005A9C] shrink-0" />
                          <span>
                            Selo Digital <strong>ICP-PR · A3</strong> pronto para chancela de{' '}
                            <strong className="text-slate-900">{currentUser.nome}</strong>
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setModalReprovarId(ag.id)}
                            disabled={isProcessando || !podeAprovarSolicitacao(currentUser, ag.cpf, 'frotas').permitido}
                            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200/90 text-xs font-bold transition ${
                              !podeAprovarSolicitacao(currentUser, ag.cpf, 'frotas').permitido
                                ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                                : 'bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-600 cursor-pointer'
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
                                ? 'opacity-40 cursor-not-allowed bg-slate-300 text-slate-500'
                                : 'bg-linear-to-r from-[#0A192F] via-[#004B87] to-[#005A9C] hover:brightness-110 text-white ring-1 ring-amber-400/40 cursor-pointer'
                            }`}
                          >
                            <Fingerprint size={15} className={!podeAprovarSolicitacao(currentUser, ag.cpf, 'frotas').permitido ? 'text-slate-400' : 'text-amber-300'} />
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
        <div className="fixed inset-0 bg-slate-950/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-slate-800 shadow-xl border border-slate-200/80 animate-in zoom-in-95">
            <h4 className="font-bold text-sm text-slate-900 mb-1">Reprovar Solicitação Oficial</h4>
            <p className="text-xs text-slate-500 mb-4">
              Informe o motivo institucional que será registrado no protocolo e enviado ao servidor:
            </p>
            <textarea
              rows={3}
              value={motivoReprovacao}
              onChange={e => setMotivoReprovacao(e.target.value)}
              placeholder="Ex: Viatura realocada para atendimento prioritário de escolta..."
              className="w-full text-xs p-3 bg-slate-50/70 border border-slate-200/90 rounded-xl mb-4 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white outline-hidden"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setModalReprovarId(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarReprovar}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-2xs cursor-pointer transition"
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
