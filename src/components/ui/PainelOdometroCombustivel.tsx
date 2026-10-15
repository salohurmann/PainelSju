import React from 'react';
import { Fuel, Gauge, AlertTriangle, CheckCircle2 } from 'lucide-react';

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

  // Ângulo do ponteiro do tanque (-90deg a 90deg)
  const anguloPonteiro = -90 + (nivelCombustivel / 100) * 180;

  return (
    <div className="bg-slate-950 text-white rounded-3xl p-6 border-2 border-slate-800 shadow-2xl relative overflow-hidden font-sans select-none">
      {/* Reflexo de vidro no painel */}
      <div className="absolute -top-12 -left-12 w-64 h-32 bg-white/5 rounded-full blur-xl pointer-events-none transform -rotate-12" />

      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-5 text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          CLUSTERS SEJU · TELEMETRIA ATIVA
        </span>
        <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] text-slate-500">
          DIAGNÓSTICO ELETRÔNICO
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Lado 1: Odômetro Estilo Display Digital Rolante */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge size={16} className="text-[#00AEEF]" /> Odômetro Oficial
            </span>
            <span className="text-[11px] font-mono text-slate-400">KM TOTAL</span>
          </div>

          {/* Caixas de Dígitos do Odômetro */}
          <div className="flex items-center justify-center gap-1 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 shadow-inner">
            {digitos.map((d, index) => (
              <div
                key={index}
                className="w-9 h-13 sm:w-10 sm:h-14 bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 rounded-lg border border-slate-700/80 flex items-center justify-center font-mono font-black text-2xl sm:text-3xl text-emerald-400 shadow-md relative overflow-hidden"
              >
                {/* Linha divisória central de rolo */}
                <div className="absolute inset-x-0 top-1/2 h-px bg-black/40" />
                <span className="relative z-10 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                  {d}
                </span>
              </div>
            ))}
            <span className="ml-2 font-mono font-bold text-sm text-slate-400">km</span>
          </div>

          {interativo && onChangeKm && (
            <div className="pt-1">
              <label className="text-[11px] text-slate-400 block mb-1">
                Ajustar Odômetro da Vistoria:
              </label>
              <input
                type="number"
                value={kmAtual}
                onChange={e => onChangeKm(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-hidden focus:border-[#00AEEF]"
              />
            </div>
          )}
        </div>

        {/* Lado 2: Medidor Visual Circular de Combustível */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Fuel size={16} className="text-[#00AEEF]" /> Nível do Tanque
            </span>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
              nivelCombustivel <= 15 ? 'bg-red-500/20 text-red-400 animate-pulse' :
              nivelCombustivel <= 40 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-emerald-500/20 text-emerald-400'
            }`}>
              {nivelCombustivel}% {nivelCombustivel <= 15 ? '(RESERVA)' : ''}
            </span>
          </div>

          {/* Gauge Circular do Tanque */}
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-col items-center justify-center relative">
            {/* Arco Visual SVG */}
            <svg viewBox="0 0 120 70" className="w-44 h-24 overflow-visible">
              {/* Arco base cinza escuro */}
              <path
                d="M 15 60 A 45 45 0 0 1 105 60"
                fill="none"
                stroke="#1e293b"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Faixa vermelha reserva */}
              <path
                d="M 15 60 A 45 45 0 0 1 35 30"
                fill="none"
                stroke="#ef4444"
                strokeWidth="10"
                strokeLinecap="round"
                opacity="0.8"
              />
              {/* Faixa verde/azul preenchida conforme nível */}
              <path
                d="M 15 60 A 45 45 0 0 1 105 60"
                fill="none"
                stroke={nivelCombustivel <= 20 ? '#ef4444' : '#10b981'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="141.37"
                strokeDashoffset={141.37 - (141.37 * (nivelCombustivel / 100))}
                className="transition-all duration-500"
              />

              {/* Ponteiro Analógico */}
              <g transform="translate(60, 60)">
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="-38"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeLinecap="round"
                  transform={`rotate(${anguloPonteiro})`}
                  className="transition-transform duration-500 origin-bottom"
                />
                <circle cx="0" cy="0" r="5" fill="#f59e0b" />
                <circle cx="0" cy="0" r="2" fill="#0f172a" />
              </g>

              {/* Marcações */}
              <text x="12" y="68" fill="#ef4444" fontSize="9" fontWeight="bold">E</text>
              <text x="56" y="16" fill="#94a3b8" fontSize="8" fontWeight="bold">1/2</text>
              <text x="100" y="68" fill="#10b981" fontSize="9" fontWeight="bold">F</text>
            </svg>

            {/* Slider interativo */}
            {interativo && onChangeCombustivel && (
              <div className="w-full mt-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={nivelCombustivel}
                  onChange={e => onChangeCombustivel(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
