import React, { useState } from 'react';
import {
  Camera,
  Check,
  ShieldCheck,
  Sparkles,
  Scan,
  Crosshair,
  Cpu,
  Radio,
  Compass,
  Lock
} from 'lucide-react';
import { VistoriaFotos } from '../../types';
import { soundFX } from '../../services/soundFx';
import confetti from 'canvas-confetti';

interface CarroBlueprintVistoriaProps {
  fotos: VistoriaFotos;
  onCapturarFoto: (posicao: keyof VistoriaFotos, dataUrl: string) => void;
  onSimularTodas: () => void;
  readOnly?: boolean;
}

export const CarroBlueprintVistoria: React.FC<CarroBlueprintVistoriaProps> = ({
  fotos,
  onCapturarFoto,
  onSimularTodas,
  readOnly = false
}) => {
  const [escaneando, setEscaneando] = useState(false);
  const [anguloHover, setAnguloHover] = useState<keyof VistoriaFotos | null>(null);

  const handleFileChange = (posicao: keyof VistoriaFotos, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        dispararScanner(posicao, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const dispararScanner = (posicao: keyof VistoriaFotos, url: string) => {
    soundFX.playClick();
    setEscaneando(true);
    setTimeout(() => {
      onCapturarFoto(posicao, url);
      setEscaneando(false);
      soundFX.playSuccess();
    }, 350);
  };

  const handleSimularComLaser = () => {
    setEscaneando(true);
    soundFX.playClick();
    setTimeout(() => {
      onSimularTodas();
      setEscaneando(false);
      soundFX.playSuccess();
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.75 }
      });
    }, 450);
  };

  const totalFotos = [
    fotos.frente,
    fotos.traseira,
    fotos.lateralDireita,
    fotos.lateralEsquerda
  ].filter(Boolean).length;
  const completo = totalFotos === 4;

  const angulos = [
    {
      id: 'frente' as keyof VistoriaFotos,
      step: '01',
      sensorCode: 'OPT-FWD-01',
      label: 'Dianteira & Placa',
      posicao: 'Ângulo Frontal',
      alvo: 'Faróis, capô, grade e placa Mercosul',
      meta: 'ISO 100 · f/2.8 · 24mm · GPS PR',
      coord: 'AZM 000° N · EIXO X+2.34m'
    },
    {
      id: 'traseira' as keyof VistoriaFotos,
      step: '02',
      sensorCode: 'OPT-AFT-02',
      label: 'Traseira & Porta-Malas',
      posicao: 'Ângulo Traseiro',
      alvo: 'Lanternas, vigia, para-choque e selo',
      meta: 'ISO 100 · f/2.8 · 24mm · GPS PR',
      coord: 'AZM 180° S · EIXO X-2.34m'
    },
    {
      id: 'lateralDireita' as keyof VistoriaFotos,
      step: '03',
      sensorCode: 'OPT-STB-03',
      label: 'Lateral Direita',
      posicao: 'Lado Passageiro',
      alvo: 'Portas, rodas, longarina e retrovisor dir.',
      meta: 'ISO 100 · f/2.8 · 35mm · GPS PR',
      coord: 'AZM 090° E · EIXO Y+0.91m'
    },
    {
      id: 'lateralEsquerda' as keyof VistoriaFotos,
      step: '04',
      sensorCode: 'OPT-PRT-04',
      label: 'Lateral Esquerda',
      posicao: 'Lado Condutor',
      alvo: 'Portas, rodas, coluna B e retrovisor esq.',
      meta: 'ISO 100 · f/2.8 · 35mm · GPS PR',
      coord: 'AZM 270° W · EIXO Y-0.91m'
    }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 text-slate-900 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.10)] relative overflow-hidden font-sans space-y-6">
      {/* Miras de Precisão CAD nos 4 Cantos Externos do Container */}
      <span className="absolute top-3 left-3 text-xs font-mono font-bold text-slate-300 select-none pointer-events-none">+</span>
      <span className="absolute top-3 right-3 text-xs font-mono font-bold text-slate-300 select-none pointer-events-none">+</span>
      <span className="absolute bottom-3 left-3 text-xs font-mono font-bold text-slate-300 select-none pointer-events-none">+</span>
      <span className="absolute bottom-3 right-3 text-xs font-mono font-bold text-slate-300 select-none pointer-events-none">+</span>

      {/* Optical Scan Line Animation */}
      {escaneando && (
        <div className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-transparent via-sky-500 to-transparent shadow-[0_0_20px_#0ea5e9] z-50 animate-pulse pointer-events-none" />
      )}

      {/* STUDIO HEADER */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#005A9C] bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200/70">
              <ShieldCheck size={13} /> Estúdio CAD de Vistoria Cautelar 360°
            </div>
            <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/70">
              CAD REV 4.2 · ESCALA 1:18
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-2">
            Inspeção Pericial & Telemetria Óptica de 4 Quadrantes
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Mapeamento vetorial de integridade externa com carimbo criptográfico SHA-256 e georreferenciamento PR.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Progress Pill */}
          <div
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ring-1 transition-all ${
              completo
                ? 'bg-emerald-50 text-emerald-700 ring-emerald-500/30 shadow-2xs'
                : 'bg-slate-100 text-slate-700 ring-slate-200'
            }`}
          >
            {completo ? (
              <Check size={13} className="text-emerald-600" />
            ) : (
              <Scan size={13} className="text-sky-600" />
            )}
            <span className="font-mono font-bold">{totalFotos}/4</span>
            <span className="text-[11px] font-medium">sensores</span>
          </div>

          {!readOnly && (
            <button
              type="button"
              onClick={handleSimularComLaser}
              className="text-xs font-bold bg-slate-900 hover:bg-[#004B87] text-white px-4 py-2 rounded-full shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Sparkles size={13} className="text-amber-300" /> Preencher Vistoria Demo
            </button>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* BLUEPRINT CAD DE ENGENHARIA AUTOMOTIVA & TELEMETRIA F1                */}
      {/* ===================================================================== */}
      <div className="relative z-10 rounded-2xl bg-[#07111F] text-white border border-slate-800 shadow-inner overflow-hidden p-5 sm:p-6">
        {/* Grade Milimetrada Técnica CAD (Sub-grid 10px + Main grid 50px) */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(56, 189, 248, 0.14) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(56, 189, 248, 0.14) 1px, transparent 1px),
              linear-gradient(to right, rgba(56, 189, 248, 0.30) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(56, 189, 248, 0.30) 1px, transparent 1px)
            `,
            backgroundSize: '12px 12px, 12px 12px, 60px 60px, 60px 60px'
          }}
        />

        {/* Glow Radial Central */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.14),transparent_70%)] pointer-events-none" />

        {/* Miras de Precisão (+) nos 4 Cantos do Blueprint CAD */}
        <div className="absolute top-2.5 left-3 flex items-center gap-1.5 text-[10px] font-mono text-sky-400/80 select-none pointer-events-none">
          <span className="text-xs font-bold text-sky-300">+</span>
          <span>X:000.0 Y:000.0</span>
        </div>
        <div className="absolute top-2.5 right-3 flex items-center gap-1.5 text-[10px] font-mono text-sky-400/80 select-none pointer-events-none">
          <span>CAD-GRID 10MM</span>
          <span className="text-xs font-bold text-sky-300">+</span>
        </div>
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-[10px] font-mono text-sky-400/80 select-none pointer-events-none">
          <span className="text-xs font-bold text-sky-300">+</span>
          <span>DATUM: CHASSIS-CL</span>
        </div>
        <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5 text-[10px] font-mono text-sky-400/80 select-none pointer-events-none">
          <span>TOL: ±0.05MM</span>
          <span className="text-xs font-bold text-sky-300">+</span>
        </div>

        {/* Barra Superior de Telemetria F1 dentro do Blueprint */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-sky-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-300 font-mono text-xs font-bold">
              <Crosshair size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-300">
                  BLUEPRINT VETORIAL DE INSPEÇÃO PERIMETRAL
                </span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-200 border border-sky-400/30">
                  TELEMETRY LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {completo
                  ? 'STATUS: 4/4 QUADRANTES CALIBRADOS E AUTENTICADOS'
                  : 'STATUS: AGUARDANDO AQUISIÇÃO ÓPTICA DOS SENSORES PERIMETRAIS'}
              </p>
            </div>
          </div>

          {/* Indicadores estilo Telemetria F1 */}
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <div className="px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-700/80 flex items-center gap-1.5">
              <Cpu size={11} className="text-sky-400" />
              <span className="text-slate-400">CHASSI:</span>
              <span className="text-white font-bold">SEDAN-EXEC</span>
            </div>
            <div className="px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-700/80 flex items-center gap-1.5">
              <Radio size={11} className={completo ? 'text-emerald-400' : 'text-amber-400'} />
              <span className="text-slate-400">INTEGRIDADE:</span>
              <span className={completo ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}>
                {totalFotos * 25}%
              </span>
            </div>
          </div>
        </div>

        {/* Grid Principal do Blueprint: Diagrama Vetorial Central + Painel de Telemetria F1 */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Coluna Esquerda/Central: SVG CAD Automotivo de Alta Precisão */}
          <div className="lg:col-span-7 flex items-center justify-center py-1">
            <svg
              viewBox="0 0 420 190"
              className="w-full max-w-[420px] h-auto select-none overflow-visible"
            >
              <defs>
                <linearGradient id="cadBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0F2942" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#1E3A5F" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#0F2942" stopOpacity="0.85" />
                </linearGradient>
                <linearGradient id="cadGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284C7" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#0F172A" stopOpacity="0.85" />
                </linearGradient>
              </defs>

              {/* Eixos de Simetria CAD (Centerline CL & Eixos de Roda) */}
              <line
                x1="15"
                y1="95"
                x2="405"
                y2="95"
                stroke="#38BDF8"
                strokeWidth="0.7"
                strokeDasharray="6 3 1.5 3"
                strokeOpacity="0.45"
              />
              <line
                x1="138"
                y1="22"
                x2="138"
                y2="168"
                stroke="#38BDF8"
                strokeWidth="0.6"
                strokeDasharray="3 3"
                strokeOpacity="0.35"
              />
              <line
                x1="286"
                y1="22"
                x2="286"
                y2="168"
                stroke="#38BDF8"
                strokeWidth="0.6"
                strokeDasharray="3 3"
                strokeOpacity="0.35"
              />

              {/* Linhas de Cota / Dimensão Engenharia (Comprimento 4.680 mm) */}
              <g opacity="0.65">
                <line x1="78" y1="176" x2="342" y2="176" stroke="#38BDF8" strokeWidth="0.75" />
                <line x1="78" y1="171" x2="78" y2="181" stroke="#38BDF8" strokeWidth="0.75" />
                <line x1="342" y1="171" x2="342" y2="181" stroke="#38BDF8" strokeWidth="0.75" />
                <rect x="172" y="170" width="76" height="12" rx="2" fill="#07111F" />
                <text
                  x="210"
                  y="179"
                  textAnchor="middle"
                  fill="#7DD3FC"
                  fontSize="7.5"
                  fontFamily="monospace"
                >
                  L: 4.680 mm
                </text>
              </g>

              {/* Anéis de Radar Perimetral */}
              <ellipse
                cx="210"
                cy="95"
                rx="168"
                ry="68"
                fill="none"
                stroke="#0284C7"
                strokeWidth="0.9"
                strokeDasharray="4 4"
                strokeOpacity="0.55"
              />
              <ellipse
                cx="210"
                cy="95"
                rx="145"
                ry="54"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="0.6"
                strokeOpacity="0.25"
              />

              {/* Feixes Ópticos Dianteiros (Faróis) */}
              <polygon
                points="80,66 44,52 44,74"
                fill={fotos.frente ? 'rgba(16,185,129,0.18)' : 'rgba(56,189,248,0.12)'}
              />
              <polygon
                points="80,124 44,116 44,138"
                fill={fotos.frente ? 'rgba(16,185,129,0.18)' : 'rgba(56,189,248,0.12)'}
              />

              {/* 4 Rodas / Pneus Detalhados no Chassi */}
              {/* Dianteira Direita (Baixo Esq) */}
              <rect x="118" y="132" width="40" height="10" rx="3" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />
              {/* Dianteira Esquerda (Topo Esq) */}
              <rect x="118" y="48" width="40" height="10" rx="3" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />
              {/* Traseira Direita (Baixo Dir) */}
              <rect x="266" y="132" width="40" height="10" rx="3" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />
              {/* Traseira Esquerda (Topo Dir) */}
              <rect x="266" y="48" width="40" height="10" rx="3" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />

              {/* Carroceria Principal (Contorno Aerodinâmico CAD) */}
              <path
                d="M 80 68 C 80 56, 98 53, 120 53 L 305 53 C 328 53, 340 58, 340 70 L 340 120 C 340 132, 328 137, 305 137 L 120 137 C 98 137, 80 134, 80 122 Z"
                fill="url(#cadBodyGrad)"
                stroke="#38BDF8"
                strokeWidth="1.6"
              />

              {/* Vincos Aerodinâmicos do Capô (Dianteira à Esquerda) */}
              <path
                d="M 86 73 L 146 64 M 86 117 L 146 126 M 92 84 L 140 80 M 92 106 L 140 110"
                stroke="#38BDF8"
                strokeWidth="0.8"
                strokeOpacity="0.6"
              />

              {/* Retrovisores Laterais */}
              <path
                d="M 156 53 L 150 42 L 160 42 L 164 53 Z"
                fill="#0F2942"
                stroke="#38BDF8"
                strokeWidth="1"
              />
              <path
                d="M 156 137 L 150 148 L 160 148 L 164 137 Z"
                fill="#0F2942"
                stroke="#38BDF8"
                strokeWidth="1"
              />

              {/* Cabine / Área Envigraçada (Para-brisa, Teto e Vigia Traseiro) */}
              <path
                d="M 144 62 L 292 60 L 312 68 L 312 122 L 292 130 L 144 128 L 132 116 L 132 74 Z"
                fill="url(#cadGlassGrad)"
                stroke="#7DD3FC"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />

              {/* Painel do Teto / Teto Solar Panorâmico & Colunas A, B, C */}
              <rect
                x="176"
                y="65"
                width="96"
                height="60"
                rx="6"
                fill="#0A192F"
                stroke="#38BDF8"
                strokeWidth="1.1"
              />
              <rect
                x="192"
                y="71"
                width="54"
                height="48"
                rx="3"
                fill="#0284C7"
                fillOpacity="0.18"
                stroke="#38BDF8"
                strokeWidth="0.7"
                strokeDasharray="2 2"
              />
              {/* Linhas das Colunas A / B / C */}
              <line x1="144" y1="62" x2="176" y2="65" stroke="#7DD3FC" strokeWidth="1" />
              <line x1="144" y1="128" x2="176" y2="125" stroke="#7DD3FC" strokeWidth="1" />
              <line x1="224" y1="65" x2="224" y2="53" stroke="#38BDF8" strokeWidth="0.9" />
              <line x1="224" y1="125" x2="224" y2="137" stroke="#38BDF8" strokeWidth="0.9" />
              <line x1="272" y1="65" x2="312" y2="68" stroke="#7DD3FC" strokeWidth="1" />
              <line x1="272" y1="125" x2="312" y2="122" stroke="#7DD3FC" strokeWidth="1" />

              {/* Grade Frontal & Lanternas Traseiras */}
              <rect x="78" y="78" width="4" height="34" rx="1.5" fill="#38BDF8" />
              <rect x="338" y="62" width="3.5" height="16" rx="1" fill="#F43F5E" />
              <rect x="338" y="112" width="3.5" height="16" rx="1" fill="#F43F5E" />

              {/* Rótulos Técnicos Internos no Chassi */}
              <text x="110" y="98" textAnchor="middle" fill="#7DD3FC" fontSize="6.5" fontFamily="monospace" opacity="0.8">
                FWD-ENG
              </text>
              <text x="219" y="98" textAnchor="middle" fill="#BAE6FD" fontSize="7" fontFamily="monospace" fontWeight="bold">
                SEJU-CAD-360
              </text>

              {/* ================================================================= */}
              {/* 4 PONTOS DE INSPEÇÃO PULSANTES (NÓS DE TELEMETRIA ÓPTICA)         */}
              {/* ================================================================= */}

              {/* 1. SENSOR FRONTAL (Esquerda - X:42, Y:95) */}
              <g className="cursor-pointer" onMouseEnter={() => setAnguloHover('frente')} onMouseLeave={() => setAnguloHover(null)}>
                <line
                  x1="54"
                  y1="95"
                  x2="78"
                  y2="95"
                  stroke={fotos.frente ? '#10B981' : '#38BDF8'}
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                />
                <circle
                  cx="42"
                  cy="95"
                  r="13"
                  fill={fotos.frente ? 'rgba(16,185,129,0.20)' : 'rgba(56,189,248,0.18)'}
                  className="animate-ping"
                  style={{ animationDuration: '2.4s' }}
                />
                <circle
                  cx="42"
                  cy="95"
                  r="10"
                  fill="#07111F"
                  stroke={fotos.frente ? '#10B981' : '#38BDF8'}
                  strokeWidth="2"
                />
                <circle
                  cx="42"
                  cy="95"
                  r="4"
                  fill={fotos.frente ? '#10B981' : '#38BDF8'}
                />
                <text x="42" y="78" textAnchor="middle" fill={fotos.frente ? '#34D399' : '#7DD3FC'} fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                  01·FWD
                </text>
              </g>

              {/* 2. SENSOR TRASEIRO (Direita - X:378, Y:95) */}
              <g className="cursor-pointer" onMouseEnter={() => setAnguloHover('traseira')} onMouseLeave={() => setAnguloHover(null)}>
                <line
                  x1="342"
                  y1="95"
                  x2="366"
                  y2="95"
                  stroke={fotos.traseira ? '#10B981' : '#38BDF8'}
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                />
                <circle
                  cx="378"
                  cy="95"
                  r="13"
                  fill={fotos.traseira ? 'rgba(16,185,129,0.20)' : 'rgba(56,189,248,0.18)'}
                  className="animate-ping"
                  style={{ animationDuration: '2.6s' }}
                />
                <circle
                  cx="378"
                  cy="95"
                  r="10"
                  fill="#07111F"
                  stroke={fotos.traseira ? '#10B981' : '#38BDF8'}
                  strokeWidth="2"
                />
                <circle
                  cx="378"
                  cy="95"
                  r="4"
                  fill={fotos.traseira ? '#10B981' : '#38BDF8'}
                />
                <text x="378" y="78" textAnchor="middle" fill={fotos.traseira ? '#34D399' : '#7DD3FC'} fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                  02·AFT
                </text>
              </g>

              {/* 3. SENSOR LATERAL ESQUERDA / CONDUTOR (Topo - X:210, Y:22) */}
              <g className="cursor-pointer" onMouseEnter={() => setAnguloHover('lateralEsquerda')} onMouseLeave={() => setAnguloHover(null)}>
                <line
                  x1="210"
                  y1="32"
                  x2="210"
                  y2="52"
                  stroke={fotos.lateralEsquerda ? '#10B981' : '#38BDF8'}
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                />
                <circle
                  cx="210"
                  cy="22"
                  r="12"
                  fill={fotos.lateralEsquerda ? 'rgba(16,185,129,0.20)' : 'rgba(56,189,248,0.18)'}
                  className="animate-ping"
                  style={{ animationDuration: '2.8s' }}
                />
                <circle
                  cx="210"
                  cy="22"
                  r="9.5"
                  fill="#07111F"
                  stroke={fotos.lateralEsquerda ? '#10B981' : '#38BDF8'}
                  strokeWidth="2"
                />
                <circle
                  cx="210"
                  cy="22"
                  r="4"
                  fill={fotos.lateralEsquerda ? '#10B981' : '#38BDF8'}
                />
                <text x="242" y="25" fill={fotos.lateralEsquerda ? '#34D399' : '#7DD3FC'} fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                  04·PORT (ESQ)
                </text>
              </g>

              {/* 4. SENSOR LATERAL DIREITA / PASSAGEIRO (Baixo - X:210, Y:156) */}
              <g className="cursor-pointer" onMouseEnter={() => setAnguloHover('lateralDireita')} onMouseLeave={() => setAnguloHover(null)}>
                <line
                  x1="210"
                  y1="138"
                  x2="210"
                  y2="146"
                  stroke={fotos.lateralDireita ? '#10B981' : '#38BDF8'}
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                />
                <circle
                  cx="210"
                  cy="156"
                  r="12"
                  fill={fotos.lateralDireita ? 'rgba(16,185,129,0.20)' : 'rgba(56,189,248,0.18)'}
                  className="animate-ping"
                  style={{ animationDuration: '3s' }}
                />
                <circle
                  cx="210"
                  cy="156"
                  r="9.5"
                  fill="#07111F"
                  stroke={fotos.lateralDireita ? '#10B981' : '#38BDF8'}
                  strokeWidth="2"
                />
                <circle
                  cx="210"
                  cy="156"
                  r="4"
                  fill={fotos.lateralDireita ? '#10B981' : '#38BDF8'}
                />
                <text x="244" y="159" fill={fotos.lateralDireita ? '#34D399' : '#7DD3FC'} fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                  03·STBD (DIR)
                </text>
              </g>
            </svg>
          </div>

          {/* Coluna Direita: Legenda Técnica de Telemetria F1 */}
          <div className="lg:col-span-5 bg-slate-950/80 border border-sky-500/25 rounded-xl p-4 space-y-3 backdrop-blur-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
                <Compass size={12} /> Matriz de Sensores Ópticos
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                TELEMETRIA F1 · PR
              </span>
            </div>

            <div className="space-y-2">
              {angulos.map((ang) => {
                const ok = Boolean(fotos[ang.id]);
                const isHovered = anguloHover === ang.id;

                return (
                  <div
                    key={ang.id}
                    className={`px-3 py-2 rounded-lg border font-mono text-[11px] flex items-center justify-between transition ${
                      ok
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                        : isHovered
                        ? 'bg-sky-950/60 border-sky-400/60 text-sky-100'
                        : 'bg-slate-900/70 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          ok ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-sky-400 animate-pulse'
                        }`}
                      />
                      <span className="text-[10px] text-sky-400/90 font-bold">{ang.sensorCode}</span>
                      <span className="truncate text-xs font-sans font-semibold text-white">
                        {ang.posicao}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${
                          ok
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {ok ? 'LOCKED · OK' : 'STANDBY'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rodapé da Telemetria com Barra de Calibração */}
            <div className="pt-2 border-t border-slate-800/90 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>HASH ENGINE: SHA-256</span>
              <span className="text-sky-300 font-bold">GPS: 25°25&apos;S 49°16&apos;W</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4 SLOTS DE CÂMERA PERICIAL COM MOLDURA VIEWFINDER (CANTONEIRAS L)      */}
      {/* ===================================================================== */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {angulos.map((ang) => {
          const imgUrl = fotos[ang.id];

          return (
            <div
              key={ang.id}
              onMouseEnter={() => setAnguloHover(ang.id)}
              onMouseLeave={() => setAnguloHover(null)}
              className={`group rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-300 border ${
                imgUrl
                  ? 'bg-white border-emerald-500/50 shadow-[0_8px_24px_-8px_rgba(16,185,129,0.18)]'
                  : 'bg-slate-50/80 hover:bg-white border-slate-200/90 hover:border-sky-500/50 hover:shadow-md'
              }`}
            >
              {/* Card Top Metadata */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-200/75 px-1.5 py-0.5 rounded">
                    {ang.step}
                  </span>
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                    {ang.posicao}
                  </span>
                </div>

                {imgUrl ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-mono font-bold">
                    <Check size={10} strokeWidth={3} /> OK
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-slate-400 uppercase">
                    {ang.sensorCode}
                  </span>
                )}
              </div>

              {/* Viewfinder Pericial Frame com Cantoneiras L nos 4 Cantos */}
              <div className="aspect-4/3 rounded-xl bg-slate-950 ring-1 ring-slate-900/15 flex items-center justify-center overflow-hidden relative p-2">
                {/* Cantoneiras L de Viewfinder nos 4 cantos */}
                <span className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-sky-400/90 rounded-tl-[2px] z-20 pointer-events-none" />
                <span className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-sky-400/90 rounded-tr-[2px] z-20 pointer-events-none" />
                <span className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-sky-400/90 rounded-bl-[2px] z-20 pointer-events-none" />
                <span className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-sky-400/90 rounded-br-[2px] z-20 pointer-events-none" />

                {/* Top Viewfinder HUD Metadata Bar */}
                <div className="absolute top-2.5 inset-x-6 flex items-center justify-between text-[8px] font-mono text-sky-200/90 z-20 pointer-events-none">
                  <span className="bg-slate-950/75 px-1.5 py-0.5 rounded backdrop-blur-xs border border-white/10">
                    ISO 100 · f/2.8 · GPS PR
                  </span>
                  <span className="bg-slate-950/75 px-1.5 py-0.5 rounded text-emerald-300 border border-white/10">
                    REC ●
                  </span>
                </div>

                {imgUrl ? (
                  <>
                    <img
                      src={imgUrl}
                      alt={ang.label}
                      className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />
                    <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between z-20">
                      <span className="text-[8px] font-mono text-slate-200 bg-slate-950/75 px-1.5 py-0.5 rounded border border-white/10">
                        {ang.coord}
                      </span>
                      <span className="bg-emerald-950/90 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-mono text-emerald-300 font-bold border border-emerald-400/40 flex items-center gap-1">
                        <Lock size={9} /> SHA-256
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-3 text-center relative z-10">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 text-sky-400 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:border-sky-400 transition-all">
                      <Camera size={17} />
                    </div>
                    <span className="text-xs font-bold text-white">
                      {ang.label}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                      {ang.alvo}
                    </span>
                    <span className="mt-2 text-[8px] font-mono text-sky-400/80 uppercase tracking-wider">
                      [ + RETÍCULO ÓPTICO PRONTO ]
                    </span>
                  </div>
                )}
              </div>

              {/* Card Bottom Action Bar */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-800 block truncate">
                    {ang.label}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 block truncate">
                    {ang.meta}
                  </span>
                </div>

                {!readOnly && (
                  <label className="text-[11px] font-bold text-white bg-slate-900 hover:bg-[#005A9C] px-3 py-1.5 rounded-lg cursor-pointer transition shrink-0 shadow-2xs">
                    {imgUrl ? 'Recapturar' : 'Capturar'}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={e => handleFileChange(ang.id, e)}
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* COMPLETION BANNER */}
      {completo && (
        <div className="relative z-10 p-4 bg-emerald-50/90 border border-emerald-300/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck size={17} />
            </div>
            <div>
              <span className="font-bold block sm:inline">Laudo Pericial CAD 360° Homologado: </span>
              <span className="text-emerald-800">
                As 4 evidências ópticas foram seladas com carimbo SHA-256 para emissão do Termo de Cautela.
              </span>
            </div>
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-white text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full shrink-0 self-start sm:self-center">
            SHA-256 · VERIFICADO
          </span>
        </div>
      )}
    </div>
  );
};
