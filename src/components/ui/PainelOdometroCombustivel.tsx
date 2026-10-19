import React from 'react';
import { Fuel, Gauge, Activity, Zap, ShieldCheck } from 'lucide-react';

interface PainelOdometroCombustivelProps {
  kmAtual: number;
  nivelCombustivel: number; // 0 a 100
  onChangeKm?: (novoKm: number) => void;
  onChangeCombustivel?: (novoNivel: number) => void;
  interativo?: boolean;
}

export const PainelOdometroCombustivel: React.FC<PainelOdometroCombustivelProps> = ({
  kmAtual,
  nivelCombustivel,
  onChangeKm,
  onChangeCombustivel,
  interativo = false
}) => {
  // Formata o odômetro em 6 dígitos (ex: 034210)
  const kmNormalizado = Math.max(0, Math.floor(kmAtual));
  const kmStr = String(kmNormalizado).padStart(6, '0');
  const digitos = kmStr.split('');

  const nivelClamp = Math.min(100, Math.max(0, nivelCombustivel));
  const isReserva = nivelClamp <= 15;
  const isAtencao = nivelClamp > 15 && nivelClamp <= 35;

  const statusColor = isReserva
    ? '#EF4444'
    : isAtencao
    ? '#F59E0B'
    : '#10B981';

  // Autonomia estimada (tanque 55L * 10.8km/L = ~594km máx)
  const autonomiaEstimada = Math.round((nivelClamp / 100) * 580);
  const litrosEstimados = ((nivelClamp / 100) * 55).toFixed(1);

  // 20 segmentos luminosos para a barra de combustível estilo Porsche/Volvo Cockpit
  const totalSegmentos = 20;
  const segmentosAtivos = Math.round((nivelClamp / 100) * totalSegmentos);

  return (
    <div className="bg-[#070A10] text-white rounded-3xl p-6 border border-slate-800/90 shadow-[0_24px_48px_-12px_rgba(2,6,23,0.75),inset_0_1px_0_rgba(255,255,255,0.08)] relative overflow-hidden font-sans select-none">
      {/* Textura Micro-Carbono & Iluminação Ambiental de Cockpit */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
          backgroundSize: '12px 12px'
        }}
      />
      {/* Top Instrument Header — Barra de Telemetria */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3.5 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </span>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-300 font-bold">
            SEJU COCKPIT · PRECISION TELEMETRY
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono text-slate-400 bg-slate-900/90 border border-slate-800/90 px-2.5 py-1 rounded-md">
            <span className="flex items-center gap-1 text-sky-400">
              <Zap size={10} /> 14.2V
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Activity size={10} /> OBD-II OK
            </span>
          </div>
          <span className="text-[10px] font-mono font-semibold text-sky-300 bg-sky-950/60 border border-sky-500/30 px-2.5 py-1 rounded-md tracking-wider">
            CAN-BUS SYNC
          </span>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        {/* LEFT MODULE: PORSCHE/VOLVO DIGITAL ODOMETER */}
        <div className="relative bg-linear-to-b from-slate-900/80 to-[#0B0F19]/90 rounded-2xl p-4.5 border border-slate-800/90 flex flex-col justify-between space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          {/* Detalhe de chanfro luminoso no topo do card */}
          <div className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-sky-400/25 to-transparent" />

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 tracking-wide flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400">
                <Gauge size={13} />
              </span>
              Odômetro Totalizador
            </span>
            <span className="text-[9px] font-mono uppercase tracking-[0.16em] text-slate-400 bg-slate-950/80 border border-slate-800 px-2 py-0.5 rounded-md">
              HODÔMETRO OFICIAL
            </span>
          </div>

          {/* Segmented Drum / Digital Cluster Display */}
          <div className="relative py-3.5 px-3 bg-[#04060B] rounded-xl border border-slate-800 shadow-[inset_0_4px_12px_rgba(0,0,0,0.85)] flex flex-col items-center justify-center gap-2">
            <div className="flex items-baseline justify-center gap-1.5">
              <div className="flex items-center gap-1">
                {digitos.map((d, index) => {
                  const isLeadingZero = index < digitos.length - 1 && Number(kmStr.slice(0, index + 1)) === 0;
                  const isLastDigit = index === digitos.length - 1;
                  return (
                    <div
                      key={index}
                      className={`w-8 h-11 sm:w-9 sm:h-12 rounded-lg flex items-center justify-center font-mono font-black text-xl sm:text-2xl relative overflow-hidden border transition-all ${
                        isLastDigit
                          ? 'bg-linear-to-b from-sky-950/80 via-[#091326] to-sky-950/80 border-sky-500/40 shadow-[0_0_12px_rgba(56,189,248,0.12)]'
                          : 'bg-linear-to-b from-slate-900/95 via-[#080C14] to-slate-900/95 border-slate-800/90'
                      }`}
                    >
                      {/* Sombra superior/inferior de tambor cilíndrico */}
                      <div className="absolute inset-x-0 top-0 h-2 bg-linear-to-b from-black/70 to-transparent pointer-events-none" />
                      <div className="absolute inset-x-0 bottom-0 h-2 bg-linear-to-t from-black/70 to-transparent pointer-events-none" />
                      <div className="absolute inset-x-0 top-1/2 h-px bg-black/60 pointer-events-none" />

                      {/* Dígito Fantasma 8 de Fundo Estilo LCD Matrix */}
                      <span className="absolute inset-0 flex items-center justify-center text-slate-800/25 select-none pointer-events-none">
                        8
                      </span>

                      {/* Dígito Ativo */}
                      <span
                        className={`relative z-10 tracking-tight ${
                          isLeadingZero
                            ? 'text-slate-700/80'
                            : isLastDigit
                            ? 'text-sky-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.45)]'
                            : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                        }`}
                      >
                        {d}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="ml-1.5 flex flex-col items-start">
                <span className="font-mono text-[10px] font-bold text-sky-400 uppercase tracking-widest leading-none">
                  KM
                </span>
                <span className="font-mono text-[8px] text-slate-600 uppercase tracking-tighter mt-0.5">
                  TOTAL
                </span>
              </div>
            </div>

            {/* Sub-display Trip A & Média Horária */}
            <div className="w-full flex items-center justify-between px-2 pt-2 border-t border-slate-900 text-[10px] font-mono text-slate-400">
              <span>
                TRIP A: <strong className="text-slate-200">{(kmNormalizado % 420).toFixed(1)} km</strong>
              </span>
              <span>
                CONS. MÉD: <strong className="text-emerald-400">11.4 km/L</strong>
              </span>
            </div>
          </div>

          {interativo && onChangeKm ? (
            <div className="pt-1 flex items-center justify-between gap-2 bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
              <label className="text-[11px] text-slate-300 font-medium shrink-0 pl-1">
                Calibrar KM:
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onChangeKm(Math.max(0, kmAtual - 50))}
                  className="px-2 py-1 text-[10px] font-mono font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-md border border-slate-700 cursor-pointer transition"
                >
                  -50
                </button>
                <input
                  type="number"
                  value={kmAtual}
                  onChange={e => onChangeKm(Number(e.target.value))}
                  className="w-24 text-right text-xs font-mono font-bold px-2.5 py-1 bg-[#05080F] border border-slate-700 rounded-md text-sky-300 outline-hidden focus:border-sky-400 transition"
                />
                <button
                  type="button"
                  onClick={() => onChangeKm(kmAtual + 50)}
                  className="px-2 py-1 text-[10px] font-mono font-bold bg-slate-900 hover:bg-slate-800 text-sky-300 rounded-md border border-slate-700 cursor-pointer transition"
                >
                  +50
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800/60">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-sky-400" /> PRECISÃO ±1 KM
              </span>
              <span className="text-emerald-400 font-semibold">LACRADO DETRAN/PR</span>
            </div>
          )}
        </div>

        {/* RIGHT MODULE: PORSCHE / VOLVO SEGMENTED FUEL TELEMETRY */}
        <div className="relative bg-linear-to-b from-slate-900/80 to-[#0B0F19]/90 rounded-2xl p-4.5 border border-slate-800/90 flex flex-col justify-between space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          {/* Detalhe de chanfro luminoso no topo do card */}
          <div
            className="absolute inset-x-8 top-0 h-px transition-colors duration-500"
            style={{
              backgroundImage: `linear-gradient(to right, transparent, ${statusColor}55, transparent)`
            }}
          />

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-200 tracking-wide flex items-center gap-2">
              <span
                className="w-6 h-6 rounded-lg flex items-center justify-center border"
                style={{
                  backgroundColor: `${statusColor}15`,
                  borderColor: `${statusColor}40`,
                  color: statusColor
                }}
              >
                <Fuel size={13} />
              </span>
              Nível de Combustível
            </span>

            <span
              className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                isReserva
                  ? 'bg-red-500/15 text-red-400 border-red-500/35 animate-pulse'
                  : isAtencao
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/35'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
              }`}
            >
              {isReserva ? '⚠ RESERVA CRÍTICA' : `AUTONOMIA ~${autonomiaEstimada} KM`}
            </span>
          </div>

          {/* Center Readout + Precision Segmented Bar + Arc */}
          <div className="bg-[#04060B] rounded-xl p-3.5 border border-slate-800 shadow-[inset_0_4px_12px_rgba(0,0,0,0.85)] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-slate-500 block">
                  VOLUME NO TANQUE (55L)
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <div className="text-2xl font-mono font-black tracking-tight text-white flex items-baseline gap-0.5">
                    {nivelClamp}
                    <span className="text-xs font-bold text-sky-400">%</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 border-l border-slate-800 pl-2">
                    ~{litrosEstimados} L
                  </span>
                </div>
              </div>

              {/* Arco Automotivo de Precisão com Ticks */}
              <svg viewBox="0 0 108 50" className="w-28 h-12 overflow-visible shrink-0">
                {/* Trilha de fundo */}
                <path
                  d="M 12 42 A 40 40 0 0 1 96 42"
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                {/* Trilha iluminada */}
                <path
                  d="M 12 42 A 40 40 0 0 1 96 42"
                  fill="none"
                  stroke={statusColor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="125.66"
                  strokeDashoffset={125.66 - 125.66 * (nivelClamp / 100)}
                  className="transition-all duration-500 ease-out"
                  style={{ filter: `drop-shadow(0 0 6px ${statusColor}80)` }}
                />
                {/* Labels E, 1/2, F */}
                <text x="8" y="49" fill="#EF4444" fontSize="7.5" fontWeight="bold" className="font-mono">
                  R
                </text>
                <text x="48" y="11" fill="#94A3B8" fontSize="6.5" fontWeight="bold" className="font-mono">
                  1/2
                </text>
                <text x="94" y="49" fill="#10B981" fontSize="7.5" fontWeight="bold" className="font-mono">
                  F
                </text>
              </svg>
            </div>

            {/* Barra de Segmentos Luminosos Individuais (20 LEDs de Precisão) */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 p-1.5 bg-slate-950 rounded-lg border border-slate-800/90">
                {Array.from({ length: totalSegmentos }).map((_, idx) => {
                  const ativo = idx < segmentosAtivos;
                  const segReserva = idx < 3;
                  const segAtencao = idx >= 3 && idx < 7;
                  const corSeg = segReserva
                    ? '#EF4444'
                    : segAtencao
                    ? '#F59E0B'
                    : '#10B981';

                  return (
                    <div
                      key={idx}
                      className="flex-1 h-2.5 rounded-[2px] transition-all duration-300"
                      style={{
                        backgroundColor: ativo ? corSeg : '#1E293B',
                        opacity: ativo ? 1 : 0.35,
                        boxShadow: ativo ? `0 0 6px ${corSeg}88` : 'none'
                      }}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-500 px-0.5">
                <span className="text-red-400/80 font-bold">E (0%)</span>
                <span>1/4</span>
                <span className="text-slate-400">1/2 (50%)</span>
                <span>3/4</span>
                <span className="text-emerald-400/90 font-bold">F (100%)</span>
              </div>
            </div>
          </div>

          {interativo && onChangeCombustivel ? (
            <div className="pt-0.5 flex items-center gap-3 bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-300 font-medium shrink-0 pl-1">
                Sensor:
              </span>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={nivelClamp}
                onChange={e => onChangeCombustivel(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
              <span className="text-[11px] font-mono font-bold text-sky-300 w-9 text-right pr-1">
                {nivelClamp}%
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800/60">
              <span>SONDA DE NÍVEL DIGITAL</span>
              <span className="text-emerald-400 font-semibold">TELEMETRIA ATIVA</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

