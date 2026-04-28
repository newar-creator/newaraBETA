import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playExternalBubble } from '../lib/sounds';

interface MathGuideProps {
  onClose: () => void;
}

export const MathGuide: React.FC<MathGuideProps> = ({ onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-sky-900/60 backdrop-blur-2xl"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white/80 border-4 border-white rounded-[2rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col relative"
      >
        <div className="glossy-overlay opacity-30 pointer-events-none" />
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-violet-500 to-indigo-600 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl">
              🔢
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">GUÍA VISUAL: NÚMEROS NATURALES</h2>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Resumen Interactivo de Matemática</p>
            </div>
          </div>
          <button 
            onClick={() => {
              playExternalBubble();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-12 bg-white/20">
          
          {/* Hero Illustration Section */}
          <div className="relative h-48 rounded-[2.5rem] overflow-hidden group shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-indigo-500 to-violet-600 animate-gradient-xy"></div>
            {/* Animated Bubbles inside Hero */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-10 w-20 h-20 bg-white rounded-full blur-xl animate-pulse"></div>
              <div className="absolute bottom-10 right-20 w-32 h-32 bg-white rounded-full blur-2xl animate-pulse delay-700"></div>
            </div>
            
            <div className="relative h-full flex items-center justify-between px-10">
              <div className="max-w-md">
                <h3 className="text-4xl font-black text-white drop-shadow-lg mb-2">¡Mundo Natural!</h3>
                <p className="text-white/80 font-bold text-sm">Explora las bases de toda la matemática moderna con estilo NewAra.</p>
              </div>
              <div className="hidden md:flex gap-4">
                {['0', '1', '2', '3'].map((n, idx) => (
                  <motion.div 
                    key={n}
                    animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 3, delay: idx * 0.5, repeat: Infinity }}
                    className="w-16 h-16 bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-2xl"
                  >
                    {n}
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white/20 to-transparent"></div>
          </div>

          {/* Section 1: Operaciones */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 shadow-lg flex items-center justify-center text-2xl text-white">➕</div>
              <h3 className="text-2xl font-black text-violet-900 drop-shadow-sm">Operaciones y Propiedades</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-400 to-indigo-400 rounded-[2rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative p-6 rounded-[2rem] bg-white border border-white/50 shadow-sm">
                  <h4 className="font-black text-violet-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-sm">Σ</span>
                    Suma o Adición
                  </h4>
                  <div className="space-y-4">
                    <PropertyItem title="Conmutativa" formula="a + b = b + a" example="13 + 19 = 19 + 13" color="violet" />
                    <PropertyItem title="Asociativa" formula="(a+b)+c = a+(b+c)" example="(1+2)+3 = 1+(2+3)" color="violet" />
                    <PropertyItem title="Elemento Neutro" formula="a + 0 = a" example="7 + 0 = 7" color="violet" />
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-[2rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative p-6 rounded-[2rem] bg-white border border-white/50 shadow-sm">
                  <h4 className="font-black text-indigo-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-sm">Π</span>
                    Multiplicación
                  </h4>
                  <div className="space-y-4">
                    <PropertyItem title="Conmutativa" formula="a · b = b · a" example="5 · 4 = 4 · 5" color="indigo" />
                    <PropertyItem title="Elemento Neutro" formula="a · 1 = a" example="12 · 1 = 12" color="indigo" />
                    <PropertyItem title="Distributiva" formula="a·(b+c) = a·b + a·c" example="2·(3+4) = 2·3+2·4" color="indigo" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Division - Visual Diagram */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 shadow-lg flex items-center justify-center text-2xl text-white">➗</div>
              <h3 className="text-2xl font-black text-sky-900 drop-shadow-sm">El Diagrama de la División</h3>
            </div>
            
            <div className="bg-sky-50/50 p-10 rounded-[3rem] border-2 border-white shadow-inner relative overflow-hidden flex flex-col items-center">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-sky-200 rounded-full blur-3xl opacity-30"></div>
              
              <div className="grid grid-cols-2 gap-4 max-w-lg w-full relative">
                {/* Dividend */}
                <div className="col-span-1 p-6 rounded-3xl bg-white shadow-lg border border-sky-100 flex flex-col items-center justify-center group hover:scale-105 transition-transform">
                  <span className="text-4xl font-black text-sky-600 mb-2">D</span>
                  <span className="text-[10px] font-black uppercase text-slate-400">Dividendo</span>
                </div>
                {/* Divisor */}
                <div className="col-span-1 p-6 rounded-3xl bg-white shadow-lg border border-sky-100 flex flex-col items-center justify-center group hover:scale-105 transition-transform">
                  <span className="text-4xl font-black text-sky-400 mb-2">d</span>
                  <span className="text-[10px] font-black uppercase text-slate-400">Divisor</span>
                </div>
                {/* Cociente */}
                <div className="col-span-1 p-6 rounded-3xl bg-white shadow-lg border border-sky-100 flex flex-col items-center justify-center group hover:scale-105 transition-transform">
                  <span className="text-4xl font-black text-sky-800 mb-2">c</span>
                  <span className="text-[10px] font-black uppercase text-slate-400">Cociente</span>
                </div>
                {/* Resto */}
                <div className="col-span-1 p-6 rounded-3xl bg-white shadow-lg border border-sky-100 flex flex-col items-center justify-center group hover:scale-105 transition-transform">
                  <span className="text-4xl font-black text-rose-500 mb-2">r</span>
                  <span className="text-[10px] font-black uppercase text-slate-400">Resto</span>
                </div>

                {/* Formula Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full border border-sky-200 shadow-2xl text-xl font-black text-sky-900 border-b-4 border-b-sky-300">
                    D = d · c + r
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Criterios de Divisibilidad - Image-like cards */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 shadow-lg flex items-center justify-center text-2xl text-white">📏</div>
              <h3 className="text-2xl font-black text-rose-900 drop-shadow-sm">Flashcards de Divisibilidad</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <ModernDivCard num="2" rule="Pares" desc="Termina en 0, 2, 4, 6 u 8" color="rose" />
              <ModernDivCard num="3" rule="Sumas" desc="Suma de cifras da múltiplo de 3" color="orange" />
              <ModernDivCard num="5" rule="Ceros" desc="Termina en 0 o 5" color="emerald" />
              <ModernDivCard num="9" rule="Nueves" desc="Suma de cifras da múltiplo de 9" color="blue" />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/50 border-t border-white/20 backdrop-blur-md flex justify-center sticky bottom-0">
          <GlossyButton onClick={onClose} className="px-12 py-3 rounded-full shadow-xl">
            ENTENDIDO, ¡A ESTUDIAR!
          </GlossyButton>
        </div>
      </motion.div>
    </motion.div>
  );
};

function PropertyItem({ title, formula, example, color }: { title: string, formula: string, example: string, color: string }) {
  const colorClasses = {
    violet: 'bg-violet-50 text-violet-700',
    indigo: 'bg-indigo-50 text-indigo-700',
  }[color as 'violet' | 'indigo'];

  return (
    <div className={`p-4 rounded-2xl ${colorClasses} border border-black/5 flex flex-col gap-1`}>
      <div className="flex justify-between items-center">
        <span className="text-xs font-black uppercase opacity-60">{title}</span>
        <code className="bg-white/60 px-2 py-0.5 rounded font-black text-[10px]">{formula}</code>
      </div>
      <p className="text-xs font-bold mt-1">Ej: {example}</p>
    </div>
  );
}

function ModernDivCard({ num, rule, desc, color }: { num: string, rule: string, desc: string, color: string }) {
  const colors: Record<string, string> = {
    rose: 'from-rose-400 to-rose-600 shadow-rose-200',
    orange: 'from-orange-400 to-orange-600 shadow-orange-200',
    emerald: 'from-emerald-400 to-emerald-600 shadow-emerald-200',
    blue: 'from-blue-400 to-blue-600 shadow-blue-200',
  };

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative aspect-[4/5] rounded-[2.5rem] bg-white border border-white shadow-xl overflow-hidden group cursor-help"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colors[color]} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
      <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center font-black text-2xl text-slate-800">
        {num}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-1">
        <span className="text-[10px] font-black uppercase opacity-40">Regla</span>
        <h4 className="text-lg font-black text-slate-800 leading-tight">{rule}</h4>
        <p className="text-[10px] font-bold text-slate-500 leading-tight mt-1">{desc}</p>
      </div>
    </motion.div>
  );
}

function DivisibilityCard({ num, rule }: { num: string, rule: string }) {
  return (
    <div className="p-4 rounded-3xl bg-white border border-rose-50 shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center gap-2">
      <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black text-xl shadow-lg group-hover:scale-110 transition-transform">
        {num}
      </div>
      <p className="text-[10px] font-bold text-slate-600 leading-tight">{rule}</p>
    </div>
  );
}
