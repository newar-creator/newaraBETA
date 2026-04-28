import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AeroCard } from './AeroUI';
import { ChevronRight, ChevronLeft, MapPin } from 'lucide-react';

const FICHAS = [
  {
    title: "Espacio Geográfico",
    def: "Resultado de cómo la sociedad transforma y usa su ambiente. Está en permanente cambio.",
    points: ["Es construido por las personas", "Combina lo natural y lo artificial", "Siempre evoluciona"],
    color: "#378ADD"
  },
  {
    title: "Territorio",
    def: "Área delimitada donde se ejerce PODER (un país, una provincia).",
    points: ["Límites definidos", "Jurisdicción política/económica", "Ejemplo: Argentina"],
    color: "#1D9E75"
  },
  {
    title: "Región",
    def: "Área con características comunes (clima, relieve o economía).",
    points: ["No es natural, es construida por el geógrafo", "Límites decididos para estudio", "Ej: Región de Cuyo"],
    color: "#EFA827"
  },
  {
    title: "Esfera y Eje",
    def: "La Tierra no es una esfera perfecta y su eje está inclinado 23° 27'.",
    points: ["Causa de las estaciones", "Rotación sobre el eje", "Inclinación fija"],
    color: "#D85A30"
  },
  {
    title: "Paralelos y Meridianos",
    def: "Líneas imaginarias para ubicarse. Ecuador (0° lat) y Greenwich (0° lon).",
    points: ["Latitud: Norte/Sur", "Longitud: Este/Oeste", "Base del GPS"],
    color: "#85B7EB"
  }
];

export const GeographyGuide: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [index, setIndex] = useState(0);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xl"
    >
      <div className="max-w-2xl w-full relative">
        <button 
          onClick={onClose}
          className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30 shadow-xl hover:bg-white/40 z-20"
        >
          ×
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
          >
            <AeroCard className="min-h-[400px] flex flex-col justify-between border-4" title={`Ficha Visual ${index + 1} de ${FICHAS.length}`}>
              <div className="space-y-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/20" style={{ background: FICHAS[index].color + '44' }}>
                    🌍
                  </div>
                  <h2 className="text-3xl font-black text-sky-950 tracking-tighter">{FICHAS[index].title}</h2>
                </div>

                <p className="text-xl font-medium text-sky-900 leading-relaxed italic">
                  "{FICHAS[index].def}"
                </p>

                <div className="bg-white/30 rounded-3xl p-6 border border-white/50 space-y-3">
                  <p className="text-[10px] uppercase font-black text-sky-900/40 tracking-widest">Puntos Clave</p>
                  {FICHAS[index].points.map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full shadow-lg" style={{ background: FICHAS[index].color }} />
                      <span className="font-bold text-sky-950">{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mt-8">
                <button 
                  disabled={index === 0}
                  onClick={() => setIndex(i => i - 1)}
                  className="p-4 rounded-full bg-white/40 disabled:opacity-20 hover:bg-white/60 transition-all"
                >
                  <ChevronLeft />
                </button>
                <div className="flex gap-2">
                  {FICHAS.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === index ? 'w-6 bg-blue-500' : 'bg-blue-200'}`} />
                  ))}
                </div>
                <button 
                  disabled={index === FICHAS.length - 1}
                  onClick={() => setIndex(i => i + 1)}
                  className="p-4 rounded-full bg-white/40 disabled:opacity-20 hover:bg-white/60 transition-all"
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
