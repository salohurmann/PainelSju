import React, { useState } from 'react';
import { Agendamento, Usuario } from '../../types';
import { generateAuditHash, formatShortHash } from '../../services/crypto';
import { PlacaMercosul } from '../ui/PlacaMercosul';
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
  Check,
  CreditCard,
  List,
  FileCheck2
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
  const totalAprovados = agendamentos.filter(a => a.status === 'aprovado' || a.status === 'em_andamento' || a.status === 'realizado').length;
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
      {/* Seção 1: Header Executivo & KPI Strip */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  DELIBERAÇÃO OFICIAL · CHEFIA DE GABINETE
                </span>
                <span className="text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200/70">
                  SHA-256 Ativo
                </span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900 tracking-tight mt-0.5">
                Fila de Aprovação de Missões Oficiais
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Autorização em 1 clique com geração imediata de assinatura digital criptográfica e passe de tráfego.
              </p>
            </div>
          </div>

          {/* Alternador de Modo de Visualização */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start md:self-center shrink-0">
            <button
              type="button"
              onClick={() => setVisualizacao('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                visualizacao === 'cards'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List size={14} /> Modo Lista
            </button>
            <button
              type="button"
              onClick={() => setVisualizacao('passe')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                visualizacao === 'passe'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard size={14} /> Passe Digital
            </button>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Total na Fila</span>
              <span className="text-lg font-semibold text-slate-900 font-mono mt-0.5 block">
                {agendamentos.length}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-slate-600">
              <FileCheck2 size={16} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-amber-800/80 block">Aguardando</span>
              <span className="text-lg font-semibold text-amber-900 font-mono mt-0.5 block">
                {totalPendentes}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white border border-amber-200/70 flex items-center justify-center text-amber-600">
              <Clock size={16} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-emerald-800/80 block">Autorizadas</span>
              <span className="text-lg font-semibold text-emerald-900 font-mono mt-0.5 block">
                {totalAprovados}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white border border-emerald-200/70 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Não Autorizadas</span>
              <span className="text-lg font-semibold text-slate-700 font-mono mt-0.5 block">
                {totalReprovados}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-slate-400">
              <XCircle size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Seção 2: Barra de Filtros e Busca */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'pendente', label: 'Pendentes' },
            { id: 'aprovado', label: 'Aprovados' },
            { id: 'reprovado', label: 'Reprovados' },
            { id: 'todos', label: 'Todos' }
          ].map(tab => {
            const count = tab.id === 'todos' 
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
                    ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                  active ? 'bg-white/15 text-white' : 'bg-slate-200/70 text-slate-700'
                }`}>
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
            className="w-full text-xs pl-9 pr-3.5 py-2 bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white transition"
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
              onReprovar={(m) => onReprovar(ag.id, m, currentUser)}
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

              return (
                <div
                  key={ag.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs hover:border-slate-300/90 transition space-y-5"
                >
                  {/* Topo do Card: Solicitante, Placa e Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-800 flex items-center justify-center font-semibold text-sm shrink-0">
                        {ag.nome.charAt(0)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-900 text-sm">{ag.nome}</span>
                          <span className="font-mono text-[11px] bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md text-slate-600 font-medium">
                            {ag.ticket}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                          CPF: {ag.cpf} · Tel: {ag.telefone}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-center">
                      <PlacaMercosul placa={ag.veiculoPlaca} uf="PR" />
                      {ag.status === 'pendente' && (
                        <span className="text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                          <Clock size={12} /> Aguardando
                        </span>
                      )}
                      {ag.status === 'aprovado' && (
                        <span className="text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                          <CheckCircle2 size={12} /> Autorizado
                        </span>
                      )}
                      {ag.status === 'reprovado' && (
                        <span className="text-[11px] font-medium bg-red-50 text-red-700 border border-red-200/80 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                          <XCircle size={12} /> Não Autorizado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Corpo Dividido: Detalhes da Missão */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50/60 p-4 rounded-xl border border-slate-200/60">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                        <Car size={11} /> Veículo Oficial
                      </span>
                      <div className="font-semibold text-slate-900">{ag.veiculoNome}</div>
                      <div className="text-[11px] text-slate-500">
                        {ag.modalidade === 'com_motorista' ? 'Com Motorista Oficial' : 'Condução Própria'}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                        <Calendar size={11} /> Datas & Período
                      </span>
                      <div className="font-mono font-semibold text-slate-900">
                        {ag.datas.map(d => d.split('-').reverse().join('/')).join(', ')}
                      </div>
                      <div className="text-[11px] text-slate-500 capitalize">
                        Turno: {ag.periodo.replace('_', ' ')}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                        <MapPin size={11} /> Roteiro & Finalidade
                      </span>
                      <div className="text-slate-800 font-medium line-clamp-2 leading-relaxed">
                        {ag.destino}
                      </div>
                    </div>
                  </div>

                  {/* Rodapé de Auditoria ou Botões de Deliberação */}
                  {ag.hashAuditoria && (
                    <div className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700">
                      <span className="flex items-center gap-1.5 font-medium">
                        <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                        Autorizado por <strong className="text-slate-900">{ag.aprovadorNome}</strong> ({ag.aprovadorCpf})
                      </span>
                      <span className="font-mono text-[10px] bg-white text-slate-600 px-2.5 py-1 rounded-md border border-slate-200/80">
                        SHA-256: {formatShortHash(ag.hashAuditoria)}
                      </span>
                    </div>
                  )}

                  {isPendente && (
                    <div className="pt-1 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setModalReprovarId(ag.id)}
                        disabled={isProcessando}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-600 text-xs font-semibold transition cursor-pointer"
                      >
                        Reprovar Solicitação
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAprovar1Clique(ag)}
                        disabled={isProcessando}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Check size={15} />
                        {isProcessando ? 'Autenticando SHA-256...' : 'Aprovar com 1 Clique'}
                      </button>
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
            <h4 className="font-semibold text-sm text-slate-900 mb-1">Reprovar Solicitação Oficial</h4>
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
