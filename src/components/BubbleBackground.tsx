import { motion } from 'motion/react';
import React from 'react';

const Bubble = ({ size, initialX, initialY, duration, delay, color }: { 
  size: number; 
  initialX: number; 
  initialY: number; 
  duration: number; 
  delay: number;
  color: string;
}) => {
  return (
    <motion.div
      initial={{ y: '110vh', opacity: 0, scale: 0 }}
      animate={{
        y: ['110vh', '-20vh'], // Move upwards across the whole screen
        x: [0, Math.random() > 0.5 ? 20 : -20, 0], // Sway slightly
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
        background: `radial-gradient(circle at 30% 30%, white 0%, transparent 40%), 
                    radial-gradient(circle at 70% 70%, ${color}66 0%, transparent 60%),
                    linear-gradient(135deg, ${color}33 0%, ${color}aa 100%)`,
        boxShadow: `inset -10px -10px 20px rgba(255,255,255,0.5), 
                    inset 10px 10px 20px rgba(0,0,0,0.15),
                    0 15px 35px rgba(0,0,0,0.1)`,
        backdropFilter: 'blur(3px)',
        border: '1.5px solid rgba(255,255,255,0.4)',
      }}
    >
      {/* Glossy Reflection overlay */}
      <div 
        className="absolute top-[10%] left-[15%] w-[40%] h-[20%] bg-white/40 rounded-[100%] rotate-[-35deg]"
        style={{ filter: 'blur(1px)' }}
      />
    </motion.div>
  );
};

export const BubbleBackground: React.FC = () => {
  // Generate a larger set of randomized bubbles
  const bubbles = React.useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      size: 40 + Math.random() * 160,
      x: Math.random() * 100, // 0 to 100% of width
      y: 110,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 10,
      color: ['#4ca5ff', '#67c23a', '#00f2ff', '#ffec3d'][Math.floor(Math.random() * 4)]
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-gradient-to-b from-[#e6f3ff] via-[#f0f9ff] to-[#ffffff]">
      {/* Soft light spots */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#a8d8ff] rounded-full blur-[120px] opacity-20" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#c2ffcc] rounded-full blur-[120px] opacity-20" />
      
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
