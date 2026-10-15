import React, { useState } from 'react';
import { 
  Navigation, 
  Car, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Fuel, 
  Gauge, 
  QrCode, 
  Printer, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  X,
  FileCheck2,
  Check,
  Building2,
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
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 backdrop-blur-md animate-in fade-in">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 font-sans"
        onClick={e => e.stopPropagation()}
      >
        {/* TOPO: Cabeçalho com Stepper e Fechar */}
        <div className="bg-[#00385E] text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#002B49]">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider">
              <Sparkles size={14} className="animate-spin" /> EXPERIÊNCIA INTERATIVA 360° · SEJU/PR
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
              Simulador da Jornada de Missão Oficial
            </h2>
            <p className="text-xs text-blue-200 mt-0.5">
              Experimente em tempo real todo o ciclo: da rota no mapa ao despacho da Chefia e check-in no pátio.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white text-white hover:text-slate-900 flex items-center justify-center font-bold text-sm cursor-pointer transition self-end sm:self-auto shrink-0"
          >
            ✕
          </button>
        </div>

        {/* BARRA DE PROGRESSO / STEPPER DOS 5 PASSOS */}
        <div className="bg-slate-100 p-2.5 px-4 sm:px-6 border-b border-slate-200 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar text-xs">
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
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                  isAtivo 
                    ? 'bg-[#0072BB] text-white shadow-xs' 
                    : isConcluido 
                    ? 'text-emerald-700 bg-emerald-100/70' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  isAtivo ? 'bg-white text-[#0072BB]' : isConcluido ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isConcluido ? '✓' : s.num}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTEÚDO PRINCIPAL (ALTERNÂNCIA DE ETAPAS) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* ETAPA 1: O MAPA E A MISSÃO */}
          {etapa === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Lado Esquerdo: O Mapa SVG do Paraná com Rota Ativa */}
                <div className="lg:col-span-6 relative bg-linear-to-br from-slate-900 via-[#00385E] to-slate-900 rounded-3xl p-5 border border-slate-800 flex items-center justify-center min-h-[300px] overflow-hidden shadow-inner">
                  {/* Selo Radar */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 bg-black/50 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> RADAR DE VIAGEM ATIVO
                  </div>

                  <svg viewBox="0 0 100 100" className="w-full h-full max-h-[260px] select-none">
                    {/* Contorno do PR */}
                    <path
                      d="M 12,68 L 10,75 L 18,80 L 32,82 L 46,78 L 58,84 L 75,82 L 86,76 L 90,70 L 85,62 L 78,54 L 72,42 L 70,30 L 64,22 L 50,22 L 42,26 L 30,28 L 22,34 L 16,46 L 14,56 Z"
                      fill="#0F2B48"
                      stroke="#00AEEF"
                      strokeWidth="0.8"
                      strokeOpacity="0.6"
                    />

                    {/* Linha de rota traçada neon */}
                    <line
                      x1={curitibaCoord.x}
                      y1={curitibaCoord.y}
                      x2={missaoSel.coordenadas.x}
                      y2={missaoSel.coordenadas.y}
                      stroke="#34D399"
                      strokeWidth="1.8"
                      strokeDasharray="2,2"
                      className="animate-pulse"
                    />

                    {/* Ponto Curitiba */}
                    <circle cx={curitibaCoord.x} cy={curitibaCoord.y} r="2.2" fill="#00AEEF" stroke="#FFFFFF" strokeWidth="0.6" />
                    <text x={curitibaCoord.x} y={curitibaCoord.y - 3} textAnchor="middle" fill="#FFFFFF" fontSize="2.8" fontWeight="bold">Curitiba</text>

                    {/* Ponto Destino */}
                    <circle cx={missaoSel.coordenadas.x} cy={missaoSel.coordenadas.y} r="3.2" fill="#10B981" stroke="#FFFFFF" strokeWidth="0.8" className="animate-ping origin-center" />
                    <circle cx={missaoSel.coordenadas.x} cy={missaoSel.coordenadas.y} r="2.2" fill="#10B981" stroke="#FFFFFF" strokeWidth="0.6" />
                    <text x={missaoSel.coordenadas.x} y={missaoSel.coordenadas.y - 3} textAnchor="middle" fill="#34D399" fontSize="2.8" fontWeight="bold">{missaoSel.cidade}</text>
                  </svg>
                </div>

                {/* Lado Direito: Seleção das Missões */}
                <div className="lg:col-span-6 space-y-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Escolha o Polo Regional da Missão Oficial:
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
                          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                            isSel 
                              ? 'border-[#0072BB] bg-blue-50/70 shadow-xs ring-1 ring-[#0072BB]' 
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-slate-900">{m.cidade}</span>
                            <span className="text-[10px] font-mono font-bold text-[#0072BB] bg-white px-2 py-0.5 rounded border border-slate-200">
                              {m.km * 2} km (ida/volta)
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{m.motivo}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{m.rota}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Resumo da Telemetria */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Tempo</div>
                      <div className="font-bold text-slate-900 font-mono">{missaoSel.tempo}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Consumo</div>
                      <div className="font-bold text-[#0072BB] font-mono">{missaoSel.consumo}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Combustível</div>
                      <div className="font-bold text-emerald-700 font-mono">{missaoSel.custo}</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ETAPA 2: A VIATURA OFICIAL */}
          {etapa === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <h3 className="text-base font-black text-slate-900">
                  Seleção da Viatura Oficial no Pátio SEJU
                </h3>
                <p className="text-xs text-slate-500">
                  Para o trajeto até <strong>{missaoSel.cidade}</strong> ({missaoSel.km * 2} km ida e volta), selecione o veículo compatível com a delegação.
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
                      className={`p-4 rounded-3xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                        isSel 
                          ? 'border-[#0072BB] bg-blue-50/50 shadow-md ring-2 ring-blue-100' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <PlacaMercosul placa={v.placa} uf="PR" />
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            ● 100%
                          </span>
                        </div>
                        <h4 className="font-black text-xs text-slate-900 mt-2">{v.modelo}</h4>
                        <div className="text-[11px] text-slate-500 mt-0.5">Cor: {v.cor} · {v.capacidade} lugares</div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>Odômetro:</span>
                        <strong>{v.km.toLocaleString('pt-BR')} km</strong>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delegação Oficial a Bordo */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0072BB]/10 text-[#0072BB] flex items-center justify-center font-bold">
                    <Car size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Delegação Oficial Designada (3 Servidores)</div>
                    <div className="text-[11px] text-slate-500">Dra. Maria Helena (Gabinete), Carlos Silveira (Assistente) e Dra. Patrícia (Psicóloga)</div>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full self-start sm:self-auto">
                  ✓ Capacidade Respeitada ({veiculoSel.capacidade} assentos)
                </span>
              </div>
            </div>
          )}

          {/* ETAPA 3: O DESPACHO DA CHEFIA */}
          {etapa === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <h3 className="text-base font-black text-slate-900">
                  Despacho Eletrônico da Chefia de Gabinete
                </h3>
                <p className="text-xs text-slate-500">
                  Simulação do despacho eletrônico no smartphone institucional da autoridade competente.
                </p>
              </div>

              {/* Mockup do Smartphone Institucional */}
              <div className="max-w-md mx-auto bg-slate-900 rounded-3xl p-5 border-4 border-slate-800 shadow-2xl text-white space-y-4">
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Smartphone size={12} /> SISTEMA CORPORATIVO SEJU
                  </span>
                  <span>Notificação em Tempo Real</span>
                </div>

                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-[#0072BB] text-white px-2 py-0.5 rounded">
                      AG-20261015-4421
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      aprovado ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-amber-950 animate-pulse'
                    }`}>
                      {aprovado ? 'AUTORIZADO COM SUCESSO' : 'AGUARDANDO DESPACHO'}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="text-slate-300">Missão: <strong className="text-white">{missaoSel.motivo}</strong></div>
                    <div className="text-slate-300">Destino: <strong className="text-white">{missaoSel.cidade}</strong> ({missaoSel.km} km)</div>
                    <div className="text-slate-300">Veículo: <strong className="text-white">{veiculoSel.modelo} ({veiculoSel.placa})</strong></div>
                  </div>
                </div>

                {!aprovado ? (
                  <button
                    type="button"
                    onClick={handleAprovarChefia}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 size={18} /> Assinar & Aprovar Digitalmente (ICP-PR)
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-950/80 rounded-2xl border border-emerald-500/40 text-center space-y-1">
                    <div className="text-xs font-black text-emerald-400 flex items-center justify-center gap-1.5">
                      <ShieldCheck size={16} /> Assinatura Digital Verificada
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      Hash SHA-256: {hashGerado}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ETAPA 4: O PASSE DIGITAL NA CARTEIRA */}
          {etapa === 4 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <h3 className="text-base font-black text-slate-900">
                  Passe Oficial de Trânsito Digital (Apple Wallet)
                </h3>
                <p className="text-xs text-slate-500">
                  Emitido imediatamente após a aprovação da chefia para porte obrigatório e fiscalização rodoviária (BPRv/PRF).
                </p>
              </div>

              {/* O Passe Digital Estilo Apple Wallet */}
              <div className="max-w-md mx-auto bg-linear-to-b from-[#00385E] via-[#00538A] to-[#0072BB] text-white rounded-3xl p-6 shadow-2xl border border-blue-400/40 space-y-5">
                <div className="flex items-center justify-between text-[10px] font-mono tracking-widest uppercase text-blue-200 border-b border-white/15 pb-3">
                  <span>GOVERNO DO PARANÁ · SEJU</span>
                  <span className="font-extrabold text-emerald-300">DOCUMENTO OFICIAL</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-200">Veículo Autorizado</span>
                    <div className="font-extrabold text-sm text-white">{veiculoSel.modelo}</div>
                  </div>
                  <PlacaMercosul placa={veiculoSel.placa} uf="PR" />
                </div>

                <div className="p-3.5 bg-white/10 rounded-2xl border border-white/15 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Destino:</span>
                    <strong className="text-white">{missaoSel.cidade}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Ticket Oficial:</span>
                    <strong className="text-emerald-300 font-mono">AG-20261015-4421</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Autorizador:</span>
                    <strong className="text-white">Chefia de Gabinete SEJU</strong>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-white/15 text-[10px]">
                  <div className="flex items-center gap-1.5 text-blue-200">
                    <QrCode size={18} className="text-white" />
                    <span>QRCode de Validação na Estrada</span>
                  </div>
                  <span className="font-mono text-emerald-300 font-bold">SHA-256 VERIFICADO</span>
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 5: VISTORIA DIGITAL NO PÁTIO */}
          {etapa === 5 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <h3 className="text-base font-black text-slate-900">
                  Vistoria Fotográfica no Pátio & Saída Homologada
                </h3>
                <p className="text-xs text-slate-500">
                  Antes de deixar o pátio central da SEJU, o condutor confere odômetro, tanque e as 4 fotos obrigatórias.
                </p>
              </div>

              {/* As 4 Fotos da Vistoria */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-center">
                {[
                  { pos: 'Frente', img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=300&q=80' },
                  { pos: 'Traseira', img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=300&q=80' },
                  { pos: 'Lat. Direita', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=300&q=80' },
                  { pos: 'Lat. Esquerda', img: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=300&q=80' }
                ].map((f, i) => (
                  <div key={i} className="p-2 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                    <img src={f.img} alt={f.pos} className="w-full h-20 object-cover rounded-xl border border-slate-200" />
                    <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-700">
                      <CheckCircle2 size={12} /> {f.pos}
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Final de Liberação */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 max-w-xl mx-auto flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Check size={22} />
                  </div>
                  <div>
                    <div className="font-extrabold text-emerald-950">Viatura Oficial Liberada para Deslocamento</div>
                    <div className="text-[11px] text-emerald-800">Odômetro: {veiculoSel.km} km · Tanque: 100% · Vistoria gravada</div>
                  </div>
                </div>

                <span className="font-mono text-[10px] font-black text-emerald-900 bg-emerald-200/80 px-2.5 py-1 rounded-lg">
                  PORTÃO 1 ABERTO
                </span>
              </div>
            </div>
          )}

        </div>

        {/* RODAPÉ DO MODAL COM BOTÕES DE NAVEGAÇÃO */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={etapa === 1}
            onClick={() => {
              soundFX.playClick();
              setEtapa(prev => Math.max(1, prev - 1));
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              etapa === 1 
                ? 'opacity-40 cursor-not-allowed text-slate-400' 
                : 'text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 cursor-pointer'
            }`}
          >
            <ChevronLeft size={16} /> Voltar
          </button>

          <div className="text-xs font-mono text-slate-400 font-bold">
            Passo {etapa} de 5
          </div>

          {etapa < 5 ? (
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setEtapa(prev => Math.min(5, prev + 1));
              }}
              className="px-5 py-2.5 rounded-xl bg-[#0072BB] hover:bg-[#00538a] text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Avançar Etapa</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                soundFX.playSuccess();
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>Concluir Simulação</span>
              <CheckCircle2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
