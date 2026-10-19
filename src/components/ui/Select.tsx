import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  hint,
  options,
  children,
  id,
  className = '',
  disabled,
  ...props
}, ref) => {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-[var(--text)] select-none">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={`w-full h-10 pl-3 pr-9 bg-[var(--surface)] text-[var(--text)] text-sm rounded-[var(--radius-md)] border appearance-none transition-colors outline-none cursor-pointer disabled:opacity-50 disabled:bg-[var(--surface-2)] disabled:cursor-not-allowed ${
            error
              ? 'border-[var(--danger)] focus:ring-2 focus:ring-[var(--danger)]/20 focus:border-[var(--danger)]'
              : 'border-[var(--border)] hover:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)]'
          } ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-[var(--surface)] text-[var(--text)]">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <span className="absolute right-3 text-[var(--text-muted)] pointer-events-none flex items-center justify-center">
          <ChevronDown size={16} />
        </span>
      </div>
      {error ? (
        <p className="text-xs text-[var(--danger)] leading-tight">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[var(--text-muted)] leading-tight">{hint}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
