import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  id,
  className = '',
  disabled,
  ...props
}, ref) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-[var(--text)] select-none">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <span className="absolute left-3 text-[var(--text-muted)] pointer-events-none flex items-center justify-center">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`w-full h-10 px-3 bg-[var(--surface)] text-[var(--text)] text-sm rounded-[var(--radius-md)] border transition-colors outline-none placeholder:text-[var(--text-muted)] disabled:opacity-50 disabled:bg-[var(--surface-2)] disabled:cursor-not-allowed ${
            leftIcon ? 'pl-9' : ''
          } ${
            rightIcon ? 'pr-9' : ''
          } ${
            error
              ? 'border-[var(--danger)] focus:ring-2 focus:ring-[var(--danger)]/20 focus:border-[var(--danger)]'
              : 'border-[var(--border)] hover:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)]'
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 text-[var(--text-muted)] flex items-center justify-center">
            {rightIcon}
          </span>
        )}
      </div>
      {error ? (
        <p className="text-xs text-[var(--danger)] leading-tight">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[var(--text-muted)] leading-tight">{hint}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
