import React from 'react';

export interface DestinoParana {
  id: string;
  nome: string;
  regiao: string;
  /** Distância rodoviária aproximada a partir de Curitiba (ida). */
  distanciaKm: number;
  tempoHoras: number;
  rodovias: string;
  /** Posição no desenho do mapa (viewBox 0 0 141 92). */
  x: number;
  y: number;
}

export const CIDADES_PARANA: DestinoParana[] = [
  { id: 'curitiba', nome: 'Curitiba', regiao: 'Metropolitana', distanciaKm: 0, tempoHoras: 0, rodovias: '—', x: 113.4, y: 67.6 },
  { id: 'paranagua', nome: 'Paranaguá', regiao: 'Litoral', distanciaKm: 91, tempoHoras: 1.5, rodovias: 'BR-277', x: 129.2, y: 69.7 },
  { id: 'pontagrossa', nome: 'Ponta Grossa', regiao: 'Campos Gerais', distanciaKm: 114, tempoHoras: 1.8, rodovias: 'BR-376', x: 95, y: 59.9 },
  { id: 'guarapuava', nome: 'Guarapuava', regiao: 'Centro-Sul', distanciaKm: 256, tempoHoras: 3.5, rodovias: 'BR-277', x: 68.1, y: 66.7 },
  { id: 'londrina', nome: 'Londrina', regiao: 'Norte', distanciaKm: 388, tempoHoras: 5, rodovias: 'BR-376 e PR-445', x: 74.3, y: 19.5 },
  { id: 'maringa', nome: 'Maringá', regiao: 'Noroeste', distanciaKm: 425, tempoHoras: 5.5, rodovias: 'BR-376', x: 58.2, y: 22 },
  { id: 'cascavel', nome: 'Cascavel', regiao: 'Oeste', distanciaKm: 498, tempoHoras: 6.2, rodovias: 'BR-277', x: 26.7, y: 57 },
  { id: 'umuarama', nome: 'Umuarama', regiao: 'Noroeste', distanciaKm: 580, tempoHoras: 7.2, rodovias: 'PR-323', x: 29.4, y: 30 },
  { id: 'foz', nome: 'Foz do Iguaçu', regiao: 'Oeste', distanciaKm: 637, tempoHoras: 8, rodovias: 'BR-277', x: 3.3, y: 70.4 },
];

// Contorno simplificado do Paraná (projeção equiretangular a partir de pontos de divisa).
const CONTORNO =
  'M 9.7,36.5 L 14.5,26.1 L 20.7,19.3 L 29,9.1 L 37.3,3.4 L 48.6,2.3 L 60,3.4 L 71.4,4.8 L 82.8,9.1 L 93.1,10.9 L 100.4,12 L 106.2,17 L 107.6,25 L 111.8,32.9 L 113.8,39.7 L 120.1,45.4 L 127.3,49.3 L 133.5,54.5 L 138.7,61.3 L 136.6,68.1 L 131.4,72.6 L 128.3,80.1 L 120.1,80.1 L 111.8,81.7 L 102.5,83.3 L 92.1,80.6 L 82.8,82.4 L 75.6,86 L 65.2,87.4 L 52.8,89.2 L 40.4,87.4 L 29,86.3 L 22.8,86.5 L 20.7,80.6 L 18.6,72.6 L 12.4,71.5 L 3.1,71.1 L 3.5,62.4 L 6.2,52.2 L 8.3,43.1 Z';

// Lado do nome de cada cidade, para os rótulos não se sobreporem.
const ROTULO: Record<string, 'dir' | 'esq' | 'cima' | 'baixo' | 'cimaDir'> = {
  curitiba: 'baixo',
  paranagua: 'cima',
  maringa: 'esq',
  foz: 'cimaDir',
  pontagrossa: 'cima',
};

interface MapaParanaInterativoProps {
  cidadeSelecionada: DestinoParana;
  onSelectCidade: (cidade: DestinoParana) => void;
}

/** Mapa do Paraná para escolher o destino. Curitiba é a origem. */
export const MapaParanaInterativo: React.FC<MapaParanaInterativoProps> = ({ cidadeSelecionada, onSelectCidade }) => {
  const origem = CIDADES_PARANA[0];
  const destino = cidadeSelecionada.id === origem.id ? null : cidadeSelecionada;
  return (
    <svg viewBox="-4 -4 149 100" className="h-auto w-full" role="group" aria-label="Mapa do Paraná com os destinos">
      <path d={CONTORNO} fill="#DCEEFB" stroke="#0072BB" strokeWidth="0.8" strokeLinejoin="round" />
      {destino && (
        <line
          x1={origem.x}
          y1={origem.y}
          x2={destino.x}
          y2={destino.y}
          stroke="#00385E"
          strokeWidth="1"
          strokeDasharray="2.4 1.6"
          strokeLinecap="round"
        />
      )}
      {CIDADES_PARANA.map(c => {
        const ativo = c.id === cidadeSelecionada.id;
        const ehOrigem = c.id === origem.id;
        const lado = ROTULO[c.id] ?? 'dir';
        const tx = lado === 'cimaDir' ? c.x - 1.5 : lado === 'dir' ? c.x + 3.6 : lado === 'esq' ? c.x - 3.6 : c.x;
        const ty = lado === 'cima' || lado === 'cimaDir' ? c.y - 4 : lado === 'baixo' ? c.y + 6.4 : c.y + 1.3;
        const ancora = lado === 'dir' || lado === 'cimaDir' ? 'start' : lado === 'esq' ? 'end' : 'middle';
        return (
          <g
            key={c.id}
            role="button"
            tabIndex={ehOrigem ? -1 : 0}
            aria-label={ehOrigem ? 'Curitiba, origem' : `${c.nome}, ${c.distanciaKm} km`}
            aria-pressed={ativo}
            onClick={() => !ehOrigem && onSelectCidade(c)}
            onKeyDown={e => {
              if (!ehOrigem && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onSelectCidade(c);
              }
            }}
            className={ehOrigem ? '' : 'cursor-pointer outline-none [&:focus-visible>circle]:stroke-[#C6E86B]'}
          >
            <circle cx={c.x} cy={c.y} r="6" fill="transparent" />
            <circle
              cx={c.x}
              cy={c.y}
              r={ativo || ehOrigem ? 2.6 : 1.8}
              fill={ehOrigem ? '#00385E' : ativo ? '#00703C' : '#FFFFFF'}
              stroke={ehOrigem ? '#00385E' : ativo ? '#C6E86B' : '#0072BB'}
              strokeWidth={ativo ? 1.4 : 0.8}
            />
            <text
              x={tx}
              y={ty}
              textAnchor={ancora}
              fontSize="3.6"
              fontWeight={ativo || ehOrigem ? 700 : 500}
              fill="#00385E"
              style={{ fontFamily: 'Inter Variable, Inter, sans-serif' }}
            >
              {ehOrigem ? 'Curitiba · saída' : c.nome}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
