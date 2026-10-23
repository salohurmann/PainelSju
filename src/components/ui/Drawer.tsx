import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  side?: 'right' | 'left';
  footer?: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  width = 'md',
  side = 'right',
  footer
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  }[width];

  const sideAnimation = side === 'right' ? 'slide-in-from-right' : 'slide-in-from-left';

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed top-0 bottom-0 ${
          side === 'right' ? 'right-0' : 'left-0'
        } w-full ${widthClasses} bg-[var(--surface)] text-[var(--text)] border-${
          side === 'right' ? 'l' : 'r'
        } border-[var(--border)] shadow-2xl z-10 flex flex-col animate-in ${sideAnimation} duration-200`}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between px-5 py-4 border-b border-[var(--border)] gap-4">
            <div>
              {title && <h2 className="text-base font-semibold text-[var(--text)]">{title}</h2>}
              {description && <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-[var(--text-muted)] hover:text-[var(--text)] p-1 rounded-[var(--radius-sm)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              aria-label="Fechar painel"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 text-sm">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--border)] bg-[var(--surface-2)]/40">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
