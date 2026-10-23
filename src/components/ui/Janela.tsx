import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Fecha com Esc, trava a rolagem da página, leva o foco para dentro da janela
 * e devolve o foco a quem a abriu ao fechar.
 */
let ultimoFocoFora: HTMLElement | null = null;
if (typeof document !== 'undefined') {
  document.addEventListener(
    'focusin',
    e => {
      const alvo = e.target as HTMLElement | null;
      if (alvo && !alvo.closest('[aria-modal="true"]')) ultimoFocoFora = alvo;
    },
    true,
  );
}

export function useJanela(aberta: boolean, onFechar: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const fecharRef = useRef(onFechar);
  useEffect(() => {
    fecharRef.current = onFechar;
  }, [onFechar]);

  useEffect(() => {
    if (!aberta) return;
    // Um campo com autoFocus já puxa o foco para dentro antes deste efeito:
    // nesse caso, volta para o último elemento focado fora da janela.
    const ativo = document.activeElement as HTMLElement | null;
    const anterior = ativo && ref.current?.contains(ativo) ? ultimoFocoFora : ativo;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const alvo = ref.current?.querySelector<HTMLElement>('[autofocus], input, textarea, select, button:not([aria-label="Fechar"])');
    (alvo ?? ref.current)?.focus({ preventScroll: true });

    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        fecharRef.current();
        return;
      }
      if (e.key !== 'Tab' || !ref.current) return;
      const focaveis = [...ref.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(
        el => el.offsetParent !== null,
      );
      if (!focaveis.length) return;
      const [primeiro, ultimo] = [focaveis[0], focaveis[focaveis.length - 1]];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    };
    document.addEventListener('keydown', tecla, true);
    return () => {
      document.removeEventListener('keydown', tecla, true);
      document.body.style.overflow = overflow;
      anterior?.focus?.({ preventScroll: true });
    };
  }, [aberta]);

  return ref;
}

interface JanelaProps {
  titulo: string;
  onFechar: () => void;
  children: React.ReactNode;
  /** Largura máxima: md (padrão), lg ou xl. */
  largura?: 'md' | 'lg' | 'xl';
  /** Abre como painel na lateral direita (detalhes longos). */
  lateral?: boolean;
  /** Esconde o título visível (use quando o conteúdo já tem o seu). */
  semTitulo?: boolean;
}

const LARGURA = { md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };

/** Janela padrão do Seju: no celular sobe de baixo, no computador fica no centro. */
export const Janela: React.FC<JanelaProps> = ({ titulo, onFechar, children, largura = 'lg', lateral = false, semTitulo = false }) => {
  const ref = useJanela(true, onFechar);
  return (
    <div
      className={`fixed inset-0 z-50 flex bg-[#0B1B2E]/60 ${lateral ? 'justify-end' : 'items-end justify-center sm:items-center sm:p-4'}`}
      onMouseDown={e => e.target === e.currentTarget && onFechar()}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className={
          'relative ' +
          (lateral
            ? 'flex h-full w-full max-w-lg flex-col overflow-y-auto bg-[var(--surface)] p-6 outline-none sm:p-7'
            : `max-h-[92vh] w-full ${LARGURA[largura]} overflow-y-auto rounded-t-[28px] bg-[var(--surface)] p-6 outline-none sm:rounded-[28px] sm:p-7`)
        }
      >
        <div className={`flex items-start justify-between gap-3 ${semTitulo ? 'absolute right-5 top-5' : 'mb-4'}`}>
          {!semTitulo && <h3 className="font-display text-2xl font-bold leading-tight text-[var(--text)]">{titulo}</h3>}
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface-3)] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

/** Fundo escuro com Esc e foco, para conteúdos que desenham o próprio cartão (bilhete, comprovante). */
export const Sobreposicao: React.FC<{ rotulo: string; onFechar: () => void; children: React.ReactNode; fecharNoFundo?: boolean }> = ({
  rotulo,
  onFechar,
  children,
  fecharNoFundo = true,
}) => {
  const ref = useJanela(true, onFechar);
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-[#0B1B2E]/60 sm:items-center sm:p-4"
      onMouseDown={e => fecharNoFundo && e.target === e.currentTarget && onFechar()}
    >
      <div ref={ref} role="dialog" aria-modal="true" aria-label={rotulo} tabIndex={-1} className="w-full max-w-md outline-none">
        {children}
      </div>
    </div>
  );
};
