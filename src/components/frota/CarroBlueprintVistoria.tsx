import React, { useState } from 'react';
import { Camera, Check, ShieldCheck, Sparkles, Upload, AlertCircle, Eye, Scan, Zap } from 'lucide-react';
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
    }, 400);
  };

  const handleSimularComLaser = () => {
    setEscaneando(true);
    soundFX.playClick();
    setTimeout(() => {
      onSimularTodas();
      setEscaneando(false);
      soundFX.playSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }, 500);
  };

  const totalFotos = [fotos.frente, fotos.traseira, fotos.lateralDireita, fotos.lateralEsquerda].filter(Boolean).length;
  const completo = totalFotos === 4;

  const angulos = [
    { id: 'frente' as keyof VistoriaFotos, label: '1. Frente (com placa)', posicao: 'Dianteira / Grade', alvo: 'Faróis e Placa Mercosul' },
    { id: 'traseira' as keyof VistoriaFotos, label: '2. Traseira (com lanternas)', posicao: 'Traseira / Porta-Malas', alvo: 'Lanternas e Para-choque' },
    { id: 'lateralDireita' as keyof VistoriaFotos, label: '3. Lateral Direita', posicao: 'Lado do Passageiro', alvo: 'Portas e Retrovisor' },
    { id: 'lateralEsquerda' as keyof VistoriaFotos, label: '4. Lateral Esquerda', posicao: 'Lado do Motorista', alvo: 'Portas e Retrovisor' }
  ];

  return (
    <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border-2 border-slate-800 text-white shadow-2xl relative overflow-hidden font-sans space-y-6">
      
      {/* Grade de fundo tecnológica */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-25 pointer-events-none" />

      {/* Laser Beam Scanner Animation (atravessa a tela quando carrega uma foto) */}
      {escaneando && (
        <div className="absolute inset-x-0 h-1 bg-linear-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#34d399] z-50 animate-bounce pointer-events-none" />
      )}

      {/* Header do Blueprint */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
            <ShieldCheck size={16} /> PERÍCIA VISUAL VEICULAR 360° · SEJU
          </div>
          <h3 className="text-xl font-black text-white mt-1">
            Inspeção Obrigatória de 4 Ângulos
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro pericial fotográfico de saída e devolução para blindagem jurídica contra avarias ou danos não constatados.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Badge de Progresso */}
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 ${
            completo 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-xs' 
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}>
            {completo ? <Check size={14} /> : <Scan size={14} className="animate-spin" />}
            <span>{totalFotos} de 4 Fotos Registradas</span>
          </div>

          {!readOnly && (
            <button
              type="button"
              onClick={handleSimularComLaser}
              className="text-xs font-bold bg-[#0072BB] hover:bg-blue-600 text-white px-3.5 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Sparkles size={14} /> Simular Câmera Celular
            </button>
          )}
        </div>
      </div>

      {/* Cards dos 4 Ângulos com Câmera e Preview */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {angulos.map((ang) => {
          const imgUrl = fotos[ang.id];

          return (
            <div
              key={ang.id}
              className={`rounded-2xl border-2 transition-all duration-300 p-4 flex flex-col justify-between relative overflow-hidden ${
                imgUrl
                  ? 'bg-slate-900 border-emerald-500/70 shadow-lg shadow-emerald-950/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-blue-500/60'
              }`}
            >
              {/* Header do Card do Ângulo */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                  {ang.posicao}
                </span>
                {imgUrl ? (
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </span>
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                )}
              </div>

              {/* Área de Visualização da Foto */}
              <div className="aspect-4/3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden relative group">
                {imgUrl ? (
                  <>
                    <img
                      src={imgUrl}
                      alt={ang.label}
                      className="w-full h-full object-cover transition group-hover:scale-105 duration-300"
                    />
                    {/* Timestamp impresso na foto (Marca d'água pericial oficial) */}
                    <div className="absolute bottom-1 right-1 bg-black/85 px-2 py-0.5 rounded text-[8px] font-mono text-emerald-400 font-bold border border-emerald-500/30">
                      SEJU/PR · SHA-256 OK
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mb-2 group-hover:text-[#00AEEF] transition">
                      <Camera size={20} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-300">
                      {ang.posicao}
                    </span>
                    <span className="text-[9px] text-slate-500 mt-0.5">
                      {ang.alvo}
                    </span>
                  </div>
                )}
              </div>

              {/* Botão de Ação / Upload */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 truncate">
                  {ang.label}
                </span>

                {!readOnly && (
                  <label className="text-[11px] font-bold text-[#00AEEF] hover:text-white cursor-pointer transition flex items-center gap-1">
                    {imgUrl ? 'Alterar' : 'Fotografar'}
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

      {/* Selo Pericial de Conclusão */}
      {completo && (
        <div className="relative z-10 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-300 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400" />
            <span className="font-bold">INSPEÇÃO 360° COMPLETA:</span>
            <span>4 fotos periciais autenticadas. Veículo liberado para termo de cautela.</span>
          </div>
          <span className="font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded">
            PRONTO
          </span>
        </div>
      )}

    </div>
  );
};
