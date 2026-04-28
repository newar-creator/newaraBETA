import React from 'react';
import { motion } from 'motion/react';
import { playExternalBubble } from '../lib/sounds';

interface AeroCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  theme?: 'white' | 'black';
}

export const AeroCard: React.FC<AeroCardProps> = ({ children, className = '', title, theme = 'white' }) => {
  const themeClasses = theme === 'black' 
    ? "bg-black/60 border-white/20 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]" 
    : "bg-white/40 border-t-white/80 border-l-white/60 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]";

  const titleClasses = theme === 'black' ? "text-white/90" : "text-sky-900";
  const contentClasses = theme === 'black' ? "text-white/80" : "text-sky-950";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`aero-glass rounded-[2rem] p-6 overflow-hidden relative border transition-all duration-500 ${themeClasses} ${className}`}
    >
      <div className={`absolute inset-0 ${theme === 'black' ? 'bg-gradient-to-br from-white/5 to-transparent' : 'bg-gradient-to-br from-white/40 to-transparent'} pointer-events-none`} />
      <div className="glossy-overlay opacity-20" />
      {title && (
        <h3 className={`text-xl font-black mb-4 ${titleClasses} border-b border-white/10 pb-2 flex items-center gap-2 transition-colors duration-500`}>
          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          {title}
        </h3>
      )}
      <div className={`relative z-10 ${contentClasses} transition-colors duration-500`}>
        {children}
      </div>
    </motion.div>
  );
};

interface GlossyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'blue' | 'green';
}

export const GlossyButton: React.FC<GlossyButtonProps> = ({ children, className = '', variant = 'blue', onClick, ...props }) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playExternalBubble();
    if (onClick) onClick(e);
  };

  return (
    <button 
      className={`aero-button ${variant === 'green' ? 'aero-button-green' : ''} ${className}`}
      onClick={handleClick}
      {...props}
    >
      <div className="glossy-overlay opacity-40" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
};
