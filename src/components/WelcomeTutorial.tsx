import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NewAraLogo } from './NewAraLogo';
import { ChevronRight } from 'lucide-react';

export const WelcomeTutorial: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[#020617] pointer-events-auto"
        >
          {/* Animated Background Particles/Glow */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
                x: [0, 50, 0],
                y: [0, 30, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[100px]"
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.3, 0.1],
                x: [0, -40, 0],
                y: [0, -60, 0]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sky-500/20 blur-[120px]"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: 0.2 
              }}
              className="mb-8"
            >
              <div className="relative">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-0 bg-blue-400/20 blur-2xl rounded-full"
                />
                <NewAraLogo size="lg" theme="black" className="scale-[1.8] relative z-10" />
              </div>
            </motion.div>

            <div className="overflow-hidden mb-2">
              <motion.h1
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                className="text-white text-5xl md:text-7xl font-black uppercase tracking-tighter"
              >
                Bienvenido
              </motion.h1>
            </div>

            <div className="overflow-hidden mb-12">
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
                className="text-blue-200/60 text-sm md:text-base font-medium tracking-[0.3em] uppercase"
              >
                Tu entorno educativo inteligente
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <button
                onClick={onComplete}
                className="group relative flex items-center gap-3 px-8 py-4 bg-white text-slate-950 rounded-full font-black uppercase tracking-widest text-sm hover:bg-blue-50 transition-all shadow-2xl active:scale-95"
              >
                Comenzar ahora
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronRight size={18} strokeWidth={3} />
                </motion.div>
                
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-full bg-white blur-md opacity-0 group-hover:opacity-30 transition-opacity" />
              </button>
            </motion.div>
          </div>

          {/* Bottom decorative accents */}
          <div className="absolute bottom-12 left-0 right-0 flex justify-center px-6">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "20%" }}
              transition={{ duration: 1.5, delay: 0.8 }}
              className="h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
