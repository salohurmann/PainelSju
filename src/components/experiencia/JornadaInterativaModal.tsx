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
  DollarSign
} from 'lucide-react';
import { PlacaMercosul } from '../ui/PlacaMercosul';
import { soundFX } from '../../services/soundFx';
import confetti from 'canvas-confetti';

interface JornadaInterativaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateApp?: (appId: string) => void;
}

const MISSOES_PRESET = [
  {
    id: 'foz',
    cidade: 'Foz do Iguaçu',
    rota: 'BR-277 (Oeste / Fronteira)',
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
    rota: 'BR-376 / PR-445 (Norte do PR)',
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
    rota: 'BR-277 (Litoral do PR)',
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
    rota: 'BR-376 (Campos Gerais)',
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
    modelo: 'Toyota Corolla Sedan 2.0',
    placa: 'BCB-4A12',
    cor: 'Prata',
    capacidade: 5,
    km: 34210,
    tanque: 100
  },
  {
    id: 'v2',
    modelo: 'Chevrolet Spin 1.8 (7 Lugares)',
    placa: 'BCD-7G88',
    cor: 'Branco',
    capacidade: 7,
    km: 19840,
    tanque: 100
  },
  {
    id: 'v3',
    modelo: 'Renault Duster 4x4',
    placa: 'BCE-1K99',
    cor: 'Preto',
    capacidade: 5,
    km: 26150,
    tanque: 100
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
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 }
    });
    setAprovado(true);
    setHashGerado('d7a8f3b4c1e920584736291aeb082419cfa17b48329e41b9c7e012fa5b8d93c1');
  };

  const curitibaCoord = { x: 78, y: 72 };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white/98 backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl max-w-4xl w-full max-h-[92vh] sm:max-h-[90vh] shadow-[0_24px_70px_-15px_rgba(15,23,42,0.3),0_0_0_1px_rgba(15,23,42,0.08)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 font-sans"
        onClick={e => e.stopPropagation()}
      >
        {/* Indicador Mobile Bottom-Sheet */}
        <div className="pt-2.5 pb-1 sm:hidden flex justify-center bg-white">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* TOPO: Cabeçalho Clean Apple-Style */}
        <div className="bg-white px-5 py-4 sm:px-7 sm:py-5 flex items-start sm:items-center justify-between gap-4 border-b border-slate-200/80">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[#0072BB] bg-blue-50/90 border border-blue-200/60 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider">
              <Sparkles size={11} /> Experiência Interativa 360° · SEJU/PR
            </div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 mt-1.5">
              Simulador da Jornada de Missão Oficial
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Explore o fluxo ponta a ponta: roteirização, viatura, despacho digital e vistoria no pátio.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition shrink-0"
            title="Fechar tour"
          >
            <X size={16} />
          </button>
        </div>

        {/* BARRA DE PROGRESSO / STEPPER PILLS REFINADOS */}
        <div className="bg-slate-50/90 px-4 py-2.5 sm:px-7 border-b border-slate-200/75 flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {[
            { num: 1, label: 'Rota no Mapa' },
            { num: 2, label: 'Viatura Oficial' },
            { num: 3, label: 'Despacho da Chefia' },
            { num: 4, label: 'Passe Digital' },
            { num: 5, label: 'Vistoria no Pátio' }
          ].map(s => {
            const isAtivo = etapa === s.num;
            const isConcluido = etapa > s.num;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setEtapa(s.num);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isAtivo 
                    ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/90' 
                    : isConcluido 
                    ? 'text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100/70' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                  isAtivo 
                    ? 'bg-[#0072BB] text-white' 
                    : isConcluido 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-200/80 text-slate-600'
                }`}>
                  {isConcluido ? <Check size={11} strokeWidth={2.5} /> : s.num}
                </span>
                <span className="hidden sm:inline text-xs">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTEÚDO PRINCIPAL (ALTERNÂNCIA DE ETAPAS) */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6 bg-white">
          
          {/* ETAPA 1: O MAPA E A MISSÃO */}
          {etapa === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Lado Esquerdo: O Mapa SVG do Paraná com Rota Ativa */}
                <div className="lg:col-span-6 relative bg-linear-to-b from-slate-900 to-[#0B253C] rounded-2xl p-5 border border-slate-800/90 flex items-center justify-center min-h-[290px] overflow-hidden shadow-xs">
                  {/* Selo Radar */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 text-[10px] font-mono font-medium text-emerald-300 bg-slate-900/75 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ROTEIRIZADOR ATIVO
                  </div>

                  <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-[10px] text-slate-300 font-mono bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                    <span>Origem: Curitiba (SEJU)</span>
                    <span className="text-emerald-300 font-semibold">Destino: {missaoSel.cidade}</span>
                  </div>

                  <svg viewBox="0 0 100 100" className="w-full h-full max-h-[240px] select-none">
                    {/* Contorno do PR */}
                    <path
                      d="M 12,68 L 10,75 L 18,80 L 32,82 L 46,78 L 58,84 L 75,82 L 86,76 L 90,70 L 85,62 L 78,54 L 72,42 L 70,30 L 64,22 L 50,22 L 42,26 L 30,28 L 22,34 L 16,46 L 14,56 Z"
                      fill="#123456"
                      stroke="#38BDF8"
                      strokeWidth="0.7"
                      strokeOpacity="0.65"
                    />

                    {/* Linha de rota traçada */}
                    <line
                      x1={curitibaCoord.x}
                      y1={curitibaCoord.y}
                      x2={missaoSel.coordenadas.x}
                      y2={missaoSel.coordenadas.y}
                      stroke="#34D399"
                      strokeWidth="1.5"
                      strokeDasharray="2,2"
                    />

                    {/* Ponto Curitiba */}
                    <circle cx={curitibaCoord.x} cy={curitibaCoord.y} r="2.2" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="0.6" />
                    <text x={curitibaCoord.x} y={curitibaCoord.y - 3.2} textAnchor="middle" fill="#FFFFFF" fontSize="2.8" fontWeight="bold">Curitiba</text>

                    {/* Ponto Destino */}
                    <circle cx={missaoSel.coordenadas.x} cy={missaoSel.coordenadas.y} r="3.4" fill="#10B981" fillOpacity="0.3" />
                    <circle cx={missaoSel.coordenadas.x} cy={missaoSel.coordenadas.y} r="2.2" fill="#10B981" stroke="#FFFFFF" strokeWidth="0.6" />
                    <text x={missaoSel.coordenadas.x} y={missaoSel.coordenadas.y - 3.2} textAnchor="middle" fill="#6EE7B7" fontSize="2.8" fontWeight="bold">{missaoSel.cidade}</text>
                  </svg>
                </div>

                {/* Lado Direito: Seleção das Missões */}
                <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Selecione o Polo Regional da Missão
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
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                              isSel 
                                ? 'border-[#0072BB] bg-blue-50/40 shadow-2xs ring-2 ring-[#0072BB]/15' 
                                : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                <MapPin size={13} className={isSel ? 'text-[#0072BB]' : 'text-slate-400'} />
                                {m.cidade}
                              </span>
                              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${
                                isSel
                                  ? 'text-[#0072BB] bg-white border-[#0072BB]/25'
                                  : 'text-slate-600 bg-slate-50 border-slate-200/80'
                              }`}>
                                {m.km * 2} km (ida/volta)
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 mt-1 line-clamp-1">{m.motivo}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{m.rota}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Resumo da Telemetria */}
                  <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center justify-center gap-1">
                        <Clock size={11} /> Tempo
                      </div>
                      <div className="font-bold text-slate-900 font-mono mt-0.5">{missaoSel.tempo}</div>
                    </div>
                    <div className="border-x border-slate-200/70">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center justify-center gap-1">
                        <Fuel size={11} /> Consumo
                      </div>
                      <div className="font-bold text-[#0072BB] font-mono mt-0.5">{missaoSel.consumo}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center justify-center gap-1">
                        <DollarSign size={11} /> Estimado
                      </div>
                      <div className="font-bold text-emerald-700 font-mono mt-0.5">{missaoSel.custo}</div>
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
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Seleção da Viatura Oficial no Pátio SEJU
                </h3>
                <p className="text-xs text-slate-500">
                  Para o deslocamento até <strong className="text-slate-700">{missaoSel.cidade}</strong> ({missaoSel.km * 2} km ida e volta), escolha a viatura compatível com a equipe.
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
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                        isSel 
                          ? 'border-[#0072BB] bg-blue-50/30 shadow-xs ring-2 ring-[#0072BB]/15' 
                          : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <PlacaMercosul placa={v.placa} uf="PR" />
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                            Tanque 100%
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900">{v.modelo}</h4>
                        <div className="text-[11px] text-slate-500 mt-0.5">Cor {v.cor} · {v.capacidade} lugares</div>
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>Odômetro</span>
                        <strong className="text-slate-800">{v.km.toLocaleString('pt-BR')} km</strong>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delegação Oficial a Bordo */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 text-[#0072BB] flex items-center justify-center shadow-2xs shrink-0">
                    <Car size={19} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Delegação Oficial Designada (3 Servidores)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Dra. Maria Helena (Gabinete), Carlos Silveira (Assistente) e Dra. Patrícia (Psicóloga)</div>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-3 py-1 rounded-full self-start sm:self-auto shrink-0">
                  ✓ Capacidade compatível ({veiculoSel.capacidade} assentos)
                </span>
              </div>
            </div>
          )}

          {/* ETAPA 3: O DESPACHO DA CHEFIA */}
          {etapa === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Despacho Eletrônico da Chefia de Gabinete
                </h3>
                <p className="text-xs text-slate-500">
                  Deliberação em 1 clique no dispositivo institucional com assinatura criptográfica SHA-256.
                </p>
              </div>

              {/* Card Dispositivo Institucional Clean */}
              <div className="max-w-md mx-auto bg-white rounded-3xl p-5 border border-slate-200/90 shadow-lg space-y-4">
                <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-100 pb-3">
                  <span className="flex items-center gap-1.5 text-slate-800 font-semibold">
                    <Smartphone size={14} className="text-[#0072BB]" /> Central Mobile · Chefia SEJU
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Agora mesmo</span>
                </div>

                <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/75 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-semibold bg-white border border-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md">
                      AG-20261015-4421
                    </span>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      aprovado 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {aprovado ? 'Autorizado com Sucesso' : 'Aguardando Despacho'}
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5 text-slate-600">
                    <div>Missão: <strong className="text-slate-900 font-semibold">{missaoSel.motivo}</strong></div>
                    <div>Destino: <strong className="text-slate-900 font-semibold">{missaoSel.cidade}</strong> ({missaoSel.km} km)</div>
                    <div>Veículo: <strong className="text-slate-900 font-semibold">{veiculoSel.modelo} ({veiculoSel.placa})</strong></div>
                  </div>
                </div>

                {!aprovado ? (
                  <button
                    type="button"
                    onClick={handleAprovarChefia}
                    className="w-full py-3 bg-[#0072BB] hover:bg-[#005a96] text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 size={16} /> Assinar & Aprovar Digitalmente (ICP-PR)
                  </button>
                ) : (
                  <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 text-center space-y-1">
                    <div className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                      <ShieldCheck size={15} className="text-emerald-600" /> Assinatura Digital Selada no Cofre
                    </div>
                    <div className="text-[10px] text-emerald-700/80 font-mono truncate select-none">
                      Chave Oculta · ••••••••••••••••
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
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Passe Oficial de Trânsito Digital (Apple Wallet)
                </h3>
                <p className="text-xs text-slate-500">
                  Emitido instantaneamente após o despacho para porte do condutor e verificação rápida nas rodovias.
                </p>
              </div>

              {/* O Passe Digital Estilo Apple Wallet */}
              <div className="max-w-md mx-auto bg-linear-to-b from-[#0A2540] to-[#004C80] text-white rounded-3xl p-6 shadow-xl border border-white/15 space-y-5">
                <div className="flex items-center justify-between text-[10px] font-mono tracking-wider uppercase text-blue-200/90 border-b border-white/10 pb-3">
                  <span>GOVERNO DO PARANÁ · SEJU</span>
                  <span className="font-semibold text-emerald-300">PASSE DE MISSÃO</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-medium text-blue-200/80">Viatura Oficial</span>
                    <div className="font-bold text-sm text-white mt-0.5">{veiculoSel.modelo}</div>
                  </div>
                  <PlacaMercosul placa={veiculoSel.placa} uf="PR" />
                </div>

                <div className="p-3.5 bg-white/8 backdrop-blur-md rounded-2xl border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-blue-200/80">Destino</span>
                    <strong className="text-white font-semibold">{missaoSel.cidade}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200/80">Protocolo</span>
                    <strong className="text-emerald-300 font-mono">AG-20261015-4421</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200/80">Autoridade</span>
                    <strong className="text-white font-semibold">Chefia de Gabinete SEJU</strong>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-white/10 text-[10px]">
                  <div className="flex items-center gap-2 text-blue-100">
                    <div className="p-1.5 bg-white text-slate-900 rounded-lg">
                      <QrCode size={16} />
                    </div>
                    <span>Validação Offline / Rodoviária</span>
                  </div>
                  <span className="font-mono text-emerald-300 font-semibold">SHA-256 ATIVO</span>
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 5: VISTORIA DIGITAL NO PÁTIO */}
          {etapa === 5 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Vistoria Fotográfica no Pátio & Saída Homologada
                </h3>
                <p className="text-xs text-slate-500">
                  Registro pericial dos 4 ângulos, odômetro e combustível antes da abertura automática da cancela.
                </p>
              </div>

              {/* As 4 Fotos da Vistoria */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-2xl mx-auto text-center">
                {[
                  { pos: 'Frente', img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=300&q=80' },
                  { pos: 'Traseira', img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=300&q=80' },
                  { pos: 'Lat. Direita', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=300&q=80' },
                  { pos: 'Lat. Esquerda', img: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=300&q=80' }
                ].map((f, i) => (
                  <div key={i} className="p-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                    <img src={f.img} alt={f.pos} className="w-full h-24 object-cover rounded-xl border border-slate-100" />
                    <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-700 pb-0.5">
                      <CheckCircle2 size={13} className="text-emerald-600" /> {f.pos}
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Final de Liberação */}
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/90 max-w-xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                    <Check size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="font-bold text-emerald-950">Viatura Oficial Liberada para Deslocamento</div>
                    <div className="text-[11px] text-emerald-800/90 mt-0.5">Odômetro: {veiculoSel.km.toLocaleString('pt-BR')} km · Tanque: 100% · 4 fotos validadas</div>
                  </div>
                </div>

                <span className="font-mono text-[10px] font-bold text-emerald-800 bg-white border border-emerald-200 px-2.5 py-1 rounded-lg self-start sm:self-auto shrink-0">
                  PORTÃO 1 LIBERADO
                </span>
              </div>
            </div>
          )}

        </div>

        {/* RODAPÉ DO MODAL COM BOTÕES DE NAVEGAÇÃO */}
        <div className="px-5 py-3.5 sm:px-7 sm:py-4 bg-slate-50/90 border-t border-slate-200/80 flex items-center justify-between gap-3 pb-safe shrink-0">
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
            <ChevronLeft size={15} /> Anterior
          </button>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map(stepNum => (
              <span
                key={stepNum}
                className={`h-1.5 rounded-full transition-all ${
                  etapa === stepNum ? 'w-5 bg-[#0072BB]' : etapa > stepNum ? 'w-1.5 bg-emerald-500' : 'w-1.5 bg-slate-300'
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
              className="px-4 py-2 rounded-xl bg-[#0072BB] hover:bg-[#005a96] text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>Continuar</span>
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
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
