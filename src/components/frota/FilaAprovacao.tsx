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
  User, 
  MapPin, 
  Calendar, 
  Search, 
  Smartphone,
  Check,
  CreditCard,
  List
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
      {/* Header Executivo da Chefia */}
      <div className="bg-linear-to-r from-[#00385E] via-[#00538A] to-[#0072BB] rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
            <Smartphone size={16} /> DELIBERAÇÃO OFICIAL · CHEFIA DE GABINETE
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold mt-1">
            Fila de Aprovação de Missões com 1 Clique
          </h2>
          <p className="text-xs text-blue-100/90 mt-1 max-w-xl">
            Cada autorização gera uma assinatura criptográfica <strong>SHA-256</strong> inviolável e despacha um e-mail com as instruções para o servidor solicitante.
          </p>
        </div>

        {/* Alternador de Modo de Visualização */}
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-2xl border border-white/20 self-start md:self-auto shrink-0">
          <button
            onClick={() => setVisualizacao('cards')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              visualizacao === 'cards' ? 'bg-white text-slate-900 shadow-sm' : 'text-white hover:bg-white/10'
            }`}
          >
            <List size={14} /> Modo Lista
          </button>
          <button
            onClick={() => setVisualizacao('passe')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              visualizacao === 'passe' ? 'bg-white text-slate-900 shadow-sm' : 'text-white hover:bg-white/10'
            }`}
          >
            <CreditCard size={14} /> Passe Digital (Wallet)
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
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

            return (
              <button
                key={tab.id}
                onClick={() => setFiltroStatus(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                  filtroStatus === tab.id
                    ? 'bg-[#0072BB] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  filtroStatus === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, ticket ou destino..."
            className="w-full text-xs pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0072BB]"
          />
        </div>
      </div>

      {/* Conteúdo: Lista ou Passes Digitais */}
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
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 text-xs">
              Nenhuma solicitação encontrada no momento.
            </div>
          ) : (
            listaFiltrada.map(ag => {
              const isPendente = ag.status === 'pendente';
              const isProcessando = processandoId === ag.id;

              return (
                <div
                  key={ag.id}
                  className={`bg-white rounded-3xl p-6 border transition-all shadow-xs space-y-4 ${
                    isPendente 
                      ? 'border-l-6 border-l-amber-500 border-slate-200 hover:border-slate-300' 
                      : ag.status === 'aprovado'
                      ? 'border-l-6 border-l-emerald-500 border-slate-200'
                      : 'border-l-6 border-l-red-500 border-slate-200 opacity-90'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0072BB] flex items-center justify-center font-bold text-sm">
                        {ag.nome.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">{ag.nome}</span>
                          <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded-lg text-slate-700 font-bold">
                            {ag.ticket}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 font-mono">
                          CPF: {ag.cpf} · Tel: {ag.telefone}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <PlacaMercosul placa={ag.veiculoPlaca} uf="PR" />
                      {ag.status === 'pendente' && (
                        <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full flex items-center gap-1.5">
                          <Clock size={14} /> Aguardando Validação
                        </span>
                      )}
                      {ag.status === 'aprovado' && (
                        <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full flex items-center gap-1.5">
                          <CheckCircle2 size={14} /> Autorizado
                        </span>
                      )}
                      {ag.status === 'reprovado' && (
                        <span className="text-xs font-bold bg-red-100 text-red-900 px-3 py-1 rounded-full">
                          Não Autorizado
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Veículo</span>
                      <strong className="text-slate-800">{ag.veiculoNome}</strong>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {ag.modalidade === 'com_motorista' ? 'Com Motorista' : 'Sem Motorista'}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Período</span>
                      <strong className="text-slate-800">{ag.datas.map(d => d.split('-').reverse().join('/')).join(', ')}</strong>
                      <div className="text-[11px] text-slate-500 mt-0.5 uppercase">
                        {ag.periodo.replace('_', ' ')}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Destino da Missão</span>
                      <span className="text-slate-800 line-clamp-2">{ag.destino}</span>
                    </div>
                  </div>

                  {ag.hashAuditoria && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                      <span className="flex items-center gap-1.5 font-bold">
                        <ShieldCheck size={16} className="text-emerald-700" />
                        Aprovado por {ag.aprovadorNome} ({ag.aprovadorCpf})
                      </span>
                      <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-emerald-200">
                        SHA-256: {formatShortHash(ag.hashAuditoria)}
                      </span>
                    </div>
                  )}

                  {isPendente && (
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setModalReprovarId(ag.id)}
                        disabled={isProcessando}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition cursor-pointer"
                      >
                        Reprovar Solicitação
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAprovar1Clique(ag)}
                        disabled={isProcessando}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                      >
                        <Check size={16} />
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl animate-in zoom-in-95">
            <h4 className="font-extrabold text-sm text-slate-900 mb-1">Reprovar Solicitação</h4>
            <p className="text-xs text-slate-500 mb-4">
              Informe a justificativa que será enviada por e-mail ao servidor solicitante:
            </p>
            <textarea
              rows={3}
              value={motivoReprovacao}
              onChange={e => setMotivoReprovacao(e.target.value)}
              placeholder="Ex: Veículo indisponível devido a comboio oficial..."
              className="w-full text-xs p-3 border border-slate-300 rounded-xl mb-4 focus:ring-2 focus:ring-red-500 outline-hidden"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setModalReprovarId(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarReprovar}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
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
