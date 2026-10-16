import React, { useState } from 'react';

interface BrasaoParanaProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const BrasaoParana: React.FC<BrasaoParanaProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-8',
    md: 'w-9 h-11',
    lg: 'w-14 h-17',
    xl: 'w-24 h-28'
  };

  if (imgError) {
    return (
      <svg
        viewBox="0 0 64 76"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`select-none ${sizeClasses[size]} ${className}`}
      >
        <path
          d="M32 4L8 14V36C8 54 18.5 67.5 32 72C45.5 67.5 56 54 56 36V14L32 4Z"
          fill="#0072BB"
          stroke="#C59B27"
          strokeWidth="3"
        />
        <path
          d="M14 26L50 50M14 34L50 58"
          stroke="#FFFFFF"
          strokeWidth="4"
        />
        <circle cx="32" cy="36" r="10" fill="#009B54" stroke="#FFFFFF" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <img 
      src={`${import.meta.env.BASE_URL}brasao-parana.png`} 
      alt="Brasão do Paraná" 
      onError={() => setImgError(true)}
      className={`object-contain select-none ${sizeClasses[size]} ${className}`}
      loading="eager"
    />
  );
};
