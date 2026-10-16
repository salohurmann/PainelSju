import React, { useState } from 'react';
import { MapPin, Navigation, Route, Gauge, Clock, Sparkles, Fuel } from 'lucide-react';

export interface DestinoParana {
  id: string;
  nome: string;
  regiao: string;
  distanciaKm: number;
  tempoHoras: number;
  rodovias: string;
  diariaEstimada: number;
  x: number; // Coordenadas percentuais SVG no mapa do PR (0 a 100)
  y: number;
}

export const CIDADES_PARANA: DestinoParana[] = [
  { id: 'curitiba', nome: 'Curitiba (SEJU Sede)', regiao: 'Metropolitana', distanciaKm: 0, tempoHoras: 0, rodovias: 'Sede Central', diariaEstimada: 0, x: 78, y: 72 },
  { id: 'paranagua', nome: 'Paranaguá', regiao: 'Litoral', distanciaKm: 91, tempoHoras: 1.5, rodovias: 'BR-277', diariaEstimada: 380, x: 88, y: 73 },
  { id: 'pontagrossa', nome: 'Ponta Grossa', regiao: 'Campos Gerais', distanciaKm: 114, tempoHoras: 1.8, rodovias: 'BR-376', diariaEstimada: 380, x: 67, y: 64 },
  { id: 'londrina', nome: 'Londrina', regiao: 'Norte', distanciaKm: 388, tempoHoras: 5.0, rodovias: 'BR-376 / PR-445', diariaEstimada: 420, x: 60, y: 28 },
  { id: 'maringa', nome: 'Maringá', regiao: 'Noroeste', distanciaKm: 425, tempoHoras: 5.5, rodovias: 'BR-376', diariaEstimada: 420, x: 48, y: 30 },
  { id: 'guarapuava', nome: 'Guarapuava', regiao: 'Centro-Sul', distanciaKm: 256, tempoHoras: 3.5, rodovias: 'BR-277', diariaEstimada: 380, x: 50, y: 66 },
  { id: 'cascavel', nome: 'Cascavel', regiao: 'Oeste', distanciaKm: 498, tempoHoras: 6.2, rodovias: 'BR-277', diariaEstimada: 450, x: 26, y: 62 },
  { id: 'foz', nome: 'Foz do Iguaçu', regiao: 'Tríplice Fronteira', distanciaKm: 637, tempoHoras: 8.0, rodovias: 'BR-277', diariaEstimada: 520, x: 14, y: 74 },
  { id: 'umuarama', nome: 'Umuarama', regiao: 'Noroeste', distanciaKm: 580, tempoHoras: 7.2, rodovias: 'PR-323', diariaEstimada: 450, x: 30, y: 35 }
];

interface MapaParanaInterativoProps {
  cidadeSelecionada: DestinoParana;
  onSelectCidade: (cidade: DestinoParana) => void;
  comPernoite: boolean;
  onTogglePernoite: (pernoite: boolean) => void;
}

export const MapaParanaInterativo: React.FC<MapaParanaInterativoProps> = ({
  cidadeSelecionada,
  onSelectCidade,
  comPernoite,
  onTogglePernoite
}) => {
  const [hoverCidade, setHoverCidade] = useState<DestinoParana | null>(null);

  const curitiba = CIDADES_PARANA[0];
  const displayCidade = hoverCidade || cidadeSelecionada;

  // Cálculo da diária conforme Decreto Estadual
  const valorDiariaCalculado =
    cidadeSelecionada.id === 'curitiba'
      ? 0
      : comPernoite
      ? cidadeSelecionada.diariaEstimada
      : Math.round(cidadeSelecionada.diariaEstimada * 0.5);

  const litrosCombustivel =
    cidadeSelecionada.id === 'curitiba'
      ? 0
      : Math.round((cidadeSelecionada.distanciaKm * 2) / 10.5);

  // Curva Bezier suave entre Curitiba e o Destino selecionado
  const midX = (curitiba.x + displayCidade.x) / 2;
  const midY = Math.min(curitiba.y, displayCidade.y) - 8;
  const routePath = `M ${curitiba.x} ${curitiba.y} Q ${midX} ${midY} ${displayCidade.x} ${displayCidade.y}`;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.06)] space-y-6 font-sans">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#005A9C] bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200/60">
            <Navigation size={12} /> Cartografia Rodoviária Oficial · PR
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-2">
            Planejador Geográfico de Missões & Diárias
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Selecione um polo regional no mapa ou nas pílulas rápidas para simular o itinerário e o cálculo de diárias.
          </p>
        </div>

        {/* Sleek Segmented Pernoite Switch */}
        <div className="inline-flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/80 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => onTogglePernoite(false)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              !comPernoite
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sem Pernoite (50%)
          </button>
          <button
            type="button"
            onClick={() => onTogglePernoite(true)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              comPernoite
                ? 'bg-[#005A9C] text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Com Pernoite (100%)
          </button>
        </div>
      </div>

      {/* QUICK CITY SELECTOR PILLS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {CIDADES_PARANA.map((c) => {
          const active = cidadeSelecionada.id === c.id;
          const nomeCurto = c.id === 'curitiba' ? 'Curitiba (Sede)' : c.nome;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectCidade(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                active
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  active ? 'bg-sky-400' : c.id === 'curitiba' ? 'bg-[#005A9C]' : 'bg-slate-300'
                }`}
              />
              {nomeCurto}
            </button>
          );
        })}
      </div>

      {/* MAIN GRID: ULTRA-CLEAN AIRY MAP + TELEMETRY CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT: LIGHT & AIRY VECTOR MAP CONTAINER */}
        <div className="lg:col-span-7 relative bg-linear-to-b from-slate-50/90 to-sky-50/40 rounded-3xl p-6 border border-slate-200/80 overflow-hidden min-h-[360px] flex items-center justify-center">
          {/* Subtle Dot Matrix */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] opacity-45 pointer-events-none" />

          {/* Floating Origin Pill */}
          <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-2 text-[10px] font-semibold text-slate-600 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#005A9C]" />
            <span>ORIGEM: CURITIBA · SEJU</span>
          </div>

          {/* Floating Active Route Pill */}
          {displayCidade.id !== 'curitiba' && (
            <div className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#005A9C] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-sky-200/80 shadow-2xs">
              <span>{displayCidade.rodovias}</span>
              <span>•</span>
              <span>{displayCidade.distanciaKm} KM</span>
            </div>
          )}

          {/* SVG PARANÁ MAP */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full max-h-[320px] select-none overflow-visible"
          >
            <defs>
              <linearGradient id="cleanRouteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0284C7" />
                <stop offset="100%" stopColor="#005A9C" />
              </linearGradient>
              <filter id="mapDropShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.06" />
              </filter>
            </defs>

            {/* Paraná State Silhouette — Crisp White/Sky Surface */}
            <path
              d="M 12,68 L 10,75 L 18,80 L 32,82 L 46,78 L 58,84 L 75,82 L 86,76 L 90,70 L 85,62 L 78,54 L 72,42 L 70,30 L 64,22 L 50,22 L 42,26 L 30,28 L 22,34 L 16,46 L 14,56 Z"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="0.9"
              filter="url(#mapDropShadow)"
              className="transition-all duration-300"
            />

            {/* Subtle Highway Network Lines */}
            <g stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="1.2,1.2">
              <line x1={curitiba.x} y1={curitiba.y} x2={CIDADES_PARANA[2].x} y2={CIDADES_PARANA[2].y} />
              <line x1={CIDADES_PARANA[2].x} y1={CIDADES_PARANA[2].y} x2={CIDADES_PARANA[3].x} y2={CIDADES_PARANA[3].y} />
              <line x1={CIDADES_PARANA[3].x} y1={CIDADES_PARANA[3].y} x2={CIDADES_PARANA[4].x} y2={CIDADES_PARANA[4].y} />
              <line x1={CIDADES_PARANA[2].x} y1={CIDADES_PARANA[2].y} x2={CIDADES_PARANA[5].x} y2={CIDADES_PARANA[5].y} />
              <line x1={CIDADES_PARANA[5].x} y1={CIDADES_PARANA[5].y} x2={CIDADES_PARANA[6].x} y2={CIDADES_PARANA[6].y} />
              <line x1={CIDADES_PARANA[6].x} y1={CIDADES_PARANA[6].y} x2={CIDADES_PARANA[7].x} y2={CIDADES_PARANA[7].y} />
              <line x1={CIDADES_PARANA[4].x} y1={CIDADES_PARANA[4].y} x2={CIDADES_PARANA[8].x} y2={CIDADES_PARANA[8].y} />
              <line x1={curitiba.x} y1={curitiba.y} x2={CIDADES_PARANA[1].x} y2={CIDADES_PARANA[1].y} />
            </g>

            {/* Active Curved Route Arc */}
            {displayCidade.id !== 'curitiba' && (
              <g>
                {/* Soft Glow Underlay */}
                <path
                  d={routePath}
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="2.4"
                  strokeOpacity="0.22"
                  strokeLinecap="round"
                />
                {/* Crisp Dashed Route Line */}
                <path
                  d={routePath}
                  fill="none"
                  stroke="url(#cleanRouteGrad)"
                  strokeWidth="1.2"
                  strokeDasharray="2.2,1.6"
                  strokeLinecap="round"
                />
              </g>
            )}

            {/* Interactive City Pins */}
            {CIDADES_PARANA.map((c) => {
              const isSelected = displayCidade.id === c.id;
              const isCuritiba = c.id === 'curitiba';
              const label = c.id === 'curitiba' ? 'Curitiba' : c.nome;

              return (
                <g
                  key={c.id}
                  className="cursor-pointer group"
                  onClick={() => onSelectCidade(c)}
                  onMouseEnter={() => setHoverCidade(c)}
                  onMouseLeave={() => setHoverCidade(null)}
                >
                  {/* Subtle Halo Ring on Active or Origin */}
                  {(isSelected || isCuritiba) && (
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r={isSelected ? '4.2' : '3.2'}
                      fill={isSelected ? '#0284C7' : '#005A9C'}
                      fillOpacity="0.14"
                    />
                  )}

                  {/* Pin Dot */}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={isSelected ? '2.2' : isCuritiba ? '2.0' : '1.5'}
                    fill={
                      isSelected
                        ? '#005A9C'
                        : isCuritiba
                        ? '#0284C7'
                        : '#94A3B8'
                    }
                    stroke="#FFFFFF"
                    strokeWidth="0.7"
                    className="transition-all duration-200"
                  />

                  {/* Crisp City Label */}
                  <text
                    x={c.x}
                    y={c.y - 3.2}
                    textAnchor="middle"
                    fill={isSelected ? '#0F172A' : '#64748B'}
                    fontSize={isSelected ? '2.7' : '2.2'}
                    fontWeight={isSelected || isCuritiba ? '700' : '500'}
                    className="transition-all duration-200 select-none font-sans"
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* RIGHT: CLEAN TELEMETRY & ALLOWANCE SUMMARY */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {/* Destination Telemetry Card */}
          <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Polo Selecionado
              </span>
              <span className="text-[11px] font-semibold text-[#005A9C] bg-white px-2.5 py-0.5 rounded-full border border-slate-200/80 shadow-2xs">
                Região {displayCidade.regiao}
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
                <MapPin size={20} />
              </div>
              <div className="min-w-0">
                <h4 className="text-lg font-black text-slate-900 tracking-tight truncate">
                  {displayCidade.nome}
                </h4>
                <div className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                  <Route size={13} className="text-[#005A9C]" />
                  <span>Eixo Rodoviário: {displayCidade.rodovias}</span>
                </div>
              </div>
            </div>

            {/* 3-Column Metrics */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                <div className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                  <Gauge size={11} className="text-[#005A9C]" /> Distância
                </div>
                <div className="text-base font-black text-slate-900 font-mono mt-1">
                  {displayCidade.distanciaKm}{' '}
                  <span className="text-[10px] font-semibold text-slate-400">km</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                <div className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                  <Clock size={11} className="text-[#005A9C]" /> Tempo Est.
                </div>
                <div className="text-base font-black text-slate-900 font-mono mt-1">
                  {displayCidade.tempoHoras > 0 ? `${displayCidade.tempoHoras}h` : '0h'}
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                <div className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                  <Fuel size={11} className="text-[#005A9C]" /> Ida/Volta
                </div>
                <div className="text-base font-black text-slate-900 font-mono mt-1">
                  ~{litrosCombustivel}{' '}
                  <span className="text-[10px] font-semibold text-slate-400">L</span>
                </div>
              </div>
            </div>
          </div>

          {/* Allowance Calculation Card */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Indenização de Diária · Decreto PR
              </span>
              <span className="text-[10px] font-bold bg-sky-50 text-[#005A9C] border border-sky-200/60 px-2.5 py-0.5 rounded-full">
                {comPernoite ? 'Integral (Com Pernoite)' : 'Parcial 50% (Sem Pernoite)'}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Valor Estimado da Diária
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight mt-0.5">
                  R$ {valorDiariaCalculado.toFixed(2).replace('.', ',')}
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                <div className="font-semibold text-slate-600">Tabela SEFAZ/SEJU</div>
                <div>Custeio de refeições e pousada</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#005A9C] shrink-0" />
              <span>Cálculo integrado automaticamente à nota de empenho da viagem.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
