import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
  icon?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: 'underline' | 'segmented';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeId,
  onChange,
  variant = 'underline',
  className = ''
}) => {
  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex items-center gap-1 p-1 bg-[var(--surface-2)] rounded-[var(--radius-md)] border border-[var(--border)] overflow-x-auto max-w-full ${className}`}
      >
        {items.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] transition-all cursor-pointer whitespace-nowrap select-none ${
                isActive
                  ? 'bg-[var(--surface)] text-[var(--text)] font-semibold shadow-xs border border-[var(--border)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)] border border-transparent'
              }`}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? 'bg-[var(--surface-2)] text-[var(--text)]' : 'bg-[var(--surface)] text-[var(--text-muted)]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`border-b border-[var(--border)] flex items-center gap-4 overflow-x-auto ${className}`}>
      {items.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative inline-flex items-center gap-2 py-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap select-none ${
              isActive ? 'text-[var(--brand)] font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${
                  isActive ? 'bg-[var(--brand-subtle)] text-[var(--brand)]' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                }`}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand)] rounded-t-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};
