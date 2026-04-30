import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NewAraLogo } from './NewAraLogo';
import { ArrowBigRight, ArrowBigDown, ArrowBigUp, X } from 'lucide-react';

interface TutorialStep {
  targetId: string;
  text: string;
  position: 'right' | 'top' | 'bottom' | 'left';
}

const STEPS: TutorialStep[] = [
  { targetId: 'nav-home', text: 'Vuelve a la pantalla principal y mira tus materias.', position: 'right' },
  { targetId: 'nav-gallery', text: 'Explora actividades compartidas por otros usuarios.', position: 'right' },
  { targetId: 'nav-schedule', text: 'Gestiona tu horario escolar fácilmente.', position: 'right' },
  { targetId: 'nav-exam', text: 'Prepárate con simulacros de examen.', position: 'right' },
  { targetId: 'nav-settings', text: 'Personaliza tu perfil y ajustes de la app.', position: 'right' },
];

export const WelcomeTutorial: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'splash' | 'tutorial' | 'none'>('splash');
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (phase === 'splash') {
      const timer = setTimeout(() => {
        setPhase('tutorial');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'tutorial') {
      const updateRect = () => {
        const element = document.getElementById(STEPS[currentStep].targetId);
        if (element && element.offsetParent !== null) {
          setTargetRect(element.getBoundingClientRect());
        } else {
          setTargetRect(null);
        }
      };
      
      updateRect();
      const timer = setTimeout(updateRect, 100); // Small delay for layout
      window.addEventListener('resize', updateRect);
      return () => {
        window.removeEventListener('resize', updateRect);
        clearTimeout(timer);
      };
    }
  }, [phase, currentStep]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <AnimatePresence>
        {phase === 'splash' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0a1122] flex flex-col items-center justify-center pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <NewAraLogo size="lg" theme="black" className="scale-150 mb-8" />
            </motion.div>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white text-3xl font-black uppercase tracking-[0.2em]"
            >
              Bienvenido
            </motion.p>
          </motion.div>
        )}

        {phase === 'tutorial' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 pointer-events-auto overflow-hidden"
          >
            {/* Highlight Hole */}
            <AnimatePresence mode="wait">
              {targetRect && (
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute border-2 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.5)] rounded-xl pointer-events-none z-10"
                  style={{
                    top: targetRect.top - 4,
                    left: targetRect.left - 4,
                    width: targetRect.width + 8,
                    height: targetRect.height + 8,
                  }}
                />
              )}
            </AnimatePresence>

            {/* Explanation box */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`absolute bg-white p-6 rounded-3xl shadow-2xl w-[90%] max-w-sm z-20 pointer-events-auto ${
                !targetRect ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''
              }`}
              style={targetRect ? (isMobile ? {
                top: targetRect.top - 200 > 0 ? targetRect.top - 200 : targetRect.bottom + 40,
                left: '5%',
                width: '90%'
              } : {
                top: targetRect.top,
                left: targetRect.right + 40,
              }) : undefined}
            >
              {!isMobile && targetRect && (
                <div className="absolute -left-8 top-6 text-sky-400">
                  <ArrowBigRight size={32} fill="currentColor" />
                </div>
              )}
              {isMobile && targetRect && (
                <div className={`absolute left-1/2 -translate-x-1/2 text-sky-400 ${targetRect.top - 200 > 0 ? '-bottom-8' : '-top-8'}`}>
                  {targetRect.top - 200 > 0 ? <ArrowBigDown size={32} fill="currentColor" /> : <ArrowBigUp size={32} fill="currentColor" />}
                </div>
              )}
              <p className="text-sky-950 font-bold text-lg mb-4 leading-tight">
                {STEPS[currentStep].text}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-sky-900/40 uppercase tracking-widest leading-none">
                  Paso {currentStep + 1} de {STEPS.length}
                </span>
                <button 
                  onClick={handleNext}
                  className="px-4 py-2 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-colors shadow-lg active:scale-95"
                >
                  {currentStep === STEPS.length - 1 ? '¡Empezar!' : 'Siguiente'}
                </button>
              </div>
            </motion.div>

            {/* Close button */}
            <button 
              onClick={onComplete}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-30"
            >
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
