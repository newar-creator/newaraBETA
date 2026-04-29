import React from 'react';
import { motion } from 'motion/react';

interface NewAraLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'white' | 'black';
}

export const NewAraLogo: React.FC<NewAraLogoProps> = ({ className = '', size = 'md', theme = 'white' }) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl'
  };

  return (
    <motion.div 
      className={`font-logo font-bold tracking-tighter flex items-baseline select-none ${sizeClasses[size]} ${className}`}
      whileHover={{ scale: 1.05 }}
    >
      <span className={`${theme === 'black' ? 'text-white' : 'text-[#1a2b4b]'} transition-colors duration-500`}>
        New
      </span>
      <span 
        className="bg-gradient-to-r from-[#00d2ff] via-[#48ffcc] to-[#00ff2b] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]"
      >
        Ara
      </span>
    </motion.div>
  );
};
