import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { AeroCard } from './AeroUI';

interface ScheduleSlot {
  day: number; // 0: Lunes, 4: Viernes
  time: string;
  subject: string;
  teacher?: string;
  color: string;
  rowSpan?: number;
}

const TIMES = [
  { id: '1ra', start: '07:40', end: '08:20' },
  { id: '2da', start: '08:20', end: '09:00' },
  { id: '3ra', start: '09:10', end: '09:50' },
  { id: '4ta', start: '09:50', end: '10:30' },
  { id: '5ta', start: '10:45', end: '11:25' },
  { id: '6ta', start: '11:25', end: '12:05' },
  { id: '7ma', start: '12:10', end: '12:50' },
  { id: '8va', start: '12:50', end: '13:30' },
  { id: '9na', start: '13:30', end: '14:10' },
];

const DAYS = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES'];

const SCHEDULE_DATA: Record<string, (ScheduleSlot | null)[]> = {
  '1ra': [
    { day: 0, time: '07:40', subject: 'LENGUA Y LIT.', teacher: 'CAL Supl:', color: '#4ca5ff' },
    { day: 1, time: '07:40', subject: 'BIOLOGÍA', teacher: 'AQUINO', color: '#ffa94d' },
    { day: 2, time: '07:40', subject: 'LAA I/F', teacher: 'HOYOS/ OJEA', color: '#ffec3d' },
    { day: 3, time: '07:40', subject: 'LENGUA Y LIT.', teacher: 'CAL Supl:', color: '#4ca5ff' },
    { day: 4, time: '07:40', subject: 'GEO.PP/FEC/HIST', teacher: 'PASTRANA', color: '#ffadd2' },
  ],
  '2da': [
    { day: 0, time: '08:20', subject: 'LENGUA Y LIT.', teacher: 'CAL Supl:', color: '#4ca5ff' },
    { day: 1, time: '08:20', subject: 'BIOLOGÍA', teacher: 'AQUINO', color: '#ffa94d' },
    { day: 2, time: '08:20', subject: 'LAA I/F', teacher: 'HOYOS/ OJEA', color: '#ffec3d' },
    { day: 3, time: '08:20', subject: 'LENGUA Y LIT.', teacher: 'CAL Supl:', color: '#4ca5ff' },
    { day: 4, time: '08:20', subject: 'HIST. PP/FEC/GE', teacher: 'RIGUEIRO', color: '#ffadd2' },
  ],
  '3ra': [
    { day: 0, time: '09:10', subject: 'EDI', teacher: 'DRAGON', color: '#9254de' },
    { day: 1, time: '09:10', subject: 'F.E.C', teacher: 'PASTRANA', color: '#ff85c0' },
    { day: 2, time: '09:10', subject: 'BIO. / PP MAT.', teacher: 'AQUINO/ELORDI', color: '#5cdbd3' },
    { day: 3, time: '09:10', subject: 'TECNOLOGÍA', teacher: 'SOSA', color: '#f759ab' },
    { day: 4, time: '09:10', subject: 'LENGUA/PP ART', teacher: 'CAL Supl:', color: '#b7eb8f' },
  ],
  '4ta': [
    { day: 0, time: '09:50', subject: 'EDI', teacher: 'DRAGON', color: '#9254de' },
    { day: 1, time: '09:50', subject: 'F.E.C', teacher: 'PASTRANA', color: '#ff85c0' },
    { day: 2, time: '09:50', subject: 'MAT. / PP BIO.', teacher: 'ELORDI/AQUINO', color: '#5cdbd3' },
    { day: 3, time: '09:50', subject: 'TECNOLOGÍA', teacher: 'SOSA', color: '#f759ab' },
    { day: 4, time: '09:50', subject: 'ARTE PP LENGU', teacher: 'ESCOBAR', color: '#b7eb8f' },
  ],
  '5ta': [
    { day: 0, time: '10:45', subject: 'HISTORIA', teacher: 'RIGUEIRO', color: '#ff7875' },
    { day: 1, time: '10:45', subject: 'TUTORÍA', teacher: 'PASTRANA', color: '#8c8c8c' },
    { day: 2, time: '10:45', subject: 'MATEMÁTICA', teacher: 'ELORDI', color: '#40a9ff' },
    { day: 3, time: '10:45', subject: 'LAA I/F', teacher: 'HOYOS/ OJEA', color: '#ffec3d' },
    { day: 4, time: '10:45', subject: 'LAA I/F', teacher: 'HOYOS/OJEA', color: '#ffec3d' },
  ],
  '6ta': [
    { day: 0, time: '11:25', subject: 'HISTORIA', teacher: 'RIGUEIRO', color: '#ff7875' },
    { day: 1, time: '11:25', subject: 'MATEMÁTICA', teacher: 'ELORDI', color: '#40a9ff' },
    { day: 2, time: '11:25', subject: 'MATEMÁTICA', teacher: 'ELORDI', color: '#40a9ff' },
    { day: 3, time: '11:25', subject: 'LAA I/F', teacher: 'HOYOS/ OJEA', color: '#ffec3d' },
    { day: 4, time: '11:25', subject: 'LAA I/F', teacher: 'HOYOS/OJEA', color: '#ffec3d' },
  ],
  '7ma': [
    { day: 0, time: '12:10', subject: 'GEOGRAFÍA', teacher: '', color: '#9254de' },
    { day: 1, time: '12:10', subject: 'HISTORIA', teacher: 'RIGUEIRO', color: '#ff7875' },
    { day: 2, time: '12:10', subject: 'MATEMÁTICA', teacher: 'ELORDI', color: '#40a9ff' },
    { day: 3, time: '12:10', subject: '', teacher: '', color: 'transparent' },
    { day: 4, time: '12:10', subject: 'ARTES', teacher: 'ESCOBAR', color: '#91d5ff' },
  ],
  '8va': [
    { day: 0, time: '12:50', subject: 'GEOGRAFÍA', teacher: '', color: '#9254de' },
    { day: 1, time: '12:50', subject: '', teacher: '', color: 'transparent' },
    { day: 2, time: '12:50', subject: 'LAA I/F', teacher: 'HOYOS/ OJEA', color: '#ffec3d' },
    { day: 3, time: '12:50', subject: '', teacher: '', color: 'transparent' },
    { day: 4, time: '12:50', subject: 'ARTES', teacher: 'ESCOBAR', color: '#91d5ff' },
  ],
  '9na': [
    { day: 0, time: '13:30', subject: '', teacher: '', color: 'transparent' },
    { day: 1, time: '13:30', subject: 'Educación Física', teacher: '13:00 a 15:00', color: '#73d13d' },
    { day: 2, time: '13:30', subject: '', teacher: '', color: 'transparent' },
    { day: 3, time: '13:30', subject: '', teacher: '', color: 'transparent' },
    { day: 4, time: '13:30', subject: 'BIOLOGÍA', teacher: 'AQUINO', color: '#ffa94d' },
  ],
};

export const ScheduleTable: React.FC<{ theme?: 'white' | 'black' | 'aero' }> = ({ theme = 'white' }) => {
  const [selectedDay, setSelectedDay] = React.useState(new Date().getDay() > 0 && new Date().getDay() <= 5 ? new Date().getDay() - 1 : 0);

  return (
    <div className="space-y-4">
      {/* Selector de días para móvil */}
      <div className="flex md:hidden gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {DAYS.map((day, i) => (
            <button
              key={day}
              onClick={() => setSelectedDay(i)}
              className={`px-6 py-2.5 rounded-2xl text-[11px] font-black tracking-widest transition-all shrink-0 border-2 shadow-sm ${
                selectedDay === i 
                  ? (theme === 'black' ? 'bg-white text-black border-white scale-105' : 'bg-sky-600 text-white border-sky-600 scale-105')
                  : (theme === 'black' ? 'bg-white/5 text-white/40 border-white/5' : 'bg-white/60 text-sky-950/40 border-white/10')
              }`}
            >
              {day}
            </button>
        ))}
      </div>

      {/* Grid de Horarios */}
      <div className="grid grid-cols-[auto_1fr] md:grid-cols-[auto_repeat(5,1fr)] gap-2 md:gap-4 items-stretch">
        {/* Header - Solo Desktop */}
        <div className="hidden md:block" />
        {DAYS.map((day, i) => (
          <div key={day} className={`hidden md:flex items-center justify-center p-3 rounded-2xl border font-black text-xs tracking-widest shadow-sm ${
            theme === 'black' ? 'bg-white/10 border-white/10 text-white/90' : 'bg-white/60 border-white/40 text-sky-950'
          }`}>
            {day}
          </div>
        ))}

        {/* Filas de tiempo */}
        {TIMES.map((time) => {
          const dayIdx = selectedDay;
          const slot = SCHEDULE_DATA[time.id][dayIdx];
          const hasContent = slot && slot.subject !== '';

          return (
            <React.Fragment key={time.id}>
              {/* Indicador de tiempo - Estilo responsivo */}
              <div className={`p-2 md:p-3 rounded-2xl border flex flex-col items-center justify-center min-w-[70px] md:min-w-[80px] self-center md:self-stretch ${
                theme === 'black' ? 'bg-zinc-900 border-white/5' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-[9px] md:text-[10px] font-black opacity-30 uppercase">{time.id}</span>
                <span className={`text-xs md:text-sm font-black ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{time.start}</span>
                <span className="text-[9px] md:text-[10px] font-bold opacity-30">{time.end}</span>
              </div>

              {/* Desktop: Mostrar todos los días. Mobile: Solo seleccionado */}
              {DAYS.map((day, dayIdxLoop) => {
                const currentSlot = SCHEDULE_DATA[time.id][dayIdxLoop];
                const isVisible = dayIdxLoop === selectedDay;
                
                if (!currentSlot || currentSlot.subject === '') {
                  return (
                    <div 
                      key={`${time.id}-${day}`} 
                      className={`${isVisible ? 'flex' : 'hidden'} md:flex items-center justify-center rounded-2xl border border-dashed opacity-5 min-h-[60px] ${
                        theme === 'black' ? 'border-white' : 'border-sky-900'
                      }`}
                    />
                  );
                }

                return (
                  <div 
                    key={`${time.id}-${day}`}
                    className={`${isVisible ? 'flex' : 'hidden'} md:flex flex-col p-3 md:p-4 rounded-2xl border shadow-sm transition-transform active:scale-95 group relative overflow-hidden min-h-[60px] justify-center`}
                    style={{ 
                      backgroundColor: theme === 'black' ? `${currentSlot.color}33` : `${currentSlot.color}22`,
                      borderColor: currentSlot.color,
                    }}
                  >
                    <div className="absolute top-0 left-0 w-1 md:w-1.5 h-full" style={{ background: currentSlot.color }} />
                    <span className={`text-[11px] md:text-sm font-black leading-tight ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
                      {currentSlot.subject}
                    </span>
                    {currentSlot.teacher && (
                      <span className={`text-[9px] md:text-[11px] font-bold opacity-60 mt-0.5 md:mt-1 uppercase truncate ${theme === 'black' ? 'text-zinc-400' : 'text-sky-900/60'}`}>
                        {currentSlot.teacher}
                      </span>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>

      <div className={`flex items-center gap-6 p-4 rounded-3xl border border-dashed mt-8 ${
        theme === 'black' ? 'border-white/10 bg-white/5' : 'border-sky-200 bg-sky-50/50'
      }`}>
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-emerald-500" />
          <span className={`text-[11px] font-bold ${theme === 'black' ? 'text-white/60' : 'text-sky-900/60'}`}>
            Física: Campo de Deportes
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-blue-500" />
          <span className={`text-[11px] font-bold ${theme === 'black' ? 'text-white/60' : 'text-sky-900/60'}`}>
            Recreos: 10min / 15min
          </span>
        </div>
      </div>
    </div>
  );
};
