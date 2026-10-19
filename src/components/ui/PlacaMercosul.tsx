import React from 'react';

interface PlacaMercosulProps {
  placa: string;
  uf?: string;
  className?: string;
}

export const PlacaMercosul: React.FC<PlacaMercosulProps> = ({
  placa,
  uf = 'PR',
  className = ''
}) => {
  // Limpa e formata: ABC1D23 ou ABC-1234
  const placaFormatada = placa.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const parte1 = placaFormatada.slice(0, 3) || 'SEJ';
  const parte2 = placaFormatada.slice(3, 7) || '2026';

  return (
    <div
      className={`relative inline-flex flex-col rounded-[7px] p-[2.5px] bg-linear-to-b from-slate-300 via-slate-100 to-slate-400 shadow-[0_4px_12px_rgba(15,23,42,0.18),0_1px_2px_rgba(15,23,42,0.25),inset_0_1px_0_rgba(255,255,255,0.9)] select-none font-sans overflow-hidden group/placa ${className}`}
    >
      {/* Moldura Interna Preta Estampada (Chanfro Metálico Mercosul) */}
      <div className="relative flex flex-col bg-[#F8FAFC] border-[1.5px] border-slate-900 rounded-[5px] overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]">
        
        {/* Faixa Azul Oficial Mercosul (#003399) com Reflexo Especular */}
        <div className="relative bg-linear-to-r from-[#002b80] via-[#003399] to-[#002673] text-white flex items-center justify-between px-2 py-[3px] border-b border-slate-900/40 overflow-hidden">
          {/* Reflexo diagonal de verniz automotivo */}
          <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/15 to-transparent -skew-x-12 pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-[0.5px] bg-sky-300/40 pointer-events-none" />

          {/* Esquerda: Emblema Cruzeiro do Sul Mercosul */}
          <div className="relative z-10 flex items-center gap-1">
            <svg viewBox="0 0 18 14" className="w-3.5 h-2.5 shrink-0">
              {/* Arco do horizonte Mercosul */}
              <path
                d="M1 11.5 Q9 7.5 17 11.5"
                stroke="#38BDF8"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
              />
              {/* 4 Estrelas do Cruzeiro do Sul */}
              <circle cx="9" cy="2.5" r="1.1" fill="#FDE047" />
              <circle cx="9" cy="7.5" r="1.1" fill="#FDE047" />
              <circle cx="5.8" cy="5" r="1" fill="#FDE047" />
              <circle cx="12.2" cy="4.6" r="0.9" fill="#FDE047" />
            </svg>
            <span className="text-[6.5px] tracking-[0.06em] font-extrabold text-sky-100/95 uppercase leading-none">
              MERCOSUL
            </span>
          </div>

          {/* Centro: BRASIL em caixa alta oficial */}
          <span className="relative z-10 text-[8.5px] tracking-[0.22em] font-black text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] leading-none">
            BRASIL
          </span>

          {/* Direita: Bandeira Nacional + Escudo UF */}
          <div className="relative z-10 flex items-center gap-1">
            {/* Mini Bandeira do Brasil SVG */}
            <svg viewBox="0 0 14 10" className="w-3 h-2 rounded-[1px] border border-white/30 shadow-2xs shrink-0">
              <rect width="14" height="10" fill="#009B3A" />
              <polygon points="7,1.2 12.5,5 7,8.8 1.5,5" fill="#FEDF00" />
              <circle cx="7" cy="5" r="2.1" fill="#002776" />
            </svg>
            <span className="bg-slate-950/45 border border-white/25 text-[7px] text-amber-300 font-mono font-black px-1 py-[0.5px] rounded-[2px] leading-none">
              {uf}
            </span>
          </div>
        </div>

        {/* Corpo Principal Refletivo com Marca d'água, QR Code e Caracteres Estampados */}
        <div className="relative px-2.5 py-1 bg-linear-to-b from-white via-[#F8FAFC] to-[#EEF2F6] flex items-center justify-between gap-1.5 min-w-[132px]">
          {/* Linhas de segurança holográficas sutis de fundo */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #0f172a 0px, #0f172a 1px, transparent 1px, transparent 4px)'
            }}
          />

          {/* Coluna Lateral Esquerda: QR Code DENATRAN + Sigla BR */}
          <div className="relative z-10 flex flex-col items-center justify-between pr-1 border-r border-slate-200/80 select-none shrink-0">
            {/* Micro QR Code SVG */}
            <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-slate-700 opacity-75">
              <path
                fill="currentColor"
                d="M1 1h4v4H1V1zm1 1v2h2V2H2zm5-1h4v4H7V1zm1 1v2h2V2H8zM1 7h4v4H1V7zm1 1v2h2V8H2zm5-1h1v1H7V7zm2 0h2v1H9V7zm-2 2h2v2H7V9zm3 0h1v2h-1V9z"
              />
            </svg>
            <span className="text-[6px] font-black text-slate-600 tracking-tighter leading-none mt-0.5">
              BR
            </span>
          </div>

          {/* Caracteres Estampados em Alto-Relevo (Padrão FE-Schrift) */}
          <div className="relative z-10 flex-1 flex items-center justify-center font-mono font-black text-[15px] sm:text-[17px] tracking-[0.12em] leading-none py-0.5">
            <span className="text-slate-950 drop-shadow-[0_1.2px_0_rgba(255,255,255,0.95)] [text-shadow:0_1px_1.5px_rgba(15,23,42,0.28)]">
              {parte1}
            </span>
            <span className="mx-0.5 w-1 h-1 rounded-full bg-slate-400/80 shadow-inner" />
            <span className="text-slate-950 drop-shadow-[0_1.2px_0_rgba(255,255,255,0.95)] [text-shadow:0_1px_1.5px_rgba(15,23,42,0.28)]">
              {parte2}
            </span>
          </div>

          {/* Furo/rebite de selagem sutil à direita */}
          <div className="relative z-10 w-1.5 h-1.5 rounded-full bg-slate-300 border border-slate-400/80 shadow-inner shrink-0" />
        </div>
      </div>
    </div>
  );
};

