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
  const parte1 = placaFormatada.slice(0, 3);
  const parte2 = placaFormatada.slice(3, 7);

  return (
    <div className={`inline-flex flex-col bg-white border-2 border-slate-900 rounded-md shadow-sm select-none font-sans overflow-hidden ${className}`}>
      {/* Faixa Azul Superior Mercosul */}
      <div className="bg-[#003399] text-white flex items-center justify-between px-2 py-0.5 text-[9px] font-extrabold tracking-widest leading-none">
        <div className="flex items-center gap-1">
          {/* Logo Mercosul Estilizado (4 estrelas) */}
          <div className="flex gap-0.5 items-center">
            <span className="w-1 h-1 rounded-full bg-yellow-300" />
            <span className="w-1 h-1 rounded-full bg-yellow-300" />
            <span className="w-1 h-1 rounded-full bg-yellow-300" />
            <span className="w-1 h-1 rounded-full bg-yellow-300" />
          </div>
          <span className="text-[8px] tracking-normal font-bold">MERCOSUL</span>
        </div>
        <span className="tracking-widest font-black">BRASIL</span>
        <div className="flex items-center gap-1">
          {/* Bandeira do Brasil / Paraná */}
          <span className="bg-emerald-600 text-[7px] text-yellow-300 font-bold px-1 rounded-xs">
            {uf}
          </span>
        </div>
      </div>

      {/* Letras e Números da Placa Estilo Estampado */}
      <div className="px-3 py-1 bg-white text-slate-900 font-black tracking-wider text-base sm:text-lg flex items-center justify-center font-mono leading-none border-t border-slate-200">
        <span className="text-slate-950 font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
          {parte1}
        </span>
        <span className="mx-1 text-slate-400 font-normal">·</span>
        <span className="text-slate-950 font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
          {parte2}
        </span>
      </div>
    </div>
  );
};
