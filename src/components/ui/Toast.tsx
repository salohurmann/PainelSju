import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'danger' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  variant?: ToastVariant;
}

export interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const icons: Record<ToastVariant, React.ReactNode> = {
    success: <CheckCircle2 size={16} className="text-[var(--success)] shrink-0" />,
    danger: <AlertCircle size={16} className="text-[var(--danger)] shrink-0" />,
    warning: <AlertTriangle size={16} className="text-[var(--warning)] shrink-0" />,
    info: <Info size={16} className="text-[var(--brand)] shrink-0" />
  };

  const variant = toast.variant || 'info';

  return (
    <div
      role="status"
      className="flex items-start gap-3 p-3.5 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-lg max-w-sm w-full animate-in slide-in-from-bottom-2 fade-in duration-150"
    >
      <div className="pt-0.5">{icons[variant]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[var(--text)] leading-snug">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-[var(--text-muted)] leading-relaxed mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-[var(--text-muted)] hover:text-[var(--text)] p-0.5 rounded-[var(--radius-sm)] transition-colors cursor-pointer shrink-0"
        aria-label="Fechar notificação"
      >
        <X size={14} />
      </button>
    </div>
  );
};
