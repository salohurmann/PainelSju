import React from 'react';
import { Janela } from '../ui/Janela';

interface HotkeysHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GRUPOS: Array<{ titulo: string; itens: Array<{ teclas: string[]; texto: string }> }> = [
  {
    titulo: 'Em qualquer tela',
    itens: [
      { teclas: ['Ctrl', 'K'], texto: 'Buscar no Painel' },
      { teclas: ['?'], texto: 'Mostrar estes atalhos' },
      { teclas: ['Esc'], texto: 'Fechar janela aberta' },
    ],
  },
  {
    titulo: 'Ir para (aperte G e depois a letra)',
    itens: [
      { teclas: ['G', 'H'], texto: 'Mesa' },
      { teclas: ['G', 'F'], texto: 'Frotas' },
      { teclas: ['G', 'C'], texto: 'Chamados' },
      { teclas: ['G', 'S'], texto: 'Salas' },
      { teclas: ['G', 'D'], texto: 'Diárias' },
      { teclas: ['G', 'R'], texto: 'CENSE' },
      { teclas: ['G', 'T'], texto: 'Ramais' },
      { teclas: ['G', 'A'], texto: 'Auditoria' },
    ],
  },
];

export const HotkeysHelpModal: React.FC<HotkeysHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <Janela titulo="Atalhos de teclado" onFechar={onClose} largura="md">
      <div className="space-y-5">
        {GRUPOS.map(g => (
          <section key={g.titulo}>
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{g.titulo}</h4>
            <ul className="divide-y divide-[var(--border)] rounded-[18px] bg-[var(--surface-2)] px-4">
              {g.itens.map(i => (
                <li key={i.texto} className="flex items-center justify-between gap-3 py-2.5 text-sm text-[var(--text)]">
                  {i.texto}
                  <span className="flex gap-1">
                    {i.teclas.map(t => (
                      <kbd key={t} className="min-w-[28px] rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-2 py-0.5 text-center text-xs font-semibold text-[var(--text)]">
                        {t}
                      </kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Janela>
  );
};
