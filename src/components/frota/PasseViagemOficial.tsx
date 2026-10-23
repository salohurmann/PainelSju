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
      <div className="p-[2px] rounded-[30px] bg-linear-to-br from-amber-400/90 via-[#005A9C] to-[#0A192F] shadow-[0_24px_50px_-12px_rgba(15,23,42,0.22)] transition-all duration-300">
        {/* CREDENCIAL DIPLOMÁTICA / APPLE WALLET GOVERNAMENTAL CONTAINER */}
        <div className="bg-white rounded-[28px] overflow-hidden">
          {/* TOP HEADER — DEEP NAVY & GOLD DIPLOMATIC CROWN */}
          <div className="bg-linear-to-br from-[#071324] via-[#0D253F] to-[#004B87] px-6 pt-5 pb-5 text-white relative overflow-hidden">
            {/* Filete Dourado Diplomático Superior */}
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-amber-300 via-amber-500 to-sky-400" />

            {/* Subtle Ambient Glows */}
            <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-sky-400/10 blur-2xl pointer-events-none" />

            {/* Top Bar: Institution & Status Pill */}
            <div className="flex items-center justify-between gap-2 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-amber-400/15 border border-amber-300/40 flex items-center justify-center text-amber-300">
                  <Award size={11} />
                </div>
                <div>
                  <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-amber-300/95 block leading-none">
                    CREDENCIAL OFICIAL DE TRÁFEGO
                  </span>
                  <span className="text-[9px] font-mono text-sky-200/80">
                    GOVERNO DO PARANÁ · SEJU
                  </span>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                  isAprovado
                    ? 'bg-emerald-400/15 text-emerald-300 border-emerald-400/35'
                    : 'bg-amber-400/15 text-amber-200 border-amber-400/35'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isAprovado ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-amber-400 animate-pulse'
                  }`}
                />
                {isAprovado ? 'Passe Homologado' : 'Pendente'}
              </span>
            </div>

            {/* Boarding Pass Route Header */}
            <div className="mt-5 flex items-center justify-between gap-4 relative z-10">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-sky-200/70 block">
                  ORIGEM OFICIAL
                </span>
                <div className="text-2xl font-black tracking-tight text-white mt-0.5">
                  CWB
                </div>
                <span className="text-[11px] text-sky-100/85 font-medium">
                  Sede SEJU · Curitiba
                </span>
              </div>

              {/* Flight/Route Path Vector com Acento Dourado */}
              <div className="flex-1 flex flex-col items-center justify-center px-2">
                <div className="w-full flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-300 ring-2 ring-amber-300/20" />
                  <div className="flex-1 border-t border-dashed border-amber-300/50" />
                  <div className="w-6 h-6 rounded-full bg-amber-400/15 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-2xs">
                    <ArrowRight size={12} />
                  </div>
                  <div className="flex-1 border-t border-dashed border-sky-300/50" />
                  <div className="w-2 h-2 rounded-full bg-sky-300 ring-2 ring-sky-300/20" />
                </div>
                <span className="text-[9.5px] font-mono font-bold uppercase tracking-widest text-amber-200 mt-1.5 bg-slate-950/40 px-2 py-0.5 rounded border border-white/10">
                  {agendamento.ticket}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[9px] font-mono uppercase tracking-widest text-sky-200/70 block">
                  DESTINO / MISSÃO
                </span>
                <div className="text-2xl font-black tracking-tight text-white mt-0.5">
                  PR
                </div>
                <span className="text-[11px] text-amber-200/90 font-semibold truncate max-w-[115px] block">
                  {agendamento.modalidade === 'com_motorista' ? 'Escolta Oficial' : 'Condutor Oficial'}
                </span>
              </div>
            </div>
          </div>

          {/* VEHICLE BAR — FAIXA TÉCNICA COM BORDA DOURADA SUTIL */}
          <div className="px-6 py-3.5 bg-linear-to-r from-slate-50 via-amber-50/30 to-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-[#005A9C] block">
                VIATURA OFICIAL DESIGNADA
              </span>
              <div className="font-extrabold text-sm text-slate-900 truncate mt-0.5">
                {agendamento.veiculoNome}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                Patrimônio SEJU · {agendamento.modalidade === 'com_motorista' ? 'Com Motorista' : 'Condução Própria'}
              </div>
            </div>

            <div className="shrink-0">
              <PlacaMercosul placa={agendamento.veiculoPlaca} uf="PR" />
            </div>
          </div>

          {/* MAIN PASS METADATA BODY */}
          <div className="px-6 py-4 space-y-3.5 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Servidor Credenciado
                </span>
                <div className="font-bold text-slate-900 text-sm mt-0.5 truncate">
                  {agendamento.nome}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  CPF {agendamento.cpf}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Data & Janela
                </span>
                <div className="font-bold text-slate-900 text-sm mt-0.5 truncate font-mono">
                  {datasFormatadas}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                  <Clock size={11} className="text-[#005A9C]" />
                  <span>{periodoFormatado}</span>
                </div>
              </div>
            </div>

            {/* Destination & Purpose */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Itinerário & Finalidade Diplomática/Institucional
              </span>
              <p className="text-xs text-slate-800 font-medium mt-1 leading-relaxed line-clamp-2">
                {agendamento.destino}
              </p>
            </div>
          </div>

          {/* ================================================================= */}
          {/* RECORTE DE TICKET DE EMBARQUE & SERRILHADO DE SEGURANÇA           */}
          {/* ================================================================= */}
          <div className="relative flex items-center justify-between bg-white py-2">
            {/* Notch Esquerdo */}
            <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-amber-400/50 -ml-3.5 shadow-inner shrink-0 z-10" />

            {/* Linha Serrilhada Dupla + Microtexto */}
            <div className="w-full flex flex-col items-center px-2">
              <div className="w-full border-t-2 border-dashed border-slate-300" />
              <span className="text-[8px] font-mono tracking-[0.22em] uppercase text-slate-400 bg-white px-2 -mt-2">
                ICP-PR · TICKET SECURITY TEAR-OFF
              </span>
            </div>

            {/* Notch Direito */}
            <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-amber-400/50 -mr-3.5 shadow-inner shrink-0 z-10" />
          </div>

          {/* ================================================================= */}
          {/* HASH CRIPTOGRÁFICO ESTILIZADO & QR CODE EMOLDURADO                */}
          {/* ================================================================= */}
          <div className="px-6 py-4 bg-linear-to-b from-white to-slate-50/90 flex items-center justify-between gap-4">
            <div className="space-y-2 min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-900">
                <ShieldCheck
                  size={15}
                  className={isAprovado ? 'text-emerald-600' : 'text-amber-500'}
                />
                <span>
                  {isAprovado ? 'Chancela Criptográfica ICP-PR' : 'Aguardando Homologação'}
                </span>
              </div>

              {/* Bloco de Hash Criptográfico Estilizado */}
              <div className="p-2.5 rounded-xl bg-slate-950 text-white border border-slate-800 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono text-amber-300">
                  <span className="flex items-center gap-1 font-bold">
                    <Fingerprint size={11} className="text-sky-400" /> HASH SHA-256
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[8px]">
                    {isAprovado ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-300 truncate flex items-center gap-1.5 select-all">
                  <Lock size={10} className="text-amber-400 shrink-0" />
                  <span className="truncate tracking-wider">{hashExibicao}</span>
                </div>
              </div>
            </div>

            {/* QR Code Emoldurado com Cantoneiras L Douradas/Azuis */}
            <div className="relative p-2.5 bg-slate-950 rounded-2xl border border-amber-400/50 shadow-sm shrink-0">
              {/* 4 Cantoneiras L de Leitura Óptica */}
              <span className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-amber-400 rounded-tl-[2px] pointer-events-none" />
              <span className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-amber-400 rounded-tr-[2px] pointer-events-none" />
              <span className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-sky-400 rounded-bl-[2px] pointer-events-none" />
              <span className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-sky-400 rounded-br-[2px] pointer-events-none" />

              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-2xs border border-slate-200">
                <QrCode size={40} className="text-slate-950" strokeWidth={1.75} />
              </div>
              <span className="block text-center text-[7.5px] font-mono font-bold tracking-widest uppercase text-amber-300 mt-1">
                SCAN · PR
              </span>
            </div>
          </div>

          {/* FOOTER ACTION BAR */}
          <div className="px-6 py-3.5 bg-slate-100/80 border-t border-slate-200/80 flex items-center justify-between gap-2">
            {modoAprovacao && !isAprovado ? (
              <div className="flex items-center gap-2.5 w-full">
                <button
                  type="button"
                  onClick={() => setModalReprovar(true)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-red-600 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <X size={14} /> Reprovar
                </button>

                <button
                  type="button"
                  onClick={handleAprovarClique}
                  disabled={aprovando}
                  className="flex-2 py-2.5 px-4 rounded-xl bg-linear-to-r from-[#0A192F] to-[#004B87] hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm ring-1 ring-amber-400/40 transition cursor-pointer"
                >
                  <Check size={15} className="text-amber-300" />
                  {aprovando ? 'Autenticando...' : 'Homologar Credencial'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full text-xs">
                <span className="text-[11px] text-slate-600 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                  Passe Diplomático · Portaria SEJU
                </span>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="text-slate-800 hover:text-slate-950 bg-white hover:bg-amber-50/60 border border-slate-300/90 px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 text-xs transition cursor-pointer shadow-2xs"
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
        <div className="fixed inset-0 bg-slate-950/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 text-slate-800 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <h4 className="font-bold text-sm text-slate-900 mb-1">Reprovar Solicitação</h4>
            <p className="text-xs text-slate-500 mb-3">Informe o motivo da não autorização:</p>
            <textarea
              rows={3}
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Ex: Veículo em revisão preventiva..."
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl mb-4 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-hidden"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setModalReprovar(false)}
                className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onReprovar) onReprovar(motivo);
                  setModalReprovar(false);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer"
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
