import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface KpiStatProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: string | number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  description?: string;
  badge?: React.ReactNode;
}

export const KpiStat: React.FC<KpiStatProps> = ({
  label,
  value,
  unit,
  trend,
  description,
  badge,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`p-4 sm:p-5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] flex flex-col justify-between transition-colors ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-[var(--text-muted)] truncate">{label}</span>
        {badge}
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text)] tabular-nums">
          {value}
        </span>
        {unit && <span className="text-xs font-medium text-[var(--text-muted)]">{unit}</span>}
      </div>

      {(trend || description) && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
          {trend && (
            <span
              className={`inline-flex items-center gap-1 font-medium tabular-nums ${
                trend.direction === 'up'
                  ? 'text-[var(--success)]'
                  : trend.direction === 'down'
                  ? 'text-[var(--danger)]'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              {trend.direction === 'up' && <TrendingUp size={13} strokeWidth={2} />}
              {trend.direction === 'down' && <TrendingDown size={13} strokeWidth={2} />}
              {trend.direction === 'neutral' && <Minus size={13} strokeWidth={2} />}
              <span>{trend.value}</span>
            </span>
          )}
          {trend?.label && <span className="truncate">{trend.label}</span>}
          {!trend && description && <span className="truncate">{description}</span>}
        </div>
      )}
    </div>
  );
};
