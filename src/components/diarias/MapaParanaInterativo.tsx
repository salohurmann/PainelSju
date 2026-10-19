import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Route,
  Gauge,
  Clock,
  Sparkles,
  Fuel,
  Compass,
  Crosshair,
  Radio,
  Layers,
  ShieldCheck
} from 'lucide-react';

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

// Metadados Geodésicos e Táticos por Polo Regional (SIRGAS 2000)
const TELEMETRIA_GEODESICA: Record<
  string,
  { coords: string; altitude: string; regionalSeju: string; pedagios: number }
> = {
  curitiba: {
    coords: "25°28'33\"S 49°15'32\"W",
    altitude: '934m',
    regionalSeju: 'Sede SEJU Hauer · Matriz',
    pedagios: 0
  },
  paranagua: {
    coords: "25°31'12\"S 48°30'33\"W",
    altitude: '5m',
    regionalSeju: 'Núcleo Regional Litoral',
    pedagios: 1
  },
  pontagrossa: {
    coords: "25°05'42\"S 50°09'43\"W",
    altitude: '956m',
    regionalSeju: 'Núcleo Campos Gerais',
    pedagios: 2
  },
  londrina: {
    coords: "23°18'36\"S 51°09'46\"W",
    altitude: '610m',
    regionalSeju: 'Regional Metropolitana Norte',
    pedagios: 4
  },
  maringa: {
    coords: "23°25'31\"S 51°56'19\"W",
    altitude: '555m',
    regionalSeju: 'Regional Noroeste Central',
    pedagios: 5
  },
  guarapuava: {
    coords: "25°23'43\"S 51°27'45\"W",
    altitude: '1.120m',
    regionalSeju: 'Núcleo Regional Centro-Sul',
    pedagios: 3
  },
  cascavel: {
    coords: "24°57'21\"S 53°27'19\"W",
    altitude: '781m',
    regionalSeju: 'Regional Oeste Paranaense',
    pedagios: 5
  },
  foz: {
    coords: "25°32'49\"S 54°35'17\"W",
    altitude: '164m',
    regionalSeju: 'Base Estratégica Fronteira',
    pedagios: 6
  },
  umuarama: {
    coords: "23°45'57\"S 53°19'30\"W",
    altitude: '442m',
    regionalSeju: 'Núcleo Regional Arenito',
    pedagios: 5
  }
};

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
  const [modoVisorEscuro, setModoVisorEscuro] = useState<boolean>(true);

  const curitiba = CIDADES_PARANA[0];
  const displayCidade = hoverCidade || cidadeSelecionada;
  const geoInfo = TELEMETRIA_GEODESICA[displayCidade.id] || TELEMETRIA_GEODESICA.curitiba;

  // Cálculo da diária conforme Decreto Estadual nº 1.428/PR
  const valorDiariaCalculado =
    displayCidade.id === 'curitiba'
      ? 0
      : comPernoite
      ? displayCidade.diariaEstimada
      : Math.round(displayCidade.diariaEstimada * 0.5);

  const litrosCombustivel =
    displayCidade.id === 'curitiba'
      ? 0
      : Math.round((displayCidade.distanciaKm * 2) / 10.5);

  // Curva Bezier suave entre Curitiba e o Destino selecionado
  const midX = (curitiba.x + displayCidade.x) / 2;
  const midY = Math.min(curitiba.y, displayCidade.y) - 9;
  const routePath = `M ${curitiba.x} ${curitiba.y} Q ${midX} ${midY} ${displayCidade.x} ${displayCidade.y}`;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.08)] space-y-5 font-sans relative overflow-hidden">
      {/* Filete Superior Tático Governamental */}
      <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-[#005A9C] via-sky-400 to-emerald-500" />

      {/* HEADER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#005A9C] bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200/70">
              <Navigation size={11} className="text-[#0284C7]" /> Cartografia Tática & Telemetria · PR
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/70">
              <Compass size={11} className="text-slate-600" /> 25°25&apos;S 49°16&apos;W · SIRGAS 2000
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-2">
            Planejador Geodésico de Missões & Malha Rodoviária Estadual
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Selecione um polo regional no radar cartográfico ou nos seletores táticos para aferir distâncias, eixos rodoviários e diárias.
          </p>
        </div>

        {/* Controles Táticos: Modo do Visor + Switch de Pernoite */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto shrink-0">
          {/* Toggle Visor Tático Escuro / Carta Clara */}
          <button
            type="button"
            onClick={() => setModoVisorEscuro(!modoVisorEscuro)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/90"
            title="Alternar estética do visor cartográfico"
          >
            <Layers size={12} className="text-[#005A9C]" />
            <span>Visor: {modoVisorEscuro ? 'Radar Noturno' : 'Carta Diurna'}</span>
          </button>

          {/* Sleek Segmented Pernoite Switch */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/80">
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
                  ? 'bg-slate-900 text-white shadow-xs ring-2 ring-sky-500/20'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  active
                    ? 'bg-sky-400 animate-pulse'
                    : c.id === 'curitiba'
                    ? 'bg-[#005A9C]'
                    : 'bg-slate-300'
                }`}
              />
              <span>{nomeCurto}</span>
              {c.distanciaKm > 0 && (
                <span className={`text-[10px] font-mono ${active ? 'text-sky-300' : 'text-slate-400'}`}>
                  {c.distanciaKm}km
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* MAIN GRID: CARTOGRAFIA TÁTICA + PAINEL DE TELEMETRIA REGIONAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT: VISOR CARTOGRÁFICO TÁTICO COM MOLDURA DE COORDENADAS SIRGAS 2000 */}
        <div
          className={`lg:col-span-7 relative rounded-3xl p-6 border overflow-hidden min-h-[400px] flex items-center justify-center transition-colors duration-300 ${
            modoVisorEscuro
              ? 'bg-linear-to-br from-slate-950 via-slate-900 to-[#081E36] border-slate-800 shadow-inner'
              : 'bg-linear-to-b from-slate-50/95 via-sky-50/50 to-slate-100/60 border-slate-200/90'
          }`}
        >
          {/* GRADE CARTOGRÁFICA SUTIL AO FUNDO (Linhas Ortogonais + Matriz de Pontos) */}
          <div
            className={`absolute inset-0 pointer-events-none ${
              modoVisorEscuro
                ? 'bg-[linear-gradient(to_right,rgba(56,189,248,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.07)_1px,transparent_1px)] [background-size:36px_36px]'
                : 'bg-[linear-gradient(to_right,rgba(14,116,144,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,116,144,0.06)_1px,transparent_1px)] [background-size:36px_36px]'
            }`}
          />
          <div
            className={`absolute inset-0 pointer-events-none ${
              modoVisorEscuro
                ? 'bg-[radial-gradient(rgba(56,189,248,0.18)_1px,transparent_1px)] [background-size:18px_18px] opacity-60'
                : 'bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:18px_18px] opacity-40'
            }`}
          />

          {/* MOLDURA COM CANTONEIRAS DE COORDENADAS GEOGRÁFICAS (4 CANTOS TÁTICOS) */}
          {/* Cantoneira Superior Esquerda */}
          <div
            className={`absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 rounded-tl-md pointer-events-none ${
              modoVisorEscuro ? 'border-sky-400/70' : 'border-[#005A9C]/60'
            }`}
          />
          {/* Cantoneira Superior Direita */}
          <div
            className={`absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 rounded-tr-md pointer-events-none ${
              modoVisorEscuro ? 'border-sky-400/70' : 'border-[#005A9C]/60'
            }`}
          />
          {/* Cantoneira Inferior Esquerda */}
          <div
            className={`absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 rounded-bl-md pointer-events-none ${
              modoVisorEscuro ? 'border-sky-400/70' : 'border-[#005A9C]/60'
            }`}
          />
          {/* Cantoneira Inferior Direita */}
          <div
            className={`absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 rounded-br-md pointer-events-none ${
              modoVisorEscuro ? 'border-sky-400/70' : 'border-[#005A9C]/60'
            }`}
          />

          {/* Coordenadas de Borda Cartográfica Superior/Inferior */}
          <div
            className={`absolute top-2.5 left-1/2 -translate-x-1/2 z-10 text-[9px] font-mono tracking-[0.2em] uppercase px-2.5 py-0.5 rounded-full border pointer-events-none ${
              modoVisorEscuro
                ? 'text-sky-300/80 bg-slate-900/80 border-sky-500/20'
                : 'text-slate-500 bg-white/80 border-slate-200/80'
            }`}
          >
            25°28&apos;S 49°15&apos;W · SIRGAS 2000 · UTM 22S
          </div>

          {/* HUD SUPERIOR ESQUERDO: Origem Sede SEJU Hauer */}
          <div
            className={`absolute top-5 left-5 z-10 inline-flex items-center gap-2 text-[10px] font-semibold px-3 py-1.5 rounded-full border backdrop-blur-md shadow-xs ${
              modoVisorEscuro
                ? 'bg-slate-900/85 text-slate-200 border-slate-700/80'
                : 'bg-white/90 text-slate-700 border-slate-200/90'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
            </span>
            <span className="font-mono tracking-wider">BASE: CURITIBA · SEJU</span>
          </div>

          {/* HUD SUPERIOR DIREITO: Eixo Rodoviário em Brilho Neon */}
          {displayCidade.id !== 'curitiba' && (
            <div
              className={`absolute top-5 right-5 z-10 inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-3 py-1.5 rounded-full border backdrop-blur-md shadow-xs ${
                modoVisorEscuro
                  ? 'bg-sky-950/90 text-sky-300 border-sky-500/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                  : 'bg-white/95 text-[#005A9C] border-sky-300/80 shadow-xs'
              }`}
            >
              <Radio size={11} className="text-sky-400 animate-pulse" />
              <span>{displayCidade.rodovias}</span>
              <span className="opacity-50">•</span>
              <span>{displayCidade.distanciaKm} KM</span>
            </div>
          )}

          {/* CARD FLUTUANTE DE TELEMETRIA DA REGIONAL (Acabamento em Vidro Escuro/Claro Impecável) */}
          <div
            className={`absolute bottom-5 left-5 z-10 p-3.5 rounded-2xl border backdrop-blur-xl transition-all duration-300 max-w-[260px] sm:max-w-[290px] ${
              modoVisorEscuro
                ? 'bg-slate-900/85 border-slate-700/80 text-white shadow-[0_12px_30px_rgba(0,0,0,0.45)]'
                : 'bg-white/90 border-slate-200/90 text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.10)]'
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <span
                className={`text-[9px] font-mono font-bold uppercase tracking-widest flex items-center gap-1 ${
                  modoVisorEscuro ? 'text-sky-400' : 'text-[#005A9C]'
                }`}
              >
                <Crosshair size={10} /> Telemetria da Regional
              </span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                  modoVisorEscuro
                    ? 'bg-slate-800/90 text-slate-300 border-slate-700'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                ALT {geoInfo.altitude}
              </span>
            </div>

            <div className="text-xs font-extrabold tracking-tight truncate">
              {displayCidade.nome} · <span className="font-normal opacity-80">{displayCidade.regiao}</span>
            </div>

            <div
              className={`text-[10px] font-mono mt-1 flex items-center gap-2 ${
                modoVisorEscuro ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              <span>{geoInfo.coords}</span>
            </div>

            <div
              className={`mt-2 pt-2 border-t flex items-center justify-between text-[10px] font-mono ${
                modoVisorEscuro ? 'border-slate-800 text-sky-300' : 'border-slate-200/70 text-[#005A9C]'
              }`}
            >
              <span>{geoInfo.regionalSeju}</span>
              <span className="font-bold">R$ {valorDiariaCalculado},00</span>
            </div>
          </div>

          {/* Escala Cartográfica Gráfica (Canto Inferior Direito) */}
          <div
            className={`hidden sm:flex absolute bottom-5 right-5 z-10 flex-col items-end gap-1 text-[9px] font-mono pointer-events-none ${
              modoVisorEscuro ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <span>ESCALA 1:4.500.000</span>
            <div className="flex items-center gap-1">
              <span>0</span>
              <div
                className={`w-12 h-1.5 border flex ${
                  modoVisorEscuro ? 'border-sky-400/50' : 'border-slate-400'
                }`}
              >
                <div className={`w-1/2 h-full ${modoVisorEscuro ? 'bg-sky-400/70' : 'bg-slate-600'}`} />
              </div>
              <span>100 km</span>
            </div>
          </div>

          {/* SVG PARANÁ MAP — CARTOGRAFIA DE ALTA PRECISÃO */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full max-h-[340px] select-none overflow-visible relative z-0"
          >
            <defs>
              {/* Gradiente Neon da Rota Ativa */}
              <linearGradient id="neonRouteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="50%" stopColor="#0284C7" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>

              {/* Superfície do Território Paranaense */}
              <linearGradient id="paranaDarkSurface" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#1E293B" />
              </linearGradient>
              <linearGradient id="paranaLightSurface" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#F0F9FF" />
              </linearGradient>

              {/* Filtro de Brilho Neon Refinado para Rodovias */}
              <filter id="highwayNeonGlow" x="-25%" y="-25%" width="150%" height="150%">
                <feGaussianBlur stdDeviation="1.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="mapDropShadow" x="-15%" y="-15%" width="130%" height="130%">
                <feDropShadow
                  dx="0"
                  dy="4"
                  stdDeviation="3"
                  floodColor={modoVisorEscuro ? '#0284C7' : '#0F172A'}
                  floodOpacity={modoVisorEscuro ? '0.18' : '0.08'}
                />
              </filter>
            </defs>

            {/* Linhas de Paralelos e Meridianos Internos no SVG */}
            <g
              stroke={modoVisorEscuro ? '#1E293B' : '#E2E8F0'}
              strokeWidth="0.25"
              strokeDasharray="1,1"
            >
              <line x1="5" y1="30" x2="95" y2="30" />
              <line x1="5" y1="50" x2="95" y2="50" />
              <line x1="5" y1="70" x2="95" y2="70" />
              <line x1="25" y1="15" x2="25" y2="88" />
              <line x1="50" y1="15" x2="50" y2="88" />
              <line x1="75" y1="15" x2="75" y2="88" />
            </g>

            {/* Silhueta Geográfica do Estado do Paraná */}
            <path
              d="M 12,68 L 10,75 L 18,80 L 32,82 L 46,78 L 58,84 L 75,82 L 86,76 L 90,70 L 85,62 L 78,54 L 72,42 L 70,30 L 64,22 L 50,22 L 42,26 L 30,28 L 22,34 L 16,46 L 14,56 Z"
              fill={modoVisorEscuro ? 'url(#paranaDarkSurface)' : 'url(#paranaLightSurface)'}
              stroke={modoVisorEscuro ? '#38BDF8' : '#94A3B8'}
              strokeOpacity={modoVisorEscuro ? '0.55' : '0.85'}
              strokeWidth="0.9"
              filter="url(#mapDropShadow)"
              className="transition-all duration-300"
            />

            {/* MALHA RODOVIÁRIA ESTADUAL E FEDERAL COM BRILHO NEON REFINADO */}
            <g filter="url(#highwayNeonGlow)">
              {/* Eixo BR-277 (Paranaguá -> Curitiba -> Guarapuava -> Cascavel -> Foz) */}
              <polyline
                points={`${CIDADES_PARANA[1].x},${CIDADES_PARANA[1].y} ${curitiba.x},${curitiba.y} ${CIDADES_PARANA[2].x},${CIDADES_PARANA[2].y} ${CIDADES_PARANA[5].x},${CIDADES_PARANA[5].y} ${CIDADES_PARANA[6].x},${CIDADES_PARANA[6].y} ${CIDADES_PARANA[7].x},${CIDADES_PARANA[7].y}`}
                fill="none"
                stroke={modoVisorEscuro ? '#0284C7' : '#38BDF8'}
                strokeOpacity={modoVisorEscuro ? '0.55' : '0.65'}
                strokeWidth="0.7"
                strokeDasharray="1.5,1"
              />
              {/* Eixo BR-376 / PR-445 (Ponta Grossa -> Londrina -> Maringá -> Umuarama) */}
              <polyline
                points={`${CIDADES_PARANA[2].x},${CIDADES_PARANA[2].y} ${CIDADES_PARANA[3].x},${CIDADES_PARANA[3].y} ${CIDADES_PARANA[4].x},${CIDADES_PARANA[4].y} ${CIDADES_PARANA[8].x},${CIDADES_PARANA[8].y}`}
                fill="none"
                stroke={modoVisorEscuro ? '#0284C7' : '#38BDF8'}
                strokeOpacity={modoVisorEscuro ? '0.55' : '0.65'}
                strokeWidth="0.7"
                strokeDasharray="1.5,1"
              />
            </g>

            {/* Etiquetas Táticas das Rodovias no Mapa (BR-277, BR-376, PR-445) */}
            <g className="select-none pointer-events-none font-mono">
              {/* Badge BR-277 */}
              <g transform="translate(38, 65)">
                <rect
                  x="-5.5"
                  y="-2.2"
                  width="11"
                  height="3.8"
                  rx="1"
                  fill={modoVisorEscuro ? '#082F49' : '#E0F2FE'}
                  stroke="#38BDF8"
                  strokeWidth="0.3"
                />
                <text
                  x="0"
                  y="0.3"
                  textAnchor="middle"
                  fontSize="1.9"
                  fontWeight="700"
                  fill={modoVisorEscuro ? '#7DD3FC' : '#0369A1'}
                >
                  BR-277
                </text>
              </g>

              {/* Badge BR-376 */}
              <g transform="translate(65, 46)">
                <rect
                  x="-5.5"
                  y="-2.2"
                  width="11"
                  height="3.8"
                  rx="1"
                  fill={modoVisorEscuro ? '#082F49' : '#E0F2FE'}
                  stroke="#38BDF8"
                  strokeWidth="0.3"
                />
                <text
                  x="0"
                  y="0.3"
                  textAnchor="middle"
                  fontSize="1.9"
                  fontWeight="700"
                  fill={modoVisorEscuro ? '#7DD3FC' : '#0369A1'}
                >
                  BR-376
                </text>
              </g>

              {/* Badge PR-445 */}
              <g transform="translate(55, 23)">
                <rect
                  x="-5.5"
                  y="-2.2"
                  width="11"
                  height="3.8"
                  rx="1"
                  fill={modoVisorEscuro ? '#064E3B' : '#D1FAE5'}
                  stroke="#10B981"
                  strokeWidth="0.3"
                />
                <text
                  x="0"
                  y="0.3"
                  textAnchor="middle"
                  fontSize="1.9"
                  fontWeight="700"
                  fill={modoVisorEscuro ? '#6EE7B7' : '#047857'}
                >
                  PR-445
                </text>
              </g>
            </g>

            {/* ROTA ATIVA EM ARCO COM BRILHO NEON REFINADO */}
            {displayCidade.id !== 'curitiba' && (
              <g filter="url(#highwayNeonGlow)">
                {/* Halo Neon Externo */}
                <path
                  d={routePath}
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="3.0"
                  strokeOpacity={modoVisorEscuro ? '0.30' : '0.25'}
                  strokeLinecap="round"
                />
                {/* Linha Condutora Contínua */}
                <path
                  d={routePath}
                  fill="none"
                  stroke="url(#neonRouteGrad)"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
                {/* Trilha Tática Tracejada de Alta Precisão */}
                <path
                  d={routePath}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="0.6"
                  strokeDasharray="1.8,2.2"
                  strokeLinecap="round"
                  strokeOpacity="0.9"
                />
              </g>
            )}

            {/* PINOS INTERATIVOS DE CIDADES COM ANÉIS PULSANTES QUANDO SELECIONADOS */}
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
                  {/* Anel Pulsante Concêntrico no Pino Selecionado */}
                  {isSelected && (
                    <>
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r="6.2"
                        fill="none"
                        stroke="#38BDF8"
                        strokeWidth="0.4"
                        strokeOpacity="0.5"
                        className="animate-ping"
                        style={{ transformOrigin: `${c.x}px ${c.y}px`, animationDuration: '2.2s' }}
                      />
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r="4.5"
                        fill="#38BDF8"
                        fillOpacity={modoVisorEscuro ? '0.25' : '0.18'}
                        stroke="#38BDF8"
                        strokeWidth="0.45"
                        strokeDasharray="1,0.8"
                      />
                    </>
                  )}

                  {/* Halo da Sede Curitiba */}
                  {isCuritiba && !isSelected && (
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r="3.6"
                      fill="#0284C7"
                      fillOpacity="0.22"
                      stroke="#38BDF8"
                      strokeWidth="0.35"
                    />
                  )}

                  {/* Núcleo do Pino da Cidade */}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={isSelected ? '2.4' : isCuritiba ? '2.1' : '1.6'}
                    fill={
                      isSelected
                        ? '#10B981'
                        : isCuritiba
                        ? '#0284C7'
                        : modoVisorEscuro
                        ? '#64748B'
                        : '#94A3B8'
                    }
                    stroke="#FFFFFF"
                    strokeWidth="0.7"
                    className="transition-all duration-200"
                  />

                  {/* Rótulo Cartográfico da Cidade */}
                  <text
                    x={c.x}
                    y={c.y - 3.6}
                    textAnchor="middle"
                    fill={
                      isSelected
                        ? modoVisorEscuro
                          ? '#38BDF8'
                          : '#0F172A'
                        : modoVisorEscuro
                        ? '#CBD5E1'
                        : '#475569'
                    }
                    fontSize={isSelected ? '2.8' : '2.2'}
                    fontWeight={isSelected || isCuritiba ? '800' : '600'}
                    className="transition-all duration-200 select-none font-sans"
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* RIGHT: TELEMETRIA GOVERNAMENTAL DETALHADA & RESUMO DE INDENIZAÇÃO */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {/* Card 1: Dossiê de Telemetria da Regional */}
          <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Crosshair size={12} className="text-[#005A9C]" /> Telemetria Oficial do Destino
              </span>
              <span className="text-[11px] font-semibold text-[#005A9C] bg-white px-2.5 py-0.5 rounded-full border border-slate-200/80 shadow-2xs">
                Região {displayCidade.regiao}
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0 border border-slate-800">
                <MapPin size={21} className="text-sky-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-lg font-black text-slate-900 tracking-tight truncate">
                  {displayCidade.nome}
                </h4>
                <div className="text-xs text-slate-500 font-medium mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="inline-flex items-center gap-1 text-[#005A9C] font-semibold">
                    <Route size={13} /> {displayCidade.rodovias}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono text-[11px] text-slate-500">{geoInfo.coords}</span>
                </div>
              </div>
            </div>

            {/* 3-Column Tactical Metrics */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                  <Gauge size={11} className="text-[#005A9C]" /> Distância
                </div>
                <div className="text-base font-black text-slate-900 font-mono mt-1">
                  {displayCidade.distanciaKm}{' '}
                  <span className="text-[10px] font-semibold text-slate-400">km</span>
                </div>
                <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                  Ida/Volta: {displayCidade.distanciaKm * 2} km
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                  <Clock size={11} className="text-[#005A9C]" /> Tempo Est.
                </div>
                <div className="text-base font-black text-slate-900 font-mono mt-1">
                  {displayCidade.tempoHoras > 0 ? `${displayCidade.tempoHoras}h` : '0h'}
                </div>
                <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                  Média 80 km/h
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                  <Fuel size={11} className="text-[#005A9C]" /> Combustível
                </div>
                <div className="text-base font-black text-slate-900 font-mono mt-1">
                  ~{litrosCombustivel}{' '}
                  <span className="text-[10px] font-semibold text-slate-400">L</span>
                </div>
                <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                  {geoInfo.pedagios} praça(s) eixo
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Indenização de Diária Regional (Decreto nº 1.428/PR) */}
          <div className="p-5 bg-linear-to-br from-slate-900 via-slate-900 to-[#0B2545] text-white rounded-2xl border border-slate-800 shadow-md space-y-3.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <ShieldCheck size={13} /> Tabela de Referência · Decreto PR
              </span>
              <span className="text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2.5 py-0.5 rounded-full">
                {comPernoite ? 'Integral 100% (Com Pernoite)' : 'Parcial 50% (Sem Pernoite)'}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <div className="text-[11px] text-slate-300 font-medium">
                  Referência Base para {displayCidade.nome}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight mt-0.5">
                  R$ {valorDiariaCalculado.toFixed(2).replace('.', ',')}
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                <div className="font-semibold text-sky-300">SIAF / SEFA-PR</div>
                <div>Pousada + Alimentação + Locomoção</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/90 text-[11px] text-slate-300 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-sky-400 shrink-0" />
                <span>Sincronizado ao cálculo fazendário abaixo</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-400 font-semibold">
                ● ATIVO
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

