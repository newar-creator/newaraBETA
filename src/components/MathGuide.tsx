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
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-12">
          {/* Section 1: Operaciones */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b-2 border-violet-100 pb-2">
              <span className="text-2xl">➕</span>
              <h3 className="text-xl font-black text-violet-900">Operaciones y Propiedades</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-3xl bg-violet-50 border border-violet-100 shadow-sm">
                <h4 className="font-black text-violet-800 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-violet-200 flex items-center justify-center text-xs">1</span>
                  Suma o Adición
                </h4>
                <ul className="space-y-2 text-sm text-slate-700 font-medium">
                  <li className="flex justify-between"><span>• Conmutativa:</span> <code className="bg-white px-2 rounded font-bold">a + b = b + a</code></li>
                  <li className="flex justify-between"><span>• Asociativa:</span> <code className="bg-white px-2 rounded font-bold">(a+b)+c = a+(b+c)</code></li>
                  <li className="flex justify-between"><span>• Elemento Neutro (0):</span> <code className="bg-white px-2 rounded font-bold">a + 0 = a</code></li>
                </ul>
              </div>

              <div className="p-5 rounded-3xl bg-indigo-50 border border-indigo-100 shadow-sm">
                <h4 className="font-black text-indigo-800 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-200 flex items-center justify-center text-xs">2</span>
                  Multiplicación
                </h4>
                <ul className="space-y-2 text-sm text-slate-700 font-medium">
                  <li className="flex justify-between"><span>• Conmutativa:</span> <code className="bg-white px-2 rounded font-bold">a · b = b · a</code></li>
                  <li className="flex justify-between"><span>• Elemento Neutro (1):</span> <code className="bg-white px-2 rounded font-bold">a · 1 = a</code></li>
                  <li className="flex justify-between"><span>• Distributiva:</span> <code className="bg-white px-2 rounded font-bold">a·(b+c) = a·b + a·c</code></li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2: Division */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b-2 border-sky-100 pb-2">
              <span className="text-2xl">➗</span>
              <h3 className="text-xl font-black text-sky-900">La División</h3>
            </div>
            <div className="bg-sky-50 p-6 rounded-[2rem] border border-sky-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl font-black">D = d·c+r</div>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="text-center p-4 bg-white rounded-2xl shadow-inner border border-sky-100">
                  <div className="text-3xl font-black text-sky-600 mb-1">D = d · c + r</div>
                  <p className="text-[10px] uppercase font-black text-slate-400">Algoritmo de la División</p>
                </div>
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div className="flex flex-col"><span className="text-[10px] uppercase font-black opacity-40">Dividendo (D)</span><span className="font-bold">Total a repartir</span></div>
                  <div className="flex flex-col"><span className="text-[10px] uppercase font-black opacity-40">Divisor (d)</span><span className="font-bold">Partes a hacer</span></div>
                  <div className="flex flex-col"><span className="text-[10px] uppercase font-black opacity-40">Cociente (c)</span><span className="font-bold">Cantidad por parte</span></div>
                  <div className="flex flex-col"><span className="text-[10px] uppercase font-black opacity-40">Resto (r)</span><span className="font-bold">Lo que sobra</span></div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Potencias */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b-2 border-emerald-100 pb-2">
              <span className="text-2xl">⚡</span>
              <h3 className="text-xl font-black text-emerald-900">Potencias y Prioridades</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-400">Propiedades Clave</h4>
                  <div className="p-4 rounded-2xl bg-white border border-emerald-100 flex items-center justify-between shadow-sm">
                    <span className="text-sm font-bold">Igual base (Multiplicar)</span>
                    <code className="bg-emerald-50 px-2 py-1 rounded text-emerald-700 font-bold">aⁿ · aᵐ = aⁿ⁺ᵐ</code>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-emerald-100 flex items-center justify-between shadow-sm">
                    <span className="text-sm font-bold">Igual base (Dividir)</span>
                    <code className="bg-emerald-50 px-2 py-1 rounded text-emerald-700 font-bold">aⁿ : aᵐ = aⁿ⁻ᵐ</code>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-emerald-100 flex items-center justify-between shadow-sm">
                    <span className="text-sm font-bold">Base con exponente 0</span>
                    <code className="bg-emerald-50 px-2 py-1 rounded text-emerald-700 font-bold">a⁰ = 1</code>
                  </div>
               </div>
               <div className="p-6 rounded-[2rem] bg-amber-50 border border-amber-100">
                  <h4 className="text-xs font-black uppercase text-amber-700 mb-4">Orden de Prioridad</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shadow-md">1</div>
                      <span className="font-bold text-amber-900">Paréntesis</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs font-bold shadow-md">2</div>
                      <span className="font-bold text-amber-900">Potencias y Raíces</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-300 text-white flex items-center justify-center text-xs font-bold shadow-md">3</div>
                      <span className="font-bold text-amber-900">Multiplicación y División</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-200 text-white flex items-center justify-center text-xs font-bold shadow-md">4</div>
                      <span className="font-bold text-amber-900">Suma y Resta</span>
                    </div>
                  </div>
               </div>
            </div>
          </section>

          {/* Section 4: Criterios de Divisibilidad */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b-2 border-rose-100 pb-2">
              <span className="text-2xl">📏</span>
              <h3 className="text-xl font-black text-rose-900">Criterios de Divisibilidad</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DivisibilityCard num="2" rule="Termina en 0 o cifra par" />
              <DivisibilityCard num="3" rule="Suma de cifras es múltiplo de 3" />
              <DivisibilityCard num="5" rule="Termina en 0 o 5" />
              <DivisibilityCard num="9" rule="Suma de cifras es múltiplo de 9" />
              <DivisibilityCard num="10" rule="Termina en 0" />
              <DivisibilityCard num="4" rule="Últimas dos cifras son 00 o múltiplo de 4" />
              <DivisibilityCard num="6" rule="Divisible por 2 y 3 a la vez" />
              <DivisibilityCard num="8" rule="Últimas tres cifras son 000 o múltiplo de 8" />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/50 border-t border-white/20 backdrop-blur-md flex justify-center sticky bottom-0">
          <GlossyButton onClick={onClose} className="px-12 py-3 rounded-full">
            ENTENDIDO
          </GlossyButton>
        </div>
      </motion.div>
    </motion.div>
  );
};

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
