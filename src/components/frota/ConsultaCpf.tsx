import React, { useState } from 'react';
import { Agendamento, Usuario } from '../../types';
import { formatShortHash } from '../../services/crypto';
import { PasseViagemOficial } from './PasseViagemOficial';
import { PlacaMercosul } from '../ui/PlacaMercosul';
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
  X,
  Fingerprint,
  UserCheck,
  Lock,
  ArrowRight
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
      {/* Seção 1: Busca por CPF com Bordas Chanfradas & Acabamento Premium */}
      <div
        className="bg-white p-6 sm:p-8 border border-slate-200/90 shadow-[0_14px_36px_-12px_rgba(15,23,42,0.09)] space-y-6 relative overflow-hidden rounded-2xl"
        style={{
          clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))'
        }}
      >
        {/* Filete Superior Institucional */}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-[#0A192F] via-[#005A9C] to-amber-500" />

        {/* Detalhe de Canto Chanfrado Superior Direito & Inferior Esquerdo */}
        <span className="absolute top-0 right-0 w-5 h-5 bg-linear-to-bl from-amber-400/50 to-transparent pointer-events-none" />
        <span className="absolute bottom-0 left-0 w-5 h-5 bg-linear-to-tr from-[#005A9C]/30 to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-linear-to-br from-[#0A192F] to-[#004B87] text-white flex items-center justify-center shrink-0 shadow-xs ring-2 ring-amber-400/30">
              <Search size={19} className="text-sky-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                  RASTREAMENTO DE ORDENS DE TRÁFEGO · DOSSIÊ DO SERVIDOR
                </span>
                <span className="text-[10px] font-mono font-bold bg-sky-50 text-[#005A9C] px-2 py-0.5 rounded-full border border-sky-200/80">
                  ICP-PR · QR Pass
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                Consulta de Protocolos e Linha do Tempo por CPF
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Acompanhe o estágio de deliberação em tempo real, emita a Credencial Diplomática com QR Code ou imprima comprovantes.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleConsultar} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute left-3.5 inset-y-0 flex items-center gap-2 pointer-events-none">
              <Fingerprint size={16} className="text-[#005A9C]" />
              <span className="text-[10px] font-mono font-bold text-slate-400 border-r border-slate-200 pr-2">
                CPF
              </span>
            </div>
            <input
              type="text"
              required
              maxLength={14}
              value={cpfInput}
              onChange={e => setCpfInput(formatarCpf(e.target.value))}
              placeholder="000.000.000-00"
              className="w-full text-sm font-mono font-bold pl-20 pr-4 py-3 bg-slate-50/90 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-[#005A9C]/20 focus:border-[#005A9C] focus:bg-white outline-hidden transition text-slate-900 tracking-wider"
            />
          </div>
          <button
            type="submit"
            className="bg-linear-to-r from-[#0A192F] to-[#004B87] hover:brightness-110 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-xs transition cursor-pointer shrink-0 flex items-center justify-center gap-2"
          >
            <span>Rastrear Solicitações</span>
            <ArrowRight size={14} className="text-amber-300" />
          </button>
        </form>

        {/* Atalhos Rápidos de CPF em 1 Clique (Chips de Credencial) */}
        <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-mono uppercase font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <UserCheck size={13} className="text-[#005A9C]" /> Credenciais Rápidas:
          </span>
          {currentUser && (
            <button
              type="button"
              onClick={() => handleSelecionarPresetCpf(currentUser.cpf)}
              className="text-[11px] font-bold text-slate-900 bg-amber-50/80 hover:bg-amber-100/80 px-3 py-1.5 rounded-lg border border-amber-300/80 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Meu CPF ({currentUser.nome.split(' ')[0]})</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSelecionarPresetCpf('02145878901')}
            className="text-[11px] font-semibold text-slate-700 bg-slate-50 hover:bg-sky-50 hover:text-[#005A9C] hover:border-sky-200 px-3 py-1.5 rounded-lg border border-slate-200/90 transition cursor-pointer font-mono"
          >
            Dra. Maria Helena · 021.458.789-01
          </button>
          <button
            type="button"
            onClick={() => handleSelecionarPresetCpf('14589632144')}
            className="text-[11px] font-semibold text-slate-700 bg-slate-50 hover:bg-sky-50 hover:text-[#005A9C] hover:border-sky-200 px-3 py-1.5 rounded-lg border border-slate-200/90 transition cursor-pointer font-mono"
          >
            Carlos Silveira · 145.896.321-44
          </button>
        </div>
      </div>

      {/* Seção 2: Resultados & Cartões de Histórico Chanfrados com Linha do Tempo */}
      {resultado !== null && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="flex items-center gap-1.5">
              <span>Dossiê de solicitações localizado para</span>
              <strong className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200/80">
                {cpfInput}
              </strong>
            </span>
            <span className="font-mono bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold">
              {resultado.length} {resultado.length === 1 ? 'ordem registrada' : 'ordens registradas'}
            </span>
          </div>

          {resultado.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80 shadow-2xs text-xs text-slate-400">
              Nenhuma solicitação de veículo oficial encontrada para o CPF informado.
            </div>
          ) : (
            resultado.map(ag => {
              const isAprovadoOuMais =
                ag.status === 'aprovado' ||
                ag.status === 'em_andamento' ||
                ag.status === 'realizado';
              const isReprovado = ag.status === 'reprovado';
              const isRealizadoOuAndamento =
                ag.status === 'em_andamento' || ag.status === 'realizado';

              const statusStripe =
                ag.status === 'pendente'
                  ? 'bg-amber-500'
                  : isAprovadoOuMais
                  ? 'bg-emerald-500'
                  : 'bg-red-500';

              return (
                <div
                  key={ag.id}
                  className="bg-white p-6 border border-slate-200/90 shadow-[0_10px_28px_-12px_rgba(15,23,42,0.08)] hover:border-slate-300 transition space-y-5 relative overflow-hidden rounded-2xl pl-7"
                  style={{
                    clipPath:
                      'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))'
                  }}
                >
                  {/* Faixa Lateral de Status */}
                  <div className={`absolute inset-y-0 left-0 w-1.5 ${statusStripe}`} />

                  {/* Cantoneira Chanfrada Superior Direita */}
                  <span className="absolute top-0 right-0 w-4 h-4 bg-slate-200/70 pointer-events-none" />

                  {/* Topo do Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{ag.nome}</span>
                        <span className="font-mono text-[11px] font-bold text-[#005A9C] bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200/80">
                          {ag.ticket}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        Protocolado em {new Date(ag.criadoEm).toLocaleDateString('pt-BR')} · CPF {ag.cpf}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-center">
                      <PlacaMercosul placa={ag.veiculoPlaca} uf="PR" />

                      {ag.status === 'pendente' && (
                        <span className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300/80 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                          <Clock size={12} /> Aguardando Deliberação
                        </span>
                      )}
                      {ag.status === 'aprovado' && (
                        <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300/80 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                          <CheckCircle2 size={12} /> Autorizado para Viagem
                        </span>
                      )}
                      {ag.status === 'em_andamento' && (
                        <span className="text-[11px] font-bold bg-slate-900 text-white px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                          <Car size={12} className="text-sky-400" /> Em Missão Oficial
                        </span>
                      )}
                      {ag.status === 'reprovado' && (
                        <span className="text-[11px] font-bold bg-red-50 text-red-700 border border-red-300/80 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                          <XCircle size={12} /> Não Autorizado
                        </span>
                      )}
                      {ag.status === 'realizado' && (
                        <span className="text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-emerald-600" /> Missão Concluída
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ================================================================= */}
                  {/* LINHA DO TEMPO (TIMELINE) CONECTADA DE STATUS DA SOLICITAÇÃO      */}
                  {/* ================================================================= */}
                  <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      <span>Rastreamento de Estágios do Protocolo</span>
                      <span className="font-bold text-slate-600">
                        {ag.status === 'realizado'
                          ? '3/3 CONCLUÍDO'
                          : isAprovadoOuMais
                          ? '2/3 HOMOLOGADO'
                          : '1/3 PROTOCOLADO'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative">
                      {/* Etapa 1: Requisição Emitida */}
                      <div className="p-3 rounded-xl bg-white border border-emerald-200/90 shadow-2xs flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white text-xs font-mono font-bold flex items-center justify-center shrink-0">
                          ✓
                        </span>
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-slate-900">
                            1. Requisição Emitida
                          </div>
                          <div className="text-[10px] font-mono text-emerald-700 truncate">
                            {ag.ticket} · Validado
                          </div>
                        </div>
                      </div>

                      {/* Etapa 2: Deliberação Chefia ICP-PR */}
                      <div
                        className={`p-3 rounded-xl border flex items-center gap-3 ${
                          isAprovadoOuMais
                            ? 'bg-white border-emerald-200/90 shadow-2xs'
                            : isReprovado
                            ? 'bg-red-50/60 border-red-200/90'
                            : 'bg-amber-50/60 border-amber-300/80'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                            isAprovadoOuMais
                              ? 'bg-emerald-600 text-white'
                              : isReprovado
                              ? 'bg-red-600 text-white'
                              : 'bg-amber-500 text-white animate-pulse'
                          }`}
                        >
                          {isAprovadoOuMais ? '✓' : isReprovado ? '✕' : '02'}
                        </span>
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-slate-900">
                            2. Despacho ICP-PR
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 truncate">
                            {isAprovadoOuMais
                              ? 'Chancelado via SHA-256'
                              : isReprovado
                              ? 'Pedido indeferido'
                              : 'Na mesa de 1 clique'}
                          </div>
                        </div>
                      </div>

                      {/* Etapa 3: Passe Diplomático & Vistoria 360° */}
                      <div
                        className={`p-3 rounded-xl border flex items-center gap-3 ${
                          isRealizadoOuAndamento
                            ? 'bg-white border-emerald-200/90 shadow-2xs'
                            : isAprovadoOuMais
                            ? 'bg-sky-50/70 border-sky-200/90'
                            : 'bg-slate-100/70 border-slate-200/70 opacity-75'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                            ag.status === 'realizado'
                              ? 'bg-emerald-600 text-white'
                              : isAprovadoOuMais
                              ? 'bg-[#005A9C] text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {ag.status === 'realizado' ? '✓' : '03'}
                        </span>
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-slate-900">
                            3. Passe & Vistoria 360°
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 truncate">
                            {ag.status === 'realizado'
                              ? 'Check-out finalizado'
                              : ag.status === 'em_andamento'
                              ? 'Viatura em missão'
                              : isAprovadoOuMais
                              ? 'Credencial QR ativa'
                              : 'Aguardando etapa 2'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detalhes da Viagem */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 bg-slate-50/50 p-3.5 rounded-xl border border-slate-200/60">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono uppercase font-semibold text-slate-400 flex items-center gap-1">
                        <Car size={11} className="text-[#005A9C]" /> Viatura Oficial
                      </span>
                      <div className="font-bold text-slate-900">{ag.veiculoNome}</div>
                      <div className="text-[11px] font-mono text-slate-500">Placa {ag.veiculoPlaca}</div>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono uppercase font-semibold text-slate-400 flex items-center gap-1">
                        <Calendar size={11} className="text-[#005A9C]" /> Cronograma
                      </span>
                      <div className="font-mono font-bold text-slate-900">
                        {ag.datas.map(d => d.split('-').reverse().join('/')).join(', ')}
                      </div>
                      <div className="text-[11px] text-slate-500 capitalize">
                        Turno: {ag.periodo.replace('_', ' ')}
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono uppercase font-semibold text-slate-400 flex items-center gap-1">
                        <MapPin size={11} className="text-[#005A9C]" /> Destino Oficial
                      </span>
                      <div className="text-slate-800 font-semibold line-clamp-2">{ag.destino}</div>
                    </div>
                  </div>

                  {/* Carimbo de Auditoria */}
                  {ag.hashAuditoria && (
                    <div className="px-4 py-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-950">
                      <span className="flex items-center gap-1.5 font-medium">
                        <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                        Homologado via ICP-PR por <strong className="text-slate-900">{ag.aprovadorNome}</strong> ({ag.aprovadorCpf})
                      </span>
                      <span className="font-mono text-[10px] font-bold bg-white text-emerald-800 px-2.5 py-0.5 rounded-md border border-emerald-300/80 flex items-center gap-1 self-start sm:self-center">
                        <Lock size={10} /> SHA-256: {formatShortHash(ag.hashAuditoria)}
                      </span>
                    </div>
                  )}

                  {ag.status === 'reprovado' && ag.obs && (
                    <div className="p-3 bg-red-50/70 rounded-xl border border-red-200/70 text-xs text-red-800">
                      <strong>Justificativa do Indeferimento:</strong> {ag.obs}
                    </div>
                  )}

                  {/* Ações */}
                  <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="text-xs font-bold text-slate-700 hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200/90 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Printer size={14} /> Imprimir Dossiê
                    </button>

                    {(ag.status === 'aprovado' ||
                      ag.status === 'em_andamento' ||
                      ag.status === 'realizado') && (
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setPasseSelecionado(ag);
                        }}
                        className="text-xs font-bold text-white bg-linear-to-r from-[#0A192F] to-[#004B87] hover:brightness-110 px-4 py-2 rounded-xl shadow-xs ring-1 ring-amber-400/40 flex items-center gap-2 transition cursor-pointer"
                      >
                        <Ticket size={14} className="text-amber-300" />
                        <span>Abrir Credencial Diplomática Digital (QR Code)</span>
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
              currentUser={
                currentUser || {
                  id: 'usr-1',
                  nome: passeSelecionado.nome,
                  username: 'servidor.seju',
                  cpf: passeSelecionado.cpf,
                  cargo: 'Servidor Solicitante',
                  setor: 'SEJU/PR',
                  email: passeSelecionado.email,
                  role: 'servidor'
                }
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
