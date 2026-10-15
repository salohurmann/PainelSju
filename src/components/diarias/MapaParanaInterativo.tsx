import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Route, Gauge, Clock, DollarSign, Sparkles } from 'lucide-react';

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
  const valorDiariaCalculado = cidadeSelecionada.id === 'curitiba' 
    ? 0 
    : comPernoite 
      ? cidadeSelecionada.diariaEstimada 
      : Math.round(cidadeSelecionada.diariaEstimada * 0.5);

  const litrosCombustivel = cidadeSelecionada.id === 'curitiba'
    ? 0
    : Math.round((cidadeSelecionada.distanciaKm * 2) / 10.5); // Ida e volta a 10.5 km/l

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-gov-card space-y-6">
      
      {/* Cabeçalho do Radar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#0072BB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Radar Geográfico Interativo
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-semibold">Rotas Oficiais do Paraná</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 mt-0.5 flex items-center gap-2">
            <Navigation size={18} className="text-[#0072BB]" />
            Planejador Interativo de Missões & Diárias
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Clique em qualquer polo regional no mapa para traçar o itinerário oficial, rodovias e calcular as indenizações.
          </p>
        </div>

        {/* Toggle Pernoite */}
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 shrink-0">
          <span className="text-xs font-bold text-slate-700">Com Pernoite Oficial?</span>
          <button
            type="button"
            onClick={() => onTogglePernoite(!comPernoite)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 cursor-pointer ${
              comPernoite ? 'bg-[#0072BB] justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md" />
          </button>
        </div>
      </div>

      {/* Grid Principal: Mapa Interativo SVG + Painel de Telemetria da Rota */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Lado Esquerdo: O Mapa Vetorial do Paraná */}
        <div className="lg:col-span-7 relative bg-linear-to-br from-slate-900 via-[#00385E] to-slate-900 rounded-3xl p-6 border border-slate-800 overflow-hidden shadow-inner min-h-[380px] flex items-center justify-center">
          
          {/* Grade de coordenadas náuticas/estaduais de fundo */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Selo Radar no canto */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            RADAR RODOVIÁRIO PR ATIVO
          </div>

          <div className="absolute bottom-4 left-4 z-10 text-[10px] font-mono text-slate-400 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700">
            PONTO DE PARTIDA: CURITIBA (SEJU)
          </div>

          {/* SVG Map Canvas */}
          <svg viewBox="0 0 100 100" className="w-full h-full max-h-[340px] select-none filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
            <defs>
              {/* Gradiente da linha de rota ativa */}
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00AEEF" />
                <stop offset="50%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>

              {/* Filtro de Brilho Neon */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Contorno Geométrico Fiel do Estado do Paraná */}
            <path
              d="M 12,68 L 10,75 L 18,80 L 32,82 L 46,78 L 58,84 L 75,82 L 86,76 L 90,70 L 85,62 L 78,54 L 72,42 L 70,30 L 64,22 L 50,22 L 42,26 L 30,28 L 22,34 L 16,46 L 14,56 Z"
              fill="#0F2B48"
              stroke="#00AEEF"
              strokeWidth="0.8"
              strokeOpacity="0.6"
              className="transition-all duration-500"
            />

            {/* Rodovias Secundárias (Linhas cinzas sutis) */}
            <line x1={curitiba.x} y1={curitiba.y} x2={CIDADES_PARANA[2].x} y2={CIDADES_PARANA[2].y} stroke="#334155" strokeWidth="0.6" strokeDasharray="1,1" />
            <line x1={CIDADES_PARANA[2].x} y1={CIDADES_PARANA[2].y} x2={CIDADES_PARANA[3].x} y2={CIDADES_PARANA[3].y} stroke="#334155" strokeWidth="0.6" strokeDasharray="1,1" />
            <line x1={CIDADES_PARANA[3].x} y1={CIDADES_PARANA[3].y} x2={CIDADES_PARANA[4].x} y2={CIDADES_PARANA[4].y} stroke="#334155" strokeWidth="0.6" strokeDasharray="1,1" />
            <line x1={CIDADES_PARANA[2].x} y1={CIDADES_PARANA[2].y} x2={CIDADES_PARANA[5].x} y2={CIDADES_PARANA[5].y} stroke="#334155" strokeWidth="0.6" strokeDasharray="1,1" />
            <line x1={CIDADES_PARANA[5].x} y1={CIDADES_PARANA[5].y} x2={CIDADES_PARANA[6].x} y2={CIDADES_PARANA[6].y} stroke="#334155" strokeWidth="0.6" strokeDasharray="1,1" />
            <line x1={CIDADES_PARANA[6].x} y1={CIDADES_PARANA[6].y} x2={CIDADES_PARANA[7].x} y2={CIDADES_PARANA[7].y} stroke="#334155" strokeWidth="0.6" strokeDasharray="1,1" />

            {/* Linha de Rota Ativa Traçada (com pulso luminoso) */}
            {cidadeSelecionada.id !== 'curitiba' && (
              <g filter="url(#glow)">
                <line
                  x1={curitiba.x}
                  y1={curitiba.y}
                  x2={cidadeSelecionada.x}
                  y2={cidadeSelecionada.y}
                  stroke="url(#routeGradient)"
                  strokeWidth="1.6"
                  strokeDasharray="2,2"
                  className="animate-pulse"
                />
              </g>
            )}

            {/* Nós Interativos das Cidades */}
            {CIDADES_PARANA.map((c) => {
              const isSelected = cidadeSelecionada.id === c.id;
              const isCuritiba = c.id === 'curitiba';

              return (
                <g 
                  key={c.id} 
                  className="cursor-pointer group"
                  onClick={() => onSelectCidade(c)}
                  onMouseEnter={() => setHoverCidade(c)}
                  onMouseLeave={() => setHoverCidade(null)}
                >
                  {/* Círculo pulsante quando selecionado */}
                  {isSelected && (
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r="4.5"
                      fill="none"
                      stroke={isCuritiba ? '#0072BB' : '#34D399'}
                      strokeWidth="0.8"
                      className="animate-ping origin-center"
                    />
                  )}

                  {/* Ponto Central da Cidade */}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={isSelected ? '2.4' : '1.7'}
                    fill={isCuritiba ? '#00AEEF' : isSelected ? '#10B981' : '#E2E8F0'}
                    stroke={isSelected ? '#FFFFFF' : '#0F172A'}
                    strokeWidth="0.6"
                    className="transition-all duration-300 group-hover:scale-150"
                  />

                  {/* Rótulo de Texto da Cidade */}
                  <text
                    x={c.x}
                    y={c.y - 3}
                    textAnchor="middle"
                    fill={isSelected ? '#F8FAFC' : '#94A3B8'}
                    fontSize={isSelected ? '2.8' : '2.2'}
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    className="transition-all duration-200 select-none group-hover:fill-white font-sans"
                  >
                    {c.nome.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Lado Direito: Cockpit de Telemetria da Viagem */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Card da Cidade Selecionada */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Destino Selecionado
              </span>
              <span className="text-[11px] font-bold text-[#0072BB] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Região {displayCidade.regiao}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#0072BB] text-white flex items-center justify-center font-black text-xl shadow-md">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 leading-tight">
                  {displayCidade.nome}
                </h4>
                <div className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5">
                  <Route size={13} className="text-[#0072BB]" />
                  <span>Via {displayCidade.rodovias}</span>
                </div>
              </div>
            </div>

            {/* Painel de Indicadores Numéricos */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1">
                  <Gauge size={12} className="text-[#0072BB]" /> Distância Ida
                </div>
                <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
                  {displayCidade.distanciaKm} <span className="text-xs font-bold text-slate-500">km</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1">
                  <Clock size={12} className="text-indigo-600" /> Tempo Estimado
                </div>
                <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
                  {displayCidade.tempoHoras > 0 ? `${displayCidade.tempoHoras}h` : '0h'}
                </div>
              </div>
            </div>

            {/* Consumo de Combustível Estimado */}
            {displayCidade.distanciaKm > 0 && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Combustível Est. (Ida & Volta):</span>
                <span className="font-mono font-bold text-slate-800">
                  ~{litrosCombustivel} litros
                </span>
              </div>
            )}
          </div>

          {/* Card de Cálculo de Diária Oficial */}
          <div className="p-5 bg-linear-to-br from-amber-50 to-orange-50/60 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                Indenização de Diária (Decreto Estadual PR)
              </span>
              <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded">
                {comPernoite ? 'Com Pernoite' : 'Sem Pernoite (50%)'}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-xs text-amber-900 font-medium">Valor Total da Diária:</div>
                <div className="text-2xl sm:text-3xl font-black text-amber-900 font-mono mt-0.5">
                  R$ {valorDiariaCalculado.toFixed(2).replace('.', ',')}
                </div>
              </div>
              <div className="text-right text-[11px] text-amber-700">
                <div>Alimentação inclusa</div>
                <div className="font-bold">Base SEFAZ/SEJU</div>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-200/60 text-[11px] text-amber-800 flex items-center gap-1.5 font-medium">
              <Sparkles size={13} className="text-amber-600" />
              <span>Gera comprovante oficial com código de barras pronto para empenho.</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
