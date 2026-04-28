import React from 'react';
import { motion } from 'motion/react';
import { playExternalBubble } from '../lib/sounds';
import { GlossyButton } from './AeroUI';

interface MathGuideProps {
  onClose: () => void;
}

export const MathGuide: React.FC<MathGuideProps> = ({ onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-sky-950/40 backdrop-blur-3xl"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white/90 border-4 border-white rounded-[2.5rem] shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col relative"
      >
        <div className="glossy-overlay opacity-20 pointer-events-none" />
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-between shadow-lg relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
              🔢
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight uppercase">Guía Visual: Matemáticas</h2>
              <p className="text-[10px] font-bold opacity-70 uppercase tracking-[0.2em]">Números Naturales • Operaciones • Divisibilidad</p>
            </div>
          </div>
          <button 
            onClick={() => {
              playExternalBubble();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-2xl font-bold border border-white/20"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar space-y-20 bg-slate-50/30">
          
          {/* 1. HERO INFOGRAPHIC */}
          <section className="relative h-64 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white group">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-500 to-sky-400"></div>
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
            
            <div className="relative h-full flex flex-col items-center justify-center text-center p-6">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute w-[450px] h-[450px] border border-white/10 rounded-full"
              />
              <h3 className="text-5xl md:text-7xl font-black text-white drop-shadow-2xl mb-4 tracking-tighter">
                ℕ <span className="text-2xl opacity-70 font-bold ml-2 uppercase">Naturales</span>
              </h3>
              <p className="text-white/90 font-bold text-lg max-w-lg drop-shadow-md">
                El conjunto de números que usamos para contar elementos de la naturaleza.
              </p>
              
              <div className="flex gap-4 mt-8">
                {[0, 1, 2, 3, 4, '...'].map((n, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.2, rotate: 15 }}
                    className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center font-black text-white shadow-lg border border-white/20 text-sm"
                  >
                    {n}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* 2. PROPERTIES SECTION */}
          <section className="space-y-8">
            <VisualHeader icon="✨" title="Propiedades Mágicas" subtitle="Leyes de Suma y Multiplicación" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sky-950">
              <PropertyCard 
                title="Conmutativa" 
                formula="a + b = b + a" 
                desc="El orden no altera el total." 
                example="15 + 10 = 10 + 15"
                color="violet"
              />
              <PropertyCard 
                title="Asociativa" 
                formula="(a+b)+c = a+(b+c)" 
                desc="Agrupa como quieras los números." 
                example="(5+2)+3 = 5+(2+3)"
                color="indigo"
              />
              <PropertyCard 
                title="Distributiva" 
                formula="a · (b+c) = a·b + a·c" 
                desc="Reparte la multiplicación." 
                example="2·(3+4) = 2·3 + 2·4"
                color="sky"
              />
            </div>
          </section>

          {/* 3. DIVISION BRAIN */}
          <section className="space-y-8">
            <VisualHeader icon="➗" title="Anatomía de la División" subtitle="Reparto Equitativo" />
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-10 md:p-16 rounded-[4rem] border-8 border-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="text-center lg:text-left space-y-6">
                  <h4 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter">D = d · c + r</h4>
                  <p className="text-white/60 font-medium text-lg leading-relaxed">
                    Toda división se comprueba multiplicando el divisor por el cociente y sumando el resto.
                  </p>
                  <div className="flex gap-4 justify-center lg:justify-start">
                    <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-black">EXACTA: r = 0</div>
                    <div className="px-4 py-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full text-xs font-black">INEXACTA: r &gt; 0</div>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/10 shadow-inner grid grid-cols-2 gap-6">
                  <PartCircle label="Dividendo" letter="D" color="emerald" />
                  <PartCircle label="Divisor" letter="d" color="sky" />
                  <PartCircle label="Cociente" letter="c" color="amber" />
                  <PartCircle label="Resto" letter="r" color="rose" />
                </div>
              </div>
            </div>
          </section>

          {/* 4. POWERS & PRIORITY */}
          <section className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <VisualHeader icon="⚡" title="Leyes de Potencia" subtitle="Resumen de exponentes" />
                  <div className="grid grid-cols-2 gap-4">
                    <PowerMiniCard formula="a⁰ = 1" title="Base a la 0" />
                    <PowerMiniCard formula="aⁿ·aᵐ = aⁿ⁺ᵐ" title="Multiplicar" />
                    <PowerMiniCard formula="aⁿ:aᵐ = aⁿ⁻ᵐ" title="Dividir" />
                    <PowerMiniCard formula="(aⁿ)ᵐ = aⁿ·ᵐ" title="Pot de Pot" />
                  </div>
                </div>
                <div className="space-y-6">
                  <VisualHeader icon="🎯" title="Orden de Prioridad" subtitle="¿Qué va primero?" />
                  <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100 flex flex-col gap-3">
                    <PriorityRow num="1" text="Paréntesis ( ) [ ]" color="rose" />
                    <PriorityRow num="2" text="Potencias y Raíces ⁿ√" color="amber" />
                    <PriorityRow num="3" text="Multiplicación y División ×÷" color="emerald" />
                    <PriorityRow num="4" text="Suma y Resta +-" color="sky" />
                  </div>
                </div>
             </div>
          </section>

          {/* 5. DIVISIBILIDAD FLASHCARDS */}
          <section className="space-y-8 pb-10">
            <VisualHeader icon="🔍" title="Trucos de Divisibilidad" subtitle="Flashcards Rápidas" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <DivCard num="2" rule="Es par" desc="Termina en 0, 2, 4, 6 u 8" color="rose" />
              <DivCard num="3" rule="Suma cifras" desc="Las cifras sumadas dan 3, 6 o 9" color="amber" />
              <DivCard num="5" rule="0 o 5" desc="Termina en cualquiera de esos" color="emerald" />
              <DivCard num="10" rule="Termina en 0" desc="Sin excepciones" color="sky" />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white/80 border-t border-slate-100 backdrop-blur-md flex justify-center sticky bottom-0 z-20">
          <GlossyButton onClick={onClose} className="px-16 py-4 rounded-full text-lg shadow-2xl">
            ¡LO TENGO!
          </GlossyButton>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* --- HELPER COMPONENTS --- */

function VisualHeader({ icon, title, subtitle }: { icon: string, title: string, subtitle: string }) {
  return (
    <div className="flex flex-col gap-1 items-start">
      <div className="flex items-center gap-3">
        <span className="text-4xl drop-shadow-md">{icon}</span>
        <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{title}</h3>
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-12">{subtitle}</p>
    </div>
  );
}

function PropertyCard({ title, formula, desc, example, color }: { title: string, formula: string, desc: string, example: string, color: string }) {
  const themes = {
    violet: 'bg-violet-500',
    indigo: 'bg-indigo-500',
    sky: 'bg-sky-500',
  }[color as 'violet' | 'indigo' | 'sky'];

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-xl relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 ${themes} opacity-5 rounded-full -mr-10 -mt-10`} />
      <h4 className="text-xl font-black text-slate-900 mb-2">{title}</h4>
      <p className="text-xs font-bold text-slate-400 leading-relaxed mb-6">{desc}</p>
      <div className={`${themes} bg-opacity-10 p-4 rounded-2xl mb-4 text-center`}>
        <code className="text-lg font-black text-slate-700">{formula}</code>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Ejemplo:</p>
      <p className="text-sm font-bold text-slate-600 italic">{example}</p>
    </motion.div>
  );
}

function PartCircle({ label, letter, color }: { label: string, letter: string, color: string }) {
  const colors = {
    emerald: 'text-emerald-400 bg-emerald-400/20',
    sky: 'text-sky-400 bg-sky-400/20',
    amber: 'text-amber-400 bg-amber-400/20',
    rose: 'text-rose-400 bg-rose-400/20',
  }[color as 'emerald' | 'sky' | 'amber' | 'rose'];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-20 h-20 rounded-[2rem] ${colors} border border-white/10 flex items-center justify-center font-black text-4xl shadow-lg`}>
        {letter}
      </div>
      <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">{label}</span>
    </div>
  );
}

function PowerMiniCard({ formula, title }: { formula: string, title: string }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 flex flex-col items-center justify-center text-center group hover:bg-indigo-900 transition-colors">
      <code className="text-indigo-400 font-black mb-1 text-base">{formula}</code>
      <span className="text-[9px] font-black uppercase text-white/40">{title}</span>
    </div>
  );
}

function PriorityRow({ num, text, color }: { num: string, text: string, color: string }) {
  const bg = {
    rose: 'bg-rose-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
    sky: 'bg-sky-500',
  }[color as 'rose' | 'amber' | 'emerald' | 'sky'];

  return (
    <div className="flex items-center gap-4 group">
      <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center text-white font-black shadow-lg group-hover:scale-110 transition-transform`}>
        {num}
      </div>
      <span className="text-sm font-bold text-slate-700">{text}</span>
    </div>
  );
}

function DivCard({ num, rule, desc, color }: { num: string, rule: string, desc: string, color: string }) {
  const bg = {
    rose: 'bg-rose-500 shadow-rose-200',
    amber: 'bg-amber-500 shadow-amber-200',
    emerald: 'bg-emerald-500 shadow-emerald-200',
    sky: 'bg-sky-500 shadow-sky-200'
  }[color as 'rose' | 'amber' | 'emerald' | 'sky'];

  return (
    <div className="p-6 rounded-[3rem] bg-white border border-slate-100 shadow-lg text-center flex flex-col items-center group hover:shadow-2xl transition-all">
      <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center text-white font-black text-2xl shadow-xl mb-4 group-hover:scale-110 transition-transform`}>
        {num}
      </div>
      <h5 className="font-black text-slate-800 leading-tight mb-2 uppercase text-xs">{rule}</h5>
      <p className="text-[10px] font-bold text-slate-400 leading-tight">{desc}</p>
    </div>
  );
}
