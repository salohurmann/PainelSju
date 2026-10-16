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
  Fingerprint
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

  return (
    <div className="max-w-md mx-auto relative select-none font-sans">
      {/* APPLE WALLET / EXECUTIVE BOARDING PASS CONTAINER */}
      <div className="bg-white rounded-[28px] shadow-[0_24px_48px_-12px_rgba(15,23,42,0.14),0_0_0_1px_rgba(15,23,42,0.06)] overflow-hidden transition-all duration-300">
        
        {/* TOP HEADER — DEEP NAVY WALLET PASS CROWN */}
        <div className="bg-linear-to-br from-[#0A192F] via-[#0F2942] to-[#004B87] px-6 pt-6 pb-5 text-white relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-sky-400/10 blur-2xl pointer-events-none" />

          {/* Top Bar: Institution & Status Pill */}
          <div className="flex items-center justify-between gap-2 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
              <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-sky-200/90">
                GOVERNO DO PARANÁ · SEJU
              </span>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border backdrop-blur-md ${
                isAprovado
                  ? 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30'
                  : 'bg-amber-400/15 text-amber-200 border-amber-400/30'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isAprovado ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                }`}
              />
              {isAprovado ? 'Autorizado' : 'Pendente'}
            </span>
          </div>

          {/* Boarding Pass Route Header */}
          <div className="mt-5 flex items-center justify-between gap-4 relative z-10">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-widest text-sky-200/70 block">
                Origem Oficial
              </span>
              <div className="text-2xl font-black tracking-tight text-white mt-0.5">
                CWB
              </div>
              <span className="text-[11px] text-sky-100/80 font-medium">
                Sede SEJU · Curitiba
              </span>
            </div>

            {/* Flight/Route Path Vector */}
            <div className="flex-1 flex flex-col items-center justify-center px-2">
              <div className="w-full flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-300/60" />
                <div className="flex-1 border-t border-dashed border-sky-300/40" />
                <div className="w-6 h-6 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-sky-300">
                  <ArrowRight size={12} />
                </div>
                <div className="flex-1 border-t border-dashed border-sky-300/40" />
                <div className="w-1.5 h-1.5 rounded-full bg-sky-300" />
              </div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-sky-200/75 mt-1">
                {agendamento.ticket}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-medium uppercase tracking-widest text-sky-200/70 block">
                Missão / Destino
              </span>
              <div className="text-2xl font-black tracking-tight text-white mt-0.5">
                PR
              </div>
              <span className="text-[11px] text-sky-100/80 font-medium truncate max-w-[110px] block">
                {agendamento.modalidade === 'com_motorista' ? 'Com Motorista' : 'Condutor Oficial'}
              </span>
            </div>
          </div>
        </div>

        {/* VEHICLE BAR — SLEEK SLATE SUB-BAND */}
        <div className="px-6 py-4 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Veículo Designado
            </span>
            <div className="font-extrabold text-sm text-slate-900 truncate mt-0.5">
              {agendamento.veiculoNome}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              Frota Oficial · {agendamento.modalidade === 'com_motorista' ? 'Com Motorista' : 'Sem Motorista'}
            </div>
          </div>

          <div className="shrink-0">
            <PlacaMercosul placa={agendamento.veiculoPlaca} uf="PR" />
          </div>
        </div>

        {/* MAIN PASS METADATA BODY */}
        <div className="px-6 py-5 space-y-4 bg-white">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Servidor Responsável
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
                Data & Turno
              </span>
              <div className="font-bold text-slate-900 text-sm mt-0.5 truncate">
                {datasFormatadas}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                <Clock size={11} className="text-slate-400" />
                <span>{periodoFormatado}</span>
              </div>
            </div>
          </div>

          {/* Destination & Purpose */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Itinerário & Finalidade Oficial
            </span>
            <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed line-clamp-2">
              {agendamento.destino}
            </p>
          </div>
        </div>

        {/* PERFORATED TEAR-OFF DIVIDER (Apple Wallet / Boarding Pass Notch) */}
        <div className="relative flex items-center justify-between bg-white py-1">
          <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200/70 -ml-2.5 shadow-inner shrink-0" />
          <div className="w-full border-t-2 border-dashed border-slate-200 mx-2" />
          <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200/70 -mr-2.5 shadow-inner shrink-0" />
        </div>

        {/* CRYPTOGRAPHIC VERIFICATION & SLEEK QR CODE STUB */}
        <div className="px-6 py-4 bg-white flex items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
              <ShieldCheck
                size={15}
                className={isAprovado ? 'text-emerald-600' : 'text-amber-500'}
              />
              <span>
                {isAprovado ? 'Assinatura Digital Homologada' : 'Aguardando Homologação'}
              </span>
            </div>

            <div
              className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/70 truncate max-w-[220px] select-none"
            >
              <Fingerprint size={12} className="text-slate-400 shrink-0" />
              <span className="truncate">
                Cofre · ••••••••••••••••
              </span>
            </div>
          </div>

          {/* Framed QR Code Box with Precision Corner Accents */}
          <div className="relative p-2 bg-slate-50 rounded-2xl border border-slate-200/90 shrink-0 group">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-2xs border border-slate-100">
              <QrCode size={36} className="text-slate-900" strokeWidth={1.75} />
            </div>
          </div>
        </div>

        {/* FOOTER ACTION BAR */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200/70 flex items-center justify-between gap-2">
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
                className="flex-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-[#004B87] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Check size={15} />
                {aprovando ? 'Autenticando...' : 'Homologar Passe'}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full text-xs">
              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Passe Digital Verificado · Portaria SEJU
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-100 border border-slate-200/90 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 text-xs transition cursor-pointer shadow-2xs"
              >
                <Printer size={13} /> Imprimir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Justificativa Reprovar */}
      {modalReprovar && (
        <div className="fixed inset-0 bg-slate-950/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
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
