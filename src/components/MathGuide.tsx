import React from 'react';
import { motion } from 'motion/react';
import { playExternalBubble } from '../lib/sounds';
import { GlossyButton } from './AeroUI';
import { Calculator, Zap, Target, Divide, Hash, Layers, PieChart, Info, X as XIcon } from 'lucide-react';

interface MathGuideProps {
  theme: 'white' | 'black';
  onClose: () => void;
}

export const MathGuide: React.FC<MathGuideProps> = ({ theme, onClose }) => {
  const isDark = theme === 'black';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 backdrop-blur-3xl transition-colors duration-500 ${
        isDark ? 'bg-black/80' : 'bg-sky-950/40'
      }`}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className={`rounded-[2.5rem] shadow-2xl max-w-5xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col relative border-4 transition-colors duration-500 ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-white'
        }`}
      >
        <div className="glossy-overlay opacity-20 pointer-events-none" />
        
        {/* Header */}
        <div className={`p-4 md:p-6 flex items-center justify-between shadow-lg relative z-10 ${
          isDark ? 'bg-zinc-800 text-white' : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/20 border-white/20'
            }`}>
              <Calculator size={24} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">Guía Visual: Matemáticas</h2>
              <p className="text-[10px] font-bold opacity-70 uppercase tracking-[0.2em]">Aritmética • Divisibilidad • Álgebra Básica</p>
            </div>
          </div>
          <button 
            onClick={() => {
              playExternalBubble();
              onClose();
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all text-2xl font-bold border ${
              isDark ? 'bg-white/10 hover:bg-white/20 border-white/20' : 'bg-white/10 hover:bg-white/20 border-white/20'
            }`}
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className={`flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar space-y-12 md:space-y-20 transition-colors duration-500 ${
          isDark ? 'bg-zinc-950' : 'bg-slate-50/30'
        }`}>
          
          {/* 1. HERO INFOGRAPHIC - Conjunto N */}
          <section className="relative h-64 md:h-80 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/10 group">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-500 to-sky-400"></div>
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
            
            <div className="relative h-full flex flex-col items-center justify-center text-center p-6">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute w-[450px] h-[450px] border border-white/10 rounded-full"
              />
              <h3 className="text-6xl md:text-8xl font-black text-white drop-shadow-2xl mb-4 tracking-tighter">
                ℕ <span className="text-2xl md:text-3xl opacity-70 font-bold ml-2 uppercase">Naturales</span>
              </h3>
              <p className="text-white/90 font-bold text-sm md:text-lg max-w-lg drop-shadow-md">
                El conjunto infinito que usamos para contar y ordenar. ¡No tiene decimales ni negativos!
              </p>
              
              <div className="flex flex-wrap gap-2 md:gap-4 mt-8 justify-center">
                {[0, 1, 2, 3, 5, 8, 13, 21, '...'].map((n, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.2, rotate: 15 }}
                    className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center font-black text-white shadow-lg border border-white/20 text-xs md:text-sm"
                  >
                    {n}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* 2. PROPERTIES SECTION */}
          <section className="space-y-8">
            <VisualHeader icon={<Zap />} title="Propiedades Fundamentales" subtitle="Leyes universales de las operaciones" isDark={isDark} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PropertyCard 
                title="Conmutativa" 
                formula="a + b = b + a" 
                desc="El orden de los sumandos o factores no altera el resultado." 
                example="15 + 10 = 25 | 10 + 15 = 25"
                color="violet"
                isDark={isDark}
              />
              <PropertyCard 
                title="Asociativa" 
                formula="(a+b)+c = a+(b+c)" 
                desc="Puedes agrupar los números de diferentes maneras sin cambiar el total." 
                example="(5 + 2) + 10 = 17 | 5 + (2 + 10) = 17"
                color="indigo"
                isDark={isDark}
              />
              <PropertyCard 
                title="Distributiva" 
                formula="a · (b+c) = a·b + a·c" 
                desc="La multiplicación se reparte sobre la suma o la resta." 
                example="3 · (4 + 6) = 3·4 + 3·6 = 30"
                color="sky"
                isDark={isDark}
              />
            </div>
          </section>

          {/* 3. DIVISION DEEP DIVE */}
          <section className="space-y-8">
            <VisualHeader icon={<Divide />} title="Anatomía de la División" subtitle="El algoritmo de la división entera" isDark={isDark} />
            <div className={`p-8 md:p-16 rounded-[4rem] border-8 shadow-2xl relative overflow-hidden transition-colors ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-gradient-to-br from-slate-900 to-indigo-950 border-white'
            }`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl opacity-50" />
              <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="text-center lg:text-left space-y-6">
                  <h4 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter">D = d · c + r</h4>
                  <p className="text-white/60 font-medium text-lg leading-relaxed">
                    Toda división se verifica multiplicando el divisor por el cociente y sumando el residuo.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                    <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">EXACTA: r = 0</div>
                    <div className="px-4 py-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">INEXACTA: r &gt; 0</div>
                  </div>
                </div>
                <div className={`backdrop-blur-2xl p-8 rounded-[3rem] border shadow-inner grid grid-cols-2 gap-6 ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white/5 border-white/10'
                }`}>
                  <PartCircle label="Dividendo" letter="D" color="emerald" />
                  <PartCircle label="Divisor" letter="d" color="sky" />
                  <PartCircle label="Cociente" letter="c" color="amber" />
                  <PartCircle label="Resto" letter="r" color="rose" />
                </div>
              </div>
            </div>
          </section>

          {/* 4. DCM y MCM - NEW SECTION */}
          <section className="space-y-8">
            <VisualHeader icon={<Layers />} title="M.C.D. y m.c.m." subtitle="Divisores y Múltiplos comunes" isDark={isDark} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={`p-8 rounded-[2.5rem] border transition-colors ${
                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100 shadow-xl'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center text-white font-black italic">M</div>
                  <h4 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>mínimo común mútiplo (mcm)</h4>
                </div>
                <p className={`text-sm mb-6 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Es el número más pequeño que es múltiple de dos o más números a la vez.</p>
                <div className={`p-4 rounded-2xl border-l-4 border-violet-500 ${isDark ? 'bg-zinc-800' : 'bg-violet-50'}`}>
                  <p className={`text-xs font-black uppercase mb-1 ${isDark ? 'text-violet-400' : 'text-violet-700'}`}>Regla de Oro</p>
                  <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>Factores comunes y no comunes con el MAYOR exponente.</p>
                </div>
              </div>

              <div className={`p-8 rounded-[2.5rem] border transition-colors ${
                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100 shadow-xl'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white font-black italic">D</div>
                  <h4 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Máximo Común Divisor (MCD)</h4>
                </div>
                <p className={`text-sm mb-6 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Es el mayor divisor que comparten dos o más números.</p>
                <div className={`p-4 rounded-2xl border-l-4 border-sky-500 ${isDark ? 'bg-zinc-800' : 'bg-sky-50'}`}>
                  <p className={`text-xs font-black uppercase mb-1 ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>Regla de Oro</p>
                  <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>SOLO factores comunes con el MENOR exponente.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. POWERS & PRIORITY */}
          <section className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <VisualHeader icon={<Zap />} title="Leyes de Potencia" subtitle="Resumen de exponentes" isDark={isDark} />
                  <div className="grid grid-cols-2 gap-4">
                    <PowerMiniCard formula="a⁰ = 1" title="Todo a la 0 es 1" isDark={isDark} />
                    <PowerMiniCard formula="aⁿ·aᵐ = aⁿ⁺ᵐ" title="Suma exponentes" isDark={isDark} />
                    <PowerMiniCard formula="aⁿ:aᵐ = aⁿ⁻ᵐ" title="Resta exponentes" isDark={isDark} />
                    <PowerMiniCard formula="(aⁿ)ᵐ = aⁿ·ᵐ" title="Multiplica exp" isDark={isDark} />
                  </div>
                </div>
                <div className="space-y-6">
                  <VisualHeader icon={<Target />} title="Jerarquía de Operaciones" subtitle="¿Qué se resuelve primero?" isDark={isDark} />
                  <div className={`rounded-[2.5rem] p-6 shadow-xl border flex flex-col gap-3 transition-colors ${
                    isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'
                  }`}>
                    <PriorityRow num="1" text="Paréntesis, Corchetes y Llaves ( ) [ ] { }" color="rose" isDark={isDark} />
                    <PriorityRow num="2" text="Potencias y Raíces ⁿ√" color="amber" isDark={isDark} />
                    <PriorityRow num="3" text="Multiplicación y División ×÷" color="emerald" isDark={isDark} />
                    <PriorityRow num="4" text="Suma y Resta +-" color="sky" isDark={isDark} />
                  </div>
                </div>
             </div>
          </section>

          {/* 6. DIVISIBILIDAD FLASHCARDS */}
          <section className="space-y-8 pb-10">
            <VisualHeader icon={<Hash />} title="Criterios de Divisibilidad" subtitle="Secretos de los números" isDark={isDark} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <DivCard num="2" rule="Es Par" desc="Termina en 0, 2, 4, 6, 8" color="rose" isDark={isDark} />
              <DivCard num="3" rule="Suma de Cifras" desc="La suma da múltiplo de 3" color="amber" isDark={isDark} />
              <DivCard num="5" rule="Termina en 0 o 5" desc="Efectivo en billetes" color="emerald" isDark={isDark} />
              <DivCard num="9" rule="Suma de Cifras" desc="La suma da múltiplo de 9" color="indigo" isDark={isDark} />
              <DivCard num="10" rule="Termina en 0" desc="División por potencia 10" color="sky" isDark={isDark} />
              <DivCard num="11" rule="Alternada" desc="Diferencia de cifras par/impar es 0 u 11" color="violet" isDark={isDark} />
              <DivCard num="6" rule="Doble Match" desc="Es divisible por 2 y 3 a la vez" color="teal" isDark={isDark} />
              <DivCard num="4" rule="Doble Cero" desc="Últimas 2 cifras son 00 o mult de 4" color="pink" isDark={isDark} />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className={`p-4 md:p-6 border-t backdrop-blur-md flex justify-center sticky bottom-0 z-20 transition-colors ${
          isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white/80 border-slate-100'
        }`}>
          <GlossyButton onClick={onClose} className="w-full md:w-auto px-16 py-4 rounded-full text-lg shadow-2xl">
            ¡AHORA LO ENTIENDO!
          </GlossyButton>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* --- HELPER COMPONENTS --- */

function VisualHeader({ icon, title, subtitle, isDark }: { icon: React.ReactNode, title: string, subtitle: string, isDark: boolean }) {
  return (
    <div className="flex flex-col gap-1 items-start">
      <div className="flex items-center gap-3">
        <span className="text-3xl md:text-4xl text-blue-500 drop-shadow-md">{icon}</span>
        <h3 className={`text-2xl md:text-3xl font-black tracking-tighter transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h3>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-12">{subtitle}</p>
    </div>
  );
}

function PropertyCard({ title, formula, desc, example, color, isDark }: { title: string, formula: string, desc: string, example: string, color: string, isDark: boolean }) {
  const themes = {
    violet: 'bg-violet-500',
    indigo: 'bg-indigo-500',
    sky: 'bg-sky-500',
  }[color as 'violet' | 'indigo' | 'sky'];

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className={`p-8 rounded-[3rem] border shadow-xl relative overflow-hidden transition-all ${
        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'
      }`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 ${themes} opacity-5 rounded-full -mr-10 -mt-10`} />
      <h4 className={`text-xl font-black mb-2 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h4>
      <p className="text-xs font-bold text-slate-500 leading-relaxed mb-6">{desc}</p>
      <div className={`${themes} bg-opacity-10 p-4 rounded-2xl mb-4 text-center border border-current border-opacity-5`}>
        <code className={`text-lg font-black transition-colors ${isDark ? 'text-white' : 'text-slate-700'}`}>{formula}</code>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Ejemplo:</p>
      <p className={`text-sm font-bold italic transition-colors ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>{example}</p>
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
      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] ${colors} border border-white/10 flex items-center justify-center font-black text-3xl md:text-4xl shadow-lg`}>
        {letter}
      </div>
      <span className="text-[9px] md:text-[10px] font-black uppercase text-white/50 tracking-widest">{label}</span>
    </div>
  );
}

function PowerMiniCard({ formula, title, isDark }: { formula: string, title: string, isDark: boolean }) {
  return (
    <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all group ${
      isDark ? 'bg-zinc-800 border-white/5 hover:bg-indigo-900/40' : 'bg-slate-900 border-white/5 hover:bg-slate-800'
    }`}>
      <code className="text-indigo-400 font-black mb-1 text-sm md:text-base">{formula}</code>
      <span className="text-[9px] font-black uppercase text-white/40">{title}</span>
    </div>
  );
}

function PriorityRow({ num, text, color, isDark }: { num: string, text: string, color: string, isDark: boolean }) {
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
      <span className={`text-sm font-bold transition-colors ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>{text}</span>
    </div>
  );
}

function DivCard({ num, rule, desc, color, isDark }: { num: string, rule: string, desc: string, color: string, isDark: boolean }) {
  const bg = {
    rose: 'bg-rose-500 shadow-rose-200',
    amber: 'bg-amber-500 shadow-amber-200',
    emerald: 'bg-emerald-500 shadow-emerald-200',
    sky: 'bg-sky-500 shadow-sky-200',
    indigo: 'bg-indigo-500 shadow-indigo-200',
    violet: 'bg-violet-500 shadow-violet-200',
    teal: 'bg-teal-500 shadow-teal-200',
    pink: 'bg-pink-500 shadow-pink-200'
  }[color as 'rose' | 'amber' | 'emerald' | 'sky' | 'indigo' | 'violet' | 'teal' | 'pink'];

  return (
    <div className={`p-6 rounded-[3rem] border shadow-lg text-center flex flex-col items-center group hover:shadow-2xl transition-all ${
      isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'
    }`}>
      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${bg} flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-xl mb-4 group-hover:scale-110 transition-transform`}>
        {num}
      </div>
      <h5 className={`font-black leading-tight mb-2 uppercase text-[10px] md:text-xs transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>{rule}</h5>
      <p className="text-[9px] md:text-[10px] font-bold text-slate-500 leading-tight">{desc}</p>
    </div>
  );
}
