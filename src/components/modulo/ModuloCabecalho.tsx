import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Araucaria, PALETAS } from '../marca/Araucaria';

/**
 * Cabeçalho comum dos módulos (Vitrine Paraná).
 * Cada módulo tem uma cor de assinatura, para o servidor saber onde está
 * só de bater o olho: Frotas azul, Chamados noite, Salas verde,
 * Diárias lima, CENSE tinta, Ramais céu.
 * As cores da faixa são fixas (iguais no claro e no escuro) para manter a identidade.
 */
export type CorModulo = 'azul' | 'noite' | 'verde' | 'lima' | 'tinta' | 'ceu' | 'mata';

const TEMAS: Record<
  CorModulo,
  { fundo: string; texto: string; suave: string; acento: string; botao: string; arvore: keyof typeof PALETAS }
> = {
  azul: { fundo: '#0072BB', texto: '#FFFFFF', suave: 'rgba(255,255,255,0.78)', acento: '#C6E86B', botao: 'rgba(255,255,255,0.14)', arvore: 'mata' },
  noite: { fundo: '#0B1B2E', texto: '#FFFFFF', suave: 'rgba(255,255,255,0.7)', acento: '#C6E86B', botao: 'rgba(255,255,255,0.1)', arvore: 'mata' },
  verde: { fundo: '#00703C', texto: '#FFFFFF', suave: 'rgba(255,255,255,0.78)', acento: '#C6E86B', botao: 'rgba(255,255,255,0.14)', arvore: 'clara' },
  lima: { fundo: '#C6E86B', texto: '#0B1B2E', suave: 'rgba(11,27,46,0.72)', acento: '#00703C', botao: 'rgba(11,27,46,0.08)', arvore: 'marca' },
  tinta: { fundo: '#00385E', texto: '#FFFFFF', suave: 'rgba(255,255,255,0.72)', acento: '#3CC27F', botao: 'rgba(255,255,255,0.12)', arvore: 'mata' },
  mata: { fundo: '#0E4D32', texto: '#FFFFFF', suave: 'rgba(255,255,255,0.75)', acento: '#C6E86B', botao: 'rgba(255,255,255,0.12)', arvore: 'clara' },
  ceu: { fundo: '#DCEEFB', texto: '#00385E', suave: 'rgba(0,56,94,0.72)', acento: '#0072BB', botao: 'rgba(0,56,94,0.08)', arvore: 'marca' },
};

export interface ModuloCabecalhoProps {
  cor: CorModulo;
  /** Rótulo pequeno acima do título (ex.: "Logística · TRANSP"). */
  rotulo: string;
  titulo: string;
  descricao?: React.ReactNode;
  onVoltar?: () => void;
  /** Botões de ação à direita. Use <AcaoModulo>. */
  acoes?: React.ReactNode;
  /** Conteúdo sob o título: abas, números de destaque etc. */
  children?: React.ReactNode;
  arvore?: boolean;
}

export const ModuloCabecalho: React.FC<ModuloCabecalhoProps> = ({
  cor,
  rotulo,
  titulo,
  descricao,
  onVoltar,
  acoes,
  children,
  arvore = true,
}) => {
  const t = TEMAS[cor];
  const vars = {
    '--mc-fundo': t.fundo,
    '--mc-texto': t.texto,
    '--mc-suave': t.suave,
    '--mc-acento': t.acento,
    '--mc-botao': t.botao,
    backgroundColor: t.fundo,
    color: t.texto,
  } as React.CSSProperties;

  return (
    <header
      data-cor-modulo={cor}
      className={`relative overflow-hidden rounded-[28px] px-5 pt-5 pb-6 sm:px-9 sm:pt-7 sm:pb-8 ${cor === 'noite' || cor === 'tinta' || cor === 'mata' ? 'ring-1 ring-inset ring-white/10' : ''}`}
      style={vars}
    >
      {arvore && (
        <div className="pointer-events-none absolute bottom-0 right-4 hidden h-[88%] w-56 md:block" aria-hidden="true">
          <Araucaria className="absolute bottom-0 right-0 h-full" paleta={PALETAS[t.arvore]} />
          <Araucaria className="absolute bottom-0 right-[58%] h-[55%]" paleta={PALETAS[t.arvore]} />
        </div>
      )}

      <div className="relative flex flex-col gap-5 md:pr-56">
        <div className="flex flex-wrap items-center gap-2">
          {onVoltar && (
            <button
              type="button"
              onClick={onVoltar}
              className="inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-opacity hover:opacity-80 cursor-pointer"
              style={{ backgroundColor: 'var(--mc-botao)', color: 'var(--mc-texto)' }}
            >
              <ArrowLeft size={14} /> Mesa
            </button>
          )}
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--mc-suave)' }}>
            {rotulo}
          </span>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="font-display text-[34px] font-bold leading-[1.02] sm:text-[52px]">
              {titulo}
              <span style={{ color: 'var(--mc-acento)' }}>.</span>
            </h1>
            {descricao && (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed sm:text-[15px]" style={{ color: 'var(--mc-suave)' }}>
                {descricao}
              </p>
            )}
          </div>
          {acoes && <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap lg:shrink-0">{acoes}</div>}
        </div>

        {children && <div className="flex flex-col gap-4">{children}</div>}
      </div>
    </header>
  );
};

/** Botão em pílula para usar dentro da faixa do módulo. */
export const AcaoModulo: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { destaque?: boolean; icone?: React.ReactNode }
> = ({ destaque = false, icone, children, className = '', style, ...props }) => (
  <button
    type="button"
    className={`inline-flex h-10 items-center gap-2 rounded-full px-5 text-[13px] font-semibold transition-opacity hover:opacity-85 cursor-pointer disabled:opacity-50 ${className}`}
    style={
      destaque
        ? { backgroundColor: 'var(--mc-acento)', color: 'var(--mc-fundo)', ...style }
        : { backgroundColor: 'var(--mc-botao)', color: 'var(--mc-texto)', ...style }
    }
    {...props}
  >
    {icone}
    {children}
  </button>
);

/** Abas em pílula dentro da faixa do módulo. */
export function AbasModulo<T extends string>({
  itens,
  ativa,
  onChange,
}: {
  itens: Array<{ id: T; rotulo: string; icone?: React.ReactNode; contagem?: number }>;
  ativa: T;
  onChange: (id: T) => void;
}) {
  return (
    <div role="tablist" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
      {itens.map((it) => {
        const on = it.id === ativa;
        return (
          <button
            key={it.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(it.id)}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-semibold whitespace-nowrap transition-colors cursor-pointer"
            style={
              on
                ? { backgroundColor: 'var(--mc-texto)', color: 'var(--mc-fundo)' }
                : { backgroundColor: 'var(--mc-botao)', color: 'var(--mc-texto)' }
            }
          >
            {it.icone}
            {it.rotulo}
            {it.contagem !== undefined && it.contagem > 0 && (
              <span
                className="rounded-full px-1.5 text-[11px] font-bold tabular-nums"
                style={{ backgroundColor: 'var(--mc-acento)', color: 'var(--mc-fundo)' }}
              >
                {it.contagem}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Número de destaque dentro da faixa. */
export const NumeroModulo: React.FC<{ rotulo: string; valor: React.ReactNode; detalhe?: string }> = ({
  rotulo,
  valor,
  detalhe,
}) => (
  <div className="min-w-[120px] rounded-[18px] px-4 py-3" style={{ backgroundColor: 'var(--mc-botao)' }}>
    <div className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--mc-suave)' }}>
      {rotulo}
    </div>
    <div className="font-display mt-1 text-2xl font-bold tabular-nums">{valor}</div>
    {detalhe && (
      <div className="text-[11px]" style={{ color: 'var(--mc-suave)' }}>
        {detalhe}
      </div>
    )}
  </div>
);
