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
  Calculator,
  Calendar as CalendarIcon, 
  BookOpen, 
  ClipboardCheck, 
  Home,
  ChevronRight,
  User,
  Sparkles,
  TrendingUp,
  Book,
  Lightbulb,
  HelpCircle,
  ArrowLeft,
  CheckCircle2,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SUBJECTS, Subject } from './types';
import { AeroCard, GlossyButton } from './components/AeroUI';
import { GeographyGuide } from './components/GeographyGuide';
import { MathGuide } from './components/MathGuide';
import { BubbleBackground } from './components/BubbleBackground';
import { playExternalBubble, playSuccessSound, playErrorSound } from './lib/sounds';

type View = 'home' | 'subject' | 'schedule' | 'exam' | 'unit-study' | 'settings';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [theme, setTheme] = useState<'white' | 'black'>('white');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState<number | null>(null);
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
  const [showMathGuide, setShowMathGuide] = useState(false);

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
    
    if (isCorrect) {
      playSuccessSound();
    } else {
      playErrorSound();
    }

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

  const handleNextUnit = () => {
    if (!selectedSubject || selectedUnitIndex === null) return;
    
    const nextIndex = selectedUnitIndex + 1;
    if (nextIndex < selectedSubject.units.length) {
      playExternalBubble();
      setSelectedUnitIndex(nextIndex);
      setActiveExercise(null);
      setCurrentView('unit-study');
    }
  };

  const handleSubjectClick = (subject: Subject) => {
    playExternalBubble();
    setSelectedSubject(subject);
    setSelectedUnitIndex(null);
    setCurrentView('subject');
  };

  const getIcon = (name: string, size = 20) => {
    switch (name) {
      case 'Leaf': return <Leaf size={size} />;
      case 'Globe': return <Globe size={size} />;
      case 'Scroll': return <Scroll size={size} />;
      case 'ShieldCheck': return <ShieldCheck size={size} />;
      case 'Languages': return <Languages size={size} />;
      case 'Calculator': return <Calculator size={size} />;
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
      case 'violet': return 'from-violet-400 to-violet-600';
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
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    const isCorrect = index === questions[examState.currentQuestion].r;
    
    if (isCorrect) {
      playSuccessSound();
    } else {
      playErrorSound();
    }

    if (isCorrect) {
      setExamState(prev => ({ ...prev, score: prev.score + 1 }));
    }
    
    // Add delay for feedback
    setTimeout(() => {
      setSelectedAnswer(null);
      if (examState.currentQuestion < questions.length - 1) {
        setExamState(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }));
      } else {
        setExamState(prev => ({ ...prev, finished: true }));
      }
    }, 1500);
  };

  const resetExam = () => {
    playExternalBubble();
    setExamState({ active: true, currentQuestion: 0, score: 0, finished: false });
    setCurrentView('exam');
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans relative flex-col md:flex-row transition-colors duration-500 ${theme === 'black' ? 'text-white' : ''}`}>
      <BubbleBackground theme={theme} />
      {/* Sidebar - Navigation Rail (Desktop) / Bottom Nav (Mobile) */}
      <nav className={`fixed bottom-0 left-0 right-0 h-20 md:relative md:h-auto md:w-64 aero-glass m-2 md:m-4 rounded-2xl md:rounded-3xl flex md:flex-col flex-row items-center justify-around md:justify-start py-2 md:py-8 gap-1 md:gap-6 border shadow-2xl z-40 transition-colors duration-500 ${theme === 'black' ? 'bg-black/40 border-white/10' : 'border-white/20'}`}>
        <div className="glossy-overlay opacity-20 pointer-events-none" />
        
        {/* LOGO NewAra - Hidden on Mobile to save space */}
        <div className="hidden md:flex flex-col items-center gap-4 mb-4 mt-2 px-4">
          <img 
            src="input_file_0.png" 
            alt="NewAra Logo" 
            className="w-full h-auto max-w-[180px] drop-shadow-[0_2px_8px_rgba(255,255,255,0.8)] filter brightness-105" 
            referrerPolicy="no-referrer"
          />
          
          {/* Version Badge */}
          <div className="px-4 py-1 bg-gradient-to-b from-[#ffd966] to-[#f1c232] rounded-full border border-white/60 shadow-[0_3px_8px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,0.8)] flex items-center justify-center transform hover:scale-105 transition-transform cursor-default">
            <span className="font-logo text-[12px] font-bold text-gray-800 tracking-widest flex items-center gap-1">
              BETA 2.7
            </span>
          </div>

          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
        </div>

        <div className="hidden md:flex flex-col items-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-sky-600 shadow-inner flex items-center justify-center text-white ring-4 ring-white/30">
            <User size={24} />
          </div>
          <span className="hidden md:block text-xs font-bold text-sky-900/60 uppercase tracking-widest">Estudiante</span>
        </div>

        <div className="flex-1 w-full md:px-4 md:overflow-y-auto md:custom-scrollbar flex md:flex-col flex-row justify-around md:justify-start items-center gap-1 md:gap-8">
          <div className="flex md:flex-col flex-row gap-1 md:gap-4 w-full md:w-full items-center">
            <NavButton 
              active={currentView === 'home'} 
              onClick={() => setCurrentView('home')} 
              icon={<Home size={22} />} 
              label="Inicio" 
              theme={theme}
            />
            <NavButton 
              active={currentView === 'schedule'} 
              onClick={() => setCurrentView('schedule')} 
              icon={<CalendarIcon size={22} />} 
              label="Horario" 
              theme={theme}
            />
            <NavButton 
              active={currentView === 'exam'} 
              onClick={() => setCurrentView('exam')} 
              icon={<ClipboardCheck size={22} />} 
              label="Examen" 
              theme={theme}
            />
            <NavButton 
              active={currentView === 'settings'} 
              onClick={() => setCurrentView('settings')} 
              icon={<Settings size={22} />} 
              label="Ajustes" 
              theme={theme}
            />
          </div>

          <div className="hidden md:flex flex-col gap-2 w-full pb-8">
            <p className="hidden md:block text-[10px] uppercase font-bold text-sky-800/40 tracking-tighter mb-2 px-2">Materias</p>
            {SUBJECTS.map(s => (
              <button 
                key={s.id}
                onClick={() => {
                  playExternalBubble();
                  setSelectedSubject(s);
                  setCurrentView('subject');
                }}
                className={`flex items-center gap-3 p-2 rounded-xl transition-all ${selectedSubject?.id === s.id && currentView === 'subject' ? 'bg-white/40 shadow-inner' : 'hover:bg-white/20'}`}
              >
                <div className={`p-1.5 rounded-lg text-white shadow-md bg-gradient-to-b ${getColorClasses(s.color)}`}>
                  {getIcon(s.icon, 16)}
                </div>
                <span className={`text-sm font-semibold transition-colors duration-500 ${theme === 'black' ? 'text-white/80' : 'text-sky-900'}`}>{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 pb-28 md:p-8">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
      <header className="flex flex-col gap-1">
        <h1 className={`text-3xl md:text-4xl font-bold tracking-tight font-logo uppercase transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
          Inicio
        </h1>
        <p className={`text-sm md:text-base font-medium transition-colors duration-500 ${theme === 'black' ? 'text-white/60' : 'text-sky-800/60'}`}>Gestiona tu aprendizaje en <span className={`font-logo font-bold transition-colors duration-500 ${theme === 'black' ? 'text-blue-400' : 'text-sky-900'}`}>NewAra</span>.</p>
      </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AeroCard title="Estado NewAra" theme={theme}>
                  <div className="space-y-4">
                    <div className={`p-4 rounded-2xl border shadow-inner ${theme === 'black' ? 'bg-white/5 border-white/10' : 'bg-white/40 border-white/60'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="text-amber-500" size={16} />
                        <span className={`text-xs font-bold uppercase ${theme === 'black' ? 'text-white/80' : 'text-sky-950'}`}>Progreso Global</span>
                      </div>
                      <div className="w-full h-3 bg-sky-100/20 rounded-full overflow-hidden border border-white/20">
                        <div className="h-full bg-gradient-to-r from-blue-400 to-green-400 w-[65%] shadow-[0_0_10px_rgba(59,130,246,0.2)]"></div>
                      </div>
                      <div className="flex justify-between mt-2">
                        <p className={`text-[10px] font-bold uppercase ${theme === 'black' ? 'text-white/40' : 'text-sky-800/60'}`}>Nivel 4</p>
                        <p className={`text-[10px] font-bold uppercase ${theme === 'black' ? 'text-white/40' : 'text-sky-800/60'}`}>65%</p>
                      </div>
                    </div>
                    
                    <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors cursor-pointer group ${theme === 'black' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/20 border-white/30 hover:bg-white/40'}`}>
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                        <TrendingUp size={16} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-[10px] font-black uppercase leading-none opacity-40 ${theme === 'black' ? 'text-indigo-300' : 'text-indigo-900'}`}>Próxima Sugerencia</p>
                        <p className={`text-xs font-bold ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>Repasar Unidad 2 de Biología</p>
                      </div>
                    </div>
                  </div>
                </AeroCard>

                <AeroCard title="Materias" theme={theme}>
                  <div className="grid grid-cols-2 gap-3">
                    {SUBJECTS.map(s => (
                      <button 
                        key={s.id} 
                        onClick={() => handleSubjectClick(s)}
                        className={`p-4 rounded-3xl border transition-all flex flex-col items-center gap-2 group shadow-sm hover:shadow-lg active:scale-95 ${theme === 'black' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/40 border-white/60 hover:bg-white/60'}`}
                      >
                        <div className="p-3 rounded-2xl text-white shadow-lg bg-gradient-to-br from-blue-400/80 to-blue-600 group-hover:scale-110 transition-transform">
                          {getIcon(s.icon, 24)}
                        </div>
                        <span className={`text-xs font-black uppercase tracking-wider ${theme === 'black' ? 'text-white/60' : 'text-sky-900'}`}>
                          {s.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </AeroCard>

                <AeroCard title="Guía de Control" theme={theme}>
                  <div className={`space-y-3 text-sm font-medium ${theme === 'black' ? 'text-white/70' : 'text-sky-900'}`}>
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 rounded bg-blue-100/20 flex items-center justify-center text-[10px]">🖱️</div>
                       <span>Haz clic en las unidades para expandirlas.</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 rounded bg-blue-100/20 flex items-center justify-center text-[10px]">🏠</div>
                       <span>Usa la barra lateral para navegar.</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 rounded bg-blue-100/20 flex items-center justify-center text-[10px]">📝</div>
                       <span>Completa el examen para medir tu progreso.</span>
                    </div>
                  </div>
                </AeroCard>
              </div>

              <AeroCard className="bg-gradient-to-r from-sky-400/20 to-blue-500/20" theme={theme}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-center md:text-left">
                    <h2 className={`text-2xl font-black ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>¿Listo para el desafío?</h2>
                    <p className={`${theme === 'black' ? 'text-white/60' : 'text-sky-800'}`}>Realiza un examen virtual de práctica para poner a prueba tus conocimientos.</p>
                  </div>
                  <GlossyButton onClick={resetExam} className="w-full md:w-auto px-12 py-4 text-lg">
                    Empezar Examen <ChevronRight />
                  </GlossyButton>
                </div>
              </AeroCard>
            </motion.div>
          )}

          {currentView === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-8"
            >
              <header className="flex flex-col gap-1">
                <h1 className={`text-4xl font-black transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>Configuración</h1>
                <p className={`font-medium transition-colors duration-500 ${theme === 'black' ? 'text-white/60' : 'text-sky-800/60'}`}>Personaliza tu experiencia en NewAra.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AeroCard title="Apariencia" theme={theme}>
                  <div className="space-y-6">
                    <div>
                      <p className={`text-sm font-bold mb-4 flex items-center gap-2 transition-colors duration-500 ${theme === 'black' ? 'text-white/80' : 'text-sky-900'}`}>
                        Tema del Web
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => { playExternalBubble(); setTheme('white'); }}
                          className={`p-4 rounded-3xl flex flex-col items-center gap-3 transition-all border-2 ${theme === 'white' ? 'bg-white border-blue-400 shadow-xl scale-105' : 'bg-white/40 border-white/60 hover:bg-white/60'}`}
                        >
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-100 to-white shadow-inner border border-sky-100" />
                          <span className="text-sm font-bold text-sky-950">Blanco</span>
                        </button>
                        <button 
                          onClick={() => { playExternalBubble(); setTheme('black'); }}
                          className={`p-4 rounded-3xl flex flex-col items-center gap-3 transition-all border-2 ${theme === 'black' ? 'bg-white border-blue-400 shadow-xl scale-105' : 'bg-white/40 border-white/60 hover:bg-white/60'}`}
                        >
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 to-black shadow-inner border border-slate-800" />
                          <span className="text-sm font-bold text-sky-950">Negro</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </AeroCard>

                <AeroCard title="Acerca de" theme={theme}>
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white/20 border border-white/30">
                      <p className={`text-xs font-black uppercase transition-colors duration-500 ${theme === 'black' ? 'text-white/40' : 'text-sky-900/40'} mb-2`}>Desarrollador</p>
                      <p className={`text-sm font-bold transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>NewAra Team</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/20 border border-white/30">
                      <p className={`text-xs font-black uppercase transition-colors duration-500 ${theme === 'black' ? 'text-white/40' : 'text-sky-900/40'} mb-2`}>Version</p>
                      <p className={`text-sm font-bold transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>BETA 2.7 - Frutiger Edition</p>
                    </div>
                  </div>
                </AeroCard>
              </div>
            </motion.div>
          )}

          {currentView === 'subject' && selectedSubject && (
             <motion.div 
               key="subject"
               initial={{ opacity: 0, scale: 0.8, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, x: -100, scale: 0.95 }}
               transition={{ type: "spring", damping: 25, stiffness: 120 }}
               className="space-y-6"
             >
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700 text-white shadow-xl flex-shrink-0">
                  {getIcon(selectedSubject.icon, 24)}
                </div>
                <h1 className={`text-3xl md:text-5xl font-black tracking-tighter text-center md:text-left transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{selectedSubject.name}</h1>
              </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-6">
                    <AeroCard title="Ruta de Aprendizaje" theme={theme}>
                      <DuolingoPath 
                        units={selectedSubject.units} 
                        subjectColor={selectedSubject.color}
                        onUnitClick={(index) => {
                           playExternalBubble();
                           setSelectedUnitIndex(index);
                           setCurrentView('unit-study');
                        }}
                        theme={theme}
                      />
                    </AeroCard>
                  </div>

                  <div className="space-y-6">
                    <AeroCard title="Información" theme={theme}>
                      <p className={`font-medium leading-relaxed italic text-sm transition-colors duration-500 ${theme === 'black' ? 'text-white/70' : 'text-sky-900'}`}>
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

                    {selectedSubject.id === 'matematica' && (
                       <GlossyButton 
                        onClick={() => setShowMathGuide(true)}
                        className="w-full py-3 text-sm gap-2 border-2 border-white/40"
                       >
                         <div className="flex items-center gap-2">🔢 Guía Visual <span className="text-[9px] opacity-50 font-black">(PDF)</span></div>
                        </GlossyButton>
                    )}
                    
                    <GlossyButton className="w-full py-3 text-sm opacity-40 grayscale" disabled>
                      <BookOpen size={16} /> Ver Programas
                    </GlossyButton>
                  </div>
                </div>
             </motion.div>
          )}

          {currentView === 'unit-study' && selectedSubject && selectedUnitIndex !== null && (
             <UnitStudyView 
               unit={selectedSubject.units[selectedUnitIndex]} 
               color={selectedSubject.color}
               onBack={() => setCurrentView('subject')}
               onStartExercise={() => startExercise(selectedUnitIndex)}
               theme={theme}
               hasNextUnit={selectedUnitIndex < selectedSubject.units.length - 1}
               onNextUnit={handleNextUnit}
             />
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
                 <h1 className={`text-4xl font-black transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>Mi Horario Escolar</h1>
                 <p className={`font-medium transition-colors duration-500 ${theme === 'black' ? 'text-white/60' : 'text-sky-800/60'}`}>Ciclo Lectivo 2026 - 1º 1ª</p>
               </div>

               <div className="space-y-4">
                 <p className={`md:hidden text-[10px] text-center animate-pulse font-black uppercase tracking-widest ${theme === 'black' ? 'text-white/40' : 'text-sky-800/40'}`}>↔ Desliza la tabla para ver más</p>
                 <AeroCard className="p-0 overflow-x-auto shadow-2xl border-white/40" theme={theme}>
                    <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className={`backdrop-blur-sm ${theme === 'black' ? 'bg-white/5' : 'bg-white/30'}`}>
                        <th className={`p-4 text-xs font-black border-b border-white/10 uppercase tracking-tighter w-24 ${theme === 'black' ? 'text-white/60' : 'text-sky-900'}`}>Hora</th>
                        <th className={`p-4 text-xs font-black border-b border-white/10 border-l border-white/5 uppercase tracking-widest text-center ${theme === 'black' ? 'text-white/60' : 'text-sky-900'}`}>Lunes</th>
                        <th className={`p-4 text-xs font-black border-b border-white/10 border-l border-white/5 uppercase tracking-widest text-center ${theme === 'black' ? 'text-white/60' : 'text-sky-900'}`}>Martes</th>
                        <th className={`p-4 text-xs font-black border-b border-white/10 border-l border-white/5 uppercase tracking-widest text-center ${theme === 'black' ? 'text-white/60' : 'text-sky-900'}`}>Miércoles</th>
                        <th className={`p-4 text-xs font-black border-b border-white/10 border-l border-white/5 uppercase tracking-widest text-center ${theme === 'black' ? 'text-white/60' : 'text-sky-900'}`}>Jueves</th>
                        <th className={`p-4 text-xs font-black border-b border-white/10 border-l border-white/5 uppercase tracking-widest text-center ${theme === 'black' ? 'text-white/60' : 'text-sky-900'}`}>Viernes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <ScheduleRow theme={theme} time="07:40 - 08:20" items={['Lengua y Lit.', 'Biología', 'LAA I/F', 'Lengua y Lit.', 'GEO/FEC/HIST']} colors={['blue', 'amber', 'amber', 'blue', 'red']} />
                      <ScheduleRow theme={theme} time="08:20 - 09:00" items={['Lengua y Lit.', 'Biología', 'LAA I/F', 'Lengua y Lit.', 'HIST/FEC/GEO']} colors={['blue', 'amber', 'amber', 'blue', 'red']} />
                      <ScheduleRow theme={theme} time="09:10 - 09:50" items={['EDI Dragon', 'F.E.C', 'BIO / PP MAT', 'Tecnología', 'Lengua/PP ART']} colors={['indigo', 'red', 'green', 'indigo', 'green']} />
                      <ScheduleRow theme={theme} time="09:50 - 10:30" items={['EDI Dragon', 'F.E.C', 'MAT / PP BIO', 'Tecnología', 'Arte PP Lengu.']} colors={['indigo', 'red', 'blue', 'indigo', 'green']} />
                      <ScheduleRow theme={theme} time="10:45 - 11:25" items={['Historia', 'Tutoría', 'Matemática', 'LAA I/F', 'LAA I/F']} colors={['amber', 'slate', 'blue', 'amber', 'amber']} />
                      <ScheduleRow theme={theme} time="11:25 - 12:05" items={['Historia', 'Matemática', 'Matemática', 'LAA I/F', 'LAA I/F']} colors={['amber', 'blue', 'blue', 'amber', 'amber']} />
                      <ScheduleRow theme={theme} time="12:10 - 12:50" items={['Geografía', 'Historia', 'Matemática', '', 'Artes']} colors={['indigo', 'amber', 'blue', '', 'blue']} />
                      <ScheduleRow theme={theme} time="12:50 - 13:30" items={['Geografía', '', 'LAA I/F', '', 'Artes']} colors={['indigo', '', 'amber', '', 'blue']} />
                      <ScheduleRow theme={theme} time="13:30 - 14:10" items={['', 'Ed. Física', '', '', 'Biología']} colors={['', 'green', '', '', 'amber']} highlight={true} />
                    </tbody>
                  </table>
                </AeroCard>
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
               <AeroCard title="Asistente de Examen Virtual" className="border-4 border-blue-400/30" theme={theme}>
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
                            <h2 className={`text-2xl font-black transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{questions[examState.currentQuestion].q}</h2>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          {questions[examState.currentQuestion].a.map((opt, i) => {
                            const isCorrect = i === questions[examState.currentQuestion].r;
                            const isSelected = i === selectedAnswer;
                            
                            let feedbackClass = "";
                            if (selectedAnswer !== null) {
                              if (isSelected) {
                                feedbackClass = isCorrect 
                                  ? "bg-green-500/80 border-green-400 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]" 
                                  : "bg-red-500/80 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]";
                              } else if (isCorrect) {
                                feedbackClass = "bg-green-500/20 border-green-500 border-2 text-green-500 animate-pulse";
                              } else {
                                feedbackClass = "opacity-40 grayscale";
                              }
                            }

                            const defaultClass = theme === 'black' 
                              ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' 
                              : 'bg-white/40 border-white/60 hover:bg-white/80 hover:border-blue-400 text-sky-900';

                            return (
                              <motion.button 
                                key={i} 
                                disabled={selectedAnswer !== null}
                                onClick={() => handleAnswer(i)}
                                animate={selectedAnswer !== null && isCorrect ? { scale: [1, 1.05, 1] } : {}}
                                transition={{ duration: 0.5, repeat: selectedAnswer !== null && isCorrect ? 1 : 0 }}
                                className={`p-6 rounded-3xl border-2 transition-all text-left font-bold group flex items-center justify-between shadow-sm hover:shadow-xl ${selectedAnswer !== null ? feedbackClass : defaultClass}`}
                              >
                                {opt}
                                <div className={`w-6 h-6 rounded-full border-4 transition-all shadow-inner ${selectedAnswer !== null && isSelected ? 'bg-white scale-125' : 'border-white group-hover:bg-blue-400 group-hover:scale-125'}`} />
                              </motion.button>
                            );
                          })}
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
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-2xl flex items-center justify-center text-white text-4xl font-black ring-8 ring-blue-100/10">
                          {Math.round((examState.score / questions.length) * 100)}%
                        </div>
                        <div className="space-y-2">
                          <h2 className={`text-3xl font-black transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>¡Examen Finalizado!</h2>
                          <p className={`font-medium transition-colors duration-500 ${theme === 'black' ? 'text-white/60' : 'text-sky-800'}`}>Has respondido correctamente {examState.score} de {questions.length} preguntas.</p>
                        </div>
                        <div className="flex gap-4">
                           <GlossyButton onClick={resetExam}>Reintentar</GlossyButton>
                           <button 
                             onClick={() => {
                               playExternalBubble();
                               setCurrentView('home');
                             }} 
                             className={`font-bold hover:underline transition-colors duration-500 ${theme === 'black' ? 'text-white/80' : 'text-sky-950'}`}
                           >
                             Volver al Inicio
                           </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </AeroCard>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Decorative Bubbles for Frutiger Aero feel - Simplified for performance */}
      <div className="fixed -bottom-20 -left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-2xl pointer-events-none -z-10" />
      <div className="fixed -top-20 -right-20 w-72 h-72 bg-green-400/5 rounded-full blur-2xl pointer-events-none -z-10" />
      
      {/* Exercise Overlay */}
      <AnimatePresence>
        {showGeoGuide && <GeographyGuide onClose={() => setShowGeoGuide(false)} />}
        {showMathGuide && <MathGuide onClose={() => setShowMathGuide(false)} />}
        {activeExercise && selectedSubject && exerciseState.shuffled.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-sky-900/40 backdrop-blur-xl"
          >
            <AeroCard className="max-w-xl w-full max-h-[95vh] overflow-y-auto border-4 border-white/50 shadow-2xl" theme={theme}>
              <button 
                onClick={() => setActiveExercise(null)}
                className="absolute top-2 right-2 md:-top-4 md:-right-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all text-xl md:text-2xl z-20"
              >
                ×
              </button>
              
              <div className="space-y-6 relative z-10 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl text-white shadow-lg bg-gradient-to-br ${getColorClasses(selectedSubject.color)}`}>
                      {getIcon(selectedSubject.icon, 20)}
                    </div>
                    <div>
                      <h2 className={`text-xl font-black leading-tight transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>{selectedSubject.units[activeExercise.unitIndex].title}</h2>
                      <p className={`text-[10px] uppercase font-black tracking-widest transition-colors duration-500 ${theme === 'black' ? 'text-blue-400' : 'text-sky-500'}`}>Desafío de Práctica</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-black transition-colors duration-500 ${theme === 'black' ? 'text-white/20' : 'text-sky-900/40'}`}>{activeExercise.currentQuestion + 1} / {exerciseState.shuffled.length}</span>
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
                      <p className={`text-xl font-bold leading-snug transition-colors duration-500 ${theme === 'black' ? 'text-white/90' : 'text-sky-950'}`}>
                        {exerciseState.shuffled[activeExercise.currentQuestion].question}
                      </p>
                      <div className="grid grid-cols-1 gap-3">
                        {exerciseState.shuffled[activeExercise.currentQuestion].options.map((opt: string, i: number) => {
                          const isCorrect = i === exerciseState.shuffled[activeExercise.currentQuestion].correct;
                          const isSelected = i === selectedAnswer;
                          
                          let bgClass = theme === 'black' 
                            ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-400/50" 
                            : "bg-white/40 border-white/60 hover:bg-white/80 hover:border-blue-400";

                          if (selectedAnswer !== null) {
                            if (isSelected) {
                              bgClass = isCorrect ? "bg-green-400/60 border-green-400 text-white" : "bg-red-400/60 border-red-400 text-white";
                            } else if (isCorrect) {
                              bgClass = isCorrect && theme === 'black' ? "bg-green-400/20 border-green-400/50 text-green-400" : "bg-green-400/20 border-green-400/50 text-green-700";
                            } else {
                              bgClass = theme === 'black' ? "bg-white/5 border-white/5 opacity-20" : "bg-white/20 border-white/20 opacity-40";
                            }
                          }

                          return (
                            <motion.button 
                              key={i}
                              disabled={selectedAnswer !== null}
                              onClick={() => handleExerciseAnswer(i)}
                              animate={selectedAnswer !== null && isCorrect ? { scale: [1, 1.05, 1] } : {}}
                              transition={{ duration: 0.5, repeat: selectedAnswer !== null && isCorrect ? 1 : 0 }}
                              className={`p-4 rounded-2xl text-left font-bold transition-all border-2 ${bgClass} shadow-sm flex items-center justify-between group`}
                            >
                              <span>{opt}</span>
                              <div className={`w-4 h-4 rounded-full border-2 transition-colors ${selectedAnswer !== null && isSelected ? 'bg-white border-white scale-110' : (theme === 'black' ? 'border-white/20' : 'border-sky-200 group-hover:border-blue-400')}`} />
                            </motion.button>
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
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-xl ring-8 ring-blue-50/10">
                          {Math.round((exerciseState.score / exerciseState.shuffled.length) * 100)}%
                        </div>
                      </div>
                      
                      <div className="w-full space-y-4 max-h-[40vh] overflow-y-auto px-2 custom-scrollbar">
                        <h4 className={`text-xs font-black uppercase tracking-widest text-center sticky top-0 bg-transparent py-2 backdrop-blur-md transition-colors duration-500 ${theme === 'black' ? 'text-white/20' : 'text-sky-900/40'}`}>Resumen de Actividades</h4>
                        {exerciseState.userAnswers.map((ans, idx) => (
                          <div key={idx} className={`p-4 rounded-2xl border-2 transition-all ${ans.isCorrect ? (theme === 'black' ? 'bg-green-950/20 border-green-900/50' : 'bg-green-50/50 border-green-200') : (theme === 'black' ? 'bg-red-950/20 border-red-900/50' : 'bg-red-50/50 border-red-200')}`}>
                            <p className={`text-xs font-bold mb-2 transition-colors duration-500 ${theme === 'black' ? 'text-white/80' : 'text-sky-950'}`}>{idx + 1}. {ans.question}</p>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-[10px]">
                                <span className={`font-black uppercase opacity-40 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>Tu respuesta:</span>
                                <span className={`font-bold ${ans.isCorrect ? 'text-green-500' : 'text-red-500'}`}>{ans.options[ans.selected]}</span>
                              </div>
                              {!ans.isCorrect && (
                                <div className="flex items-center gap-2 text-[10px]">
                                  <span className={`font-black uppercase opacity-40 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>Correcta:</span>
                                  <span className="font-bold text-green-500">{ans.options[ans.correct]}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-center">
                        <h3 className={`text-2xl font-black transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
                          {exerciseState.score === exerciseState.shuffled.length ? '¡Puntaje Perfecto!' : 
                           exerciseState.score > exerciseState.shuffled.length / 2 ? '¡Buen Trabajo!' : '¡Sigue Practicando!'}
                        </h3>
                        <p className={`font-medium transition-colors duration-500 ${theme === 'black' ? 'text-white/60' : 'text-sky-800'}`}>Has completado la unidad de estudio.</p>
                      </div>
                      <div className="flex gap-3 w-full">
                        <GlossyButton onClick={() => startExercise(activeExercise.unitIndex)} className="px-4 flex-1 text-sm">
                          Reiniciar
                        </GlossyButton>
                        
                        {selectedSubject.units[activeExercise.unitIndex + 1] ? (
                          <GlossyButton variant="blue" onClick={handleNextUnit} className="px-4 flex-1 text-sm bg-gradient-to-b from-green-400 to-green-600">
                            Siguiente Unidad
                          </GlossyButton>
                        ) : (
                          <GlossyButton variant="blue" onClick={() => setActiveExercise(null)} className="px-4 flex-1 text-sm">
                            Terminar
                          </GlossyButton>
                        )}
                        
                        {selectedSubject.units[activeExercise.unitIndex + 1] && (
                          <button 
                            onClick={() => setActiveExercise(null)} 
                            className={`px-4 py-2 text-xs font-bold transition-all ${theme === 'black' ? 'text-white/40 hover:text-white' : 'text-sky-900/40 hover:text-sky-900'}`}
                          >
                            Cerrar
                          </button>
                        )}
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

function NavButton({ active, icon, label, onClick, theme = 'white' }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void, theme?: 'white' | 'black' }) {
  const handleClick = () => {
    playExternalBubble();
    onClick();
  };

  const activeClasses = theme === 'black' 
    ? 'bg-blue-600/30 shadow-[0_0_20px_rgba(37,99,235,0.3)] text-blue-400 border-blue-500/50' 
    : 'bg-white/60 shadow-[0_5px_15px_rgba(59,130,246,0.2)] text-blue-600 border-white/80';

  const defaultClasses = theme === 'black' 
    ? 'text-white/60 border-transparent hover:bg-white/10 hover:text-white' 
    : 'text-sky-900 border-transparent hover:bg-white/40 hover:border-white/50 hover:shadow-md';

  return (
    <motion.button 
      onClick={handleClick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`flex-1 md:w-full flex md:flex-row flex-col items-center justify-center md:justify-start gap-1 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl transition-all relative group border-2 ${active ? activeClasses : defaultClasses}`}
      style={{ willChange: 'transform' }}
    >
      <motion.div 
        animate={active ? { scale: 1.1, rotate: [0, -5, 5, 0] } : { scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`${active ? (theme === 'black' ? 'text-blue-400' : 'text-blue-600') : 'opacity-60 group-hover:opacity-100'}`}
      >
        {icon}
      </motion.div>
      <span className={`text-[10px] md:text-sm font-bold tracking-tight`}>{label}</span>
      
      {active && (
        <motion.div 
          layoutId="nav-indicator"
          className="hidden md:block absolute right-2 w-1.5 h-8 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 32 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      )}
      
      {/* Glossy highlight effect on hover */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 rounded-t-xl transition-opacity pointer-events-none" />
    </motion.button>
  );
}

function ScheduleRow({ time, items, colors, highlight = false, theme = 'white' }: { time: string, items: string[], colors: string[], highlight?: boolean, theme?: 'white' | 'black' }) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green': return 'from-green-400/80 to-green-600/80 text-white';
      case 'blue': return 'from-blue-400/80 to-blue-600/80 text-white';
      case 'amber': return 'from-amber-400/80 to-amber-600/80 text-white';
      case 'red': return 'from-red-400/80 to-red-600/80 text-white';
      case 'indigo': return 'from-indigo-400/80 to-indigo-600/80 text-white';
      case 'slate': return 'from-slate-400/80 to-slate-600/80 text-white';
      default: return theme === 'black' ? 'bg-white/5 text-white/20' : 'bg-white/20 text-sky-900/40';
    }
  };

  return (
    <tr className={`border-b border-white/5 transition-colors ${highlight ? (theme === 'black' ? 'bg-blue-900/20' : 'bg-blue-50/20') : ''} ${theme === 'black' ? 'hover:bg-white/5' : 'hover:bg-white/10'}`}>
      <td className={`p-4 text-[10px] font-black underline whitespace-nowrap transition-colors duration-500 ${theme === 'black' ? 'text-white/40 bg-white/5' : 'text-sky-900/60 bg-white/10'}`}>{time}</td>
      {items.map((item, i) => (
        <td key={i} className="p-2 border-l border-white/5">
          {item ? (
            <div className={`p-2 rounded-xl bg-gradient-to-br ${getColorClasses(colors[i])} text-center shadow-lg border border-white/20 transform transition-transform hover:scale-105 cursor-default`} style={{ willChange: 'transform' }}>
              <p className="text-[10px] font-black uppercase tracking-tighter leading-tight">{item}</p>
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center opacity-10">
               <div className={`w-1 h-1 rounded-full ${theme === 'black' ? 'bg-white' : 'bg-sky-900'}`} />
            </div>
          )}
        </td>
      ))}
    </tr>
  );
}

function UnitButton({ number, title, color, onClick, theme = 'white' }: { number: number, title: string, color: string, onClick: () => void, theme?: 'white' | 'black' }) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green': return 'from-green-400 to-green-600 shadow-green-500/50';
      case 'blue': return 'from-blue-400 to-blue-600 shadow-blue-500/50';
      case 'amber': return 'from-amber-400 to-amber-600 shadow-amber-500/50';
      case 'indigo': return 'from-indigo-400 to-indigo-600 shadow-indigo-500/50';
      case 'red': return 'from-red-400 to-red-600 shadow-red-500/50';
      case 'violet': return 'from-violet-400 to-violet-600 shadow-violet-500/50';
      default: return 'from-sky-400 to-sky-600 shadow-sky-500/50';
    }
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="flex flex-col items-center gap-4 group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        {/* Ring */}
        <div className={`absolute inset-0 rounded-full border-4 scale-125 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-150 blur-sm ${theme === 'black' ? 'border-white/10' : 'border-white/40'}`} />
        
        {/* Main Button */}
        <div className={`w-20 h-20 rounded-full bg-gradient-to-b ${getColorClasses(color)} flex items-center justify-center text-white text-3xl font-black shadow-[0_8px_0_rgb(0,0,0,0.1),0_15px_20px_-5px_rgba(0,0,0,0.3)] border-4 border-white/60 relative overflow-hidden active:translate-y-1 active:shadow-[0_4px_0_rgb(0,0,0,0.1)] transition-all`}>
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent opacity-50" />
           {number}
        </div>

        {/* Floating Tooltip */}
        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl shadow-xl border opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-10 translate-y-2 group-hover:translate-y-0 ${theme === 'black' ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-white text-sky-950'}`}>
          <span className="text-xs font-bold uppercase tracking-tighter">{title}</span>
          <div className={`absolute bottom-[-6px] left-1/2 -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] ${theme === 'black' ? 'border-t-slate-900' : 'border-t-white'}`} />
        </div>
      </div>
    </motion.div>
  );
}

function DuolingoPath({ units, subjectColor, onUnitClick, theme = 'white' }: { units: any[], subjectColor: string, onUnitClick: (index: number) => void, theme?: 'white' | 'black' }) {
  return (
    <div className="flex flex-col items-center py-6 md:py-12 gap-8 md:gap-16 relative">
      {/* Curved Path Svg background could go here, but we'll use a staggered layout for simplicity & feel */}
      {units.map((unit, i) => {
        // Calculate horizontal offset for a zigzag path - reduced for mobile
        const offsetMultiplier = typeof window !== 'undefined' && window.innerWidth < 768 ? 40 : 80;
        const offset = Math.sin(i * 1.2) * offsetMultiplier;
        
        return (
          <div 
            key={i} 
            style={{ transform: `translateX(${offset}px)` }}
            className="relative z-10"
          >
            <UnitButton 
              number={i + 1} 
              title={unit.title} 
              color={subjectColor} 
              onClick={() => onUnitClick(i)} 
              theme={theme}
            />
            
            {/* Connector dots */}
            {i < units.length - 1 && (
              <div 
                className="absolute left-1/2 -translate-x-1/2 top-20 md:top-24 h-8 md:h-12 flex flex-col gap-2 items-center opacity-30"
                style={{
                   transform: `translateX(${-offset/2}px) rotate(${offset > 0 ? '-15deg' : '15deg'})`
                }}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${theme === 'black' ? 'bg-white' : 'bg-sky-900'}`} />
                <div className={`w-1.5 h-1.5 rounded-full ${theme === 'black' ? 'bg-white' : 'bg-sky-900'}`} />
                <div className={`w-1.5 h-1.5 rounded-full ${theme === 'black' ? 'bg-white' : 'bg-sky-900'}`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function UnitStudyView({ unit, color, onBack, onStartExercise, theme = 'white', hasNextUnit, onNextUnit }: { unit: any, color: string, onBack: () => void, onStartExercise: () => void, theme?: 'white' | 'black', hasNextUnit: boolean, onNextUnit: () => void }) {
  const getGradient = (color: string) => {
    switch (color) {
      case 'green': return 'from-green-400 to-green-600';
      case 'blue': return 'from-blue-400 to-blue-600';
      case 'amber': return 'from-amber-400 to-amber-600';
      case 'indigo': return 'from-indigo-400 to-indigo-600';
      case 'red': return 'from-red-400 to-red-600';
      case 'violet': return 'from-violet-400 to-violet-600';
      default: return 'from-sky-400 to-sky-600';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, scale: 0.95 }}
      transition={{ type: "spring", damping: 22, stiffness: 100 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <header className="flex items-center gap-4 md:gap-6">
        <button 
          onClick={onBack}
          className={`p-2 md:p-3 rounded-full aero-glass transition-all ${theme === 'black' ? 'hover:bg-white/10 text-white' : 'hover:bg-white/60 text-sky-900'}`}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className={`text-2xl md:text-4xl font-black tracking-tighter leading-tight transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{unit.title}</h2>
          <p className={`font-bold uppercase text-[10px] md:text-xs tracking-widest transition-colors duration-500 ${theme === 'black' ? 'text-white/40' : 'text-sky-800/60'}`}>{unit.description}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <AeroCard title="Explicación" theme={theme}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="p-3 rounded-2xl bg-amber-100 text-amber-600 w-fit h-fit">
                <Lightbulb size={24} />
              </div>
              <div className="space-y-4">
                <p className={`text-base md:text-lg font-medium leading-relaxed transition-colors duration-500 ${theme === 'black' ? 'text-white/80' : 'text-sky-900'}`}>
                  {unit.explanation}
                </p>
                <div className={`p-4 md:p-6 rounded-3xl border transition-colors duration-500 ${theme === 'black' ? 'bg-white/5 border-white/10' : 'bg-sky-50/50 border-sky-100'}`}>
                  <h4 className={`text-sm font-black mb-4 flex items-center gap-2 transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>
                    <Book className="text-sky-500" size={16} /> Conceptos Clave
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {unit.meanings.map((m: any, i: number) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-2 shrink-0" />
                        <div>
                          <strong className={`block transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{m.term}</strong>
                          <span className={`text-sm transition-colors duration-500 ${theme === 'black' ? 'text-white/50' : 'text-sky-800/70'}`}>{m.definition}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AeroCard>

          <AeroCard title="Significados Rápidos" theme={theme}>
             <div className="flex flex-wrap gap-3">
                {unit.meanings.map((m: any, i: number) => (
                   <div key={i} className={`px-4 py-2 rounded-2xl border shadow-sm flex items-center gap-2 group transition-colors duration-500 ${theme === 'black' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/40 border-white/60 hover:bg-white'}`}>
                      <CheckCircle2 className="text-green-500" size={16} />
                      <span className={`text-sm font-bold transition-colors duration-500 ${theme === 'black' ? 'text-white/80' : 'text-sky-900'}`}>{m.term}</span>
                   </div>
                ))}
             </div>
          </AeroCard>
        </div>

        <div className="space-y-6">
          <AeroCard className={`bg-gradient-to-br ${getGradient(color)} text-white border-0 shadow-2xl`} theme={theme}>
             <div className="space-y-6 flex flex-col items-center text-center">
                <div className="p-4 rounded-3xl bg-white/20 border border-white/30">
                  <HelpCircle size={48} />
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-black">¿Listo para practicar?</h3>
                   <p className="text-white/80 font-medium text-sm">Pon a prueba lo aprendido con los ejercicios interactivos de esta unidad.</p>
                </div>
                <GlossyButton 
                  onClick={onStartExercise}
                  className="w-full bg-white text-sky-900 py-4 font-black shadow-xl"
                >
                  EMPEZAR EJERCICIOS
                </GlossyButton>
             </div>
          </AeroCard>

          {hasNextUnit && (
            <div className="space-y-3">
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] text-center ${theme === 'black' ? 'text-white/30' : 'text-sky-900/30'}`}>¿Quieres seguir explorando?</p>
              <GlossyButton 
                onClick={onNextUnit}
                className={`w-full py-4 text-lg shadow-[0_10px_20px_rgba(0,0,0,0.1)] border-2 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all ${theme === 'black' ? 'bg-blue-600/20 border-blue-400/30 text-white' : 'bg-white border-blue-400 text-blue-600'}`}
              >
                Siguiente Unidad <ChevronRight size={20} />
              </GlossyButton>
            </div>
          )}

          <AeroCard title="Tips Pro" theme={theme}>
             <ul className={`space-y-3 text-sm font-medium transition-colors duration-500 ${theme === 'black' ? 'text-white/60' : 'text-sky-900/70'}`}>
                <li className="flex gap-2">✨ Repasa los conceptos antes de empezar.</li>
                <li className="flex gap-2">✨ Presta atención a las definiciones en negrita.</li>
                <li className="flex gap-2">✨ Si fallas, ¡no te preocupes! Puedes reintentar.</li>
             </ul>
          </AeroCard>
        </div>
      </div>
    </motion.div>
  );
}

