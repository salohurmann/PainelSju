import React, { useId } from 'react';

/**
 * Araucária — assinatura visual do Seju.
 * Tronco reto e copa em "pratos" côncavos cheios de tufos, como a
 * Araucaria angustifolia vista no horizonte dos Campos Gerais.
 * Desenho gerado por geometria (sem imagem), em 3 tons de verde.
 */

type Paleta = { escuro: string; medio: string; claro: string; tronco: string };

const PALETAS = {
  mata: { escuro: '#006B36', medio: '#00984C', claro: '#3CC27F', tronco: '#0B3A5E' },
  broto: { escuro: '#00984C', medio: '#2FBF71', claro: '#8FE3B3', tronco: '#0B3A5E' },
  marca: { escuro: '#006B36', medio: '#00984C', claro: '#3CC27F', tronco: '#0B1B2E' },
  clara: { escuro: '#1E8A57', medio: '#2FBF71', claro: '#7FDCA5', tronco: '#BFD9EE' },
} satisfies Record<string, Paleta>;

// [y das bordas do prato, meia-largura, profundidade no centro, y do galho no tronco]
const PRATOS: Array<[number, number, number, number]> = [
  [40, 82, 14, 70],
  [84, 64, 12, 108],
  [122, 42, 10, 140],
  [150, 22, 7, 162],
];

const CAMADAS = [
  { chave: 'escuro', rx: 15, ry: 10, dy: 0 },
  { chave: 'medio', rx: 12, ry: 7, dy: -5 },
  { chave: 'claro', rx: 7, ry: 3.5, dy: -9 },
] as const;

const GEOMETRIA = PRATOS.map(([yb, meia, prof, yt]) => {
  const n = Math.max(3, Math.floor((meia * 2) / 15));
  const pontos = Array.from({ length: n }, (_, i) => -meia + (i * 2 * meia) / (n - 1));
  return { yb, meia, prof, yt, pontos };
});

export const Araucaria: React.FC<{
  className?: string;
  style?: React.CSSProperties;
  paleta?: Paleta;
}> = ({ className, style, paleta = PALETAS.mata }) => (
  <svg viewBox="0 0 200 300" className={className} style={style} aria-hidden="true" focusable="false">
    <path d="M94 300 L106 300 L103 40 L97 40 Z" fill={paleta.tronco} />
    {GEOMETRIA.map(({ yb, meia, yt }) =>
      [-1, 1].map((s) => (
        <path
          key={`${yt}${s}`}
          d={`M100 ${yt} Q ${100 + s * meia * 0.55} ${yt - 2} ${100 + s * meia * 0.85} ${yb + 6}`}
          fill="none"
          stroke={paleta.tronco}
          strokeWidth={3.4}
          strokeLinecap="round"
        />
      )),
    )}
    {GEOMETRIA.map(({ yb, meia, prof, pontos }) =>
      CAMADAS.map((c) =>
        pontos.map((dx) => {
          const t = dx / meia;
          return (
            <ellipse
              key={`${yb}-${c.chave}-${dx}`}
              cx={100 + dx}
              cy={yb + prof * (1 - t * t) + c.dy}
              rx={c.rx * (Math.abs(t) < 0.99 ? 0.85 : 1)}
              ry={c.ry}
              fill={paleta[c.chave]}
            />
          );
        }),
      ),
    )}
  </svg>
);

/** Esfera azul da bandeira do Paraná, com a faixa "PARANÁ" e o Cruzeiro do Sul. */
export const EsferaParana: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => {
  const id = useId().replace(/:/g, '');
  return (
    <div className={className} style={style} aria-hidden="true">
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: 'radial-gradient(circle at 34% 30%, #3AA6EE 0%, #0A69AE 48%, #004476 100%)' }}
      />
      <svg viewBox="0 0 360 360" className="absolute inset-0 w-full h-full">
        <path id={`faixa-${id}`} d="M 22 205 Q 180 120 338 205" fill="none" stroke="#FFFFFF" strokeWidth={40} />
        <text fontFamily="'Unbounded Variable', Unbounded, sans-serif" fontWeight={800} fontSize={25} letterSpacing={9} fill="#00703C">
          <textPath href={`#faixa-${id}`} startOffset="50%" textAnchor="middle" dominantBaseline="central">
            PARANÁ
          </textPath>
        </text>
        {[[120, 250, 5], [160, 276, 6], [205, 262, 5], [180, 305, 4], [240, 290, 4]].map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="#FFFFFF" />
        ))}
      </svg>
    </div>
  );
};

/** Marca "Seju." com a araucária. */
export const MarcaSeju: React.FC<{ clara?: boolean; tamanho?: 'sm' | 'md' | 'lg' }> = ({ clara = false, tamanho = 'md' }) => {
  const dims = { sm: ['w-6 h-9', 'text-[17px]'], md: ['w-7 h-10', 'text-[21px]'], lg: ['w-9 h-[52px]', 'text-[28px]'] }[tamanho];
  return (
    <span className="inline-flex items-center gap-2">
      <Araucaria className={dims[0]} paleta={clara ? PALETAS.clara : PALETAS.marca} />
      <span className={`font-display font-extrabold leading-none ${dims[1]} ${clara ? 'text-white' : 'text-[var(--text)]'}`}>
        Seju<span className="text-[var(--verde-vivo)]">.</span>
      </span>
    </span>
  );
};

/** Composição do destaque: esfera ao fundo e três araucárias. */
export const Pinheiral: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`pointer-events-none select-none ${className.includes('absolute') ? '' : 'relative '}${className}`} aria-hidden="true">
    <EsferaParana className="absolute" style={{ width: '64%', aspectRatio: '1', right: '6%', top: '0%' }} />
    <Araucaria className="absolute bottom-0" style={{ left: '0%', height: '62%' }} paleta={PALETAS.mata} />
    <Araucaria className="absolute bottom-0" style={{ left: '30%', height: '36%' }} paleta={PALETAS.broto} />
  </div>
);
