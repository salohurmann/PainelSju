import React, { useState } from 'react';
import { 
  Car, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Fuel, 
  QrCode, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  X,
  Check,
  DollarSign,
  Navigation,
  Camera,
  Lock,
  Gauge
} from 'lucide-react';
import { PlacaMercosul } from '../ui/PlacaMercosul';
import { soundFX } from '../../services/soundFx';

interface JornadaInterativaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateApp?: (appId: string) => void;
}

const MISSOES_PRESET = [
  {
    id: 'foz',
    cidade: 'Foz do Iguaçu',
    rota: 'BR-277 (Oeste / Tríplice Fronteira)',
    motivo: 'Vistoria técnica da unidade socioeducativa CENSE Foz',
    km: 637,
    tempo: '8h 15min',
    consumo: '60,6 L',
    custo: 'R$ 356,90',
    pedagios: 5,
    coordenadas: { x: 14, y: 74 }
  },
  {
    id: 'londrina',
    cidade: 'Londrina',
    rota: 'BR-376 / PR-445 (Norte Pioneiro / Metropolitana)',
    motivo: 'Atendimento do programa Cidadania nos Bairros',
    km: 388,
    tempo: '5h 00min',
    consumo: '36,9 L',
    custo: 'R$ 217,30',
    pedagios: 4,
    coordenadas: { x: 60, y: 28 }
  },
  {
    id: 'paranagua',
    cidade: 'Paranaguá',
    rota: 'BR-277 (Serra do Mar / Litoral do PR)',
    motivo: 'Inspeção portuária e direitos humanos na comarca',
    km: 91,
    tempo: '1h 20min',
    consumo: '8,6 L',
    custo: 'R$ 50,60',
    pedagios: 1,
    coordenadas: { x: 88, y: 73 }
  },
  {
    id: 'pontagrossa',
    cidade: 'Ponta Grossa',
    rota: 'BR-376 (Eixo Campos Gerais)',
    motivo: 'Capacitação regional dos Conselhos Tutelares',
    km: 114,
    tempo: '1h 45min',
    consumo: '10,8 L',
    custo: 'R$ 63,60',
    pedagios: 2,
    coordenadas: { x: 67, y: 64 }
  }
];

const VEICULOS_SIMULADOR = [
  {
    id: 'v1',
    codigo: 'BAIA-01',
    modelo: 'Toyota Corolla Sedan 2.0',
    placa: 'BCB-4A12',
    cor: 'Prata Metálico',
    capacidade: 5,
    km: 34210,
    tanque: 100,
    tracao: 'Executivo Sedan'
  },
  {
    id: 'v2',
    codigo: 'BAIA-04',
    modelo: 'Chevrolet Spin 1.8 (7 Lugares)',
    placa: 'BCD-7G88',
    cor: 'Branco Institucional',
    capacidade: 7,
    km: 19840,
    tanque: 100,
    tracao: 'Minivan Equipe'
  },
  {
    id: 'v3',
    codigo: 'BAIA-07',
    modelo: 'Renault Duster 4x4',
    placa: 'BCE-1K99',
    cor: 'Preto Tático',
    capacidade: 5,
    km: 26150,
    tanque: 100,
    tracao: 'SUV 4x4 AWD'
  }
];

export const JornadaInterativaModal: React.FC<JornadaInterativaModalProps> = ({
  isOpen,
  onClose,
  onNavigateApp
}) => {
  const [etapa, setEtapa] = useState<number>(1);
  const [missaoSel, setMissaoSel] = useState(MISSOES_PRESET[0]);
  const [veiculoSel, setVeiculoSel] = useState(VEICULOS_SIMULADOR[0]);
  const [aprovado, setAprovado] = useState(false);
  const [hashGerado, setHashGerado] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAprovarChefia = () => {
    soundFX.playSuccess();
    setAprovado(true);
    setHashGerado('d7a8f3b4c1e920584736291aeb082419cfa17b48329e41b9c7e012fa5b8d93c1');
  };

  const curitibaCoord = { x: 78, y: 72 };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/65 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative bg-white/98 rounded-t-3xl sm:rounded-3xl max-w-4xl w-full max-h-[92vh] sm:max-h-[90vh] border border-slate-200/90 shadow-[0_28px_80px_-15px_rgba(15,23,42,0.45),0_0_0_1px_rgba(255,255,255,0.9)_inset] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 font-sans"
        onClick={e => e.stopPropagation()}
      >
        {/* Brilho Especular Superior e Cantoneiras de Precisão no Modal */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0072BB]/70 to-transparent z-20" />
        <div className="pointer-events-none absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-[1.5px] border-l-[1.5px] border-[#0072BB]/45 rounded-tl-md z-20 hidden sm:block" />
        <div className="pointer-events-none absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-[1.5px] border-r-[1.5px] border-[#0072BB]/45 rounded-tr-md z-20 hidden sm:block" />

        {/* Indicador Mobile Bottom-Sheet */}
        <div className="pt-2.5 pb-1 sm:hidden flex justify-center bg-white">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* TOPO: Cabeçalho Cockpit Executivo */}
        <div className="relative bg-gradient-to-r from-white via-white to-slate-50/90 px-5 py-4 sm:px-7 sm:py-5 flex items-start sm:items-center justify-between gap-4 border-b border-slate-200/80">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 text-[#0072BB] bg-blue-50/95 border border-blue-200/70 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-2xs">
                <Sparkles size={11} /> Simulador 360° · Cockpit SEJU/PR
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                TELEMETRIA ATIVA
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-extrabold tracking-tight text-slate-900 mt-1.5">
              Jornada Digital de Missão Oficial
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Navegue pelos 5 estágios operacionais: roteirização tática, seleção de viatura, despacho ICP-PR, passe Apple Wallet e vistoria 4K.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-900 text-slate-500 hover:text-white border border-slate-200/80 flex items-center justify-center cursor-pointer transition-all shrink-0"
            title="Fechar simulador"
          >
            <X size={16} />
          </button>
        </div>

        {/* BARRA DE PROGRESSO / STEPPER ESTILO COCKPIT */}
        <div className="bg-slate-900 text-white px-4 py-3 sm:px-7 border-b border-slate-800 flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar text-xs relative">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
          {[
            { num: 1, code: '01', label: 'Rota no Mapa', sub: `${missaoSel.cidade}` },
            { num: 2, code: '02', label: 'Viatura Oficial', sub: veiculoSel.placa },
            { num: 3, code: '03', label: 'Despacho Chefia', sub: aprovado ? 'Assinado' : 'ICP-PR' },
            { num: 4, code: '04', label: 'Passe Digital', sub: 'Wallet QR' },
            { num: 5, code: '05', label: 'Vistoria Pátio', sub: '4 Câmeras' }
          ].map((s, idx) => {
            const isAtivo = etapa === s.num;
            const isConcluido = etapa > s.num;

            return (
              <React.Fragment key={s.num}>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setEtapa(s.num);
                  }}
                  className={`relative flex items-center gap-2.5 px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer border ${
                    isAtivo 
                      ? 'bg-gradient-to-r from-[#0072BB] to-blue-600 text-white border-blue-400/50 shadow-[0_0_20px_rgba(0,114,187,0.45)]' 
                      : isConcluido 
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25' 
                      : 'bg-slate-800/70 text-slate-400 border-slate-700/70 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-extrabold transition-colors ${
                    isAtivo 
                      ? 'bg-white text-[#0072BB]' 
                      : isConcluido 
                      ? 'bg-emerald-500 text-slate-950' 
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {isConcluido ? <Check size={11} strokeWidth={3} /> : s.code}
                  </span>
                  <div className="text-left hidden sm:block">
                    <div className="text-[11px] font-bold leading-none">{s.label}</div>
                    <div className={`text-[9px] font-mono mt-0.5 leading-none ${
                      isAtivo ? 'text-blue-100' : isConcluido ? 'text-emerald-400/80' : 'text-slate-500'
                    }`}>
                      {s.sub}
                    </div>
                  </div>
                </button>
                {idx < 4 && (
                  <div className={`hidden md:block h-px w-4 shrink-0 transition-colors ${
                    etapa > s.num ? 'bg-emerald-500/60' : 'bg-slate-700'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* CONTEÚDO PRINCIPAL (ALTERNÂNCIA DE ETAPAS) */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6 bg-gradient-to-b from-white to-slate-50/50">
          
          {/* ETAPA 1: O MAPA E A MISSÃO */}
          {etapa === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Lado Esquerdo: O Mapa Tático SVG do Paraná com Rota Ativa */}
                <div className="lg:col-span-6 relative bg-gradient-to-b from-slate-950 via-[#071A2C] to-[#0B253C] rounded-2xl p-5 border border-slate-800 flex items-center justify-center min-h-[300px] overflow-hidden shadow-md">
                  {/* Malha de Coordenadas */}
                  <div 
                    className="pointer-events-none absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: 'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
                      backgroundSize: '24px 24px'
                    }}
                  />

                  {/* HUD Superior */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-300 bg-slate-900/80 px-2.5 py-1 rounded-full border border-emerald-400/25">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      SAT-PR · ROTEIRIZADOR ATIVO
                    </div>
                    <div className="text-[10px] font-mono text-cyan-300 bg-slate-900/80 px-2.5 py-1 rounded-full border border-cyan-400/20">
                      {missaoSel.pedagios} PEDÁGIOS
                    </div>
                  </div>

                  {/* HUD Inferior */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] text-slate-300 font-mono bg-slate-900/80 px-3.5 py-2 rounded-xl border border-white/10 z-10">
                    <span className="flex items-center gap-1.5">
                      <Navigation size={11} className="text-sky-400" />
                      Origem: <strong className="text-white">Curitiba</strong>
                    </span>
                    <span className="text-emerald-300 font-bold">
                      Destino: {missaoSel.cidade} ({missaoSel.km} km)
                    </span>
                  </div>

                  <svg viewBox="0 0 100 100" className="w-full h-full max-h-[240px] select-none relative z-0">
                    {/* Contorno do PR com Glow */}
                    <path
                      d="M 12,68 L 10,75 L 18,80 L 32,82 L 46,78 L 58,84 L 75,82 L 86,76 L 90,70 L 85,62 L 78,54 L 72,42 L 70,30 L 64,22 L 50,22 L 42,26 L 30,28 L 22,34 L 16,46 L 14,56 Z"
                      fill="#0F2D4A"
                      stroke="#38BDF8"
                      strokeWidth="0.8"
                      strokeOpacity="0.8"
                    />

                    {/* Feixe Luminoso de Fundo da Rota */}
                    <line
                      x1={curitibaCoord.x}
                      y1={curitibaCoord.y}
                      x2={missaoSel.coordenadas.x}
                      y2={missaoSel.coordenadas.y}
                      stroke="#10B981"
                      strokeWidth="3"
                      strokeOpacity="0.25"
                    />

                    {/* Linha de rota tracejada de precisão */}
                    <line
                      x1={curitibaCoord.x}
                      y1={curitibaCoord.y}
                      x2={missaoSel.coordenadas.x}
                      y2={missaoSel.coordenadas.y}
                      stroke="#34D399"
                      strokeWidth="1.4"
                      strokeDasharray="2,1.5"
                    />

                    {/* Ponto Curitiba */}
                    <circle cx={curitibaCoord.x} cy={curitibaCoord.y} r="3.5" fill="#38BDF8" fillOpacity="0.25" />
                    <circle cx={curitibaCoord.x} cy={curitibaCoord.y} r="2.2" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="0.6" />
                    <text x={curitibaCoord.x} y={curitibaCoord.y - 3.5} textAnchor="middle" fill="#FFFFFF" fontSize="2.8" fontWeight="bold">Curitiba</text>

                    {/* Ponto Destino */}
                    <circle cx={missaoSel.coordenadas.x} cy={missaoSel.coordenadas.y} r="4.2" fill="#10B981" fillOpacity="0.3" />
                    <circle cx={missaoSel.coordenadas.x} cy={missaoSel.coordenadas.y} r="2.3" fill="#10B981" stroke="#FFFFFF" strokeWidth="0.6" />
                    <text x={missaoSel.coordenadas.x} y={missaoSel.coordenadas.y - 3.6} textAnchor="middle" fill="#6EE7B7" fontSize="2.9" fontWeight="bold">{missaoSel.cidade}</text>
                  </svg>
                </div>

                {/* Lado Direito: Seleção das Missões */}
                <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Selecione o Polo Regional da Missão
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">4 ROTAS HOMOLOGADAS</span>
                    </div>

                    <div className="space-y-2">
                      {MISSOES_PRESET.map(m => {
                        const isSel = missaoSel.id === m.id;
                        return (
                          <div
                            key={m.id}
                            onClick={() => {
                              soundFX.playClick();
                              setMissaoSel(m);
                            }}
                            className={`relative overflow-hidden p-3.5 rounded-2xl border transition-all cursor-pointer ${
                              isSel 
                                ? 'border-[#0072BB] bg-gradient-to-r from-blue-50/70 via-white to-emerald-50/30 shadow-xs ring-2 ring-[#0072BB]/15' 
                                : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                            }`}
                          >
                            {isSel && (
                              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0072BB]/50 to-transparent" />
                            )}
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                                <MapPin size={13} className={isSel ? 'text-[#0072BB]' : 'text-slate-400'} />
                                {m.cidade}
                              </span>
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                                isSel
                                  ? 'text-[#0072BB] bg-white border-[#0072BB]/30 shadow-2xs'
                                  : 'text-slate-600 bg-slate-50 border-slate-200/80'
                              }`}>
                                {m.km * 2} km (ida/volta)
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 mt-1 line-clamp-1 font-medium">{m.motivo}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{m.rota}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mostrador de Telemetria da Rota */}
                  <div className="relative overflow-hidden p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs shadow-xs">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
                    <div>
                      <div className="text-[9px] text-slate-400 font-mono font-semibold uppercase flex items-center justify-center gap-1">
                        <Clock size={11} className="text-sky-400" /> Tempo
                      </div>
                      <div className="font-extrabold text-white font-mono mt-0.5">{missaoSel.tempo}</div>
                    </div>
                    <div className="border-x border-slate-800">
                      <div className="text-[9px] text-slate-400 font-mono font-semibold uppercase flex items-center justify-center gap-1">
                        <Fuel size={11} className="text-amber-400" /> Consumo
                      </div>
                      <div className="font-extrabold text-amber-300 font-mono mt-0.5">{missaoSel.consumo}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 font-mono font-semibold uppercase flex items-center justify-center gap-1">
                        <DollarSign size={11} className="text-emerald-400" /> Estimado
                      </div>
                      <div className="font-extrabold text-emerald-400 font-mono mt-0.5">{missaoSel.custo}</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ETAPA 2: A VIATURA OFICIAL */}
          {etapa === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Seleção da Viatura Oficial no Pátio SEJU
                </h3>
                <p className="text-xs text-slate-500">
                  Para o deslocamento até <strong className="text-slate-800">{missaoSel.cidade}</strong> ({missaoSel.km * 2} km ida e volta), selecione a viatura homologada na baia:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {VEICULOS_SIMULADOR.map(v => {
                  const isSel = veiculoSel.id === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => {
                        soundFX.playClick();
                        setVeiculoSel(v);
                      }}
                      className={`relative overflow-hidden p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                        isSel 
                          ? 'border-[#0072BB] bg-gradient-to-b from-blue-50/50 to-white shadow-md ring-2 ring-[#0072BB]/20' 
                          : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/40'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80">
                            {v.codigo}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                            ● PRONTA
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <PlacaMercosul placa={v.placa} uf="PR" />
                        </div>

                        <div>
                          <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">{v.modelo}</h4>
                          <div className="text-[11px] text-slate-500 mt-0.5">{v.cor} · {v.capacidade} lugares</div>
                        </div>

                        {/* Barra de Combustível e Telemetria */}
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-slate-500">TANQUE CHEIO</span>
                            <span className="font-bold text-emerald-600">{v.tanque}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div className="h-full w-full rounded-full bg-gradient-to-r from-[#0072BB] to-emerald-500" />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Gauge size={12} className="text-[#0072BB]" /> Odômetro
                        </span>
                        <strong className="text-slate-900">{v.km.toLocaleString('pt-BR')} km</strong>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delegação Oficial a Bordo */}
              <div className="relative overflow-hidden p-4 bg-gradient-to-r from-slate-50 via-white to-emerald-50/40 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0072BB] text-white flex items-center justify-center shadow-xs shrink-0">
                    <Car size={19} />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900">Delegação Oficial Designada (3 Servidores)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Dra. Maria Helena (Gabinete), Carlos Silveira (Assistente) e Dra. Patrícia (Psicóloga)</div>
                  </div>
                </div>

                <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full self-start sm:self-auto shrink-0">
                  ✓ CAPACIDADE OK ({veiculoSel.capacidade} ASSENTOS)
                </span>
              </div>
            </div>
          )}

          {/* ETAPA 3: O DESPACHO DA CHEFIA */}
          {etapa === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Despacho Eletrônico da Chefia de Gabinete
                </h3>
                <p className="text-xs text-slate-500">
                  Deliberação em 1 clique no dispositivo institucional com assinatura criptográfica ICP-PR / SHA-256.
                </p>
              </div>

              {/* Card Dispositivo Institucional Cockpit */}
              <div className="relative overflow-hidden max-w-md mx-auto bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-md space-y-4">
                <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-100 pb-3">
                  <span className="flex items-center gap-1.5 text-slate-900 font-extrabold">
                    <Smartphone size={14} className="text-[#0072BB]" /> Central Mobile · Chefia SEJU
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/70">
                    CANAL SEGURO TLS 1.3
                  </span>
                </div>

                <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-white border border-slate-200/90 text-slate-800 px-2.5 py-0.5 rounded-md shadow-2xs">
                      AG-20261015-4421
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      aprovado 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {aprovado ? '● AUTORIZADO ICP-PR' : '● AGUARDANDO DESPACHO'}
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5 text-slate-600 pt-1">
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400">Missão:</span>
                      <strong className="text-slate-900 font-semibold text-right">{missaoSel.motivo}</strong>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400">Destino:</span>
                      <strong className="text-slate-900 font-semibold">{missaoSel.cidade} ({missaoSel.km} km)</strong>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400">Viatura:</span>
                      <strong className="text-slate-900 font-mono font-bold">{veiculoSel.modelo} ({veiculoSel.placa})</strong>
                    </div>
                  </div>
                </div>

                {!aprovado ? (
                  <button
                    type="button"
                    onClick={handleAprovarChefia}
                    className="w-full py-3.5 bg-gradient-to-r from-[#0072BB] to-[#005a96] hover:from-[#005a96] hover:to-[#004475] text-white font-bold text-xs rounded-xl shadow-[0_8px_20px_-4px_rgba(0,114,187,0.45)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <CheckCircle2 size={16} /> Assinar & Aprovar Digitalmente (ICP-PR)
                  </button>
                ) : (
                  <div className="relative overflow-hidden p-4 bg-slate-950 text-white rounded-2xl border border-emerald-500/40 space-y-1.5">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />
                    <div className="text-xs font-extrabold text-emerald-300 flex items-center justify-center gap-1.5">
                      <ShieldCheck size={15} className="text-emerald-400" /> Assinatura Digital Selada no Cofre
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono text-center truncate select-none flex items-center justify-center gap-1.5">
                      <Lock size={11} className="text-emerald-400" />
                      <span>SHA-256 · {hashGerado ? `${hashGerado.slice(0, 12)}••••••••••••` : '••••••••••••••••'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ETAPA 4: O PASSE DIGITAL NA CARTEIRA */}
          {etapa === 4 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Passe Oficial de Trânsito Digital (Apple Wallet)
                </h3>
                <p className="text-xs text-slate-500">
                  Credencial criptográfica emitida instantaneamente para porte do condutor e fiscalização rodoviária.
                </p>
              </div>

              {/* O Passe Digital Estilo Apple Wallet com Cantoneiras Luminosas */}
              <div className="relative overflow-hidden max-w-md mx-auto bg-gradient-to-br from-slate-950 via-[#0A2540] to-[#004C80] text-white rounded-3xl p-6 shadow-[0_24px_50px_-12px_rgba(10,37,64,0.65)] border border-cyan-400/30 space-y-5">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent" />
                <div className="pointer-events-none absolute top-3 left-3 w-3 h-3 border-t-[1.5px] border-l-[1.5px] border-cyan-300/60 rounded-tl" />
                <div className="pointer-events-none absolute top-3 right-3 w-3 h-3 border-t-[1.5px] border-r-[1.5px] border-cyan-300/60 rounded-tr" />
                <div className="pointer-events-none absolute bottom-3 left-3 w-3 h-3 border-b-[1.5px] border-l-[1.5px] border-emerald-400/60 rounded-bl" />
                <div className="pointer-events-none absolute bottom-3 right-3 w-3 h-3 border-b-[1.5px] border-r-[1.5px] border-emerald-400/60 rounded-br" />

                <div className="flex items-center justify-between text-[10px] font-mono tracking-wider uppercase text-blue-200/90 border-b border-white/10 pb-3">
                  <span>GOVERNO DO PARANÁ · SEJU</span>
                  <span className="font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                    PASSE OFICIAL
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-cyan-200/80">Viatura Designada</span>
                    <div className="font-extrabold text-sm sm:text-base text-white mt-0.5">{veiculoSel.modelo}</div>
                  </div>
                  <PlacaMercosul placa={veiculoSel.placa} uf="PR" />
                </div>

                <div className="p-3.5 bg-white/8 rounded-2xl border border-white/15 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-blue-200/80">Destino Oficial</span>
                    <strong className="text-white font-bold">{missaoSel.cidade} ({missaoSel.rota.split(' ')[0]})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200/80">Protocolo Digital</span>
                    <strong className="text-emerald-300 font-mono">AG-20261015-4421</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200/80">Autoridade Emissora</span>
                    <strong className="text-white font-semibold">Chefia de Gabinete SEJU</strong>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-white/10 text-[10px]">
                  <div className="flex items-center gap-2.5 text-blue-100">
                    <div className="relative p-2 bg-white text-slate-900 rounded-xl shadow-md">
                      <QrCode size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-white text-[11px]">Validação Offline / Rodoviária</div>
                      <div className="text-[9px] font-mono text-cyan-200/80">Leitura óptica instantânea</div>
                    </div>
                  </div>
                  <span className="font-mono text-emerald-300 font-bold bg-emerald-500/15 border border-emerald-400/30 px-2 py-1 rounded-lg">
                    SHA-256 ATIVO
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 5: VISTORIA DIGITAL NO PÁTIO */}
          {etapa === 5 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Vistoria Fotográfica Pericial & Saída Homologada
                </h3>
                <p className="text-xs text-slate-500">
                  Registro óptico dos 4 ângulos da viatura, odômetro e combustível antes da abertura automática da cancela.
                </p>
              </div>

              {/* As 4 Câmeras da Vistoria com Visor Técnico */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-2xl mx-auto text-center">
                {[
                  { cam: 'CAM-01', pos: 'Frente', img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=300&q=80' },
                  { cam: 'CAM-02', pos: 'Traseira', img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=300&q=80' },
                  { cam: 'CAM-03', pos: 'Lat. Direita', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=300&q=80' },
                  { cam: 'CAM-04', pos: 'Lat. Esquerda', img: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=300&q=80' }
                ].map((f, i) => (
                  <div key={i} className="group relative p-2 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                    <div className="relative overflow-hidden rounded-xl border border-slate-100">
                      <img src={f.img} alt={f.pos} className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-1.5 left-1.5 bg-slate-950/75 text-emerald-300 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Camera size={9} /> {f.cam}
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-800 pb-0.5">
                      <CheckCircle2 size={13} className="text-emerald-600" /> {f.pos}
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Final de Liberação da Cancela */}
              <div className="relative overflow-hidden p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-2xl border border-emerald-500/40 max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] shrink-0">
                    <Check size={20} strokeWidth={3} />
                  </div>
                  <div>
                    <div className="font-extrabold text-white text-xs sm:text-sm">
                      Viatura Oficial Homologada para Saída Imediata
                    </div>
                    <div className="text-[11px] text-emerald-300/90 font-mono mt-0.5">
                      Odômetro: {veiculoSel.km.toLocaleString('pt-BR')} km · Tanque: 100% · 4 fotos 4K validadas
                    </div>
                  </div>
                </div>

                <span className="font-mono text-[10px] font-extrabold text-emerald-300 bg-emerald-500/15 border border-emerald-400/40 px-3 py-1.5 rounded-xl self-start sm:self-auto shrink-0">
                  ● PORTÃO 1 ABERTO
                </span>
              </div>
            </div>
          )}

        </div>

        {/* RODAPÉ DO MODAL COM BOTÕES DE NAVEGAÇÃO COCKPIT */}
        <div className="px-5 py-3.5 sm:px-7 sm:py-4 bg-slate-50/95 border-t border-slate-200/80 flex items-center justify-between gap-3 pb-safe shrink-0">
          <button
            type="button"
            disabled={etapa === 1}
            onClick={() => {
              soundFX.playClick();
              setEtapa(prev => Math.max(1, prev - 1));
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              etapa === 1 
                ? 'opacity-40 cursor-not-allowed text-slate-400' 
                : 'text-slate-700 bg-white hover:bg-slate-100 border border-slate-200/90 shadow-2xs cursor-pointer'
            }`}
          >
            <ChevronLeft size={15} /> Etapa Anterior
          </button>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map(stepNum => (
              <span
                key={stepNum}
                className={`h-1.5 rounded-full transition-all ${
                  etapa === stepNum ? 'w-6 bg-[#0072BB]' : etapa > stepNum ? 'w-2 bg-emerald-500' : 'w-1.5 bg-slate-300'
                }`}
              />
            ))}
          </div>

          {etapa < 5 ? (
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setEtapa(prev => Math.min(5, prev + 1));
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-[#0072BB] text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Avançar Etapa</span>
              <ChevronRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                soundFX.playSuccess();
                void onNavigateApp;
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_6px_16px_-4px_rgba(16,185,129,0.5)]"
            >
              <span>Concluir Simulação</span>
              <CheckCircle2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
