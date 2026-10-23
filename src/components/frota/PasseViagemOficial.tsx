import React, { useState } from 'react';
import { Agendamento, Usuario } from '../../types';
import { PlacaMercosul } from '../ui/PlacaMercosul';
import { formatShortHash } from '../../services/crypto';
import {
  ShieldCheck,
  Check,
  X,
  Printer,
  QrCode,
  ArrowRight,
  Clock,
  Fingerprint,
  Award,
  Lock
} from 'lucide-react';

interface PasseViagemOficialProps {
  agendamento: Agendamento;
  currentUser: Usuario;
  onAprovar?: (hash: string) => void;
  onReprovar?: (motivo: string) => void;
  modoAprovacao?: boolean;
}

export const PasseViagemOficial: React.FC<PasseViagemOficialProps> = ({
  agendamento,
  currentUser: _currentUser,
  onAprovar,
  onReprovar,
  modoAprovacao = false
}) => {
  const [aprovando, setAprovando] = useState(false);
  const [modalReprovar, setModalReprovar] = useState(false);
  const [motivo, setMotivo] = useState('');

  const isAprovado =
    agendamento.status === 'aprovado' ||
    agendamento.status === 'em_andamento' ||
    agendamento.status === 'realizado';

  const handleAprovarClique = () => {
    if (!onAprovar) return;
    setAprovando(true);
    setTimeout(() => {
      onAprovar(agendamento.hashAuditoria || 'SHA256-MOCK-HASH');
      setAprovando(false);
    }, 600);
  };

  const datasFormatadas = agendamento.datas
    .map(d => d.split('-').reverse().join('/'))
    .join(', ');

  const periodoFormatado =
    agendamento.periodo === 'dia_todo'
      ? 'Integral (08h–18h)'
      : agendamento.periodo === 'manha'
      ? 'Manhã (08h–12h)'
      : 'Tarde (13h–18h)';

  const hashExibicao = agendamento.hashAuditoria
    ? formatShortHash(agendamento.hashAuditoria)
    : '9F8A7B6C...4E2D1A0F';

  return (
    <div className="max-w-md mx-auto relative select-none font-sans">
      {/* MOLDURA EXTERNA COM EFEITO DE BORDA DOURADA / AZUL DIPLOMÁTICA */}
      <div className="p-[2px] rounded-[30px] bg-[#D98A00]/90 transition-all duration-300">
        {/* CREDENCIAL DIPLOMÁTICA / APPLE WALLET GOVERNAMENTAL CONTAINER */}
        <div className="bg-[var(--surface)] rounded-[28px] overflow-hidden">
          {/* TOP HEADER — DEEP NAVY & GOLD DIPLOMATIC CROWN */}
          <div className=" bg-[#071324] px-6 pt-5 pb-5 text-white relative overflow-hidden">
            {/* Filete Dourado Diplomático Superior */}
            <div className="absolute inset-x-0 top-0 h-1 bg-[var(--warning-border)]  " />

            {/* Subtle Ambient Glows */}
            <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-[#D98A00]/10 hidden pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-[#0072BB]/10 hidden pointer-events-none" />

            {/* Top Bar: Institution & Status Pill */}
            <div className="flex items-center justify-between gap-2 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#D98A00]/15 border border-[var(--warning-border)]/40 flex items-center justify-center text-[#FFE2A8]">
                  <Award size={11} />
                </div>
                <div>
                  <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-[#FFE2A8]/95 block leading-none">
                    CREDENCIAL OFICIAL DE TRÁFEGO
                  </span>
                  <span className="text-[9px] tabular-nums text-[#DCEEFB]/80">
                    GOVERNO DO PARANÁ · SEJU
                  </span>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                  isAprovado
                    ? 'bg-[#00A859]/15 text-[#C6E86B] border-[var(--verde)]/35'
                    : 'bg-[#D98A00]/15 text-[#FFE2A8] border-[var(--warning)]/35'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isAprovado ? 'bg-[#00A859] ' : 'bg-[#D98A00] '
                  }`}
                />
                {isAprovado ? 'Passe Homologado' : 'Pendente'}
              </span>
            </div>

            {/* Boarding Pass Route Header */}
            <div className="mt-5 flex items-center justify-between gap-4 relative z-10">
              <div>
                <span className="text-[9px] tabular-nums uppercase tracking-widest text-[#DCEEFB]/70 block">
                  ORIGEM OFICIAL
                </span>
                <div className="text-2xl font-black tracking-tight text-white mt-0.5">
                  CWB
                </div>
                <span className="text-[11px] text-[#DCEEFB]/85 font-medium">
                  Sede SEJU · Curitiba
                </span>
              </div>

              {/* Flight/Route Path Vector com Acento Dourado */}
              <div className="flex-1 flex flex-col items-center justify-center px-2">
                <div className="w-full flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[var(--warning-border)] ring-2 ring-[var(--warning-border)]/20" />
                  <div className="flex-1 border-t border-dashed border-[var(--warning-border)]/50" />
                  <div className="w-6 h-6 rounded-full bg-[#D98A00]/15 border border-[var(--warning-border)]/40 flex items-center justify-center text-[#FFE2A8] shadow-2xs">
                    <ArrowRight size={12} />
                  </div>
                  <div className="flex-1 border-t border-dashed border-[var(--brand-border)]/50" />
                  <div className="w-2 h-2 rounded-full bg-[var(--brand-border)] ring-2 ring-[var(--brand-border)]/20" />
                </div>
                <span className="text-[9.5px] tabular-nums font-bold uppercase tracking-widest text-[#FFE2A8] mt-1.5 bg-[#0B1B2E]/40 px-2 py-0.5 rounded border border-white/10">
                  {agendamento.ticket}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[9px] tabular-nums uppercase tracking-widest text-[#DCEEFB]/70 block">
                  DESTINO / MISSÃO
                </span>
                <div className="text-2xl font-black tracking-tight text-white mt-0.5">
                  PR
                </div>
                <span className="text-[11px] text-[#FFE2A8]/90 font-semibold truncate max-w-[115px] block">
                  {agendamento.modalidade === 'com_motorista' ? 'Escolta Oficial' : 'Condutor Oficial'}
                </span>
              </div>
            </div>
          </div>

          {/* VEHICLE BAR — FAIXA TÉCNICA COM BORDA DOURADA SUTIL */}
          <div className="px-6 py-3.5 bg-[var(--surface-2)] border-b border-[var(--border)]/80 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="text-[9.5px] tabular-nums font-bold uppercase tracking-wider text-[var(--brand)] block">
                VIATURA OFICIAL DESIGNADA
              </span>
              <div className="font-extrabold text-sm text-[var(--text)] truncate mt-0.5">
                {agendamento.veiculoNome}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">
                Patrimônio SEJU · {agendamento.modalidade === 'com_motorista' ? 'Com Motorista' : 'Condução Própria'}
              </div>
            </div>

            <div className="shrink-0">
              <PlacaMercosul placa={agendamento.veiculoPlaca} uf="PR" />
            </div>
          </div>

          {/* MAIN PASS METADATA BODY */}
          <div className="px-6 py-4 space-y-3.5 bg-[var(--surface)]">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)] block">
                  Servidor Credenciado
                </span>
                <div className="font-bold text-[var(--text)] text-sm mt-0.5 truncate">
                  {agendamento.nome}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] tabular-nums mt-0.5">
                  CPF {agendamento.cpf}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)] block">
                  Data & Janela
                </span>
                <div className="font-bold text-[var(--text)] text-sm mt-0.5 truncate tabular-nums">
                  {datasFormatadas}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 flex items-center gap-1">
                  <Clock size={11} className="text-[var(--brand)]" />
                  <span>{periodoFormatado}</span>
                </div>
              </div>
            </div>

            {/* Destination & Purpose */}
            <div className="pt-3 border-t border-[var(--border-subtle)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)] block">
                Itinerário & Finalidade Diplomática/Institucional
              </span>
              <p className="text-xs text-[var(--text)] font-medium mt-1 leading-relaxed line-clamp-2">
                {agendamento.destino}
              </p>
            </div>
          </div>

          {/* ================================================================= */}
          {/* RECORTE DE TICKET DE EMBARQUE & SERRILHADO DE SEGURANÇA           */}
          {/* ================================================================= */}
          <div className="relative flex items-center justify-between bg-[var(--surface)] py-2">
            {/* Notch Esquerdo */}
            <div className="w-6 h-6 rounded-full bg-[var(--surface-2)] border-2 border-[var(--warning)]/50 -ml-3.5 shrink-0 z-10" />

            {/* Linha Serrilhada Dupla + Microtexto */}
            <div className="w-full flex flex-col items-center px-2">
              <div className="w-full border-t-2 border-dashed border-[var(--border-strong)]" />
              <span className="text-[8px] tabular-nums tracking-[0.22em] uppercase text-[var(--text-subtle)] bg-[var(--surface)] px-2 -mt-2">
                ICP-PR · TICKET SECURITY TEAR-OFF
              </span>
            </div>

            {/* Notch Direito */}
            <div className="w-6 h-6 rounded-full bg-[var(--surface-2)] border-2 border-[var(--warning)]/50 -mr-3.5 shrink-0 z-10" />
          </div>

          {/* ================================================================= */}
          {/* HASH CRIPTOGRÁFICO ESTILIZADO & QR CODE EMOLDURADO                */}
          {/* ================================================================= */}
          <div className="px-6 py-4 bg-[var(--surface)] flex items-center justify-between gap-4">
            <div className="space-y-2 min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--text)]">
                <ShieldCheck
                  size={15}
                  className={isAprovado ? 'text-[var(--verde)]' : 'text-[var(--warning)]'}
                />
                <span>
                  {isAprovado ? 'Chancela Criptográfica ICP-PR' : 'Aguardando Homologação'}
                </span>
              </div>

              {/* Bloco de Hash Criptográfico Estilizado */}
              <div className="p-2.5 rounded-xl bg-[#0B1B2E] text-white border border-[#22324C] shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-[9px] tabular-nums text-[#FFE2A8]">
                  <span className="flex items-center gap-1 font-bold">
                    <Fingerprint size={11} className="text-[var(--brand)]" /> HASH SHA-256
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-[#00A859]/20 text-[#C6E86B] border border-[var(--verde)]/30 text-[8px]">
                    {isAprovado ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>
                <div className="text-[10px] tabular-nums text-[var(--ink-muted)] truncate flex items-center gap-1.5 select-all">
                  <Lock size={10} className="text-[var(--warning)] shrink-0" />
                  <span className="truncate tracking-wider">{hashExibicao}</span>
                </div>
              </div>
            </div>

            {/* QR Code Emoldurado com Cantoneiras L Douradas/Azuis */}
            <div className="relative p-2.5 bg-[#0B1B2E] rounded-[18px] border border-[var(--warning)]/50 shadow-sm shrink-0">
              {/* 4 Cantoneiras L de Leitura Óptica */}    

              <div className="w-14 h-14 bg-[var(--surface)] rounded-xl flex items-center justify-center shadow-2xs border border-[var(--border)]">
                <QrCode size={40} className="text-[var(--text)]" strokeWidth={1.75} />
              </div>
              <span className="block text-center text-[7.5px] tabular-nums font-bold tracking-widest uppercase text-[#FFE2A8] mt-1">
                SCAN · PR
              </span>
            </div>
          </div>

          {/* FOOTER ACTION BAR */}
          <div className="px-6 py-3.5 bg-[var(--surface-2)]/80 border-t border-[var(--border)]/80 flex items-center justify-between gap-2">
            {modoAprovacao && !isAprovado ? (
              <div className="flex items-center gap-2.5 w-full">
                <button
                  type="button"
                  onClick={() => setModalReprovar(true)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[var(--surface)] hover:bg-[var(--danger-soft)] border border-[var(--border)] hover:border-[var(--danger-border)] text-[var(--danger)] text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <X size={14} /> Reprovar
                </button>

                <button
                  type="button"
                  onClick={handleAprovarClique}
                  disabled={aprovando}
                  className="flex-2 py-2.5 px-4 rounded-xl bg-[#0B1B2E] hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm ring-1 ring-[var(--warning)]/40 transition cursor-pointer"
                >
                  <Check size={15} className="text-[#FFE2A8]" />
                  {aprovando ? 'Autenticando...' : 'Homologar Credencial'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full text-xs">
                <span className="text-[11px] text-[var(--text-muted)] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00A859] " />
                  Passe Diplomático · Portaria SEJU
                </span>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="text-[var(--text)] hover:text-[var(--text)] bg-[var(--surface)] hover:bg-[var(--warning-soft)]/60 border border-[var(--border-strong)]/90 px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 text-xs transition cursor-pointer shadow-2xs"
                >
                  <Printer size={13} /> Imprimir Passe
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Justificativa Reprovar */}
      {modalReprovar && (
        <div className="fixed inset-0 bg-[#0B1B2E]/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-[18px] max-w-sm w-full p-5 text-[var(--text)] border border-[var(--border)] animate-in zoom-in-95">
            <h4 className="font-bold text-sm text-[var(--text)] mb-1">Reprovar Solicitação</h4>
            <p className="text-xs text-[var(--text-muted)] mb-3">Informe o motivo da não autorização:</p>
            <textarea
              rows={3}
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Ex: Veículo em revisão preventiva..."
              className="w-full text-xs p-2.5 border border-[var(--border)] rounded-xl mb-4 focus:ring-2 focus:ring-[var(--danger)]/20 focus:border-[var(--danger)] outline-hidden"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setModalReprovar(false)}
                className="px-3 py-2 text-[var(--text-muted)] hover:bg-[var(--surface-2)] rounded-lg font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onReprovar) onReprovar(motivo);
                  setModalReprovar(false);
                }}
                className="px-4 py-2 bg-[#B42318] hover:bg-[#9B1C12] text-white font-bold rounded-lg cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
