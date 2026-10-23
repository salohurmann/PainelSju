import React, { useState } from 'react';
import { Agendamento, Usuario } from '../../types';
import { formatShortHash } from '../../services/crypto';
import { PasseViagemOficial } from './PasseViagemOficial';
import { PlacaMercosul } from '../ui/PlacaMercosul';
import { MascaraCpfLgpd } from '../ui/MascaraCpfLgpd';
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
    <div className="space-y-6">
      {/* Seção 1: Busca por CPF com Bordas Chanfradas & Acabamento Premium */}
      <div
        className="bg-[var(--surface)] p-6 sm:p-8 border border-[var(--border)]/90 space-y-6 relative overflow-hidden rounded-[18px]"
        style={{
          clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))'
        }}
      >
        {/* Filete Superior Institucional */}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0B1B2E]  " />

        {/* Detalhe de Canto Chanfrado Superior Direito & Inferior Esquerdo */}
        <span className="absolute top-0 right-0 w-5 h-5 bg-[#D98A00]/50 pointer-events-none" />
        <span className="absolute bottom-0 left-0 w-5 h-5 bg-[#005A9C]/30 pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#0B1B2E] text-white flex items-center justify-center shrink-0 shadow-xs ring-2 ring-[var(--warning)]/30">
              <Search size={19} className="text-[#DCEEFB]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] tabular-nums uppercase tracking-wider text-[var(--text-muted)] font-bold">
                  RASTREAMENTO DE ORDENS DE TRÁFEGO · DOSSIÊ DO SERVIDOR
                </span>
                <span className="text-[10px] tabular-nums font-bold bg-[var(--brand-soft)] text-[var(--brand)] px-2 py-0.5 rounded-full border border-[var(--brand-border)]/80">
                  ICP-PR · QR Pass
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--text)] tracking-tight mt-0.5">
                Consulta de Protocolos e Linha do Tempo por CPF
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Acompanhe o estágio de deliberação em tempo real, emita a Credencial Diplomática com QR Code ou imprima comprovantes.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleConsultar} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute left-3.5 inset-y-0 flex items-center gap-2 pointer-events-none">
              <Fingerprint size={16} className="text-[var(--brand)]" />
              <span className="text-[10px] tabular-nums font-bold text-[var(--text-subtle)] border-r border-[var(--border)] pr-2">
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
              className="w-full text-sm tabular-nums font-bold pl-20 pr-4 py-3 bg-[var(--surface-2)]/90 border border-[var(--border)]/90 rounded-xl focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] focus:bg-[var(--surface)] outline-hidden transition text-[var(--text)] tracking-wider"
            />
          </div>
          <button
            type="submit"
            className=" bg-[#0B1B2E] hover:brightness-110 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-xs transition cursor-pointer shrink-0 flex items-center justify-center gap-2"
          >
            <span>Rastrear Solicitações</span>
            <ArrowRight size={14} className="text-[#FFE2A8]" />
          </button>
        </form>

        {/* Atalhos Rápidos de CPF em 1 Clique (Chips de Credencial) */}
        <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] tabular-nums uppercase font-semibold text-[var(--text-subtle)] mr-1 flex items-center gap-1">
            <UserCheck size={13} className="text-[var(--brand)]" /> Credenciais Rápidas:
          </span>
          {currentUser && (
            <button
              type="button"
              onClick={() => handleSelecionarPresetCpf(currentUser.cpf)}
              className="text-[11px] font-bold text-[var(--text)] bg-[var(--warning-soft)]/80 hover:bg-[var(--warning-soft)]/80 px-3 py-1.5 rounded-lg border border-[var(--warning-border)]/80 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D98A00]" />
              <span>Meu CPF ({currentUser.nome.split(' ')[0]})</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSelecionarPresetCpf('02145878901')}
            className="text-[11px] font-semibold text-[var(--text)] bg-[var(--surface-2)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)] hover:border-[var(--brand-border)] px-3 py-1.5 rounded-lg border border-[var(--border)]/90 transition cursor-pointer tabular-nums"
          >
            Dra. Maria Helena · 021.458.789-01
          </button>
          <button
            type="button"
            onClick={() => handleSelecionarPresetCpf('14589632144')}
            className="text-[11px] font-semibold text-[var(--text)] bg-[var(--surface-2)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)] hover:border-[var(--brand-border)] px-3 py-1.5 rounded-lg border border-[var(--border)]/90 transition cursor-pointer tabular-nums"
          >
            Carlos Silveira · 145.896.321-44
          </button>
        </div>
      </div>

      {/* Seção 2: Resultados & Cartões de Histórico Chanfrados com Linha do Tempo */}
      {resultado !== null && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
            <span className="flex items-center gap-1.5">
              <span>Dossiê de solicitações localizado para</span>
              <strong className="tabular-nums text-[var(--text)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--border)]/80">
                {cpfInput}
              </strong>
            </span>
            <span className="tabular-nums bg-[#0B1B2E] text-white px-2.5 py-1 rounded-lg text-[11px] font-bold">
              {resultado.length} {resultado.length === 1 ? 'ordem registrada' : 'ordens registradas'}
            </span>
          </div>

          {resultado.length === 0 ? (
            <div className="bg-[var(--surface)] rounded-[18px] p-10 text-center border border-[var(--border)]/80 shadow-2xs text-xs text-[var(--text-subtle)]">
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
                  ? 'bg-[#D98A00]'
                  : isAprovadoOuMais
                  ? 'bg-[#00A859]'
                  : 'bg-[#C8372D]';

              return (
                <div
                  key={ag.id}
                  className="bg-[var(--surface)] p-6 border border-[var(--border)]/90 hover:border-[var(--border-strong)] transition space-y-5 relative overflow-hidden rounded-[18px] pl-7"
                  style={{
                    clipPath:
                      'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))'
                  }}
                >
                  {/* Faixa Lateral de Status */}
                  <div className={`absolute inset-y-0 left-0 w-1.5 ${statusStripe}`} />

                  {/* Cantoneira Chanfrada Superior Direita */}
                  <span className="absolute top-0 right-0 w-4 h-4 bg-[var(--surface-3)]/70 pointer-events-none" />

                  {/* Topo do Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-[var(--text)] text-sm">{ag.nome}</span>
                        <span className="tabular-nums text-[11px] font-bold text-[var(--brand)] bg-[var(--brand-soft)] px-2.5 py-0.5 rounded-md border border-[var(--brand-border)]/80">
                          {ag.ticket}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--text-subtle)] mt-0.5 tabular-nums flex items-center gap-1.5 flex-wrap">
                        <span>Protocolado em {new Date(ag.criadoEm).toLocaleDateString('pt-BR')} · CPF:</span>
                        <MascaraCpfLgpd
                          cpf={ag.cpf}
                          servidorConsultorNome={currentUser?.nome}
                          contexto="Consulta de Protocolos por CPF"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-center">
                      <PlacaMercosul placa={ag.veiculoPlaca} uf="PR" />

                      {ag.status === 'pendente' && (
                        <span className="text-[11px] font-bold bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning-border)]/80 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                          <Clock size={12} /> Aguardando Deliberação
                        </span>
                      )}
                      {ag.status === 'aprovado' && (
                        <span className="text-[11px] font-bold bg-[var(--verde-soft)] text-[var(--verde)] border border-[var(--verde-border)]/80 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                          <CheckCircle2 size={12} /> Autorizado para Viagem
                        </span>
                      )}
                      {ag.status === 'em_andamento' && (
                        <span className="text-[11px] font-bold bg-[#0B1B2E] text-white px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                          <Car size={12} className="text-[var(--brand)]" /> Em Missão Oficial
                        </span>
                      )}
                      {ag.status === 'reprovado' && (
                        <span className="text-[11px] font-bold bg-[var(--danger-soft)] text-[var(--danger)] border border-[var(--danger-border)]/80 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                          <XCircle size={12} /> Não Autorizado
                        </span>
                      )}
                      {ag.status === 'realizado' && (
                        <span className="text-[11px] font-bold bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border-strong)] px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-[var(--verde)]" /> Missão Concluída
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ================================================================= */}
                  {/* LINHA DO TEMPO (TIMELINE) CONECTADA DE STATUS DA SOLICITAÇÃO      */}
                  {/* ================================================================= */}
                  <div className="p-4 bg-[var(--surface-2)]/90 rounded-xl border border-[var(--border)]/80 space-y-3">
                    <div className="flex items-center justify-between text-[10px] tabular-nums uppercase tracking-wider text-[var(--text-subtle)]">
                      <span>Rastreamento de Estágios do Protocolo</span>
                      <span className="font-bold text-[var(--text-muted)]">
                        {ag.status === 'realizado'
                          ? '3/3 CONCLUÍDO'
                          : isAprovadoOuMais
                          ? '2/3 HOMOLOGADO'
                          : '1/3 PROTOCOLADO'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative">
                      {/* Etapa 1: Requisição Emitida */}
                      <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--verde-border)]/90 shadow-2xs flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-[#00703C] text-white text-xs tabular-nums font-bold flex items-center justify-center shrink-0">
                          ✓
                        </span>
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-[var(--text)]">
                            1. Requisição Emitida
                          </div>
                          <div className="text-[10px] tabular-nums text-[var(--verde)] truncate">
                            {ag.ticket} · Validado
                          </div>
                        </div>
                      </div>

                      {/* Etapa 2: Deliberação Chefia ICP-PR */}
                      <div
                        className={`p-3 rounded-xl border flex items-center gap-3 ${
                          isAprovadoOuMais
                            ? 'bg-[var(--surface)] border-[var(--verde-border)]/90 shadow-2xs'
                            : isReprovado
                            ? 'bg-[var(--danger-soft)]/60 border-[var(--danger-border)]/90'
                            : 'bg-[var(--warning-soft)]/60 border-[var(--warning-border)]/80'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg text-xs tabular-nums font-bold flex items-center justify-center shrink-0 ${
                            isAprovadoOuMais
                              ? 'bg-[#00703C] text-white'
                              : isReprovado
                              ? 'bg-[#B42318] text-white'
                              : 'bg-[#D98A00] text-white '
                          }`}
                        >
                          {isAprovadoOuMais ? '✓' : isReprovado ? '✕' : '02'}
                        </span>
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-[var(--text)]">
                            2. Despacho ICP-PR
                          </div>
                          <div className="text-[10px] tabular-nums text-[var(--text-muted)] truncate">
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
                            ? 'bg-[var(--surface)] border-[var(--verde-border)]/90 shadow-2xs'
                            : isAprovadoOuMais
                            ? 'bg-[var(--brand-soft)]/70 border-[var(--brand-border)]/90'
                            : 'bg-[var(--surface-2)]/70 border-[var(--border)]/70 opacity-75'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg text-xs tabular-nums font-bold flex items-center justify-center shrink-0 ${
                            ag.status === 'realizado'
                              ? 'bg-[#00703C] text-white'
                              : isAprovadoOuMais
                              ? 'bg-[#005A9C] text-white'
                              : 'bg-[var(--surface-3)] text-[var(--text-muted)]'
                          }`}
                        >
                          {ag.status === 'realizado' ? '✓' : '03'}
                        </span>
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-[var(--text)]">
                            3. Passe & Vistoria 360°
                          </div>
                          <div className="text-[10px] tabular-nums text-[var(--text-muted)] truncate">
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[var(--text-muted)] bg-[var(--surface-2)]/50 p-3.5 rounded-xl border border-[var(--border)]/60">
                    <div className="space-y-0.5">
                      <span className="text-[10px] tabular-nums uppercase font-semibold text-[var(--text-subtle)] flex items-center gap-1">
                        <Car size={11} className="text-[var(--brand)]" /> Viatura Oficial
                      </span>
                      <div className="font-bold text-[var(--text)]">{ag.veiculoNome}</div>
                      <div className="text-[11px] tabular-nums text-[var(--text-muted)]">Placa {ag.veiculoPlaca}</div>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] tabular-nums uppercase font-semibold text-[var(--text-subtle)] flex items-center gap-1">
                        <Calendar size={11} className="text-[var(--brand)]" /> Cronograma
                      </span>
                      <div className="tabular-nums font-bold text-[var(--text)]">
                        {ag.datas.map(d => d.split('-').reverse().join('/')).join(', ')}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] capitalize">
                        Turno: {ag.periodo.replace('_', ' ')}
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] tabular-nums uppercase font-semibold text-[var(--text-subtle)] flex items-center gap-1">
                        <MapPin size={11} className="text-[var(--brand)]" /> Destino Oficial
                      </span>
                      <div className="text-[var(--text)] font-semibold line-clamp-2">{ag.destino}</div>
                    </div>
                  </div>

                  {/* Carimbo de Auditoria */}
                  {ag.hashAuditoria && (
                    <div className="px-4 py-2.5 bg-[var(--verde-soft)]/70 rounded-xl border border-[var(--verde-border)]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--verde)]">
                      <span className="flex items-center gap-1.5 font-medium">
                        <ShieldCheck size={15} className="text-[var(--verde)] shrink-0" />
                        Homologado via ICP-PR por <strong className="text-[var(--text)]">{ag.aprovadorNome}</strong> ({ag.aprovadorCpf})
                      </span>
                      <span className="tabular-nums text-[10px] font-bold bg-[var(--surface)] text-[var(--verde)] px-2.5 py-0.5 rounded-md border border-[var(--verde-border)]/80 flex items-center gap-1 self-start sm:self-center">
                        <Lock size={10} /> SHA-256: {formatShortHash(ag.hashAuditoria)}
                      </span>
                    </div>
                  )}

                  {ag.status === 'reprovado' && ag.obs && (
                    <div className="p-3 bg-[var(--danger-soft)]/70 rounded-xl border border-[var(--danger-border)]/70 text-xs text-[var(--danger)]">
                      <strong>Justificativa do Indeferimento:</strong> {ag.obs}
                    </div>
                  )}

                  {/* Ações */}
                  <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5 border-t border-[var(--border-subtle)]">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="text-xs font-bold text-[var(--text)] hover:bg-[var(--surface-2)] px-3.5 py-2 rounded-xl border border-[var(--border)]/90 flex items-center gap-1.5 transition cursor-pointer"
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
                        className="text-xs font-bold text-white bg-[#0B1B2E] hover:brightness-110 px-4 py-2 rounded-xl shadow-xs ring-1 ring-[var(--warning)]/40 flex items-center gap-2 transition cursor-pointer"
                      >
                        <Ticket size={14} className="text-[#FFE2A8]" />
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
          className="fixed inset-0 bg-[#0B1B2E]/60 z-50 flex items-center justify-center p-4 animate-in fade-in"
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
                className="w-8 h-8 rounded-lg bg-white/15 hover:bg-[var(--surface)] text-white hover:text-[var(--text)] flex items-center justify-center cursor-pointer transition "
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
