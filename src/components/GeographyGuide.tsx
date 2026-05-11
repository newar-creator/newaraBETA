import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AeroCard } from './AeroUI';
import { ChevronRight, ChevronLeft, Globe, MapPin, Navigation, Compass, LayoutGrid, Shield, TreePine, Droplets, Sun, Cloud, Info, AlertCircle, X } from 'lucide-react';
import { playExternalBubble } from '../lib/sounds';

interface GeographyGuideProps {
  theme: 'white' | 'black';
  onClose: () => void;
}

const FICHAS = [
  {
    title: "Espacio Geográfico",
    def: "Resultado de cómo la sociedad transforma y usa su ambiente. Está en permanente cambio.",
    points: ["Es construido por las personas", "Combina lo natural y lo artificial", "Siempre evoluciona"],
    color: "#378ADD",
    icon: <Globe className="text-blue-500" />,
    diagram: (
      <div className="relative w-full h-32 flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }} 
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute w-24 h-24 bg-blue-500/20 rounded-full blur-xl" 
        />
        <div className="relative flex gap-4">
          <div className="flex flex-col items-center gap-1">
            <TreePine size={32} className="text-emerald-500" />
            <span className="text-[8px] font-black uppercase opacity-50">Natural</span>
          </div>
          <div className="pt-4 text-sky-900 font-black">+</div>
          <div className="flex flex-col items-center gap-1">
            <LayoutGrid size={32} className="text-amber-600" />
            <span className="text-[8px] font-black uppercase opacity-50">Social</span>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Territorio",
    def: "Área delimitada donde se ejerce PODER (un país, una provincia).",
    points: ["Límites definidos", "Jurisdicción política/económica", "Ejemplo: Argentina"],
    color: "#1D9E75",
    icon: <Shield className="text-emerald-500" />,
    diagram: (
      <div className="relative w-full h-32 flex items-center justify-center">
        <div className="w-32 h-20 border-4 border-emerald-500 border-dashed rounded-xl relative overflow-hidden bg-emerald-500/10">
          <motion.div 
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <MapPin className="text-emerald-600" size={40} />
          </motion.div>
        </div>
      </div>
    )
  },
  {
    title: "Región",
    def: "Área con características comunes (clima, relieve o economía).",
    points: ["No es natural, es construida por el geógrafo", "Límites decididos para estudio", "Ej: Región de Cuyo"],
    color: "#EFA827",
    icon: <LayoutGrid className="text-amber-500" />,
    diagram: (
      <div className="relative w-full h-32 flex grid grid-cols-3 gap-2 p-4">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className={`h-8 rounded-lg ${i % 2 === 0 ? 'bg-amber-500/20 border border-amber-500/40' : 'bg-slate-200/50'}`} />
        ))}
      </div>
    )
  },
  {
    title: "Esfera y Eje",
    def: "La Tierra no es una esfera perfecta y su eje está inclinado 23° 27'.",
    points: ["Causa de las estaciones", "Rotación sobre el eje", "Inclinación fija"],
    color: "#D85A30",
    icon: <Compass className="text-orange-500" />,
    diagram: (
      <div className="relative w-full h-32 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 23 }}
          className="relative w-24 h-24 border-2 border-orange-500/30 rounded-full flex items-center justify-center"
        >
          <div className="absolute w-0.5 h-32 bg-orange-500 -top-4" />
          <div className="w-20 h-20 bg-blue-400 rounded-full shadow-inner" />
          <div className="absolute top-2 right-2 text-[10px] font-black text-orange-600">23.5°</div>
        </motion.div>
      </div>
    )
  },
  {
    title: "Latitud y Longitud",
    def: "Líneas imaginarias para ubicarse. Ecuador (0° lat) y Greenwich (0° lon).",
    points: ["Latitud: Norte/Sur (Paralelos)", "Longitud: Este/Oeste (Meridianos)", "Base del GPS"],
    color: "#85B7EB",
    icon: <Navigation className="text-blue-400" />,
    diagram: (
      <div className="relative w-full h-32 flex items-center justify-center gap-8">
        <div className="relative w-16 h-16 rounded-full border border-blue-300">
          <div className="absolute h-[1px] w-full bg-red-500 top-1/2" />
          <span className="absolute -bottom-4 text-[8px] font-black uppercase text-blue-500">Latitud</span>
        </div>
        <div className="relative w-16 h-16 rounded-full border border-blue-300">
          <div className="absolute w-[1px] h-full bg-blue-500 left-1/2" />
          <span className="absolute -bottom-4 text-[8px] font-black uppercase text-blue-500">Longitud</span>
        </div>
      </div>
    )
  },
  {
    title: "Ambiente y Recursos",
    def: "Elementos de la naturaleza que la sociedad valora y utiliza.",
    points: ["Renovables vs No Renovables", "Valoración social", "Transformación técnica"],
    color: "#10b981",
    icon: <TreePine className="text-emerald-500" />,
    diagram: (
      <div className="relative w-full h-32 flex items-center justify-center gap-4">
        <div className="flex flex-col items-center">
          <Droplets size={24} className="text-blue-500" />
          <Sun size={24} className="text-amber-500" />
        </div>
        <ChevronRight size={16} className="text-slate-400" />
        <div className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg">RECURSO</div>
      </div>
    )
  },
  {
    title: "Problemáticas Ambientales",
    def: "Desequilibrios causados por la acción humana o procesos naturales.",
    points: ["Deforestación", "Contaminación", "Cambio Climático"],
    color: "#ef4444",
    icon: <Cloud className="text-red-500" />,
    diagram: (
      <div className="relative w-full h-32 flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute w-20 h-20 bg-red-500 rounded-full blur-xl"
        />
        <AlertCircle size={40} className="text-red-600 relative z-10" />
      </div>
    )
  }
];

export const GeographyGuide: React.FC<GeographyGuideProps> = ({ theme, onClose }) => {
  const [index, setIndex] = useState(0);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl ${
        theme === 'black' ? 'bg-black/80' : 'bg-sky-950/40'
      }`}
    >
      <div className="max-w-2xl w-full relative max-h-[95vh] md:max-h-none flex flex-col">
        <button 
          onClick={() => {
            playExternalBubble();
            onClose();
          }}
          className={`absolute -top-2 -right-2 md:-top-4 md:-right-4 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border shadow-xl transition-all z-30 ${
            theme === 'black' 
              ? 'bg-zinc-800 hover:bg-zinc-700 text-white border-white/20' 
              : 'bg-white hover:bg-slate-50 text-sky-950 border-slate-200'
          }`}
        >
          <X size={20} />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.05, opacity: 0, y: -10 }}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <AeroCard 
              theme={theme}
              className="flex-1 min-h-[400px] md:min-h-[500px] max-h-[90vh] md:max-h-[800px] flex flex-col border-4 border-white/20 shadow-2xl overflow-hidden" 
              title={`Ficha ${index + 1} de ${FICHAS.length}`}
            >
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 md:pr-2 space-y-4 md:space-y-6 py-2">
                {/* Header Section */}
                <div className="flex items-center gap-3 md:gap-4">
                  <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-2xl shadow-inner border transition-colors shrink-0 ${
                    theme === 'black' ? 'bg-white/5 border-white/10' : 'bg-white/40 border-white/20'
                  }`}>
                    {FICHAS[index].icon}
                  </div>
                  <div>
                    <h2 className={`text-xl md:text-3xl font-black tracking-tighter transition-colors leading-tight ${
                      theme === 'black' ? 'text-white' : 'text-sky-950'
                    }`}>
                      {FICHAS[index].title}
                    </h2>
                    <p className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-40 ${
                      theme === 'black' ? 'text-white' : 'text-sky-900'
                    }`}>Concepto Fundamental</p>
                  </div>
                </div>

                {/* Definition */}
                <p className={`text-base md:text-xl font-medium leading-relaxed italic border-l-4 pl-3 md:pl-4 transition-all ${
                  theme === 'black' ? 'text-white/80 border-blue-500' : 'text-sky-900 border-blue-400'
                }`}>
                  "{FICHAS[index].def}"
                </p>

                {/* Diagram Area */}
                <div className={`rounded-2xl md:rounded-3xl p-1 md:p-2 border transition-colors overflow-hidden shrink-0 ${
                  theme === 'black' ? 'bg-white/5 border-white/10' : 'bg-slate-100/50 border-slate-200'
                }`}>
                   <div className="scale-90 md:scale-100 transform-gpu">
                    {FICHAS[index].diagram}
                   </div>
                </div>

                {/* Key Points */}
                <div className={`rounded-2xl md:rounded-3xl p-3 md:p-6 border transition-all space-y-3 md:space-y-4 ${
                  theme === 'black' ? 'bg-white/5 border-white/10' : 'bg-white/30 border-white/50'
                }`}>
                  <div className="flex items-center gap-2">
                    <Info size={10} className="opacity-40" />
                    <p className={`text-[8px] md:text-[10px] uppercase font-black tracking-widest opacity-40 ${
                      theme === 'black' ? 'text-white' : 'text-sky-900'
                    }`}>Análisis Técnico</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                    {FICHAS[index].points.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 md:gap-3">
                        <div className="w-1.5 h-1.5 rounded-full shadow-lg shrink-0" style={{ background: FICHAS[index].color }} />
                        <span className={`font-bold text-[11px] md:text-sm leading-tight transition-colors ${
                          theme === 'black' ? 'text-white/90' : 'text-sky-950'
                        }`}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex justify-between items-center mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/10 shrink-0">
                <button 
                  disabled={index === 0}
                  onClick={() => {
                    playExternalBubble();
                    setIndex(i => i - 1);
                  }}
                  className={`p-3 md:p-4 rounded-full transition-all active:scale-90 ${
                    theme === 'black' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white/40 hover:bg-white/60 text-sky-900 shadow-sm'
                  } disabled:opacity-10`}
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="flex gap-2">
                  {FICHAS.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        i === index ? 'w-8 bg-blue-500' : 'w-1.5 bg-blue-200 opacity-40'
                      }`} 
                    />
                  ))}
                </div>

                <button 
                  disabled={index === FICHAS.length - 1}
                  onClick={() => {
                    playExternalBubble();
                    setIndex(i => i + 1);
                  }}
                  className={`p-4 rounded-full transition-all active:scale-90 ${
                    theme === 'black' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white/40 hover:bg-white/60 text-sky-900 shadow-sm'
                  } disabled:opacity-10`}
                >
                  <ChevronRight />
                </button>
              </div>
            </AeroCard>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
