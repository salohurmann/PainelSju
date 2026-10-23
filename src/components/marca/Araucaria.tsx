import React from 'react';

/**
 * Araucária geométrica — assinatura visual do Painel SJU.
 * Copa em "taça" (galhos que sobem nas pontas), como a Araucaria angustifolia
 * vista no horizonte dos Campos Gerais. Puramente decorativa.
 */
export const Araucaria: React.FC<{
  className?: string;
  copa?: string;
  copaClara?: string;
  tronco?: string;
  style?: React.CSSProperties;
}> = ({ className, copa = 'var(--verde-vivo)', copaClara, tronco = 'currentColor', style }) => {
  const clara = copaClara ?? copa;
  // Camadas da copa: [meia-largura, altura y, profundidade da curva]
  const camadas: Array<[number, number, number]> = [
    [46, 22, 9],
    [37, 35, 8],
    [28, 46, 7],
    [19, 55, 6],
  ];
  return (
    <svg viewBox="0 0 100 150" className={className} style={style} aria-hidden="true" focusable="false">
      <rect x="48" y="30" width="4" height="120" rx="1.5" fill={tronco} />
      {camadas.map(([mw, y, d], i) => (
        <g key={i}>
          <path
            d={`M ${50 - mw} ${y - 5} Q 50 ${y + d} ${50 + mw} ${y - 5}`}
            fill="none"
            stroke={i % 2 === 0 ? copa : clara}
            strokeWidth={i === 0 ? 7 : 6}
            strokeLinecap="round"
          />
          <circle cx={50 - mw} cy={y - 7} r={i === 0 ? 4.6 : 4} fill={i % 2 === 0 ? copa : clara} />
          <circle cx={50 + mw} cy={y - 7} r={i === 0 ? 4.6 : 4} fill={i % 2 === 0 ? copa : clara} />
        </g>
      ))}
    </svg>
  );
};

/**
 * Pinheiral: horizonte com araucárias de alturas diferentes e a esfera azul
 * da bandeira do Paraná ao fundo. Usado no topo da Mesa e no login.
 */
export const Pinheiral: React.FC<{ className?: string; esfera?: boolean }> = ({ className = '', esfera = true }) => (
  <div className={`pointer-events-none select-none ${className.includes('absolute') ? '' : 'relative '}${className}`} aria-hidden="true">
    {esfera && (
      <div
        className="absolute rounded-full"
        style={{ width: '62%', aspectRatio: '1', right: '14%', bottom: '18%', background: '#0072BB' }}
      />
    )}
    <Araucaria className="absolute bottom-0" style={{ left: '0%', height: '54%' }} copa="#0B8C4E" tronco="#8FB0CE" />
    <Araucaria className="absolute bottom-0" style={{ left: '17%', height: '88%' }} copa="#00A859" copaClara="#3CC27F" tronco="#8FB0CE" />
    <Araucaria className="absolute bottom-0" style={{ left: '40%', height: '66%' }} copa="#0B8C4E" copaClara="#00A859" tronco="#8FB0CE" />
    <Araucaria className="absolute bottom-0" style={{ left: '58%', height: '96%' }} copa="#3CC27F" copaClara="#00A859" tronco="#8FB0CE" />
    <div className="absolute left-0 right-0 bottom-0 h-[3px] rounded-full" style={{ background: '#8FB0CE' }} />
  </div>
);
