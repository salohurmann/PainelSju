import React, { useState } from 'react';
import { Agendamento, Usuario } from '../../types';
import { formatShortHash } from '../../services/crypto';
import { PasseViagemOficial } from './PasseViagemOficial';
import { soundFX } from '../../services/soundFx';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ShieldCheck, 
  Printer, 
  Ticket,
  Car,
  Calendar,
  MapPin,
  X
} from 'lucide-react';

interface ConsultaCpfProps {
  agendamentos: Agendamento[];
  currentUser?: Usuario;
}

export const ConsultaCpf: React.FC<ConsultaCpfProps> = ({ agendamentos, currentUser }) => {
  const [cpfInput, setCpfInput] = useState('');
  const [resultado, setResultado] = useState<Agendamento[] | null>(null);
  const [passeSelecionado, setPasseSelecionado] = useState<Agendamento | null>(null);

  const formatarCpf = (v: string) => {
    let clean = v.replace(/\D/g, '');
    if (clean.length > 11) clean = clean.slice(0, 11);
    return clean
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const executarBuscaPorCpf = (cpfVal: string) => {
    const clean = cpfVal.replace(/\D/g, '');
    if (!clean) return;
    const encontrados = agendamentos.filter(
      a => a.cpf.replace(/\D/g, '') === clean
    );
    setResultado(encontrados);
  };

  const handleConsultar = (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    executarBuscaPorCpf(cpfInput);
  };

  const handleSelecionarPresetCpf = (cpf: string) => {
    soundFX.playClick();
    const formatted = formatarCpf(cpf);
    setCpfInput(formatted);
    executarBuscaPorCpf(formatted);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Seção 1: Busca por CPF & Atalhos */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Search size={19} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  RASTREAMENTO DE ORDENS DE TRÁFEGO
                </span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900 tracking-tight mt-0.5">
                Consulta e Linha do Tempo por CPF
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Acompanhe o estágio de deliberação, acesse o Passe Oficial Digital com QR Code ou imprima comprovantes.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleConsultar} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              required
              maxLength={14}
              value={cpfInput}
              onChange={e => setCpfInput(formatarCpf(e.target.value))}
              placeholder="Digite o CPF (000.000.000-00)"
              className="w-full text-sm font-mono font-semibold pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white outline-hidden transition"
            />
          </div>
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-2xs transition cursor-pointer shrink-0"
          >
            Consultar Solicitações
          </button>
        </form>

        {/* Atalhos Rápidos de CPF em 1 Clique */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-medium text-slate-400 mr-1">Consultas rápidas:</span>
          {currentUser && (
            <button
              type="button"
              onClick={() => handleSelecionarPresetCpf(currentUser.cpf)}
              className="text-[11px] font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3 py-1 rounded-lg border border-slate-200/80 transition cursor-pointer"
            >
              Meu CPF ({currentUser.nome.split(' ')[0]})
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSelecionarPresetCpf('02145878901')}
            className="text-[11px] font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-1 rounded-lg border border-slate-200/80 transition cursor-pointer"
          >
            Dra. Maria Helena
          </button>
          <button
            type="button"
            onClick={() => handleSelecionarPresetCpf('14589632144')}
            className="text-[11px] font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-1 rounded-lg border border-slate-200/80 transition cursor-pointer"
          >
            Carlos Silveira
          </button>
        </div>
      </div>

      {/* Seção 2: Resultados & Linha do Tempo */}
      {resultado !== null && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Solicitações localizadas para <strong className="font-mono text-slate-800">{cpfInput}</strong>
            </span>
            <span className="font-mono bg-white px-2.5 py-0.5 rounded-md border border-slate-200/80 text-slate-700 font-semibold">
              {resultado.length} {resultado.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          {resultado.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80 shadow-2xs text-xs text-slate-400">
              Nenhuma solicitação de veículo encontrada para o CPF informado.
            </div>
          ) : (
            resultado.map(ag => {
              const isAprovadoOuMais = ag.status === 'aprovado' || ag.status === 'em_andamento' || ag.status === 'realizado';
              const isReprovado = ag.status === 'reprovado';
              const isRealizadoOuAndamento = ag.status === 'em_andamento' || ag.status === 'realizado';

              return (
                <div
                  key={ag.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-5"
                >
                  {/* Topo do Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{ag.nome}</span>
                        <span className="font-mono text-[11px] font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/80">
                          {ag.ticket}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Protocolado em {new Date(ag.criadoEm).toLocaleDateString('pt-BR')}
                      </div>
                    </div>

                    <div>
                      {ag.status === 'pendente' && (
                        <span className="text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
                          <Clock size={12} /> Aguardando Deliberação
                        </span>
                      )}
                      {ag.status === 'aprovado' && (
                        <span className="text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
                          <CheckCircle2 size={12} /> Autorizado para Viagem
                        </span>
                      )}
                      {ag.status === 'em_andamento' && (
                        <span className="text-[11px] font-medium bg-slate-900 text-white px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
                          <Car size={12} /> Em Missão Oficial
                        </span>
                      )}
                      {ag.status === 'reprovado' && (
                        <span className="text-[11px] font-medium bg-red-50 text-red-700 border border-red-200/80 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
                          <XCircle size={12} /> Não Autorizado
                        </span>
                      )}
                      {ag.status === 'realizado' && (
                        <span className="text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
                          <CheckCircle2 size={12} /> Missão Concluída
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Linha do Tempo (Timeline) da Solicitação */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70">
                    {/* Etapa 1 */}
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                        ✓
                      </span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-slate-900">1. Requisição Emitida</div>
                        <div className="text-[10px] text-slate-500 truncate">Protocolo {ag.ticket}</div>
                      </div>
                    </div>

                    {/* Etapa 2 */}
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-full text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${
                        isAprovadoOuMais
                          ? 'bg-emerald-600 text-white'
                          : isReprovado
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {isAprovadoOuMais ? '✓' : isReprovado ? '✕' : '2'}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-slate-900">2. Deliberação Chefia</div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {isAprovadoOuMais
                            ? 'Assinado via SHA-256'
                            : isReprovado
                            ? 'Pedido indeferido'
                            : 'Na fila de 1 clique'}
                        </div>
                      </div>
                    </div>

                    {/* Etapa 3 */}
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-full text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${
                        isRealizadoOuAndamento
                          ? 'bg-slate-900 text-white'
                          : isAprovadoOuMais
                          ? 'bg-white text-slate-800 border border-slate-300'
                          : 'bg-slate-200/70 text-slate-400'
                      }`}>
                        {ag.status === 'realizado' ? '✓' : '3'}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-slate-900">3. Passe & Vistoria</div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {ag.status === 'realizado'
                            ? 'Check-out finalizado'
                            : ag.status === 'em_andamento'
                            ? 'Viatura em tráfego'
                            : isAprovadoOuMais
                            ? 'Passe QR liberado'
                            : 'Aguardando etapa 2'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detalhes da Viagem */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                        <Car size={11} /> Veículo
                      </span>
                      <div className="font-semibold text-slate-900">{ag.veiculoNome}</div>
                      <div className="text-[11px] font-mono text-slate-500">Placa {ag.veiculoPlaca}</div>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                        <Calendar size={11} /> Datas
                      </span>
                      <div className="font-mono font-semibold text-slate-900">
                        {ag.datas.map(d => d.split('-').reverse().join('/')).join(', ')}
                      </div>
                      <div className="text-[11px] text-slate-500 capitalize">Turno: {ag.periodo.replace('_', ' ')}</div>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                        <MapPin size={11} /> Destino
                      </span>
                      <div className="text-slate-800 font-medium line-clamp-2">{ag.destino}</div>
                    </div>
                  </div>

                  {/* Carimbo de Auditoria */}
                  {ag.hashAuditoria && (
                    <div className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700">
                      <span className="flex items-center gap-1.5 font-medium">
                        <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                        Assinado por <strong className="text-slate-900">{ag.aprovadorNome}</strong> ({ag.aprovadorCpf})
                      </span>
                      <span className="font-mono text-[10px] bg-white text-slate-600 px-2.5 py-0.5 rounded-md border border-slate-200/80">
                        SHA-256: {formatShortHash(ag.hashAuditoria)}
                      </span>
                    </div>
                  )}

                  {ag.status === 'reprovado' && ag.obs && (
                    <div className="p-3 bg-red-50/70 rounded-xl border border-red-200/70 text-xs text-red-800">
                      <strong>Justificativa:</strong> {ag.obs}
                    </div>
                  )}

                  {/* Ações */}
                  <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="text-xs font-medium text-slate-700 hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/90 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Printer size={14} /> Imprimir Comprovante
                    </button>

                    {(ag.status === 'aprovado' || ag.status === 'em_andamento' || ag.status === 'realizado') && (
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setPasseSelecionado(ag);
                        }}
                        className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl shadow-2xs flex items-center gap-2 transition cursor-pointer"
                      >
                        <Ticket size={14} /> Visualizar Passe Oficial Digital (QR Code)
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal do Passe Oficial Digital */}
      {passeSelecionado && (
        <div 
          className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setPasseSelecionado(null)}
        >
          <div 
            className="max-w-md w-full animate-in zoom-in-95 relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setPasseSelecionado(null)}
                className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white text-white hover:text-slate-900 flex items-center justify-center cursor-pointer transition shadow-md"
              >
                <X size={16} />
              </button>
            </div>

            <PasseViagemOficial
              agendamento={passeSelecionado}
              currentUser={currentUser || { id: 'usr-1', nome: passeSelecionado.nome, username: 'servidor.seju', cpf: passeSelecionado.cpf, cargo: 'Servidor Solicitante', setor: 'SEJU/PR', email: passeSelecionado.email, role: 'servidor' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
