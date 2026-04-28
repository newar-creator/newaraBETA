import { motion } from 'motion/react';
import React from 'react';

const Bubble = ({ size, initialX, initialY, duration, delay, color }: { 
  size: number; 
  initialX: string; 
  initialY: string; 
  duration: number; 
  delay: number;
  color: string;
}) => {
  return (
    <motion.div
      initial={{ x: initialX, y: initialY, opacity: 0, scale: 0 }}
      animate={{
        y: [initialY, '-20vh'], // Move upwards
        x: [initialX, `calc(${initialX} + ${Math.random() > 0.5 ? '' : '-'}${20 + Math.random() * 40}px)`], // Sway
        opacity: [0, 0.4, 0.4, 0],
        scale: [0.5, 1, 1, 0.8],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut"
      }}
      className="absolute rounded-full pointer-events-none overflow-hidden"
      style={{
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
  const bubbles = [
    { size: 120, x: '10%', y: '110%', duration: 15, delay: 0, color: '#4ca5ff' },
    { size: 80, x: '25%', y: '120%', duration: 12, delay: 2, color: '#67c23a' },
    { size: 150, x: '45%', y: '115%', duration: 18, delay: 5, color: '#00f2ff' },
    { size: 60, x: '60%', y: '130%', duration: 10, delay: 1, color: '#4ca5ff' },
    { size: 200, x: '80%', y: '110%', duration: 25, delay: 8, color: '#67c23a' },
    { size: 100, x: '90%', y: '125%', duration: 14, delay: 4, color: '#00f2ff' },
    { size: 130, x: '15%', y: '140%', duration: 20, delay: 7, color: '#4ca5ff' },
    { size: 70, x: '35%', y: '135%', duration: 11, delay: 3, color: '#67c23a' },
    { size: 90, x: '70%', y: '120%', duration: 16, delay: 6, color: '#00f2ff' },
  ];

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
