import React from 'react';
import { Modal } from '../ui/Modal';
import { Keyboard, X } from 'lucide-react';

interface HotkeysHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  descricao: string;
  categoria: 'Navegação Rápida' | 'Ações Globais' | 'Controles de Interface';
}

const SHORTCUTS: ShortcutItem[] = [
  { keys: ['Ctrl', 'K'], descricao: 'Abrir Paleta de Comandos e Busca Global', categoria: 'Ações Globais' },
  { keys: ['?'], descricao: 'Abrir esta ajuda de atalhos de teclado', categoria: 'Ações Globais' },
  { keys: ['Esc'], descricao: 'Fechar qualquer modal, gaveta ou overlay ativo', categoria: 'Controles de Interface' },
  { keys: ['G', 'H'], descricao: 'Ir para o Painel Geral (Home Hub)', categoria: 'Navegação Rápida' },
  { keys: ['G', 'F'], descricao: 'Ir para Gestão de Frotas & Viaturas', categoria: 'Navegação Rápida' },
  { keys: ['G', 'C'], descricao: 'Ir para Chamados & Suporte TI (Kanban)', categoria: 'Navegação Rápida' },
  { keys: ['G', 'S'], descricao: 'Ir para Reserva de Salas & Auditórios', categoria: 'Navegação Rápida' },
  { keys: ['G', 'D'], descricao: 'Ir para Diárias & Deslocamentos (Decreto 1.428)', categoria: 'Navegação Rápida' },
  { keys: ['G', 'R'], descricao: 'Ir para Fundo Rotativo CENSE (19 Unidades)', categoria: 'Navegação Rápida' },
  { keys: ['G', 'T'], descricao: 'Ir para Telefonia & Guia de Ramais', categoria: 'Navegação Rápida' },
  { keys: ['G', 'A'], descricao: 'Ir para Trilha de Auditoria Criptográfica SHA-256', categoria: 'Navegação Rápida' }
];

export const HotkeysHelpModal: React.FC<HotkeysHelpModalProps> = ({ isOpen, onClose }) => {
  const categorias: Array<'Ações Globais' | 'Navegação Rápida' | 'Controles de Interface'> = [
    'Ações Globais',
    'Navegação Rápida',
    'Controles de Interface'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Atalhos de Teclado · SEJU Gov.PR"
      description="Navegue rapidamente pelo sistema institucional utilizando teclas de atalho."
      size="md"
    >
      <div className="space-y-5 py-2">
        {categorias.map((cat) => {
          const itens = SHORTCUTS.filter(s => s.categoria === cat);
          return (
            <div key={cat} className="space-y-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {cat}
              </h4>
              <div className="divide-y divide-[var(--border-subtle)] border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--surface-2)]/30 overflow-hidden">
                {itens.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3.5 py-2.5 text-xs hover:bg-[var(--surface-2)] transition-colors"
                  >
                    <span className="text-[var(--text)] font-medium">
                      {item.descricao}
                    </span>
                    <div className="flex items-center gap-1 shrink-0 ml-3">
                      {item.keys.map((k, kIdx) => (
                        <React.Fragment key={kIdx}>
                          <kbd className="px-2 py-0.5 min-w-[22px] text-center text-[10px] font-mono font-semibold bg-[var(--surface)] text-[var(--text)] border border-[var(--border-strong)] rounded shadow-xs">
                            {k}
                          </kbd>
                          {kIdx < item.keys.length - 1 && (
                            <span className="text-[10px] text-[var(--text-muted)]">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="pt-2 text-center text-[11px] text-[var(--text-muted)]">
          Pressione <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-[var(--surface-2)] border border-[var(--border)] rounded">Esc</kbd> a qualquer momento para fechar.
        </div>
      </div>
    </Modal>
  );
};
