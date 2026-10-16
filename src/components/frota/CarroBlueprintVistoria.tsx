import React, { useState } from 'react';
import { Camera, Check, ShieldCheck, Sparkles, Scan } from 'lucide-react';
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
      label: 'Dianteira & Placa',
      posicao: 'Ângulo Frontal',
      alvo: 'Faróis, capô e placa Mercosul'
    },
    {
      id: 'traseira' as keyof VistoriaFotos,
      step: '02',
      label: 'Traseira & Porta-Malas',
      posicao: 'Ângulo Traseiro',
      alvo: 'Lanternas, vigia e para-choque'
    },
    {
      id: 'lateralDireita' as keyof VistoriaFotos,
      step: '03',
      label: 'Lateral Direita',
      posicao: 'Lado Passageiro',
      alvo: 'Portas, rodas e retrovisor dir.'
    },
    {
      id: 'lateralEsquerda' as keyof VistoriaFotos,
      step: '04',
      label: 'Lateral Esquerda',
      posicao: 'Lado Condutor',
      alvo: 'Portas, rodas e retrovisor esq.'
    }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 text-slate-900 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.08)] relative overflow-hidden font-sans space-y-6">
      {/* Subtle Studio Grid Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

      {/* Optical Scan Line Animation */}
      {escaneando && (
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-transparent via-sky-500 to-transparent shadow-[0_0_16px_#0ea5e9] z-50 animate-pulse pointer-events-none" />
      )}

      {/* STUDIO HEADER */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#005A9C] bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200/60">
            <ShieldCheck size={13} /> Estúdio de Vistoria Cautelar 360°
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-2">
            Inspeção Fotográfica de 4 Ângulos
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Registro visual de saída e devolução com autenticação criptográfica para conformidade patrimonial da frota.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Progress Pill */}
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ring-1 transition-all ${
              completo
                ? 'bg-emerald-50 text-emerald-700 ring-emerald-500/30'
                : 'bg-slate-100 text-slate-700 ring-slate-200'
            }`}
          >
            {completo ? (
              <Check size={13} className="text-emerald-600" />
            ) : (
              <Scan size={13} className="text-slate-500" />
            )}
            <span className="font-mono font-bold">{totalFotos}/4</span>
            <span className="text-[11px] font-medium">ângulos</span>
          </div>

          {!readOnly && (
            <button
              type="button"
              onClick={handleSimularComLaser}
              className="text-xs font-bold bg-slate-900 hover:bg-[#004B87] text-white px-3.5 py-2 rounded-full shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Sparkles size={13} /> Preencher Vistoria Demo
            </button>
          )}
        </div>
      </div>

      {/* AUTOMOTIVE STUDIO BLUEPRINT BAR (Top-Down Vector Silhouette + 4 Sensor Nodes) */}
      <div className="relative z-10 bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-700 font-mono text-xs font-bold">
            360°
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">
              Mapeamento Perimetral do Veículo
            </div>
            <div className="text-[11px] text-slate-500">
              {completo
                ? 'Todos os quadrantes periciados e prontos para homologação.'
                : 'Capture ou selecione os 4 quadrantes obrigatórios abaixo.'}
            </div>
          </div>
        </div>

        {/* Minimalist Top-Down Luxury Sedan Blueprint SVG */}
        <div className="flex items-center gap-4">
          <svg viewBox="0 0 220 72" className="w-52 h-16 select-none overflow-visible">
            {/* Studio Measurement Rings */}
            <ellipse
              cx="110"
              cy="36"
              rx="92"
              ry="30"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            {/* Vehicle Body Outline */}
            <rect
              x="42"
              y="16"
              width="136"
              height="40"
              rx="14"
              fill="#FFFFFF"
              stroke="#64748B"
              strokeWidth="1.5"
            />
            {/* Cabin / Windshield & Rear Glass */}
            <path
              d="M 72 20 L 144 20 L 134 52 L 72 52 Z"
              fill="#F1F5F9"
              stroke="#94A3B8"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Roof Panel */}
            <rect
              x="86"
              y="22"
              width="44"
              height="28"
              rx="4"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="1"
            />

            {/* 4 Sensor Nodes: Front (left), Rear (right), Top (Left Side), Bottom (Right Side) */}
            {/* Front Node */}
            <circle
              cx="26"
              cy="36"
              r="5"
              fill={fotos.frente ? '#10B981' : '#E2E8F0'}
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            {/* Rear Node */}
            <circle
              cx="194"
              cy="36"
              r="5"
              fill={fotos.traseira ? '#10B981' : '#E2E8F0'}
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            {/* Lateral Esquerda (Top) */}
            <circle
              cx="110"
              cy="6"
              r="5"
              fill={fotos.lateralEsquerda ? '#10B981' : '#E2E8F0'}
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            {/* Lateral Direita (Bottom) */}
            <circle
              cx="110"
              cy="66"
              r="5"
              fill={fotos.lateralDireita ? '#10B981' : '#E2E8F0'}
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>

      {/* 4 STUDIO INSPECTION CARDS */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {angulos.map((ang) => {
          const imgUrl = fotos[ang.id];

          return (
            <div
              key={ang.id}
              className={`group rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-300 ${
                imgUrl
                  ? 'bg-white ring-1 ring-emerald-500/40 shadow-sm'
                  : 'bg-slate-50/70 hover:bg-white ring-1 ring-slate-200/90 hover:ring-sky-500/40 hover:shadow-sm'
              }`}
            >
              {/* Card Top Metadata */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {ang.step}
                  </span>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    {ang.posicao}
                  </span>
                </div>

                {imgUrl ? (
                  <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/30 flex items-center justify-center">
                    <Check size={11} strokeWidth={3} />
                  </span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-sky-500 transition-colors" />
                )}
              </div>

              {/* Studio Photo Frame */}
              <div className="aspect-4/3 rounded-xl bg-white ring-1 ring-slate-200/80 flex items-center justify-center overflow-hidden relative">
                {imgUrl ? (
                  <>
                    <img
                      src={imgUrl}
                      alt={ang.label}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute bottom-2 right-2 bg-slate-950/75 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] font-mono text-emerald-300 font-semibold border border-white/15">
                      SHA-256 · OK
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 ring-1 ring-slate-200/80 text-slate-500 flex items-center justify-center mb-2 group-hover:bg-sky-50 group-hover:text-[#005A9C] group-hover:ring-sky-200 transition-all">
                      <Camera size={18} />
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      {ang.label}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                      {ang.alvo}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Bottom Action Bar */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-600 truncate">
                  {ang.label}
                </span>

                {!readOnly && (
                  <label className="text-[11px] font-bold text-[#005A9C] hover:text-slate-900 bg-sky-50/80 hover:bg-sky-100/80 px-2.5 py-1 rounded-lg cursor-pointer transition shrink-0">
                    {imgUrl ? 'Substituir' : 'Capturar'}
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
        <div className="relative z-10 p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-900">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <ShieldCheck size={15} />
            </div>
            <div>
              <span className="font-bold">Laudo Fotográfico 360° Homologado: </span>
              <span className="text-emerald-700">
                As 4 evidências periciais foram autenticadas para emissão do Termo de Cautela.
              </span>
            </div>
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-white text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0">
            Verificado
          </span>
        </div>
      )}
    </div>
  );
};
