import React, { useState, useEffect } from 'react';
import logoImg from '../assets/pearl-polishh-logo.jpeg';
import { getStoredStudioSettings } from '../data/storage';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  lightText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', lightText = false }) => {
  const [imgSrc, setImgSrc] = useState<string>(logoImg || '/pearl-polishh-logo.jpeg');
  const [imgError, setImgError] = useState(false);
  const [studioName, setStudioName] = useState('Pearl & Polishh');

  useEffect(() => {
    try {
      const settings = getStoredStudioSettings();
      if (settings?.studioName) {
        setStudioName(settings.studioName);
      }
    } catch (e) {
      // fallback
    }
  }, []);

  const handleImageError = () => {
    if (imgSrc !== '/pearl-polishh-logo.jpeg') {
      setImgSrc('/pearl-polishh-logo.jpeg');
    } else {
      setImgError(true);
    }
  };

  const iconSizes = {
    sm: 'w-9 h-9 sm:w-10 sm:h-10',
    md: 'w-11 h-11 sm:w-12 sm:h-12 lg:w-13 lg:h-13',
    lg: 'w-16 h-16 sm:w-18 sm:h-18',
  };

  const textSizes = {
    sm: 'text-lg sm:text-xl',
    md: 'text-xl sm:text-2xl lg:text-[28px]',
    lg: 'text-2xl sm:text-3xl lg:text-4xl',
  };

  return (
    <div className="flex items-center gap-2.5 sm:gap-3 select-none shrink-0 group">
      {/* Brand Logo Icon Ring */}
      <div className={`${iconSizes[size]} relative flex items-center justify-center shrink-0 rounded-full p-[2px] bg-gradient-to-tr from-[#B8860B] via-[#F3E5AB] to-[#D4AF37] shadow-sm group-hover:shadow-md transition-all duration-300`}>
        <div className="w-full h-full rounded-full overflow-hidden bg-[#38040F] flex items-center justify-center border border-white/20">
          {!imgError ? (
            <img
              src={imgSrc}
              alt={`${studioName} Logo`}
              onError={handleImageError}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-serif font-black text-[#D4AF37] text-xs sm:text-sm tracking-widest">
              P&amp;P
            </span>
          )}
        </div>
      </div>

      {/* Brand Name */}
      <div className="flex flex-col justify-center">
        <span
          className={`font-serif font-bold tracking-tight leading-none whitespace-nowrap ${textSizes[size]} ${
            lightText ? 'text-white' : 'text-[#38040F]'
          }`}
        >
          Pearl <span className="font-serif italic font-normal text-[#D4AF37] px-0.5">&amp;</span> Polishh
        </span>
      </div>
    </div>
  );
};


