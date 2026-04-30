import { motion } from 'motion/react';
import React from 'react';

const Bubble: React.FC<{ 
  size: number; 
  initialX: number; 
  initialY: number; 
  duration: number; 
  delay: number;
  color: string;
}> = ({ size, initialX, initialY, duration, delay, color }) => {
  return (
    <motion.div
      initial={{ y: '110vh', opacity: 0, scale: 0 }}
      animate={{
        y: ['110vh', '-20vh'],
        x: [0, Math.random() > 0.5 ? 20 : -20, 0],
        opacity: [0, 0.4, 0.4, 0],
        scale: [0.5, 1, 1, 0.8],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        delay: delay,
        ease: "linear"
      }}
      className="absolute rounded-full pointer-events-none overflow-hidden"
      style={{
        left: `${initialX}%`,
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 30%, white 0%, transparent 50%), 
                    linear-gradient(135deg, ${color}33 0%, ${color}99 100%)`,
        boxShadow: `inset -5px -5px 15px rgba(255,255,255,0.4), 
                    inset 5px 5px 15px rgba(0,0,0,0.1),
                    0 10px 25px rgba(0,0,0,0.05)`,
        border: '1px solid rgba(255,255,255,0.3)',
        willChange: 'transform, opacity',
      }}
    >
      <div 
        className="absolute top-[10%] left-[15%] w-[40%] h-[20%] bg-white/30 rounded-[100%] rotate-[-35deg]"
      />
    </motion.div>
  );
};

export const BubbleBackground: React.FC<{ theme?: 'white' | 'black' }> = ({ theme = 'white' }) => {
  // Balanced set of bubbles for performance
  const bubbles = React.useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const count = isMobile ? 6 : 10; // Significantly reduced for mobile performance
    return Array.from({ length: count }).map((_, i) => ({
      size: 60 + Math.random() * 140,
      x: Math.random() * 100,
      y: 110,
      duration: 18 + Math.random() * 25, // Slower is better for performance
      delay: Math.random() * 10,
      color: theme === 'white' 
        ? ['#4ca5ff', '#67c23a', '#00f2ff', '#ffec3d'][i % 4]
        : ['#1a2b4b', '#004d40', '#4a148c', '#bf360c'][i % 4]
    }));
  }, [theme]);

  const bgStyles = theme === 'white' 
    ? "bg-gradient-to-b from-[#e6f3ff] via-[#f0f9ff] to-[#ffffff]"
    : "bg-gradient-to-b from-[#0a0f1d] via-[#1a2b4b] to-[#0a0f1d]";

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none z-[-1] transition-colors duration-1000 ${bgStyles}`}>
      {/* Soft light spots */}
      <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 ${theme === 'white' ? 'bg-[#a8d8ff]' : 'bg-[#1e3a8a]'}`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-20 ${theme === 'white' ? 'bg-[#c2ffcc]' : 'bg-[#064e3b]'}`} />
      
      {bubbles.map((b, i) => (
        <Bubble 
          key={i}
          size={b.size}
          initialX={b.x}
          initialY={b.y}
          duration={b.duration}
          delay={b.delay}
          color={b.color}
        />
      ))}
    </div>
  );
};
