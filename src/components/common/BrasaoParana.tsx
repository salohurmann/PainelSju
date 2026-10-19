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

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none group/brasao ${sizeClasses[size]} ${className}`}
    >
      {/* Halo de Joalheria Institucional (Brilho Especular Tricolor Sutil) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-tr from-[#0072BB]/20 via-[#009B54]/15 to-[#C59B27]/25 opacity-75 blur-[3px] group-hover/brasao:opacity-100 group-hover/brasao:blur-[4px] transition-all duration-300"
      />
      {/* Anel Filigrana Dourado/Prata Sutil */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-0.5 rounded-xl ring-1 ring-inset ring-[#C59B27]/25 group-hover/brasao:ring-[#C59B27]/45 transition-all duration-300"
      />

      {imgError ? (
        <svg
          viewBox="0 0 64 76"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 w-full h-full select-none drop-shadow-[0_2px_4px_rgba(15,23,42,0.18)]"
        >
          <defs>
            <linearGradient id="escudoPrGrad" x1="8" y1="4" x2="56" y2="72" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0082D5" />
              <stop offset="55%" stopColor="#0072BB" />
              <stop offset="100%" stopColor="#004C80" />
            </linearGradient>
            <linearGradient id="ouroPrGrad" x1="0" y1="0" x2="64" y2="76" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E5C158" />
              <stop offset="50%" stopColor="#C59B27" />
              <stop offset="100%" stopColor="#9A7414" />
            </linearGradient>
          </defs>
          <path
            d="M32 4L8 14V36C8 54 18.5 67.5 32 72C45.5 67.5 56 54 56 36V14L32 4Z"
            fill="url(#escudoPrGrad)"
            stroke="url(#ouroPrGrad)"
            strokeWidth="3.2"
          />
          <path
            d="M14 26L50 50M14 34L50 58"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="32" cy="36" r="10.5" fill="#009B54" stroke="url(#ouroPrGrad)" strokeWidth="2.2" />
          <circle cx="32" cy="36" r="3.5" fill="#FFFFFF" />
        </svg>
      ) : (
        <img 
          src={`${import.meta.env.BASE_URL}brasao-parana.png`} 
          alt="Brasão do Paraná" 
          onError={() => setImgError(true)}
          className="relative z-10 w-full h-full object-contain select-none drop-shadow-[0_2px_3px_rgba(15,23,42,0.16)] contrast-[1.05] saturate-[1.06] transition-transform duration-300 group-hover/brasao:scale-[1.04]"
          loading="eager"
        />
      )}
    </div>
  );
};
