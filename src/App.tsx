/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Leaf, 
  Globe, 
  Scroll, 
  ShieldCheck, 
  Languages, 
  Calendar as CalendarIcon, 
  BookOpen, 
  ClipboardCheck, 
  Home,
  ChevronRight,
  User,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SUBJECTS, Subject } from './types';
import { AeroCard, GlossyButton } from './components/AeroUI';
import { GeographyGuide } from './components/GeographyGuide';
import { BubbleBackground } from './components/BubbleBackground';

type View = 'home' | 'subject' | 'schedule' | 'exam';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [expandedUnit, setExpandedUnit] = useState<number | null>(null);
  const [activeExercise, setActiveExercise] = useState<{unitIndex: number, subjectId: string, currentQuestion: number} | null>(null);
  const [exerciseState, setExerciseState] = useState({ 
    score: 0, 
    finished: false, 
    shuffled: [] as any[],
    userAnswers: [] as {
      question: string;
      selected: number;
      correct: number;
      isCorrect: boolean;
      options: string[];
    }[]
  });
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showGeoGuide, setShowGeoGuide] = useState(false);

  const shuffleArray = (array: any[]) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const startExercise = (unitIndex: number) => {
    if (!selectedSubject) return;
    const unit = selectedSubject.units[unitIndex];
    // Shuffle questions
    const randomizedQuestions = shuffleArray(unit.exercises).map(ex => {
      const originalOptions = ex.options.map((opt, idx) => ({ text: opt, isCorrect: idx === ex.correct }));
      const shuffledOptions = shuffleArray(originalOptions);
      return {
        question: ex.question,
        options: shuffledOptions.map(o => o.text),
        correct: shuffledOptions.findIndex(o => o.isCorrect)
      };
    });

    setActiveExercise({ unitIndex, subjectId: selectedSubject.id, currentQuestion: 0 });
    setExerciseState({ score: 0, finished: false, shuffled: randomizedQuestions, userAnswers: [] });
    setSelectedAnswer(null);
  };

  const handleExerciseAnswer = (index: number) => {
    if (selectedAnswer !== null || !activeExercise) return;
    
    setSelectedAnswer(index);
    const currentQ = exerciseState.shuffled[activeExercise.currentQuestion];
    const isCorrect = index === currentQ.correct;
    const newScore = isCorrect ? exerciseState.score + 1 : exerciseState.score;
    
    const answerLog = {
      question: currentQ.question,
      selected: index,
      correct: currentQ.correct,
      isCorrect,
      options: currentQ.options
    };

    setExerciseState(prev => ({
      ...prev,
      score: newScore,
      userAnswers: [...prev.userAnswers, answerLog]
    }));

    // Short delay for feedback visibility
    setTimeout(() => {
      setSelectedAnswer(null);
      if (activeExercise.currentQuestion < exerciseState.shuffled.length - 1) {
        setActiveExercise({ ...activeExercise, currentQuestion: activeExercise.currentQuestion + 1 });
      } else {
        setExerciseState(prev => ({ ...prev, finished: true }));
      }
    }, 1000);
  };

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setCurrentView('subject');
  };

  const getIcon = (name: string, size = 20) => {
    switch (name) {
      case 'Leaf': return <Leaf size={size} />;
      case 'Globe': return <Globe size={size} />;
      case 'Scroll': return <Scroll size={size} />;
      case 'ShieldCheck': return <ShieldCheck size={size} />;
      case 'Languages': return <Languages size={size} />;
      default: return <BookOpen size={size} />;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green': return 'from-green-400 to-green-600';
      case 'blue': return 'from-blue-400 to-blue-600';
      case 'amber': return 'from-amber-400 to-amber-600';
      case 'indigo': return 'from-indigo-400 to-indigo-600';
      case 'red': return 'from-red-400 to-red-600';
      default: return 'from-sky-400 to-sky-600';
    }
  };

  const [examState, setExamState] = useState({
    active: false,
    currentQuestion: 0,
    score: 0,
    finished: false
  });

  const questions = [
    { q: '¿Qué tipo de sistema es un termo con agua caliente (idealmente)?', a: ['Abierto', 'Cerrado', 'Aislado', 'Complejo'], r: 2 },
    { q: '¿Cuál es la civilización más antigua de América identificada en los textos?', a: ['Inca', 'Maya', 'Azteca', 'Caral'], r: 3 },
    { q: 'En FEC, ¿cuál es el fundamento último de los Derechos Humanos?', a: ['Las leyes', 'La Constitución', 'La Dignidad Humana', 'El Gobierno'], r: 2 },
    { q: '¿A qué se refiere el término "Globalización" en geografía?', a: ['Solo al clima', 'Interconexión mundial económica y cultural', 'División por murallas', 'Estudio de mapas antiguos'], r: 1 },
    { q: 'Complete: "While I ____ for the exam, the light went out."', a: ['study', 'was studying', 'studied', 'am studying'], r: 1 }
  ];

  const handleAnswer = (index: number) => {
    if (index === questions[examState.currentQuestion].r) {
      setExamState(prev => ({ ...prev, score: prev.score + 1 }));
    }
    
    if (examState.currentQuestion < questions.length - 1) {
      setExamState(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }));
    } else {
      setExamState(prev => ({ ...prev, finished: true }));
    }
  };

  const resetExam = () => {
    setExamState({ active: true, currentQuestion: 0, score: 0, finished: false });
    setCurrentView('exam');
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans relative">
      <BubbleBackground />
      {/* Sidebar - Navigation Rail */}
      <nav className="w-20 md:w-64 aero-glass m-4 rounded-3xl flex flex-col items-center py-8 gap-6 border shadow-2xl relative">
        <div className="glossy-overlay opacity-20 pointer-events-none" />
        
        {/* LOGO NewAra */}
        <div className="mb-4 flex flex-col items-center gap-2">
          <div 
            className="font-logo text-3xl font-bold tracking-tighter flex items-baseline select-none relative"
            style={{ textShadow: '0 2px 4px rgba(255,255,255,0.8)' }}
          >
            <span className="text-[#1a2b4b]">New</span>
            <span className="bg-gradient-to-r from-[#00ff00] to-[#00f2ff] bg-clip-text text-transparent">Ara</span>
          </div>
          
          {/* Version Badge */}
          <div className="px-3 py-0.5 bg-gradient-to-b from-[#ffd966] to-[#f1c232] rounded-full border border-white/60 shadow-[0_2px_5px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.8)] flex items-center justify-center">
            <span className="font-logo text-[10px] font-bold text-gray-800 tracking-wider flex items-center gap-1">
              BETA 2.4
            </span>
          </div>

          <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-20" />
        </div>

        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-sky-600 shadow-inner flex items-center justify-center text-white ring-4 ring-white/30">
            <User size={24} />
          </div>
          <span className="hidden md:block text-xs font-bold text-sky-900/60 uppercase tracking-widest">Estudiante</span>
        </div>

        <div className="flex flex-col gap-4 w-full px-4">
          <NavButton 
            active={currentView === 'home'} 
            onClick={() => setCurrentView('home')} 
            icon={<Home size={24} />} 
            label="Inicio" 
          />
          <NavButton 
            active={currentView === 'schedule'} 
            onClick={() => setCurrentView('schedule')} 
            icon={<CalendarIcon size={24} />} 
            label="Horario" 
          />
          <NavButton 
            active={currentView === 'exam'} 
            onClick={() => setCurrentView('exam')} 
            icon={<ClipboardCheck size={24} />} 
            label="Examen" 
          />
        </div>

        <div className="mt-auto flex flex-col gap-2 w-full px-4">
          <p className="hidden md:block text-[10px] uppercase font-bold text-sky-800/40 tracking-tighter mb-2 px-2">Materias</p>
          {SUBJECTS.map(s => (
            <button 
              key={s.id}
              onClick={() => {
                setSelectedSubject(s);
                setCurrentView('subject');
              }}
              className={`flex items-center gap-3 p-2 rounded-xl transition-all ${selectedSubject?.id === s.id && currentView === 'subject' ? 'bg-white/40 shadow-inner' : 'hover:bg-white/20'}`}
            >
              <div className={`p-1.5 rounded-lg text-white shadow-md bg-gradient-to-b ${getColorClasses(s.color)}`}>
                {getIcon(s.icon, 16)}
              </div>
              <span className="hidden md:block text-sm font-semibold text-sky-900">{s.name}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <header className="flex flex-col gap-1">
                <h1 className="text-4xl font-bold text-sky-950 tracking-tight font-logo uppercase">
                  Inicio
                </h1>
                <p className="text-sky-800/60 font-medium">Gestiona tu aprendizaje en <span className="font-logo font-bold text-sky-900">NewAra</span>.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AeroCard title="Estado NewAra">
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white/40 border border-white/60 shadow-inner">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="text-amber-500" size={16} />
                        <span className="text-xs font-bold text-sky-950 uppercase">Progreso Global</span>
                      </div>
                      <div className="w-full h-3 bg-sky-100 rounded-full overflow-hidden border border-white/20">
                        <div className="h-full bg-gradient-to-r from-blue-400 to-green-400 w-[65%] shadow-[0_0_10px_rgba(59,130,246,0.2)]"></div>
                      </div>
                      <div className="flex justify-between mt-2">
                        <p className="text-[10px] text-sky-800/60 font-bold uppercase">Nivel 4</p>
                        <p className="text-[10px] text-sky-800/60 font-bold uppercase">65%</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-white/20 rounded-2xl border border-white/30 hover:bg-white/40 transition-colors cursor-pointer group">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                        <TrendingUp size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-indigo-900/40 uppercase leading-none">Próxima Sugerencia</p>
                        <p className="text-xs font-bold text-sky-950">Repasar Unidad 2 de Biología</p>
                      </div>
                    </div>
                  </div>
                </AeroCard>

                <AeroCard title="Materias">
                  <div className="grid grid-cols-2 gap-3">
                    {SUBJECTS.map(s => (
                      <button 
                        key={s.id} 
                        onClick={() => handleSubjectClick(s)}
                        className="p-4 rounded-3xl bg-white/40 border border-white/60 hover:bg-white/60 transition-all flex flex-col items-center gap-2 group shadow-sm hover:shadow-lg active:scale-95"
                      >
                        <div className="p-3 rounded-2xl text-white shadow-lg bg-gradient-to-br from-blue-400/80 to-blue-600 group-hover:scale-110 transition-transform">
                          {getIcon(s.icon, 24)}
                        </div>
                        <span className="text-xs font-black uppercase text-sky-900 tracking-wider">
                          {s.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </AeroCard>

                <AeroCard title="Guía de Control">
                  <div className="space-y-3 text-sm font-medium text-sky-900">
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center text-[10px]">🖱️</div>
                       <span>Haz clic en las unidades para expandirlas.</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center text-[10px]">🏠</div>
                       <span>Usa la barra lateral para navegar.</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center text-[10px]">📝</div>
                       <span>Completa el examen para medir tu progreso.</span>
                    </div>
                  </div>
                </AeroCard>
              </div>

              <AeroCard className="bg-gradient-to-r from-sky-400/20 to-blue-500/20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-sky-950">¿Listo para el desafío?</h2>
                    <p className="text-sky-800 font-medium">Realiza un examen virtual de práctica para poner a prueba tus conocimientos.</p>
                  </div>
                  <GlossyButton onClick={resetExam} className="w-full md:w-auto px-12 py-4 text-lg">
                    Empezar Examen <ChevronRight />
                  </GlossyButton>
                </div>
              </AeroCard>
            </motion.div>
          )}

          {currentView === 'subject' && selectedSubject && (
             <motion.div 
               key="subject"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="space-y-6"
             >
                <div className="flex items-center gap-4">
                  <button onClick={() => setCurrentView('home')} className="p-3 rounded-full aero-glass hover:bg-white/60 transition-all text-sky-900">
                    <ChevronRight className="rotate-180" />
                  </button>
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700 text-white shadow-xl">
                    {getIcon(selectedSubject.icon, 32)}
                  </div>
                  <h1 className="text-5xl font-black text-sky-950 tracking-tighter">{selectedSubject.name}</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-6">
                    <AeroCard title="Unidades de Estudio">
                      <div className="grid grid-cols-1 gap-4">
                        {selectedSubject.units.map((unit, i) => (
                           <div 
                             key={i} 
                             onClick={() => setExpandedUnit(expandedUnit === i ? null : i)}
                             className="group overflow-hidden bg-white/40 border border-white/60 rounded-3xl transition-all cursor-pointer shadow-sm hover:shadow-md"
                           >
                              <div className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-xl shadow-inner">
                                    {i + 1}
                                  </div>
                                  <span className="text-lg font-bold text-sky-900">{unit.title}</span>
                                </div>
                                <motion.div 
                                  animate={{ rotate: expandedUnit === i ? 90 : 0 }}
                                  className="text-sky-300 group-hover:text-sky-600 transition-colors"
                                >
                                  <ChevronRight />
                                </motion.div>
                              </div>
                              <AnimatePresence>
                                {expandedUnit === i && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-5 pb-5 text-sky-800/80 font-medium border-t border-white/20 pt-4 bg-white/10"
                                  >
                                    <p>{unit.description}</p>
                                    <div className="mt-4 flex gap-2">
                                      <GlossyButton 
                                        variant="green" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          startExercise(i);
                                        }}
                                        className="text-[10px] py-1 px-4"
                                      >
                                        EJERCICIOS
                                      </GlossyButton>
                                      <button className="text-[10px] bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1 rounded-full font-bold text-blue-600 uppercase transition-all">Ver Más</button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                           </div>
                        ))}
                      </div>
                    </AeroCard>
                  </div>

                  <div className="space-y-6">
                    <AeroCard title="Información">
                      <p className="text-sky-900 font-medium leading-relaxed italic text-sm">
                        "{selectedSubject.description}"
                      </p>
                    </AeroCard>

                    {selectedSubject.id === 'geografia' && (
                       <GlossyButton 
                        onClick={() => setShowGeoGuide(true)}
                        className="w-full py-3 text-sm gap-2 border-2 border-white/40"
                       >
                         <div className="flex items-center gap-2">📖 Guía Visual <span className="text-[9px] opacity-50 font-black">(.HTML)</span></div>
                       </GlossyButton>
                    )}
                    
                    <GlossyButton className="w-full py-3 text-sm opacity-40 grayscale" disabled>
                      <BookOpen size={16} /> Ver Programas
                    </GlossyButton>
                  </div>
                </div>
             </motion.div>
          )}

          {currentView === 'schedule' && (
            <motion.div 
               key="schedule"
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -30 }}
               className="space-y-8"
            >
               <div className="flex flex-col gap-1">
                 <h1 className="text-4xl font-black text-sky-950">Mi Horario Escolar</h1>
                 <p className="text-sky-800/60 font-medium">Ciclo Lectivo 2026 - 1º 1ª</p>
               </div>

               <AeroCard className="p-0 overflow-x-auto shadow-2xl border-white/40">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-white/30 backdrop-blur-xl">
                        <th className="p-4 text-xs font-black text-sky-900 border-b border-white/20 uppercase tracking-tighter w-24">Hora</th>
                        <th className="p-4 text-xs font-black text-sky-900 border-b border-white/20 border-l border-white/10 uppercase tracking-widest text-center">Lunes</th>
                        <th className="p-4 text-xs font-black text-sky-900 border-b border-white/20 border-l border-white/10 uppercase tracking-widest text-center">Martes</th>
                        <th className="p-4 text-xs font-black text-sky-900 border-b border-white/20 border-l border-white/10 uppercase tracking-widest text-center">Miércoles</th>
                        <th className="p-4 text-xs font-black text-sky-900 border-b border-white/20 border-l border-white/10 uppercase tracking-widest text-center">Jueves</th>
                        <th className="p-4 text-xs font-black text-sky-900 border-b border-white/20 border-l border-white/10 uppercase tracking-widest text-center">Viernes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      <ScheduleRow time="07:40 - 08:20" items={['Lengua y Lit.', 'Biología', 'LAA I/F', 'Lengua y Lit.', 'GEO/FEC/HIST']} colors={['blue', 'amber', 'amber', 'blue', 'red']} />
                      <ScheduleRow time="08:20 - 09:00" items={['Lengua y Lit.', 'Biología', 'LAA I/F', 'Lengua y Lit.', 'HIST/FEC/GEO']} colors={['blue', 'amber', 'amber', 'blue', 'red']} />
                      <ScheduleRow time="09:10 - 09:50" items={['EDI Dragon', 'F.E.C', 'BIO / PP MAT', 'Tecnología', 'Lengua/PP ART']} colors={['indigo', 'red', 'green', 'indigo', 'green']} />
                      <ScheduleRow time="09:50 - 10:30" items={['EDI Dragon', 'F.E.C', 'MAT / PP BIO', 'Tecnología', 'Arte PP Lengu.']} colors={['indigo', 'red', 'blue', 'indigo', 'green']} />
                      <ScheduleRow time="10:45 - 11:25" items={['Historia', 'Tutoría', 'Matemática', 'LAA I/F', 'LAA I/F']} colors={['amber', 'slate', 'blue', 'amber', 'amber']} />
                      <ScheduleRow time="11:25 - 12:05" items={['Historia', 'Matemática', 'Matemática', 'LAA I/F', 'LAA I/F']} colors={['amber', 'blue', 'blue', 'amber', 'amber']} />
                      <ScheduleRow time="12:10 - 12:50" items={['Geografía', 'Historia', 'Matemática', '', 'Artes']} colors={['indigo', 'amber', 'blue', '', 'blue']} />
                      <ScheduleRow time="12:50 - 13:30" items={['Geografía', '', 'LAA I/F', '', 'Artes']} colors={['indigo', '', 'amber', '', 'blue']} />
                      <ScheduleRow time="13:30 - 14:10" items={['', 'Ed. Física', '', '', 'Biología']} colors={['', 'green', '', '', 'amber']} highlight={true} />
                    </tbody>
                  </table>
               </AeroCard>

               <div className="flex gap-4">
                  <div className="flex-1 aero-glass p-4 rounded-3xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg">📍</div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-sky-900/40">Ubicación Actual</p>
                      <p className="text-sm font-bold text-sky-950">Aula 104 - Sector Norte</p>
                    </div>
                  </div>
                  <div className="flex-1 aero-glass p-4 rounded-3xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-green-500 flex items-center justify-center text-white shadow-lg">🔔</div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-sky-900/40">Próximo Recreo</p>
                      <p className="text-sm font-bold text-sky-950">En 15 minutos</p>
                    </div>
                  </div>
               </div>
            </motion.div>
          )}

          {currentView === 'exam' && (
            <motion.div 
               key="exam"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.1 }}
               className="max-w-3xl mx-auto space-y-8 py-12"
            >
               <AeroCard title="Asistente de Examen Virtual" className="border-4 border-blue-400/30">
                  <AnimatePresence mode="wait">
                    {!examState.finished ? (
                      <motion.div 
                        key={examState.currentQuestion}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        className="space-y-8 py-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-black text-blue-500 tracking-widest">Pregunta {examState.currentQuestion + 1} de {questions.length}</span>
                            <h2 className="text-2xl font-black text-sky-950">{questions[examState.currentQuestion].q}</h2>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          {questions[examState.currentQuestion].a.map((opt, i) => (
                            <button 
                              key={i} 
                              onClick={() => handleAnswer(i)}
                              className="p-6 rounded-3xl bg-white/40 border-2 border-white/60 hover:bg-white/80 hover:border-blue-400 transition-all text-left font-bold text-sky-900 group flex items-center justify-between shadow-sm hover:shadow-xl"
                            >
                              {opt}
                              <div className="w-6 h-6 rounded-full border-4 border-white shadow-inner group-hover:bg-blue-400 group-hover:scale-125 transition-all" />
                            </button>
                          ))}
                        </div>

                        <div className="w-full h-2 bg-sky-100 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${((examState.currentQuestion) / questions.length) * 100}%` }}
                          />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="result"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="py-12 flex flex-col items-center text-center gap-6"
                      >
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-2xl flex items-center justify-center text-white text-4xl font-black ring-8 ring-blue-100">
                          {Math.round((examState.score / questions.length) * 100)}%
                        </div>
                        <div className="space-y-2">
                          <h2 className="text-3xl font-black text-sky-950">¡Examen Finalizado!</h2>
                          <p className="text-sky-800 font-medium">Has respondido correctamente {examState.score} de {questions.length} preguntas.</p>
                        </div>
                        <div className="flex gap-4">
                           <GlossyButton onClick={resetExam}>Reintentar</GlossyButton>
                           <button onClick={() => setCurrentView('home')} className="text-sky-950 font-bold hover:underline">Volver al Inicio</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </AeroCard>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Decorative Bubbles for Frutiger Aero feel */}
      <div className="fixed -bottom-20 -left-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="fixed -top-20 -right-20 w-96 h-96 bg-green-400/10 rounded-full blur-3xl pointer-events-none -z-10 animate-[pulse_8s_infinite]" />
      <div className="fixed top-1/2 left-1/4 w-32 h-32 bg-white/30 rounded-full border border-white/50 blur-sm pointer-events-none -z-10 shadow-2xl animate-bounce" style={{ animationDuration: '6s' }} />

      {/* Exercise Overlay */}
      <AnimatePresence>
        {showGeoGuide && <GeographyGuide onClose={() => setShowGeoGuide(false)} />}
        {activeExercise && selectedSubject && exerciseState.shuffled.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-900/40 backdrop-blur-xl"
          >
            <AeroCard className="max-w-xl w-full border-4 border-white/50 shadow-2xl overflow-visible">
              <button 
                onClick={() => setActiveExercise(null)}
                className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all text-2xl z-20"
              >
                ×
              </button>
              
              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl text-white shadow-lg bg-gradient-to-br ${getColorClasses(selectedSubject.color)}`}>
                      {getIcon(selectedSubject.icon, 20)}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-sky-900 leading-tight">{selectedSubject.units[activeExercise.unitIndex].title}</h2>
                      <p className="text-[10px] uppercase font-black text-sky-500 tracking-widest">Desafío de Práctica</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-sky-900/40">{activeExercise.currentQuestion + 1} / {exerciseState.shuffled.length}</span>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {!exerciseState.finished ? (
                    <motion.div 
                      key={activeExercise.currentQuestion}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      className="space-y-6"
                    >
                      <p className="text-xl font-bold text-sky-950 leading-snug">
                        {exerciseState.shuffled[activeExercise.currentQuestion].question}
                      </p>
                      <div className="grid grid-cols-1 gap-3">
                        {exerciseState.shuffled[activeExercise.currentQuestion].options.map((opt: string, i: number) => {
                          const isCorrect = i === exerciseState.shuffled[activeExercise.currentQuestion].correct;
                          const isSelected = i === selectedAnswer;
                          
                          let bgClass = "bg-white/40 border-white/60 hover:bg-white/80 hover:border-blue-400";
                          if (selectedAnswer !== null) {
                            if (isSelected) {
                              bgClass = isCorrect ? "bg-green-400/60 border-green-400 text-white" : "bg-red-400/60 border-red-400 text-white";
                            } else if (isCorrect) {
                              bgClass = "bg-green-400/20 border-green-400/50 text-green-700";
                            } else {
                              bgClass = "bg-white/20 border-white/20 opacity-40";
                            }
                          }

                          return (
                            <button 
                              key={i}
                              disabled={selectedAnswer !== null}
                              onClick={() => handleExerciseAnswer(i)}
                              className={`p-4 rounded-2xl text-left font-bold transition-all border-2 ${bgClass} shadow-sm flex items-center justify-between group`}
                            >
                              <span>{opt}</span>
                              <div className={`w-4 h-4 rounded-full border-2 transition-colors ${selectedAnswer !== null && isSelected ? 'bg-white border-white scale-110' : 'border-sky-200 group-hover:border-blue-400'}`} />
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="py-6 flex flex-col items-center gap-6"
                    >
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-xl ring-8 ring-blue-50">
                          {Math.round((exerciseState.score / exerciseState.shuffled.length) * 100)}%
                        </div>
                      </div>
                      
                      <div className="w-full space-y-4 max-h-[40vh] overflow-y-auto px-2 custom-scrollbar">
                        <h4 className="text-xs font-black text-sky-900/40 uppercase tracking-widest text-center sticky top-0 bg-transparent py-2 backdrop-blur-md">Resumen de Actividades</h4>
                        {exerciseState.userAnswers.map((ans, idx) => (
                          <div key={idx} className={`p-4 rounded-2xl border-2 transition-all ${ans.isCorrect ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
                            <p className="text-xs font-bold text-sky-950 mb-2">{idx + 1}. {ans.question}</p>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-[10px]">
                                <span className="font-black opacity-40 uppercase">Tu respuesta:</span>
                                <span className={`font-bold ${ans.isCorrect ? 'text-green-600' : 'text-red-600'}`}>{ans.options[ans.selected]}</span>
                              </div>
                              {!ans.isCorrect && (
                                <div className="flex items-center gap-2 text-[10px]">
                                  <span className="font-black opacity-40 uppercase">Correcta:</span>
                                  <span className="font-bold text-green-600">{ans.options[ans.correct]}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-center">
                        <h3 className="text-2xl font-black text-sky-950">
                          {exerciseState.score === exerciseState.shuffled.length ? '¡Puntaje Perfecto!' : 
                           exerciseState.score > exerciseState.shuffled.length / 2 ? '¡Buen Trabajo!' : '¡Sigue Practicando!'}
                        </h3>
                        <p className="text-sky-800 font-medium">Has completado la unidad de estudio.</p>
                      </div>
                      <div className="flex gap-3">
                        <GlossyButton onClick={() => startExercise(activeExercise.unitIndex)} className="px-8 flex-1">
                          Reiniciar
                        </GlossyButton>
                        <GlossyButton variant="blue" onClick={() => setActiveExercise(null)} className="px-8 flex-1">
                          Terminar
                        </GlossyButton>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!exerciseState.finished && (
                  <div className="w-full h-1.5 bg-sky-100 rounded-full overflow-hidden mt-4">
                    <motion.div 
                      className="h-full bg-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(activeExercise.currentQuestion / exerciseState.shuffled.length) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </AeroCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all relative group ${active ? 'bg-white/50 shadow-lg text-blue-600 scale-105 border border-white/50' : 'text-sky-900 hover:bg-white/30'}`}
    >
      <div className={`${active ? 'text-blue-600' : 'text-sky-900/60 group-hover:text-sky-900'}`}>{icon}</div>
      <span className={`hidden md:block font-bold transition-all ${active ? 'text-blue-600' : 'text-sky-900/60 group-hover:text-sky-900'}`}>{label}</span>
      {active && <div className="absolute right-2 w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
    </button>
  );
}

function ScheduleRow({ time, items, colors, highlight = false }: { time: string, items: string[], colors: string[], highlight?: boolean }) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green': return 'from-green-400/80 to-green-600/80 text-white';
      case 'blue': return 'from-blue-400/80 to-blue-600/80 text-white';
      case 'amber': return 'from-amber-400/80 to-amber-600/80 text-white';
      case 'red': return 'from-red-400/80 to-red-600/80 text-white';
      case 'indigo': return 'from-indigo-400/80 to-indigo-600/80 text-white';
      case 'slate': return 'from-slate-400/80 to-slate-600/80 text-white';
      default: return 'bg-white/20 text-sky-900/40';
    }
  };

  return (
    <tr className={`border-b border-white/5 hover:bg-white/10 transition-colors ${highlight ? 'bg-blue-50/20' : ''}`}>
      <td className="p-4 text-[10px] font-black text-sky-900/60 whitespace-nowrap bg-white/10">{time}</td>
      {items.map((item, i) => (
        <td key={i} className="p-2 border-l border-white/5">
          {item ? (
            <div className={`p-2 rounded-xl bg-gradient-to-br ${getColorClasses(colors[i])} text-center shadow-lg backdrop-blur-sm border border-white/20 transform transition-transform hover:scale-105 cursor-default`}>
              <p className="text-[10px] font-black uppercase tracking-tighter leading-tight">{item}</p>
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center opacity-10">
               <div className="w-1 h-1 rounded-full bg-sky-900" />
            </div>
          )}
        </td>
      ))}
    </tr>
  );
}

