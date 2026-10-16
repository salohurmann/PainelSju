import React from 'react';
import { Fuel, Gauge } from 'lucide-react';

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
  const kmStr = String(Math.max(0, kmAtual)).padStart(6, '0');
  const digitos = kmStr.split('');

  const isReserva = nivelCombustivel <= 15;
  const isAtencao = nivelCombustivel > 15 && nivelCombustivel <= 35;

  const statusColor = isReserva
    ? '#EF4444'
    : isAtencao
    ? '#F59E0B'
    : '#10B981';

  // Autonomia estimada simples (tanque 55L * 11km/L = ~605km máx)
  const autonomiaEstimada = Math.round((nivelCombustivel / 100) * 580);

  return (
    <div className="bg-[#0B0F17] text-white rounded-3xl p-6 border border-slate-800/90 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden font-sans select-none">
      {/* Subtle Porsche/Linear Top Specular Highlight */}
      <div className="absolute inset-x-12 top-0 h-px bg-linear-to-r from-transparent via-sky-400/30 to-transparent pointer-events-none" />

      {/* Top Instrument Header */}
      <div className="flex items-center justify-between border-b border-slate-800/70 pb-3.5 mb-5">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400 font-semibold">
            SEJU TELEMETRY · INSTRUMENT CLUSTER
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-900/90 border border-slate-800 px-2.5 py-0.5 rounded-full">
          CAN-BUS SYNC
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        {/* LEFT MODULE: PRECISION DIGITAL ODOMETER */}
        <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800/80 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300 tracking-wide flex items-center gap-2">
              <Gauge size={14} className="text-sky-400" />
              Odômetro Total
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              REGISTRO OFICIAL
            </span>
          </div>

          {/* Segmented Drum / Digital Cluster Display */}
          <div className="flex items-baseline justify-center gap-1.5 py-2.5 px-3 bg-[#06090F] rounded-xl border border-slate-800/90 shadow-inner">
            <div className="flex items-center gap-1">
              {digitos.map((d, index) => {
                const isLeadingZero = index < digitos.length - 1 && Number(kmStr.slice(0, index + 1)) === 0;
                return (
                  <div
                    key={index}
                    className="w-8 h-11 sm:w-9 sm:h-12 rounded-lg bg-linear-to-b from-slate-900/90 via-[#0B111E] to-slate-900/90 border border-slate-800/90 flex items-center justify-center font-mono font-bold text-xl sm:text-2xl relative overflow-hidden"
                  >
                    <div className="absolute inset-x-0 top-1/2 h-px bg-black/50" />
                    <span
                      className={`relative z-10 tracking-tight ${
                        isLeadingZero
                          ? 'text-slate-700'
                          : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]'
                      }`}
                    >
                      {d}
                    </span>
                  </div>
                );
              })}
            </div>
            <span className="ml-1.5 font-mono text-xs font-semibold text-sky-400 uppercase tracking-wider">
              km
            </span>
          </div>

          {interativo && onChangeKm ? (
            <div className="pt-1 flex items-center justify-between gap-3">
              <label className="text-[11px] text-slate-400 font-medium shrink-0">
                Ajustar leitura:
              </label>
              <input
                type="number"
                value={kmAtual}
                onChange={e => onChangeKm(Number(e.target.value))}
                className="w-36 text-right text-xs font-mono font-bold px-3 py-1.5 bg-[#06090F] border border-slate-700/80 rounded-lg text-white outline-hidden focus:border-sky-400 transition"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>PRECISÃO ±1 KM</span>
              <span className="text-slate-400">VERIFICADO</span>
            </div>
          )}
        </div>

        {/* RIGHT MODULE: SLEEK FUEL GAUGE & PROGRESS CLUSTER */}
        <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800/80 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300 tracking-wide flex items-center gap-2">
              <Fuel size={14} className="text-sky-400" />
              Nível de Combustível
            </span>

            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                isReserva
                  ? 'bg-red-500/15 text-red-400 border-red-500/30 animate-pulse'
                  : isAtencao
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {isReserva ? 'RESERVA CRÍTICA' : `~${autonomiaEstimada} KM RESTANTES`}
            </span>
          </div>

          {/* Center Readout + Precision Segmented Bar + Arc */}
          <div className="bg-[#06090F] rounded-xl p-3.5 border border-slate-800/90 space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                  Capacidade do Tanque
                </span>
                <div className="text-2xl font-mono font-black tracking-tight text-white mt-0.5 flex items-baseline gap-1">
                  {nivelCombustivel}
                  <span className="text-xs font-semibold text-slate-400">%</span>
                </div>
              </div>

              {/* Minimalist Precision Arc SVG */}
              <svg viewBox="0 0 100 46" className="w-28 h-12 overflow-visible">
                <path
                  d="M 10 40 A 38 38 0 0 1 90 40"
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M 10 40 A 38 38 0 0 1 90 40"
                  fill="none"
                  stroke={statusColor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="119.38"
                  strokeDashoffset={119.38 - 119.38 * (Math.min(100, Math.max(0, nivelCombustivel)) / 100)}
                  className="transition-all duration-500 ease-out"
                />
                <text x="8" y="46" fill="#64748B" fontSize="7" fontWeight="bold" className="font-mono">
                  E
                </text>
                <text x="46" y="12" fill="#64748B" fontSize="6.5" fontWeight="bold" className="font-mono">
                  1/2
                </text>
                <text x="88" y="46" fill="#64748B" fontSize="7" fontWeight="bold" className="font-mono">
                  F
                </text>
              </svg>
            </div>

            {/* Smooth Segmented Digital Bar */}
            <div className="space-y-1.5">
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.min(100, Math.max(0, nivelCombustivel))}%`,
                    backgroundColor: statusColor,
                    boxShadow: `0 0 10px ${statusColor}66`
                  }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {interativo && onChangeCombustivel ? (
            <div className="pt-0.5 flex items-center gap-3">
              <span className="text-[11px] text-slate-400 font-medium shrink-0">
                Ajustar:
              </span>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={nivelCombustivel}
                onChange={e => onChangeCombustivel(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>SENSOR TANQUE</span>
              <span className="text-slate-400">TELEMETRIA OK</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
