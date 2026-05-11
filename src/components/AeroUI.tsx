import React from 'react';
import { motion } from 'motion/react';
import { playExternalBubble } from '../lib/sounds';
import { Loader2, ShieldAlert } from 'lucide-react';

interface AeroCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  extra?: React.ReactNode;
  theme?: 'white' | 'black';
}

export const AeroCard: React.FC<AeroCardProps> = ({ children, className = '', title, extra, theme = 'white' }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const themeClasses = theme === 'black' 
    ? "bg-black/60 border-white/20 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]" 
    : "bg-white/40 border-t-white/80 border-l-white/60 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]";

  const titleClasses = theme === 'black' ? "text-white/90" : "text-sky-900";
  const contentClasses = theme === 'black' ? "text-white/80" : "text-sky-950";

  return (
    <motion.div 
      initial={{ opacity: 0, y: isMobile ? 10 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`aero-glass rounded-[2rem] p-3 md:p-6 overflow-hidden relative border transition-all duration-300 ${themeClasses} ${className}`}
    >
      <div className={`absolute inset-0 ${theme === 'black' ? 'bg-gradient-to-br from-white/5 to-transparent' : 'bg-gradient-to-br from-white/40 to-transparent'} pointer-events-none`} />
      <div className="glossy-overlay opacity-20" />
      {title && (
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
          <h3 className={`text-xl font-black ${titleClasses} flex items-center gap-2 transition-colors duration-500`}>
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            {title}
          </h3>
          {extra && <div className="flex-shrink-0">{extra}</div>}
        </div>
      )}
      <div className={`relative z-10 ${contentClasses} transition-colors duration-500 ${className.includes('flex') ? 'flex-1 flex flex-col min-h-0' : ''}`}>
        {children}
      </div>
    </motion.div>
  );
};

interface GlossyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  theme?: 'white' | 'black';
}

export const GlossyInput: React.FC<GlossyInputProps> = ({ label, theme = 'white', className = '', ...props }) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className={`text-[10px] font-black uppercase tracking-widest opacity-60 ml-1 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>
          {label}
        </label>
      )}
      <div className="relative group">
        <input 
          {...props}
          className={`w-full px-5 py-3 rounded-2xl border text-sm font-bold transition-all duration-300 outline-none relative z-10 
            ${theme === 'black' 
              ? 'bg-white/5 border-white/10 text-white focus:bg-white/10 focus:border-white/30' 
              : 'bg-white/60 border-white/40 text-sky-950 focus:bg-white/80 focus:border-sky-300 shadow-[inset_0_1px_4px_rgba(0,0,0,0.05)]'
            } ${className}`}
        />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/20 to-transparent pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 z-20" />
      </div>
    </div>
  );
};

interface GlossyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'blue' | 'green' | 'pink' | 'gray';
  loading?: boolean;
}

export const GlossyButton: React.FC<GlossyButtonProps> = ({ children, className = '', variant = 'blue', onClick, loading, ...props }) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) return;
    playExternalBubble();
    if (onClick) onClick(e);
  };

  const variantClass = variant === 'green' ? 'aero-button-green' 
    : variant === 'pink' ? 'aero-button-pink'
    : variant === 'gray' ? 'aero-button-gray'
    : '';

  return (
    <button 
      className={`aero-button ${variantClass} ${className} ${loading ? 'opacity-70 cursor-wait' : ''}`}
      onClick={handleClick}
      disabled={loading || props.disabled}
      {...props}
    >
      <div className="glossy-overlay opacity-40" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && <Loader2 size={16} className="animate-spin" />}
        {children}
      </span>
    </button>
  );
};


export const AeroAuthAlert: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onLogin: () => void;
  message?: string;
  theme?: 'white' | 'black';
}> = ({ isOpen, onClose, onLogin, message = "Inicia sesión para continuar", theme = 'white' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className={`w-full max-w-sm rounded-[2rem] p-8 relative border overflow-hidden ${
          theme === 'black' 
            ? 'bg-black/80 border-white/20 text-white shadow-2xl' 
            : 'bg-white/80 border-white/60 text-sky-950 shadow-2xl'
        } backdrop-blur-xl`}
      >
        <div className={`absolute inset-0 ${theme === 'black' ? 'bg-gradient-to-br from-white/5 to-transparent' : 'bg-gradient-to-br from-white/60 to-transparent'} pointer-events-none`} />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/20 flex items-center justify-center text-sky-500 mb-2">
            <ShieldAlert size={32} />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tight">Acceso Requerido</h3>
            <p className="text-sm font-medium opacity-60 px-4 leading-relaxed">
              {message}
            </p>
          </div>

          <div className="flex flex-col w-full gap-3 pt-2">
            <GlossyButton onClick={() => { onLogin(); onClose(); }} className="w-full py-4 text-white bg-sky-500 shadow-lg shadow-sky-500/30">
              Iniciar Sesión
            </GlossyButton>
            <button onClick={onClose} className="text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity pb-2">
              Tal vez luego
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
