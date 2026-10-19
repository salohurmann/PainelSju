import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  hint,
  id,
  className = '',
  rows = 3,
  disabled,
  ...props
}, ref) => {
  const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-xs font-medium text-[var(--text)] select-none">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        disabled={disabled}
        className={`w-full p-3 bg-[var(--surface)] text-[var(--text)] text-sm rounded-[var(--radius-md)] border transition-colors outline-none placeholder:text-[var(--text-muted)] disabled:opacity-50 disabled:bg-[var(--surface-2)] disabled:cursor-not-allowed resize-y ${
          error
            ? 'border-[var(--danger)] focus:ring-2 focus:ring-[var(--danger)]/20 focus:border-[var(--danger)]'
            : 'border-[var(--border)] hover:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)]'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-[var(--danger)] leading-tight">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[var(--text-muted)] leading-tight">{hint}</p>
      ) : null}
    </div>
  );
});

Textarea.displayName = 'Textarea';
