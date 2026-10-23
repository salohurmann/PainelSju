import React from 'react';

export type BadgeVariant = 'brand' | 'success' | 'warning' | 'danger' | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  dot = false,
  icon,
  className = '',
  ...props
}) => {
  const variantClasses: Record<BadgeVariant, string> = {
    brand: 'bg-[var(--brand-subtle)] text-[var(--brand)] border-[var(--brand)]/20',
    success: 'bg-[var(--success-subtle)] text-[var(--success)] border-[var(--success)]/25',
    warning: 'bg-[var(--warning-subtle)] text-[var(--warning)] border-[var(--warning)]/25',
    danger: 'bg-[var(--danger-subtle)] text-[var(--danger)] border-[var(--danger)]/25',
    neutral: 'bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)]'
  };

  const dotClasses: Record<BadgeVariant, string> = {
    brand: 'bg-[var(--brand)]',
    success: 'bg-[var(--success)]',
    warning: 'bg-[var(--warning)]',
    danger: 'bg-[var(--danger)]',
    neutral: 'bg-[var(--text-muted)]'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 h-[22px] px-2 text-xs font-medium rounded-[var(--radius-sm)] border leading-none select-none ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClasses[variant]}`} />}
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
};
