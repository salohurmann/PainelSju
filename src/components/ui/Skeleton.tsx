import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const variantClasses = {
    text: 'h-3.5 w-full rounded-[var(--radius-sm)]',
    rectangular: 'rounded-[var(--radius-md)]',
    circular: 'rounded-full'
  }[variant];

  return (
    <div
      className={`animate-pulse bg-[var(--surface-2)] border border-[var(--border-subtle)] ${variantClasses} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style
      }}
      {...props}
    />
  );
};
