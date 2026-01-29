
import React from 'react';

interface RCMLogoProps {
  className?: string;
  size?: number;
  textColor?: string;
  showText?: boolean;
}

export const RCMLogo: React.FC<RCMLogoProps> = ({ className, size = 180, textColor = "text-black", showText = true }) => {
  const brandOrange = "#F36F21";

  return (
    <div className={`flex flex-col items-center justify-center ${className}`} style={{ width: size }}>
      <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-2xl">
        <defs>
          <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={brandOrange} />
            <stop offset="100%" stopColor="#2D3748" />
          </linearGradient>
        </defs>
        {/* Hexagonal Shield Background */}
        <path d="M200 40L360 130V270L200 360L40 270V130L200 40Z" fill="url(#hexGrad)" />
        
        {/* The Bold White 'R' */}
        <path d="M130 110H220C260 110 290 135 290 180C290 225 260 250 220 250H130V110ZM190 150V210H220C235 210 245 200 245 180C245 160 235 150 220 150H190Z" fill="white" />
        <path d="M130 250V310H190V250H130ZM220 250L290 310H350L260 230C275 225 285 210 290 195L220 250Z" fill="white" />
        
        {/* The Orange Growth Chevron */}
        <path d="M160 230L200 200L240 230" stroke={brandOrange} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Corner Nodes */}
        <circle cx="200" cy="40" r="10" fill={brandOrange} />
        <circle cx="360" cy="130" r="6" fill="white" opacity="0.8" />
        <circle cx="40" cy="130" r="6" fill="white" opacity="0.8" />
      </svg>
      
      {showText && (
        <div className="mt-8 text-center">
          <h1 className={`text-[2.6em] font-[1000] tracking-tighter leading-[0.8] uppercase ${textColor}`}>
            RCM<br/><span style={{ color: brandOrange }}>DEALER</span>
          </h1>
        </div>
      )}
    </div>
  );
};
