import React from 'react';

interface BrasaoParanaProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const BrasaoParana: React.FC<BrasaoParanaProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-10',
    md: 'w-12 h-15',
    lg: 'w-16 h-20',
    xl: 'w-24 h-30'
  };

  return (
    <img 
      src="/brasao-parana.png" 
      alt="Brasão de Armas do Governo do Estado do Paraná" 
      className={`object-contain select-none drop-shadow-sm ${sizeClasses[size]} ${className}`}
      loading="eager"
    />
  );
};
