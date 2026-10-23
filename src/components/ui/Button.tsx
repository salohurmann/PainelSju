import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-8 px-2.5 text-xs gap-1.5',
    md: 'h-9 px-3.5 text-xs gap-2',
    lg: 'h-10 px-4 text-sm gap-2'
  }[size];

  const variantClasses = {
    primary: 'bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] border border-transparent shadow-xs font-semibold',
    secondary: 'bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-2)] border border-[var(--border)] font-medium',
    ghost: 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] border border-transparent font-medium',
    danger: 'bg-[var(--danger)] text-white hover:opacity-90 border border-transparent font-semibold shadow-xs'
  }[variant];

  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={`inline-flex items-center justify-center rounded-[var(--radius-md)] transition-colors cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin shrink-0 text-current" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
