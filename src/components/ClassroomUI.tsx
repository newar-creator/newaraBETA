import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Users2, 
  Plus, 
  LogOut, 
  Archive, 
  ClipboardList, 
  Share, 
  ChevronRight,
  MessageSquare,
  ArrowLeft,
  Copy,
  Calendar,
  Lock,
  Search,
  Sparkles,
  Layout,
  BookOpen,
  FileText,
  Image as ImageIcon,
  File,
  Download,
  CheckCircle2,
  Clock,
  ExternalLink,
  Paperclip,
  Flag,
  MoreVertical,
  Pencil,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { AeroCard, GlossyButton } from './AeroUI';

const FileAttachment: React.FC<{ file: any; theme: 'black' | 'light' }> = ({ file, theme }) => {
  if (!file) return null;

  const isImage = file.type.startsWith('image/');
  const isDocument = file.type === 'application/pdf' || file.type.includes('msword') || file.type.includes('officedocument');

  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`mt-3 p-4 md:p-3 rounded-2xl border flex items-center gap-3 md:gap-4 transition-all hover:bg-white/5 active:scale-[0.98] ${
      theme === 'black' ? 'bg-white/5 border-white/10' : 'bg-sky-50 border-sky-100'
    }`}>
      <div className="p-3 bg-sky-500/20 rounded-xl text-sky-500 flex-shrink-0">
        {isImage ? <ImageIcon size={20} /> : isDocument ? <FileText size={20} /> : <File size={20} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-black truncate ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{file.name}</p>
        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{file.type.split('/')[1]}</p>
      </div>
      {isImage ? (
         <button onClick={() => window.open(file.url, '_blank')} className="p-3 md:p-2 hover:bg-white/10 rounded-xl text-sky-500 transition-colors">
           <ExternalLink size={18} />
         </button>
      ) : (
        <button onClick={downloadFile} className="p-3 md:p-2 hover:bg-white/10 rounded-xl text-sky-500 transition-colors">
          <Download size={18} />
        </button>
      )}
    </div>
  );
};

interface ClassCardProps {
  cls: any;
  onClick: () => void;
  theme: 'black' | 'light';
  userName: string;
}

export const ClassCard: React.FC<ClassCardProps> = ({ cls, onClick, theme, userName }) => {
  const isOwner = cls.ownerName === userName;
  const isArchived = cls.isArchived === true;

  const getThemeColor = (color: string) => {
    switch (color) {
      case 'blue': return 'from-blue-500 to-indigo-600';
      case 'purple': return 'from-purple-600 to-pink-600';
      case 'green': return 'from-emerald-500 to-teal-600';
      case 'amber': return 'from-amber-500 to-orange-600';
      case 'rose': return 'from-rose-500 to-red-600';
      default: return 'from-sky-500 to-blue-600';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={!isArchived ? onClick : undefined}
      className={`group relative cursor-pointer h-full transition-all ${isArchived ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}
    >
      <AeroCard className="overflow-hidden border-none h-full shadow-lg group-hover:shadow-2xl transition-all duration-500" theme={theme}>
        {/* Card Header with Background */}
        <div className={`h-28 bg-gradient-to-br ${getThemeColor(cls.themeColor)} p-5 flex flex-col justify-between relative overflow-hidden`}>
          <div className="absolute -right-6 -top-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
            <Layout size={120} />
          </div>
          
          <div className="flex justify-between items-start relative z-10 w-full">
            <div className="max-w-[70%]">
              <h3 className="text-white font-black text-xl leading-tight drop-shadow-lg truncate" title={cls.name}>
                {cls.name}
              </h3>
              <p className="text-white/80 text-[10px] font-black uppercase tracking-widest truncate">{cls.ownerName}</p>
            </div>
            
            <div className="flex gap-2">
              {isOwner && !isArchived && (
                <div className="bg-emerald-500/30 backdrop-blur-md rounded-full px-2 py-0.5 border border-white/20 flex items-center gap-1">
                  <Sparkles size={8} className="text-white" />
                  <span className="text-[8px] font-black text-white uppercase">Profesor</span>
                </div>
              )}
              {isArchived && (
                <div className="bg-zinc-950/40 backdrop-blur-md rounded-full px-2 py-0.5 border border-white/10 flex items-center gap-1">
                  <Archive size={8} className="text-white" />
                  <span className="text-[8px] font-black text-white uppercase">Archivada</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end relative z-10">
             <div className="bg-white/20 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center border border-white/30 group-hover:bg-white group-hover:text-sky-500 transition-all duration-300">
                <Users size={14} className="text-white group-hover:text-inherit" />
             </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-4">
          <p className={`text-xs font-medium line-clamp-2 min-h-[32px] opacity-60 leading-relaxed ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>
            {cls.description || 'Sin descripción disponible.'}
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
             <div className="flex flex-col">
               <span className="text-[8px] font-black uppercase tracking-widest opacity-30 mb-0.5">Código Único</span>
               <code className={`text-xs font-black tracking-widest uppercase ${theme === 'black' ? 'text-sky-400' : 'text-sky-600'}`}>
                 {cls.code}
               </code>
             </div>
             
             <div className={`p-2 rounded-xl transition-all ${
               theme === 'black' ? 'bg-white/5 text-white group-hover:bg-sky-500' : 'bg-sky-50 text-sky-500 group-hover:bg-sky-500 group-hover:text-white'
             }`}>
               <ChevronRight size={16} />
             </div>
          </div>
        </div>
      </AeroCard>
    </motion.div>
  );
};

interface ClassDetailProps {
  cls: any;
  announcements: any[];
  comments: Record<string, any[]>;
  members: any[];
  resources: any[];
  assignments: any[];
  submissions: any[];
  theme: 'black' | 'light';
  isOwner: boolean;
  onPostAnnouncement: (content: string, attachment?: any) => void;
  onPostComment: (announcementId: string, content: string) => void;
  onEditAnnouncement: (announcementId: string, content: string) => void;
  onDeleteAnnouncement: (announcementId: string) => void;
  onEditComment: (announcementId: string, commentId: string, content: string) => void;
  onDeleteComment: (announcementId: string, commentId: string) => void;
  onReportAbuse: (type: 'announcement' | 'comment' | 'activity', id: string, content: string, author: string) => void;
  onShareResource: (title: string, code: string) => void;
  onPlayActivity: (code: string) => void;
  onCreateAssignment: (title: string, description: string, dueDate: string, attachment?: any) => void;
  onSubmitTask: (assignmentId: string, attachment: any) => void;
  onBack: () => void;
  onArchive: () => void;
  onLeave: () => void;
  userName: string;
}

const UserAvatar: React.FC<{ name: string; url?: string; className?: string; textClass?: string }> = ({ 
  name, url, className = "w-10 h-10", textClass = "text-xs" 
}) => {
  if (url) {
    return <img src={url} alt={name} className={`${className} rounded-full object-cover border-2 border-white/10 shadow-lg`} referrerPolicy="no-referrer" />;
  }
  return (
    <div className={`${className} rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg ${textClass}`}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
};

const AssignmentItem: React.FC<{ 
  ass: any; 
  theme: 'black' | 'light'; 
  isOwner: boolean; 
  onView: (ass: any) => void;
  submissions: any[];
  userName: string;
}> = ({ ass, theme, isOwner, onView, submissions, userName }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const userSubmission = submissions.find(s => s.assignmentId === ass.id && s.studentName === userName);
  const submissionCount = submissions.filter(s => s.assignmentId === ass.id).length;

  return (
    <AeroCard 
      theme={theme} 
      className={`overflow-hidden transition-all duration-300 border-none ${
        isExpanded ? 'ring-2 ring-sky-500/50 shadow-2xl shadow-sky-500/10' : 'hover:bg-white/5'
      }`}
    >
      <div 
        className="p-5 md:p-6 cursor-pointer flex items-center justify-between group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
          <div className={`p-2.5 md:p-4 rounded-xl md:rounded-2xl transition-all ${
            isExpanded ? 'bg-sky-500 text-white' : 'bg-sky-500/10 text-sky-500 group-hover:bg-sky-500 group-hover:text-white'
          }`}>
            <ClipboardList size={22} className="md:w-6 md:h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-black text-sm md:text-lg truncate ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
              {ass.title}
            </h4>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-40">
              <span className="flex items-center gap-1"><Calendar size={10} /> {ass.createdAt?.toDate().toLocaleDateString()}</span>
              {ass.dueDate && (
                <span className="text-rose-500 flex items-center gap-1">
                  <Clock size={10} /> {ass.dueDate}
                </span>
              )}
              {isOwner ? (
                <span className="text-sky-500 flex items-center gap-1">
                  <Users size={10} /> {submissionCount} <span className="hidden xs:inline">Entregas</span>
                </span>
              ) : userSubmission ? (
                <span className="text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 size={10} /> <span className="hidden xs:inline">Entregado</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-sky-500/40"
        >
          <ChevronRight size={20} />
        </motion.div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-5 md:px-6 pb-6 pt-2 space-y-5 border-t border-white/5">
              <div className={`text-sm leading-relaxed opacity-70 ${theme === 'black' ? 'text-gray-300' : 'text-sky-900'}`}>
                {ass.description}
              </div>

              {ass.attachment && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Material de apoyo</p>
                  <FileAttachment file={ass.attachment} theme={theme} />
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-3 pt-2">
                <GlossyButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(ass);
                  }}
                  className="flex-1 py-3 text-xs md:text-sm font-black uppercase tracking-widest bg-sky-500 text-white"
                >
                  {isOwner ? 'Ver Entregas' : userSubmission ? 'Revisar Entrega' : 'Entregar Tarea'}
                </GlossyButton>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="px-6 py-3 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AeroCard>
  );
};

export const ClassDetail: React.FC<ClassDetailProps> = ({ 
  cls, announcements, comments, members, resources, assignments, submissions, theme, isOwner, 
  onPostAnnouncement, onPostComment, onEditAnnouncement, onDeleteAnnouncement, 
  onEditComment, onDeleteComment, onReportAbuse,
  onShareResource, onPlayActivity, onCreateAssignment, onSubmitTask, onBack, onArchive, onLeave, userName 
}) => {
  const [activeTab, setActiveTab] = useState<'anuncios' | 'tareas' | 'personas'>('anuncios');
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [annAttachment, setAnnAttachment] = useState<any>(null);
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resCode, setResCode] = useState('');
  
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDue, setTaskDue] = useState('');
  const [taskAttachment, setTaskAttachment] = useState<any>(null);

  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [archiveInput, setArchiveInput] = useState('');

  const [viewingAssignment, setViewingAssignment] = useState<any | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [editAnnContent, setEditAnnContent] = useState('');
  const [editingCommId, setEditingCommId] = useState<string | null>(null);
  const [editCommContent, setEditCommContent] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: any) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);

    if (file.size > 2000000) { // 2MB limit
      setFileError(`El archivo "${file.name}" es demasiado grande (Máx 2MB).`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setter({
        name: file.name,
        type: file.type,
        url: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePost = () => {
    if (!newAnnouncement.trim()) return;
    onPostAnnouncement(newAnnouncement, annAttachment);
    setNewAnnouncement('');
    setAnnAttachment(null);
  };

  const handleCreateTask = () => {
    if (!taskTitle.trim()) return;
    onCreateAssignment(taskTitle, taskDesc, taskDue, taskAttachment);
    setTaskTitle('');
    setTaskDesc('');
    setTaskDue('');
    setTaskAttachment(null);
    setShowTaskForm(false);
  };

  const handleShare = () => {
    if (!resTitle.trim() || !resCode.trim()) return;
    onShareResource(resTitle, resCode);
    setResTitle('');
    setResCode('');
    setShowResourceForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className={`relative rounded-b-[40px] md:rounded-[40px] overflow-hidden p-6 md:p-10 shadow-2xl bg-gradient-to-br ${
        cls.themeColor === 'blue' ? 'from-blue-600 to-indigo-700' :
        cls.themeColor === 'purple' ? 'from-purple-600 to-pink-700' :
        cls.themeColor === 'green' ? 'from-emerald-600 to-teal-700' :
        cls.themeColor === 'amber' ? 'from-amber-500 to-orange-600' :
        cls.themeColor === 'rose' ? 'from-rose-600 to-red-700' : 'from-sky-600 to-blue-700'
      }`}>
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
             <button 
               onClick={onBack}
               className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-[10px] md:text-xs font-black uppercase tracking-widest mb-4 md:mb-6"
             >
               <ArrowLeft size={16} /> Volver a clases
             </button>
             <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg leading-tight">{cls.name}</h1>
             <p className="text-white/80 font-bold max-w-xl text-sm md:text-base leading-relaxed">{cls.description}</p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-4 md:gap-3">
             <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 md:p-5 border border-white/20 w-full md:w-auto text-center md:text-left">
               <p className="text-[9px] md:text-[10px] font-black text-white/60 tracking-widest uppercase mb-1">Código de Clase</p>
               <div className="flex items-center justify-center md:justify-start gap-4">
                 <span className="text-2xl md:text-3xl font-black text-white tracking-[0.2em]">{cls.code}</span>
                 <button 
                   onClick={() => {
                     navigator.clipboard.writeText(cls.code);
                     alert("Código copiado!");
                   }}
                   className="p-2 hover:bg-white/20 rounded-xl transition-all active:scale-95"
                 >
                   <Copy size={20} className="text-white" />
                 </button>
               </div>
             </div>
             <div className="flex gap-2 w-full md:w-auto">
               {isOwner ? (
                  <button 
                    onClick={() => setShowArchiveConfirm(true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/40 text-red-100 rounded-2xl transition-all text-[10px] font-black uppercase tracking-wider border border-red-500/30"
                  >
                    <Archive size={14} /> Archivar
                  </button>
               ) : (
                  <button 
                    onClick={() => {
                      if (confirm("¿Estás seguro de que quieres salir de la clase?")) onLeave();
                    }}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-zinc-950/20 hover:bg-zinc-950/40 text-white rounded-2xl transition-all text-[10px] font-black uppercase tracking-wider border border-white/10"
                  >
                    <LogOut size={14} /> Salir
                  </button>
               )}
             </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 md:gap-8 px-1 md:px-0">
        {/* Navigation Tabs - Sticky on Mobile */}
        <div className="lg:col-span-1 sticky top-0 z-40 bg-zinc-950/20 backdrop-blur-md lg:static lg:bg-transparent lg:backdrop-blur-none -mx-1 px-1 lg:mx-0 lg:px-0 py-2 lg:py-0">
           <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide mask-fade-right lg:mask-none px-2 lg:px-0">
              {[
                { id: 'anuncios', label: 'Novedades', icon: MessageSquare },
                { id: 'tareas', label: 'Tareas', icon: ClipboardList },
                { id: 'personas', label: 'Personas', icon: Users2 }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-shrink-0 lg:w-full flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${
                    activeTab === tab.id 
                      ? 'bg-sky-500 text-white shadow-xl shadow-sky-500/20' 
                      : theme === 'black' ? 'text-white/40 hover:bg-white/5' : 'text-sky-950/40 hover:bg-sky-50'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
           </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {activeTab === 'anuncios' ? (
            <>
              {/* Post Area */}
              <AeroCard theme={theme} className="p-1">
                <div className="flex items-start gap-3 p-4">
                    <UserAvatar name={userName} className="w-10 h-10 flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                     <textarea 
                       value={newAnnouncement}
                       onChange={(e) => setNewAnnouncement(e.target.value)}
                       placeholder="Comparte algo con tu clase..."
                       className={`w-full p-4 rounded-2xl border text-sm font-bold min-h-[100px] focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                         theme === 'black' ? 'bg-white/5 border-white/10 text-white' : 'bg-sky-50/50 border-sky-100 text-sky-950'
                       }`}
                     />
                     
                     {annAttachment && <FileAttachment file={annAttachment} theme={theme} />}
                     
                     <AnimatePresence>
                       {fileError && (
                         <motion.div 
                           initial={{ opacity: 0, y: -10 }} 
                           animate={{ opacity: 1, y: 0 }} 
                           exit={{ opacity: 0 }}
                           className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black text-red-500 uppercase tracking-widest"
                         >
                           {fileError}
                         </motion.div>
                       )}
                     </AnimatePresence>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer px-4 py-2 bg-sky-500/10 rounded-xl text-sky-500 hover:bg-sky-500/20 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                            <Paperclip size={16} /> {annAttachment ? 'Cambiar archivo' : 'Adjuntar'}
                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, setAnnAttachment)} />
                          </label>
                          {annAttachment && (
                            <button 
                              onClick={() => setAnnAttachment(null)}
                              className="text-[9px] font-black uppercase text-red-500 opacity-60 hover:opacity-100 px-2 py-1"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                        <GlossyButton 
                          onClick={handlePost}
                          className="w-full sm:w-auto px-10 py-3 bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                          disabled={!newAnnouncement.trim()}
                        >
                          Publicar
                        </GlossyButton>
                      </div>
                   </div>
                </div>
              </AeroCard>
              <div className="space-y-4">
                {announcements.length === 0 ? (
                  <div className="text-center py-20 opacity-30">
                    <MessageSquare size={48} className="mx-auto mb-4" />
                    <p className="font-bold">No hay anuncios todavía.</p>
                  </div>
                ) : (
                  announcements.map((ann) => (
                    <AeroCard key={ann.id} theme={theme} className="p-4 md:p-6 overflow-visible group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={ann.authorName} url={ann.authorAvatar} className="w-9 h-9" />
                          <div>
                            <p className={`text-xs font-black ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{ann.authorName}</p>
                            <p className="text-[10px] opacity-40 font-bold">{ann.createdAt?.toDate ? ann.createdAt.toDate().toLocaleDateString() : 'Justo ahora'}</p>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <button 
                            onClick={() => onReportAbuse('announcement', ann.id, ann.content, ann.authorName)}
                            className="p-1.5 md:p-2 hover:bg-amber-500/10 text-amber-500/40 hover:text-amber-500 rounded-xl transition-all"
                            title="Reportar"
                          >
                            <Flag size={14} />
                          </button>
                          {(ann.authorName === userName || isOwner) && (
                            <div className="flex gap-1">
                              <button 
                                onClick={() => {
                                  setEditingAnnId(ann.id);
                                  setEditAnnContent(ann.content);
                                }}
                                className="p-1.5 md:p-2 hover:bg-blue-500/10 text-blue-500/40 hover:text-blue-500 rounded-xl transition-all"
                                title="Editar"
                              >
                                <Pencil size={14} />
                              </button>
                              <button 
                                onClick={() => onDeleteAnnouncement(ann.id)}
                                className="p-1.5 md:p-2 hover:bg-red-500/10 text-red-500/40 hover:text-red-500 rounded-xl transition-all"
                                title="Eliminar"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {editingAnnId === ann.id ? (
                        <div className="space-y-3 mb-4">
                          <textarea 
                            value={editAnnContent}
                            onChange={(e) => setEditAnnContent(e.target.value)}
                            className={`w-full p-4 rounded-2xl border text-sm font-bold min-h-[100px] focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                              theme === 'black' ? 'bg-white/5 border-white/10 text-white' : 'bg-sky-50/50 border-sky-100 text-sky-950'
                            }`}
                          />
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setEditingAnnId(null)}
                              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest ${theme === 'black' ? 'text-white/40' : 'text-sky-950/40'}`}
                            >
                              Cancelar
                            </button>
                            <GlossyButton 
                              onClick={() => {
                                onEditAnnouncement(ann.id, editAnnContent);
                                setEditingAnnId(null);
                              }}
                              className="px-6 py-2 text-[10px]"
                            >
                              Guardar
                            </GlossyButton>
                          </div>
                        </div>
                      ) : (
                        <p className={`text-sm font-medium leading-relaxed mb-4 ${theme === 'black' ? 'text-gray-300' : 'text-sky-900'}`}>
                          {ann.content}
                        </p>
                      )}
                      {ann.attachment && (
                        <div className="mt-4 border-t border-white/5 pt-4">
                           {ann.attachment.type.startsWith('image/') ? (
                             <img src={ann.attachment.url} alt={ann.attachment.name} className="max-h-80 rounded-2xl border border-white/10" />
                           ) : (
                             <FileAttachment file={ann.attachment} theme={theme} />
                           )}
                        </div>
                      )}

                      {/* Comments Section */}
                      <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-sky-500">
                          <MessageSquare size={14} /> {ann.commentsCount || 0} Comentarios de clase
                        </div>
                        
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                           {(comments[ann.id] || []).map(comm => (
                             <div key={comm.id} className="flex gap-3 items-start group">
                               <UserAvatar name={comm.authorName} url={comm.authorAvatar} className="w-6 h-6" textClass="text-[8px]" />
                               <div className="flex-1 text-xs">
                                 <div className="flex items-center justify-between">
                                   <p className="font-black opacity-80 mb-0.5">{comm.authorName}</p>
                                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button 
                                       onClick={() => onReportAbuse('comment', comm.id, comm.content, comm.authorName)}
                                       className="text-amber-500/40 hover:text-amber-500 transition-all"
                                       title="Reportar"
                                     >
                                       <Flag size={10} />
                                     </button>
                                     {(comm.authorName === userName || isOwner) && (
                                       <div className="flex gap-1">
                                         <button 
                                           onClick={() => {
                                             setEditingCommId(comm.id);
                                             setEditCommContent(comm.content);
                                           }}
                                           className="text-blue-500/40 hover:text-blue-500 transition-all"
                                           title="Editar"
                                         >
                                           <Pencil size={10} />
                                         </button>
                                         <button 
                                           onClick={() => onDeleteComment(ann.id, comm.id)}
                                           className="text-red-500/40 hover:text-red-500 transition-all"
                                           title="Eliminar"
                                         >
                                           <Trash2 size={10} />
                                         </button>
                                       </div>
                                     )}
                                   </div>
                                 </div>
                                 {editingCommId === comm.id ? (
                                   <div className="mt-2 space-y-2">
                                     <input 
                                       type="text"
                                       value={editCommContent}
                                       onChange={(e) => setEditCommContent(e.target.value)}
                                       className={`w-full px-3 py-1.5 rounded-xl border text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                                         theme === 'black' ? 'bg-white/5 border-white/10 text-white' : 'bg-sky-50/50 border-sky-100 text-sky-950'
                                       }`}
                                     />
                                     <div className="flex justify-end gap-2">
                                       <button onClick={() => setEditingCommId(null)} className="text-[8px] font-black uppercase opacity-40">Canc.</button>
                                       <button onClick={() => { onEditComment(ann.id, comm.id, editCommContent); setEditingCommId(null); }} className="text-[8px] font-black uppercase text-sky-500">Guardar</button>
                                     </div>
                                   </div>
                                 ) : (
                                   <p className="opacity-60 leading-relaxed">{comm.content}</p>
                                 )}
                               </div>
                             </div>
                           ))}
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                           <UserAvatar name={userName} className="w-8 h-8 flex-shrink-0" />
                           <input 
                             type="text"
                             value={newComments[ann.id] || ''}
                             onChange={(e) => setNewComments(prev => ({ ...prev, [ann.id]: e.target.value }))}
                             onKeyPress={(e) => {
                               if (e.key === 'Enter' && newComments[ann.id]?.trim()) {
                                 onPostComment(ann.id, newComments[ann.id]);
                                 setNewComments(prev => ({ ...prev, [ann.id]: '' }));
                               }
                             }}
                             placeholder="Añadir un comentario de clase..."
                             className={`flex-1 px-4 py-2 rounded-full text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all ${
                               theme === 'black' ? 'bg-white/5 border border-white/10 text-white' : 'bg-sky-50/50 border border-sky-100 text-sky-950'
                             }`}
                           />
                        </div>
                      </div>
                    </AeroCard>
                  ))
                )}
              </div>
            </>
          ) : activeTab === 'tareas' ? (
            <div className="space-y-6">
               {isOwner && !viewingAssignment && (
                 <GlossyButton 
                   onClick={() => setShowTaskForm(true)}
                   className="w-full py-4 bg-sky-500 text-white flex items-center justify-center gap-2"
                 >
                   <Plus size={20} /> Crear Tarea
                 </GlossyButton>
               )}

               <AnimatePresence>
                 {showTaskForm && (
                   <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                     <AeroCard theme={theme} className="p-8 space-y-4">
                        <h3 className="text-xl font-black">Nueva Tarea</h3>
                        <input 
                           type="text" 
                           placeholder="Título de la tarea"
                           value={taskTitle}
                           onChange={(e) => setTaskTitle(e.target.value)}
                           className={`w-full p-4 rounded-2xl border font-bold ${theme === 'black' ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'}`}
                        />
                        <textarea 
                           placeholder="Instrucciones..."
                           value={taskDesc}
                           onChange={(e) => setTaskDesc(e.target.value)}
                           className={`w-full p-4 rounded-2xl border font-bold min-h-[120px] ${theme === 'black' ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'}`}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-1">
                             <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-2">Fecha de entrega</label>
                             <input 
                               type="date" 
                               value={taskDue}
                               onChange={(e) => setTaskDue(e.target.value)}
                               className={`w-full p-4 rounded-2xl border font-bold ${theme === 'black' ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'}`}
                             />
                           </div>
                           <div className="space-y-1">
                             <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-2">Adjunto de apoyo</label>
                             <label className={`w-full p-4 rounded-2xl border font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-sky-500/10 ${theme === 'black' ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'}`}>
                               <Paperclip size={18} /> {taskAttachment ? taskAttachment.name : 'Subir archivo'}
                               <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, setTaskAttachment)} />
                             </label>
                           </div>
                        </div>
                        
                        <AnimatePresence>
                          {fileError && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }} 
                              animate={{ opacity: 1, scale: 1 }}
                              className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-[10px] font-black text-red-500 uppercase tracking-widest"
                            >
                              {fileError}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="flex gap-3 pt-4">
                           <button onClick={() => setShowTaskForm(false)} className="flex-1 font-black opacity-50 uppercase tracking-widest text-xs">Cancelar</button>
                           <GlossyButton onClick={handleCreateTask} className="flex-1 py-4 bg-sky-500 text-white">Publicar Tarea</GlossyButton>
                        </div>
                     </AeroCard>
                   </motion.div>
                 )}
               </AnimatePresence>

               {viewingAssignment ? (
                 <div className="space-y-6">
                    <button onClick={() => setViewingAssignment(null)} className="flex items-center gap-2 text-xs font-black uppercase opacity-60 hover:opacity-100 transition-all">
                      <ArrowLeft size={16} /> Volver a tareas
                    </button>
                    
                    <AeroCard theme={theme} className="p-8 space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                           <div className="space-y-2">
                             <h2 className="text-2xl md:text-3xl font-black leading-tight">{viewingAssignment.title}</h2>
                             <div className="flex flex-wrap items-center gap-3">
                               <p className="text-xs font-bold opacity-40 flex items-center gap-1">
                                 <Calendar size={12} /> {viewingAssignment.createdAt?.toDate().toLocaleDateString()}
                               </p>
                               {viewingAssignment.dueDate && (
                                 <div className="md:hidden flex items-center gap-1 px-2 py-0.5 bg-rose-500/10 rounded-full text-[10px] font-black text-rose-500 uppercase">
                                   <Clock size={10} /> {viewingAssignment.dueDate}
                                 </div>
                               )}
                             </div>
                           </div>
                           <div className="hidden md:block text-right bg-white/5 p-3 rounded-2xl border border-white/5">
                              <p className="text-[10px] font-black uppercase opacity-40 mb-1 tracking-widest">Fecha de entrega</p>
                              <p className="text-sm font-black text-rose-500">{viewingAssignment.dueDate || 'Abierta'}</p>
                           </div>
                        </div>
                       
                       <p className="text-sm font-medium leading-relaxed opacity-80">{viewingAssignment.description}</p>
                       
                       {viewingAssignment.attachment && (
                         <div className="p-4 bg-sky-500/5 rounded-2xl border border-sky-500/10">
                            <p className="text-[10px] font-black uppercase opacity-40 mb-3 tracking-widest">Material adjunto</p>
                            <FileAttachment file={viewingAssignment.attachment} theme={theme} />
                         </div>
                       )}
                    </AeroCard>

                    {isOwner ? (
                       <div className="space-y-4">
                          <h3 className="text-xl font-black text-sky-500 px-2 italic">Entregas de alumnos</h3>
                          <div className="space-y-4">
                              {submissions.filter(s => s.assignmentId === viewingAssignment.id).length === 0 ? (
                                <p className="text-center py-10 opacity-30 text-sm font-bold">Nadie ha entregado todavía.</p>
                              ) : (
                                submissions.filter(s => s.assignmentId === viewingAssignment.id).map(sub => (
                                  <AeroCard key={sub.id} theme={theme} className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                                     <div className="flex items-center gap-4 w-full md:w-auto">
                                        <UserAvatar name={sub.studentName} url={sub.studentAvatar} className="w-10 h-10" />
                                        <div>
                                           <p className="font-black text-sm">{sub.studentName}</p>
                                           <p className="text-[10px] opacity-40 font-bold uppercase">Entregado: {sub.submittedAt?.toDate()?.toLocaleDateString()}</p>
                                        </div>
                                     </div>
                                     <div className="w-full md:w-auto">
                                       <FileAttachment file={sub.attachment} theme={theme} />
                                     </div>
                                  </AeroCard>
                                ))
                              )}
                           </div>
                        </div>
                    ) : (
                       <div className="space-y-4">
                          <h3 className="text-xl font-black text-sky-500 px-2 italic">Tu entrega</h3>
                          {submissions.find(s => s.assignmentId === viewingAssignment.id && s.studentName === userName) ? (
                            <AeroCard theme={theme} className="p-6 bg-emerald-500/5 border-emerald-500/20 text-center">
                               <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
                               <h4 className="text-lg font-black text-emerald-500">¡Tarea entregada!</h4>
                               <p className="text-xs font-bold opacity-60 mb-4">Ya has enviado tu trabajo para esta tarea.</p>
                               <FileAttachment file={submissions.find(s => s.assignmentId === viewingAssignment.id && s.studentName === userName).attachment} theme={theme} />
                            </AeroCard>
                          ) : (
                             <AeroCard theme={theme} className="p-6 md:p-10 text-center space-y-6 border-dashed border-2 border-white/5 bg-white/[0.02]">
                               <div className="w-16 h-16 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto text-sky-500">
                                 <Plus size={32} />
                               </div>
                               <div>
                                 <h4 className="text-xl font-black">Entregar tarea</h4>
                                 <p className="text-xs font-bold opacity-40 max-w-[200px] mx-auto">Sube tu archivo PDF, Word o imagen para completar el trabajo.</p>
                               </div>
                               
                               <div className="max-w-xs mx-auto">
                                  <label className="w-full py-5 rounded-3xl bg-sky-500 text-white font-black uppercase text-[10px] md:text-xs tracking-widest cursor-pointer flex items-center justify-center gap-3 shadow-2xl shadow-sky-500/30 hover:scale-[1.02] active:scale-95 transition-all">
                                    <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onload = () => {
                                          if (confirm(`¿Quieres enviar "${file.name}"?`)) {
                                            onSubmitTask(viewingAssignment.id, {
                                              name: file.name,
                                              type: file.type,
                                              url: reader.result as string
                                            });
                                          }
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }} />
                                    <Paperclip size={18} />
                                    Subir y Entregar
                                  </label>
                               </div>
                            </AeroCard>
                          )}
                       </div>
                    )}
                 </div>
               ) : (
                 <div className="space-y-4">
                   {assignments.length === 0 ? (
                     <div className="text-center py-20 opacity-30">
                       <ClipboardList size={48} className="mx-auto mb-4" />
                       <p className="font-bold italic">No hay tareas asignadas aún.</p>
                     </div>
                   ) : (
                     assignments.map(ass => (
                       <AssignmentItem 
                         key={ass.id}
                         ass={ass}
                         theme={theme}
                         isOwner={isOwner}
                         onView={setViewingAssignment}
                         submissions={submissions}
                         userName={userName}
                       />
                     ))
                   )}
                 </div>
               )}
            </div>
          ) : (
            <div className="space-y-8">
               <div className="space-y-4">
                  <h3 className="text-xl font-black text-sky-500 flex items-center gap-2 px-2">
                    <Users2 size={24} /> Profesores
                  </h3>
                  <div className="space-y-1">
                    {members.filter(m => m.role === 'Profesor').map(m => (
                      <div key={m.userName} className="flex items-center gap-4 p-4 border-b border-white/5">
                        <UserAvatar name={m.userName} url={m.avatar} className="w-9 h-9" />
                        <p className={`font-bold ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{m.userName}</p>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black text-sky-500 flex items-center gap-2">
                      <Users size={24} /> Alumnos
                    </h3>
                    <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                      {members.filter(m => m.role === 'Estudiante').length} Alumnos
                    </span>
                  </div>
                  <div className="space-y-1">
                    {members.filter(m => m.role === 'Estudiante').length === 0 ? (
                      <p className="text-center py-10 opacity-30 text-sm font-bold">Aún no hay alumnos unidos.</p>
                    ) : (
                      members.filter(m => m.role === 'Estudiante').map(m => (
                        <div key={m.userName} className="flex items-center gap-4 p-4 border-b border-white/5">
                          <UserAvatar name={m.userName} url={m.avatar} className="w-9 h-9" />
                          <p className={`font-bold ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{m.userName}</p>
                        </div>
                      ))
                    )}
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Sidebar / Resource Codes */}
        <div className="space-y-6">
           <AeroCard theme={theme} className="p-6 overflow-visible">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xs font-black uppercase tracking-widest ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
                  Caja de Códigos
                </h3>
                {isOwner && (
                  <button 
                    onClick={() => setShowResourceForm(!showResourceForm)}
                    className="p-1 hover:bg-sky-500/20 rounded-lg text-sky-500 transition-all"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>

              {showResourceForm && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3 mb-6 p-4 bg-sky-500/5 rounded-2xl border border-sky-500/20"
                >
                  <input 
                    type="text" 
                    value={resTitle}
                    onChange={(e) => setResTitle(e.target.value)}
                    placeholder="Título (Ej: Juego Noche)"
                    className={`w-full px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      theme === 'black' ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-sky-100 text-sky-950'
                    }`}
                  />
                  <input 
                    type="text" 
                    value={resCode}
                    onChange={(e) => setResCode(e.target.value)}
                    placeholder="Código de actividad"
                    className={`w-full px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        theme === 'black' ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-sky-100 text-sky-950'
                    }`}
                  />
                  <GlossyButton onClick={handleShare} className="w-full py-2 bg-sky-500 text-white text-[10px]">
                    Compartir Código
                  </GlossyButton>
                </motion.div>
              )}

              <div className="space-y-3">
                {resources.length === 0 ? (
                  <p className="text-[10px] font-bold opacity-30 text-center py-4 italic">No hay códigos compartidos.</p>
                ) : (
                  resources.map(res => (
                    <div key={res.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-sky-500/30 hover:bg-white/[0.07] transition-all group">
                      <p className="text-[9px] font-black opacity-40 uppercase tracking-tighter mb-2 truncate" title={res.title}>
                        {res.title}
                      </p>
                      <div className="flex items-center justify-between font-mono">
                        <code className="text-sm font-black text-sky-500 tracking-wider">
                          {res.code}
                        </code>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => onPlayActivity(res.code)}
                            className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-white text-[10px] font-black rounded-xl transition-all shadow-lg shadow-sky-500/20 active:scale-95"
                          >
                            JUGAR
                          </button>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(res.code);
                              alert("Código copiado!");
                            }}
                            className="p-2 hover:bg-white/10 rounded-xl transition-all text-sky-500/60 hover:text-sky-500"
                            title="Copiar código"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
           </AeroCard>

           <div className="p-6 bg-sky-500/10 rounded-3xl border border-sky-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="text-sky-500" size={18} />
                <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Tip Educativo</p>
              </div>
              <p className={`text-[10px] font-bold leading-relaxed ${theme === 'black' ? 'text-white/60' : 'text-sky-900/60'}`}>
                Los profesores pueden publicar códigos aquí para que los alumnos los peguen en el buscador de la Galería y accedan directo a la actividad.
              </p>
           </div>
        </div>
      </div>

      {/* Archive Confirmation Overlay */}
      <AnimatePresence>
        {showArchiveConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowArchiveConfirm(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-md"
             />
             <motion.div
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 20 }}
               className={`relative w-full max-w-md p-8 rounded-[40px] border-2 shadow-2xl ${
                 theme === 'black' 
                   ? 'bg-zinc-950 border-white/10 text-white' 
                   : 'bg-white border-sky-100 text-sky-950'
               }`}
             >
               <div className="text-center space-y-6">
                 <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto text-red-500 border-2 border-red-500/30">
                   <Archive size={32} />
                 </div>
                 <div className="space-y-2">
                   <h2 className="text-2xl font-black">¿Archivar clase?</h2>
                   <p className="text-sm font-bold opacity-60">
                     Para confirmar, por favor escribe el nombre de la clase exactamente como aparece: 
                     <br/><span className="text-red-500 uppercase tracking-widest">{cls.name}</span>
                   </p>
                 </div>

                 <input 
                   type="text" 
                   value={archiveInput}
                   onChange={(e) => setArchiveInput(e.target.value)}
                   placeholder="Escribir nombre de la clase..."
                   className={`w-full px-6 py-4 rounded-2xl border-2 text-center text-lg font-black transition-all ${
                     archiveInput === cls.name 
                       ? 'border-emerald-500 bg-emerald-500/10' 
                       : 'border-red-500/20 bg-red-500/5'
                   }`}
                 />

                 <div className="flex gap-3">
                    <button 
                      onClick={() => setShowArchiveConfirm(false)}
                      className="flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest opacity-60 hover:opacity-100 transition-all"
                    >
                      Cancelar
                    </button>
                    <GlossyButton 
                      disabled={archiveInput !== cls.name}
                      onClick={() => {
                        onArchive();
                        setShowArchiveConfirm(false);
                      }}
                      className={`flex-1 py-4 bg-red-500 text-white shadow-lg shadow-red-500/20 ${archiveInput !== cls.name ? 'grayscale opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Archivar
                    </GlossyButton>
                 </div>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
