import React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'square';
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  shape = 'circle',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm'
  }[size];

  const shapeClasses = shape === 'circle' ? 'rounded-full' : 'rounded-[var(--radius-md)]';

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  return (
    <div
      className={`relative inline-flex items-center justify-center font-semibold bg-[var(--surface-2)] text-[var(--brand)] border border-[var(--border)] overflow-hidden shrink-0 select-none ${sizeClasses} ${shapeClasses} ${className}`}
      {...props}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
