/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Leaf, 
  Globe, 
  Scroll, 
  ShieldCheck, 
  Languages, 
  Calculator,
  Croissant,
  Calendar, 
  BookOpen, 
  ClipboardCheck, 
  Home,
  ChevronRight,
  User,
  UserX,
  Sparkles,
  TrendingUp,
  Book,
  Menu,
  Lightbulb,
  HelpCircle,
  ArrowLeft,
  CheckCircle2,
  Settings,
  WifiOff,
  PlusCircle,
  Hash,
  Share2,
  Copy,
  Lock,
  Play,
  Plus,
  X,
  AlertTriangle,
  Search,
  SearchX,
  Trash2,
  Flag,
  AlertCircle,
  RefreshCw,
  Edit3,
  Save,
  ChevronLeft,
  Users,
  Users2,
  Share,
  ClipboardList,
  Archive,
  LogOut,
  Heart,
  Trophy,
  Award,
  Gamepad2,
  LayoutGrid,
  TrendingDown,
  Bell,
  Check,
  CheckCircle,
  CheckCheck,
  BellRing,
  MessageSquare,
  ShieldAlert,
  Send,
  XCircle,
  Library,
  ExternalLink,
  Server,
  GraduationCap,
  Presentation,
  Pizza,
  Download,
  Filter,
  ListFilter,
  Coins,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { useNavigate, useLocation, useParams, Routes, Route, Navigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, getDoc, serverTimestamp, setDoc, getDocs, query, where, orderBy, limit, deleteDoc, updateDoc, increment, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getOptimizationFlags } from './lib/optimization';
import { db, auth } from './lib/firebase';
import firebaseConfig from '../firebase-applet-config.json';
import { SUBJECTS, Subject } from './types';
import { AeroCard, GlossyButton, GlossyInput, AeroAuthAlert } from './components/AeroUI';
import { ScheduleTable } from './components/ScheduleTable';
import { NewAraLogo } from './components/NewAraLogo';
import { GeographyGuide } from './components/GeographyGuide';
import { MathGuide } from './components/MathGuide';
import { BubbleBackground } from './components/BubbleBackground';
import { WelcomeTutorial } from './components/WelcomeTutorial';
import { ArasHistory } from './components/ArasHistory';
import { playExternalBubble, playWaterDrop, playSuccessSound, playErrorSound, playMinigameMusic, stopMinigameMusic, playGong, playWhoosh, playTick, playCheer } from './lib/sounds';
import { ClassCard, ClassDetail } from './components/ClassroomUI';
import { PREDEFINED_AVATARS } from './data/predefinedAvatars';

const APP_VERSION = "1.2.1-FIX";
const APP_LAST_BUILD = "2026-05-08 22:55 UTC";

const compressImage = (base64Str: string, maxWidth = 300, maxHeight = 300): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
  });
};

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || 'anonymous',
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

type View = 'home' | 'subject' | 'unit-study' | 'settings' | 'materias' | 'create-activity' | 'play-activity' | 'gallery' | 'leaderboard' | 'reports' | 'classes' | 'class-detail' | 'minigames' | 'horario' | 'users' | 'aras';

type NotificationType = 'assignment' | 'announcement' | 'moderation' | 'update';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt: any;
}

const MODERATORS = ['AraTester', 'NewAra'];

function HomeShortcut({ icon, label, onClick, color, theme }: { icon: React.ReactNode, label: string, onClick: () => void, color: string, theme: string }) {
  return (
    <button 
      onClick={() => { playExternalBubble(); onClick(); }}
      className={`group flex flex-col items-center gap-2 p-4 rounded-3xl transition-all active:scale-95 flex-1 min-w-[80px] max-w-[120px] ${
        theme === 'black' ? 'bg-white/5 hover:bg-white/10' : 'bg-white/50 hover:bg-white border border-white/50 shadow-sm'
      }`}
    >
      <div className={`p-3 rounded-2xl ${color} text-white shadow-lg group-hover:scale-110 transition-all duration-300`}>
        {icon}
      </div>
      <span className={`text-[9px] font-black uppercase tracking-widest text-center leading-tight ${theme === 'black' ? 'text-white/60' : 'text-sky-900/60'}`}>
        {label}
      </span>
    </button>
  );
}

function LeaderboardPreview({ theme, onViewProfile, isAuthReady }: { theme: 'white' | 'black', onViewProfile: (id: string, name?: string) => void, isAuthReady: boolean }) {
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const usersRef = collection(db, 'users');
        const userSnap = await getDocs(query(usersRef, limit(100)));
        const userData = userSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        const sorted = userData
          .filter(u => u.id !== 'Estudiante' && u.id !== 'AraTester' && u.id !== 'newen.araoz' && u.id !== 'NewAra')
          .sort((a: any, b: any) => {
            const scoreA = (a.completedUnits?.length || 0) + (a.stats?.totalCorrect || 0);
            const scoreB = (b.completedUnits?.length || 0) + (b.stats?.totalCorrect || 0);
            return scoreB - scoreA;
          })
          .slice(0, 5);
        
        setTopUsers(sorted);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTop();
  }, [isAuthReady]);

  if (loading) return (
    <div className="space-y-3 py-2">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className={`h-10 w-full animate-pulse rounded-xl ${theme === 'black' ? 'bg-white/5' : 'bg-sky-900/5'}`} />
      ))}
    </div>
  );

  return (
    <div className="space-y-1.5 py-1">
      {topUsers.map((user, idx) => (
        <div 
          key={user.id} 
          onClick={() => { playExternalBubble(); onViewProfile(user.id, user.name); }}
          className={`flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer group ${
            theme === 'black' ? 'hover:bg-white/5' : 'hover:bg-sky-50'
          }`}
        >
          <div className={`w-7 h-7 shrink-0 flex items-center justify-center rounded-full text-xs font-black ${
            idx === 0 ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 shadow-lg shadow-amber-500/20' : 
            idx === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 shadow-lg shadow-slate-400/20' :
            idx === 2 ? 'bg-gradient-to-br from-orange-200 to-orange-400 text-orange-950 shadow-lg shadow-orange-400/20' :
            theme === 'black' ? 'bg-white/10 text-white/40' : 'bg-sky-100 text-sky-900/40'
          }`}>
            {idx + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-bold truncate group-hover:text-blue-500 transition-colors ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
              {user.name || user.id}
            </p>
            <p className="text-[9px] opacity-40 font-bold uppercase truncate">{user.name ? user.id : ''}</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/5">
            <p className="text-[10px] font-black text-blue-500">{(user.completedUnits?.length || 0) + (user.stats?.totalCorrect || 0)}</p>
            <Sparkles size={10} className="text-amber-500" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState<number | null>(null);
  const [activeClass, setActiveClass] = useState<any | null>(null);
  const [userClasses, setUserClasses] = useState<any[]>([]);
  const [unitSearch, setUnitSearch] = useState('');

  const [currentView, setCurrentView] = useState<View>(() => {
    const path = window.location.pathname.split('/').filter(Boolean)[0];
    if (path === 'materias') return 'materias';
    if (path === 'leaderboard') return 'leaderboard';
    if (path === 'gallery') return 'gallery';
    if (path === 'clases') return 'classes';
    if (path === 'usuarios') return 'users';
    if (path === 'ajustes') return 'settings';
    if (path === 'reports') return 'reports';
    if (path === 'minijuegos') return 'minigames';
    if (path === 'aras') return 'aras';
    if (path === 'materia') return 'subject';
    if (path === 'clase') return 'class-detail';
    if (path === 'inicio') return 'home';
    if (path === 'horario') return 'horario';
    return (localStorage.getItem('newara_view') as View) || 'home';
  });

  const [lastView, setLastView] = useState<View>('home');
  const [showWelcome, setShowWelcome] = useState(false);
  const [showGalleryTutorial, setShowGalleryTutorial] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedNotificationId, setExpandedNotificationId] = useState<string | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [userRole, setUserRole] = useState<'Estudiante' | 'Profesor'>(() => (localStorage.getItem('newara_user_role') as any) || 'Estudiante');
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem('newara_visited');
    if (!hasVisited) {
      setShowWelcome(true);
    }
  }, []);

  // NEW: Sync URL to State
  useEffect(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    
    if (segments.length === 0 || segments[0] === 'inicio') {
      if (currentView !== 'home') setCurrentView('home');
      return;
    }

    const firstSegment = segments[0];

    // Deep link for minigames
    if (firstSegment === 'minijuegos' && segments[1] === 'servidor' && segments[2] === 'codigo' && segments[3]) {
      const codeFromUrl = segments[3].toUpperCase();
      if (isLoggedIn && !minigameSessionId) {
        joinMinigameSession(codeFromUrl);
      }
    }

    const viewMap: Record<string, View> = {
      'inicio': 'home',
      'materias': 'materias',
      'leaderboard': 'leaderboard',
      'gallery': 'gallery',
      'usuarios': 'users',
      'clases': 'classes',
      'ajustes': 'settings',
      'reports': 'reports',
      'minijuegos': 'minigames',
      'aras': 'aras',
      'create-activity': 'create-activity',
      'play-activity': 'play-activity',
      'horario': 'horario'
    };

    if (viewMap[firstSegment]) {
      if (currentView !== viewMap[firstSegment]) setCurrentView(viewMap[firstSegment]);
      return;
    }

    if (firstSegment === 'materia' && segments[1]) {
      const subjectId = segments[1];
      const subject = SUBJECTS.find(s => s.id === subjectId);
      if (subject) {
        setSelectedSubject(subject);
        if (segments[2] === 'unidad' && segments[3]) {
          const uIdx = parseInt(segments[3]);
          if (!isNaN(uIdx) && subject.units[uIdx]) {
            setSelectedUnitIndex(uIdx);
            if (currentView !== 'unit-study') setCurrentView('unit-study');
          } else {
            // Invalid unit, go to subject
            navigate(`/materia/${subject.id}`, { replace: true });
          }
        } else {
          if (currentView !== 'subject') setCurrentView('subject');
        }
      } else {
        // Invalid subject
        navigate('/materias', { replace: true });
      }
    } else if (firstSegment === 'clase' && segments[1]) {
      if (currentView !== 'class-detail') setCurrentView('class-detail');
    } else {
      // Catch-all: if we have a path that doesn't match, or we just loaded the root
      if (location.pathname === '/') {
        // Let's redirect to the path corresponding to the stored currentView
        const viewPaths: Record<string, string> = {
          'materias': '/materias',
          'leaderboard': '/leaderboard',
          'gallery': '/gallery',
          'users': '/usuarios',
          'classes': '/clases',
          'settings': '/ajustes',
          'reports': '/reports',
          'minigames': '/minijuegos',
          'horario': '/horario',
          'aras': '/aras',
          'home': '/inicio'
        };
        const route = viewPaths[currentView] || '/inicio';
        navigate(route, { replace: true });
      } else if (location.pathname !== '/inicio') {
         navigate('/inicio', { replace: true });
      } else if (currentView !== 'home') {
         setCurrentView('home');
      }
    }
  }, [location.pathname]);

  // Sync activeClass from URL once userClasses is loaded
  useEffect(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments[0] === 'clase' && segments[1] && userClasses.length > 0) {
      const cls = userClasses.find(c => c.id === segments[1]);
      if (cls && (!activeClass || activeClass.id !== cls.id)) {
        setActiveClass(cls);
      }
    }
  }, [location.pathname, userClasses]);

  const navigateTo = (view: View, params?: { subjectId?: string, unitIndex?: number, classId?: string, gameCode?: string }) => {
    setLastView(currentView);
    setUnitSearch('');
    
    // NEW: Handle state updates before navigation
    if (params?.subjectId) {
      const sub = SUBJECTS.find(s => s.id === params.subjectId);
      if (sub) setSelectedSubject(sub);
    }

    if (params?.unitIndex !== undefined) {
      setSelectedUnitIndex(params.unitIndex);
    }

    if (params?.classId) {
      const cls = userClasses.find(c => c.id === params.classId);
      if (cls) setActiveClass(cls);
    }

    setCurrentView(view);
    
    // NEW: Sync State to URL
    let path = '/inicio';
    const sId = params?.subjectId || selectedSubject?.id;
    const uIdx = params?.unitIndex !== undefined ? params.unitIndex : selectedUnitIndex;
    const cId = params?.classId || activeClass?.id;
    const gCode = params?.gameCode || minigameSession?.code;

    switch(view) {
      case 'home': path = '/inicio'; break;
      case 'materias': path = '/materias'; break;
      case 'leaderboard': path = '/leaderboard'; break;
      case 'gallery': path = '/gallery'; break;
      case 'classes': path = '/clases'; break;
      case 'settings': path = '/ajustes'; break;
      case 'reports': path = '/reports'; break;
      case 'create-activity': path = '/create-activity'; break;
      case 'play-activity': path = '/play-activity'; break;
      case 'horario': path = '/horario'; break;
      case 'users': path = '/usuarios'; break;
      case 'aras': path = '/aras'; break;
      case 'subject': 
        if (sId) path = `/materia/${sId}`;
        break;
      case 'unit-study':
        if (sId && uIdx !== null) 
          path = `/materia/${sId}/unidad/${uIdx}`;
        else if (sId)
          path = `/materia/${sId}`;
        break;
      case 'class-detail':
        if (cId) path = `/clase/${cId}`;
        else path = '/clases';
        break;
      case 'minigames':
        if (gCode) {
          path = `/minijuegos/servidor/codigo/${gCode}`;
        } else {
          path = '/minijuegos';
        }
        break;
    }
    
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  const handleCreateActivityClick = () => {
    playExternalBubble();
    if (!isLoggedIn) {
      setAuthMode('login');
      setIsRegistering(true);
    } else {
      navigateTo('create-activity');
    }
  };

  const [theme, setTheme] = useState<'white' | 'black' | 'aero'>(() => {
    return (localStorage.getItem('newara_theme') as 'white' | 'black' | 'aero') || 'white';
  });

  useEffect(() => {
    document.body.classList.remove('theme-aero');
    if (theme === 'aero') {
      document.body.classList.add('theme-aero');
    }
    localStorage.setItem('newara_theme', theme);
  }, [theme]);
  const [showMobileSubjects, setShowMobileSubjects] = useState(false);
  const [showMoreMobileMenu, setShowMoreMobileMenu] = useState(false);
  const [disableAnimations, setDisableAnimations] = useState(() => {
    const legacy = getOptimizationFlags().reduceAnimations;
    return legacy || localStorage.getItem('newara_disable_animations') === 'true';
  });
  
  useEffect(() => {
    if (getOptimizationFlags().isLegacy) {
      document.documentElement.classList.add('legacy-mode');
    }
  }, []);

  useEffect(() => {
    if (disableAnimations) {
      document.body.classList.add('no-animations');
    } else {
      document.body.classList.remove('no-animations');
    }
  }, [disableAnimations]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const [language, setLanguage] = useState<'es' | 'en' | 'ru'>(() => {
    return (localStorage.getItem('newara_language') as 'es' | 'en' | 'ru') || 'es';
  });

  const translations: any = {
    es: {
      materias: "Materias",
      leaderboard: "Leaderboard",
      ajustes: "Ajustes",
      denunciados: "Denunciados",
      mas: "Más",
      perfil: "Perfil",
      apariencia: "Apariencia",
      acercaDe: "Acerca de",
      terminos: "Términos de Servicio",
      cerrarSesión: "Cerrar Sesión",
      idioma: "Idioma",
      nombreVisible: "Nombre Visible",
      tuRol: "Tu Rol",
      estudiante: "Estudiante",
      profesor: "Profesor",
      bio: "Sobre ti (Bio)",
      bioPlaceholder: "Contanos algo de vos...",
      guardarCambios: "Guardar Cambios",
      eliminarFoto: "Eliminar Foto de Perfil",
      temaWeb: "Tema del Web",
      blanco: "Blanco",
      negro: "Negro",
      aeroBeta: "Aero Beta",
      desactivarAnimaciones: "Desactivar Animaciones",
      mejoraRendimiento: "Mejora el rendimiento en celulares viejos",
      version: "Versión",
      desarrollador: "Desarrollador",
      guardando: "Guardando...",
      confirmar: "Confirmar",
      cancelar: "Cancelar",
      bienvenida: "Bienvenido a NewAra",
      explorar: "Explora y aprende",
      inicio: "Inicio",
      explorarMaterias: "Explorar Materias",
      explorarMateriasDesc: "Explora todas las materias disponibles y comienza a aprender.",
      unidadesYTemas: "Unidades y Temas",
      informacion: "Información",
      verProgramas: "Ver Programas",
      reintentar: "Reintentar",
      volverAlInicio: "Volver al Inicio",
      misClases: "Mis Clases",
      crearClase: "Crear Clase",
      unirseCodigo: "Unirse con Código",
      buscarTemas: "Buscar temas o unidades...",
      sincronizando: "Sincronizando aulas...",
      noClases: "No tienes clases aún.",
      clasesArchivadas: "Clases Archivadas",
      restaurarClase: "¿Restaurar Clase?",
      mensajeRestaurar: "La clase volverá a estar activa para todos los estudiantes.",
      guiaVisual: "Guía Visual",
      deslizaTabla: "Desliza la tabla para ver más",
      sistemaOffline: "SISTEMA OFFLINE",
      modoSinConexion: "Modo Sin Conexión",
      gestionaAulas: "Gestiona tus aulas y alumnos.",
      participaClases: "Participa en las clases de tus profesores.",
      sincronizandoAulas: "Sincronizando aulas...",
      noClasesAun: "No tienes clases aún.",
      creaAunaClase: "Crea una nueva clase o únete a una existente con un código.",
      legalTitle: 'Información Legal e Importante (Servidor NewAra Pro)',
      usoAcademico: 'Uso Académico',
      usoAcademicoDesc: 'NewAra es una herramienta complementaria de estudio. Los resultados en los simulacros no garantizan notas en exámenes reales.',
      privacidad: 'Privacidad',
      privacidadDesc: 'Tus preferencias (como el tema y la vista actual) se guardan únicamente en el almacenamiento local de tu navegador.',
      cuentasUsuario: 'Cuentas de Usuario',
      cuentasUsuarioDesc: 'En RELEASE 2.1, el registro es obligatorio para publicar. Tu contraseña se cifra localmente. No compartas tus credenciales.',
      integridadAcademica: 'Integridad Académica',
      integridadAcademicaDesc: 'NewAra no es responsable por haciendo trampa en los examenes.',
      ultimaActualizacion: 'Última actualización: 29 de abril de 2026',
      usuariosLike: "Usuarios que dieron like",
      notificaciones: "Notificaciones",
      noHayNotificaciones: "No tienes notificaciones todavía.",
      marcarComoLeido: "Marcar como leído",
      marcarTodoLeido: "Marcar todo como leído",
      borrarNotificacion: "Borrar notificación",
      nuevaTarea: "Nueva Tarea",
      nuevoAnuncio: "Nuevo Anuncio",
      contenidoEliminado: "Contenido Eliminado",
      actualizacionSistema: "Actualización del Sistema",
      italiano: "Italiano",
      materia_italiano_desc: "Aprende italiano desde las bases: pronunciación, verbos, artículos y estructura de oraciones."
    },
    en: {
      materias: "Subjects",
      leaderboard: "Leaderboard",
      ajustes: "Settings",
      denunciados: "Reported",
      mas: "More",
      perfil: "Profile",
      apariencia: "Appearance",
      acercaDe: "About",
      terminos: "Terms of Service",
      cerrarSesión: "Log Out",
      idioma: "Language",
      nombreVisible: "Display Name",
      tuRol: "Your Role",
      estudiante: "Student",
      profesor: "Teacher",
      bio: "About you (Bio)",
      bioPlaceholder: "Tell us something about yourself...",
      guardarCambios: "Save Changes",
      eliminarFoto: "Remove Profile Picture",
      temaWeb: "Web Theme",
      blanco: "Light",
      negro: "Dark",
      aeroBeta: "Aero Beta",
      desactivarAnimaciones: "Disable Animations",
      mejoraRendimiento: "Improves performance on old phones",
      version: "Version",
      desarrollador: "Developer",
      guardando: "Saving...",
      confirmar: "Confirm",
      cancelar: "Cancel",
      bienvenida: "Welcome to NewAra",
      explorar: "Explore and learn",
      inicio: "Home",
      explorarMaterias: "Explore Subjects",
      explorarMateriasDesc: "Explore all available subjects and start learning.",
      unidadesYTemas: "Units and Topics",
      informacion: "Information",
      verProgramas: "View Programs",
      reintentar: "Retry",
      volverAlInicio: "Back to Home",
      misClases: "My Classes",
      crearClase: "Create Class",
      unirseCodigo: "Join with Code",
      buscarTemas: "Search topics or units...",
      sincronizando: "Syncing classes...",
      noClases: "You don't have any classes yet.",
      clasesArchivadas: "Archived Classes",
      restaurarClase: "Restore Class?",
      mensajeRestaurar: "The class will be active again for all students.",
      guiaVisual: "Visual Guide",
      deslizaTabla: "Swipe the table to see more",
      sistemaOffline: "OFFLINE SYSTEM",
      modoSinConexion: "Offline Mode",
      gestionaAulas: "Manage your classrooms and students.",
      participaClases: "Participate in your teachers' classes.",
      sincronizandoAulas: "Syncing classrooms...",
      noClasesAun: "No classes yet.",
      creaAunaClase: "Create a new class or join an existing one with a code.",
      legalTitle: 'Legal & Important Information (NewAra Pro Server)',
      usoAcademico: 'Academic Use',
      usoAcademicoDesc: 'NewAra is a complementary study tool. Simulation results do not guarantee grades on real exams.',
      privacidad: 'Privacy',
      privacidadDesc: 'Your preferences (such as theme and current view) are saved only in your browser local storage.',
      cuentasUsuario: 'User Accounts',
      cuentasUsuarioDesc: 'In RELEASE 2.1, registration is mandatory for posting. Your password is encrypted locally. Do not share your credentials.',
      integridadAcademica: 'Academic Integrity',
      integridadAcademicaDesc: 'NewAra is not responsible for cheating on exams.',
      ultimaActualizacion: 'Last updated: April 29, 2026',
      usuariosLike: "Users who liked",
      notificaciones: "Notifications",
      noHayNotificaciones: "You have no notifications yet.",
      marcarComoLeido: "Mark as read",
      marcarTodoLeido: "Mark all as read",
      borrarNotificacion: "Delete notification",
      nuevaTarea: "New Assignment",
      nuevoAnuncio: "New Announcement",
      contenidoEliminado: "Content Removed",
      actualizacionSistema: "System Update",
      italiano: "Italian",
      materia_italiano_desc: "Learn Italian from the basics: pronunciation, verbs, articles and sentence structure."
    },
    ru: {
      materias: "Предметы",
      leaderboard: "Таблица лидеров",
      ajustes: "Настройки",
      denunciados: "Жалобы",
      mas: "Ещё",
      perfil: "Профиль",
      apariencia: "Оформление",
      acercaDe: "О программе",
      terminos: "Условия использования",
      cerrarSesión: "Выйти",
      idioma: "Язык",
      nombreVisible: "Отображаемое имя",
      tuRol: "Ваша роль",
      estudiante: "Студент",
      profesor: "Преподаватель",
      bio: "О себе (Биография)",
      bioPlaceholder: "Расскажите что-нибудь о себе...",
      guardarCambios: "Сохранить изменения",
      eliminarFoto: "Удалить фото профиля",
      temaWeb: "Тема сайта",
      blanco: "Светлая",
      negro: "Тёмная",
      desactivarAnimaciones: "Отключить анимации",
      mejoraRendimiento: "Улучшает работу на старых телефонах",
      version: "Версия",
      desarrollador: "Разработчик",
      guardando: "Сохранение...",
      confirmar: "Подтвердить",
      cancelar: "Отмена",
      bienvenida: "Добро пожаловать в NewAra",
      explorar: "Исследуй и учись",
      inicio: "Главная",
      explorarMaterias: "Исследовать предметы",
      explorarMateriasDesc: "Исследуйте все доступные предметы и начинайте учиться.",
      unidadesYTemas: "Разделы и темы",
      informacion: "Информация",
      verProgramas: "Просмотреть программы",
      reintentar: "Повторить",
      volverAlInicio: "Вернуться на главную",
      misClases: "Мои классы",
      crearClase: "Создать класс",
      unirseCodigo: "Присоединиться по коду",
      buscarTemas: "Искать темы или разделы...",
      sincronizando: "Синхронизация классов...",
      noClases: "У вас пока нет классов.",
      clasesArchivadas: "Архивные классы",
      restaurarClase: "Восстановить класс?",
      mensajeRestaurar: "Класс снова станет активным для всех студентов.",
      guiaVisual: "Визуальное руководство",
      deslizaTabla: "Прокрутите таблицу, чтобы увидеть больше",
      sistemaOffline: "СИСТЕМА ОФФЛАЙН",
      modoSinConexion: "Автономный режим",
      gestionaAulas: "Управляйте своими классами и учениками.",
      participaClases: "Участвуйте в занятиях своих преподавателей.",
      sincronizandoAulas: "Синхронизация классов...",
      noClasesAun: "Классов пока нет.",
      creaAunaClase: "Создайте новый класс или присоединитесь к существующему по коду.",
      legalTitle: 'Юридическая и важная информация (Сервер NewAra Pro)',
      usoAcademico: 'Академическое использование',
      usoAcademicoDesc: 'NewAra — это вспомогательный инструмент для учебы. Результаты симуляций не гарантируют оценки на реальных экзаменах.',
      privacidad: 'Конфиденциальность',
      privacidadDesc: 'Ваши предпочтения (такие как тема и текущий вид) сохраняются только в локальном хранилище вашего браузера.',
      cuentasUsuario: 'Учетные записи пользователей',
      cuentasUsuarioDesc: 'В RELEASE 2.1 регистрация обязательна для публикации. Ваш пароль шифруется локально. Не делитесь своими учетными данными.',
      integridadAcademica: 'Академическая честность',
      integridadAcademicaDesc: 'NewAra не несет ответственности за списывание на экзаменах.',
      ultimaActualizacion: 'Последнее обновление: 29 апреля 2026 г.',
      usuariosLike: "Пользователи, поставившие лайк",
      notificaciones: "Уведомления",
      noHayNotificaciones: "У вас пока нет уведомлений.",
      marcarComoLeido: "Отметить как прочитанное",
      marcarTodoLeido: "Отметить все как прочитанные",
      borrarNotificacion: "Удалить уведомление",
      nuevaTarea: "Новое задание",
      nuevoAnuncio: "Новое объявление",
      contenidoEliminado: "Контент удален",
      actualizacionSistema: "Обновление системы"
    }
  };

  const t = (key: string) => translations[language][key] || key;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Classroom States
  const [classAnnouncements, setClassAnnouncements] = useState<any[]>([]);
  const [classMessages, setClassMessages] = useState<any[]>([]);
  const [classMembers, setClassMembers] = useState<any[]>([]);
  const [classResources, setClassResources] = useState<any[]>([]);
  const [isClassesLoading, setIsClassesLoading] = useState(false);
  const [classAssignments, setClassAssignments] = useState<any[]>([]);
  const [classSubmissions, setClassSubmissions] = useState<any[]>([]);
  const [announcementComments, setAnnouncementComments] = useState<Record<string, any[]>>({});
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showJoinClassModal, setShowJoinClassModal] = useState(false);
  const [classJoinCode, setClassJoinCode] = useState('');
  const [isArchivingClass, setIsArchivingClass] = useState(false);
  const [archiveConfirmName, setArchiveConfirmName] = useState('');
  const [initialClassTab, setInitialClassTab] = useState<'anuncios' | 'tareas' | 'personas' | 'chat'>('anuncios');
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [isPendingTasksLoading, setIsPendingTasksLoading] = useState(false);

  // Profile State
  const [userName, setUserName] = useState(() => (localStorage.getItem('newara_user_name') || 'Estudiante'));
  const [moderatorPassword, setModeratorPassword] = useState('');
  const [isModAuthorized, setIsModAuthorized] = useState(() => localStorage.getItem('newara_mod_auth') === 'true');
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('newara_logged_in') === 'true');
  const [authRequiredMsg, setAuthRequiredMsg] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (!user) {
        try {
          // Silent anonymous sign-in for Firestore rules satisfaction
          await signInAnonymously(auth);
        } catch (e: any) {
          // Silent failure if anonymous auth is disabled in console
        }
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkMod = async () => {
      if (moderatorPassword) {
        const hashedInput = await hashPassword(moderatorPassword);
        const MOD_HASH = 'c0d768997a3a8d116248c8b41982b67f13c675306663f703e3065e8aeda08990';
        if (hashedInput === MOD_HASH || moderatorPassword === 'n3w3naraoz') {
          if (!isModAuthorized) {
            playSuccessSound();
            setIsModAuthorized(true);
            localStorage.setItem('newara_mod_auth', 'true');
          }
        }
      }
    };
    checkMod();
  }, [moderatorPassword]);

  useEffect(() => {
    if (!MODERATORS.includes(userName.trim())) {
      setIsModAuthorized(false);
      localStorage.removeItem('newara_mod_auth');
    }
  }, [userName]);

  const [userPassword, setUserPassword] = useState(() => (localStorage.getItem('newara_user_password') || ''));
  const [userBio, setUserBio] = useState(() => (localStorage.getItem('newara_user_bio') || 'Explorador del conocimiento en NewAra.'));
  const [userAvatar, setUserAvatar] = useState(() => (localStorage.getItem('newara_user_avatar') || ''));
  const [showAvatarLibraryModal, setShowAvatarLibraryModal] = useState(false);
  const [avatarCategoryFilter, setAvatarCategoryFilter] = useState('Todos');
  const [userAras, setUserAras] = useState<number>(() => {
    const saved = localStorage.getItem('newara_user_aras');
    return saved ? parseInt(saved, 10) : 150;
  });
  const [showDailyArasModal, setShowDailyArasModal] = useState(false);
  const [claimableDailyAras, setClaimableDailyAras] = useState(0);
  const [hasCheckedDaily, setHasCheckedDaily] = useState(false);
  const [isClaimingDaily, setIsClaimingDaily] = useState(false);

  const claimDailyAras = async () => {
    if (!isLoggedIn || !userName || userName === 'Estudiante' || isClaimingDaily) {
      setShowDailyArasModal(false);
      return;
    }
    setIsClaimingDaily(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const userRef = doc(db, 'users', userName.trim());
      
      await updateDoc(userRef, {
        lastDailyClaimDate: today,
        aras: increment(claimableDailyAras)
      });

      const localClaimKey = `newara_daily_claim_${userName.trim()}`;
      localStorage.setItem(localClaimKey, today);
      
      setUserAras(prev => {
        const newAras = prev + claimableDailyAras;
        localStorage.setItem('newara_user_aras', newAras.toString());
        return newAras;
      });

      await logAraTransaction(
        userName.trim(), 
        claimableDailyAras, 
        'daily_reward', 
        `Recompensa diaria (${userRole === 'Profesor' ? 'Profesor' : 'Estudiante'})`
      );

      playSuccessSound();
      setShowDailyArasModal(false);
    } catch (error) {
      console.error("Error claiming daily Aras:", error);
      alert("Hubo un problema al reclamar tus Aras.");
    } finally {
      setIsClaimingDaily(false);
    }
  };
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginUserName, setLoginUserName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isCheckingAccount, setIsCheckingAccount] = useState(false);

  useEffect(() => {
    if (currentView === 'home' && isLoggedIn && userRole === 'Estudiante') {
      fetchPendingTasks();
    }
  }, [currentView, isLoggedIn, userRole, userClasses]);

  useEffect(() => {
    if (isLoggedIn && userName && userName !== 'Estudiante' && isAuthReady && auth.currentUser) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // More frequent updates for real-time feel

      // Request native notification permission
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }

      return () => clearInterval(interval);
    }
  }, [isLoggedIn, userName]);

  useEffect(() => {
    localStorage.setItem('newara_user_name', userName);
    localStorage.setItem('newara_user_role', userRole);
    localStorage.setItem('newara_user_password', userPassword);
    localStorage.setItem('newara_user_bio', userBio);
    localStorage.setItem('newara_user_avatar', userAvatar);
    localStorage.setItem('newara_disable_animations', disableAnimations.toString());
    localStorage.setItem('newara_logged_in', isLoggedIn.toString());
    localStorage.setItem('newara_language', language);
  }, [userName, userRole, userPassword, userBio, userAvatar, disableAnimations, isLoggedIn, language]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupSync = async () => {
      if (isLoggedIn && userName && userName !== 'Estudiante') {
        try {
          const bannedSnap = await getDoc(doc(db, 'banned_users', userName.trim()));
          if (bannedSnap.exists()) {
            console.error("This account has been banned/deleted.");
            logout();
            return;
          }

          const userRef = doc(db, 'users', userName.trim());
          
          unsubscribe = onSnapshot(userRef, async (userDoc) => {
            if (userDoc.exists()) {
              const data = userDoc.data();
              // Sync from Firestore as the source of truth in real-time
              if (data.avatar) setUserAvatar(data.avatar);
              if (data.role) setUserRole(data.role);
              if (data.bio) setUserBio(data.bio);
              if (data.aras !== undefined) {
                setUserAras(data.aras);
                localStorage.setItem('newara_user_aras', data.aras.toString());
              } else {
                setUserAras(150);
                localStorage.setItem('newara_user_aras', '150');
                updateDoc(userRef, { aras: 150 }).catch(console.error);
              }
              if (data.completedUnits) {
                setCompletedUnits(data.completedUnits);
                localStorage.setItem('newara_completed_units', JSON.stringify(data.completedUnits));
              }
              
              // Ensure name is always present in Firestore
              if (!data.name) {
                await updateDoc(userRef, { name: userName.trim() });
              }

              // Sync local storage too
              if (data.bio) localStorage.setItem('newara_user_bio', data.bio);
              if (data.role) localStorage.setItem('newara_user_role', data.role);
              if (data.avatar) localStorage.setItem('newara_user_avatar', data.avatar);
              if (data.name || userName) localStorage.setItem('newara_user_name', data.name || userName);

              // Ensure stats structure exists for legacy users
              if (!data.stats) {
                await updateDoc(userRef, {
                  stats: { totalViews: 0, totalLikes: 0, totalCorrect: 0 }
                });
              }

              // Check daily login reward (Profesor 50 Aras, Estudiante 10 Aras)
              const todayStr = new Date().toISOString().split('T')[0];
              const localClaimKey = `newara_daily_claim_${userName.trim()}`;
              if (!hasCheckedDaily && data.lastDailyClaimDate !== todayStr && localStorage.getItem(localClaimKey) !== todayStr) {
                setHasCheckedDaily(true);
                const role = data.role || userRole || 'Estudiante';
                const amount = role === 'Profesor' ? 50 : 10;
                setClaimableDailyAras(amount);
                setShowDailyArasModal(true);
              }
            } else {
              // Create profile for user if it doesn't exist but they are logged in
              const hashedPassword = await hashPassword(userPassword);
              await setDoc(userRef, {
                name: userName.trim(),
                password: hashedPassword,
                role: userRole,
                bio: userBio,
                avatar: userAvatar,
                createdAt: serverTimestamp(),
                stats: { totalViews: 0, totalLikes: 0, totalCorrect: 0 }
              });
            }
          }, (error) => {
            console.error("Profile real-time watch error:", error);
          });
        } catch (error) {
          console.error("Auto-sync error during setup:", error);
        }
      }
    };

    setupSync();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isLoggedIn, userName]); 

  const logAraTransaction = async (userId: string, amount: number, type: string, details: string) => {
    try {
      await addDoc(collection(db, 'users', userId, 'ara_transactions'), {
        amount,
        type,
        details,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error("Error logging ara transaction", e);
    }
  };

  const checkUsername = async (name: string) => {
    if (!name.trim() || name.trim() === 'Estudiante') return;
    setIsCheckingAccount(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', name.trim()));
      if (userDoc.exists()) {
        setAuthMode('login');
      } else {
        setAuthMode('register');
      }
    } catch (error) {
      console.error("Check username error:", error);
    } finally {
      setIsCheckingAccount(false);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!loginUserName.trim() || !loginPassword.trim()) {
      setAuthError("Completa todos los campos.");
      return;
    }
    if (MODERATORS.includes(loginUserName.trim()) && !isModAuthorized) {
      const trimmedModPass = moderatorPassword.trim();
      const hashedModInput = await hashPassword(trimmedModPass);
      const MOD_HASH = 'c0d768997a3a8d116248c8b41982b67f13c675306663f703e3065e8aeda08990';
      if (hashedModInput === MOD_HASH || trimmedModPass === 'n3w3naraoz') {
        setIsModAuthorized(true);
        localStorage.setItem('newara_mod_auth', 'true');
      } else {
        setAuthError("Contraseña de moderador requerida.");
        return;
      }
    }
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const uTrim = loginUserName.trim();
      const bannedSnap = await getDoc(doc(db, 'banned_users', uTrim));
      if (bannedSnap.exists()) {
        setAuthError("Esta cuenta ha sido eliminada por un moderador.");
        setIsAuthLoading(false);
        return;
      }
      const userDoc = await getDoc(doc(db, 'users', uTrim));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const hashedPassword = await hashPassword(loginPassword);
        
        // Multi-stage verification:
        // 1. Check if it matches the stored hash
        // 2. Check if it matches as plain text (legacy accounts)
        const isCorrect = userData.password === hashedPassword || userData.password === loginPassword;

        if (isCorrect) {
          // Automatic migration to hashing if it was plain text
          if (userData.password === loginPassword && userData.password !== hashedPassword) {
            console.log("Migrating account to secure hashing...");
            await updateDoc(doc(db, 'users', loginUserName.trim()), { 
              password: hashedPassword,
              migrationDate: serverTimestamp() 
            });
          }

          playSuccessSound();
          setUserName(loginUserName.trim());
          setUserPassword(loginPassword);
          setIsLoggedIn(true);
          setIsRegistering(false);
          setShowWelcome(false);
          localStorage.setItem('newara_visited', 'true');
          // Persist profile
          setUserBio(userData.bio || 'Explorador del conocimiento en NewAra.');
          setUserRole(userData.role || 'Estudiante');
          setUserAvatar(userData.avatar || '');
          
          if (!userData.role) {
            setShowRoleSelection(true);
          }

          localStorage.setItem('newara_user_name', loginUserName.trim());
          localStorage.setItem('newara_user_password', loginPassword);
          localStorage.setItem('newara_user_role', userData.role || 'Estudiante');
          localStorage.setItem('newara_logged_in', 'true');

          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } else {
          setAuthError("Contraseña incorrecta.");
          playErrorSound();
        }
      } else {
        setAuthError("El usuario no existe.");
        playErrorSound();
      }
    } catch (error) {
      console.error("Login error:", error);
      setAuthError("Error al conectar con el servidor.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUserName.trim() || !loginPassword.trim()) {
      setAuthError("Completa todos los campos.");
      return;
    }
    if (MODERATORS.includes(loginUserName.trim()) && !isModAuthorized) {
      const trimmedModPass = moderatorPassword.trim();
      const hashedModInput = await hashPassword(trimmedModPass);
      const MOD_HASH = 'c0d768997a3a8d116248c8b41982b67f13c675306663f703e3065e8aeda08990';
      if (hashedModInput === MOD_HASH || trimmedModPass === 'n3w3naraoz') {
        setIsModAuthorized(true);
        localStorage.setItem('newara_mod_auth', 'true');
      } else {
        setAuthError("Contraseña de moderador requerida.");
        return;
      }
    }
    if (loginPassword.length < 4) {
      setAuthError("La contraseña debe tener al menos 4 caracteres.");
      return;
    }

    const uTrimValidation = loginUserName.trim();
    
    // Username Length Validation
    if (uTrimValidation.length < 3) {
      setAuthError("El nombre de usuario es demasiado corto (mínimo 3).");
      return;
    }
    if (uTrimValidation.length > 20) {
      setAuthError("El nombre de usuario es demasiado largo (máximo 20).");
      return;
    }

    // Symbol Validation (Alphanumeric and underscores only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(uTrimValidation)) {
      setAuthError("No se permiten símbolos. Usa solo letras, números y '_'.");
      return;
    }

    // Inappropriate Words Validation
    const FORBIDDEN_WORDS = ['pto', 'oto', 'pendejo', 'puto', 'mierda', 'carajo', 'culiao', 'hdp', 'orto'];
    const lowerUsername = uTrimValidation.toLowerCase();
    const isBadWord = FORBIDDEN_WORDS.some(word => lowerUsername.includes(word));
    if (isBadWord) {
      setAuthError("Ese nombre de usuario no está permitido.");
      return;
    }

    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const uTrim = loginUserName.trim();
      const bannedSnap = await getDoc(doc(db, 'banned_users', uTrim));
      if (bannedSnap.exists()) {
        setAuthError("Esta cuenta ha sido eliminada por un moderador.");
        setIsAuthLoading(false);
        return;
      }
      const userDoc = await getDoc(doc(db, 'users', uTrim));
      if (userDoc.exists()) {
        setAuthError("¡Esta cuenta ya existe!");
        playErrorSound();
      } else {
        const hashedPassword = await hashPassword(loginPassword);
        const safeAvatar = userAvatar.length > 800000 ? '' : userAvatar;
        await setDoc(doc(db, 'users', loginUserName.trim()), {
          name: loginUserName.trim(),
          password: hashedPassword,
          bio: userBio.slice(0, 300),
          role: null, // Force selection on first login/right after register
          avatar: safeAvatar,
          createdAt: serverTimestamp(),
          aras: 150
        });
        playSuccessSound();
        setUserName(loginUserName.trim());
        setUserPassword(loginPassword);
        setUserAras(150);
        setIsLoggedIn(true);
        setIsRegistering(false);
        setShowWelcome(false);
        setShowRoleSelection(true); // Trigger selection
        localStorage.setItem('newara_visited', 'true');
        localStorage.setItem('newara_user_name', loginUserName.trim());
        localStorage.setItem('newara_user_password', loginPassword);
        localStorage.setItem('newara_logged_in', 'true');

        confetti({
          particleCount: 200,
          spread: 90,
          origin: { y: 0.6 },
          scalar: 1.2
        });
      }
    } catch (error) {
      console.error("Register error:", error);
      setAuthError("Error al crear la cuenta.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSelectRole = async (role: 'Estudiante' | 'Profesor') => {
    if (!isLoggedIn || !userName) return;
    setIsAuthLoading(true);
    try {
      const userRef = doc(db, 'users', userName.trim());
      await updateDoc(userRef, { 
        role,
        roleSelectedAt: serverTimestamp()
      });
      setUserRole(role);
      localStorage.setItem('newara_user_role', role);
      setShowRoleSelection(false);
      playSuccessSound();
    } catch (error) {
       console.error("Error setting role:", error);
       handleFirestoreError(error, OperationType.UPDATE, `users/${userName}`);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handleUpdateProfile = async () => {
    if (!isLoggedIn) return;
    setIsUpdatingProfile(true);
    const userId = userName.trim();
    const path = `users/${userId}`;
    try {
      const userRef = doc(db, 'users', userId);
      const safeAvatar = userAvatar && userAvatar.length > 800000 ? '' : userAvatar;
      
      // Use setDoc with merge to ensure it works even if the document was somehow missing
      await setDoc(userRef, {
        name: userName.trim(), // Keep name synced
        bio: userBio.slice(0, 300),
        role: userRole,
        avatar: safeAvatar,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      playSuccessSound();
      // Update local storage too to ensure sync
      localStorage.setItem('newara_user_bio', userBio);
      localStorage.setItem('newara_user_role', userRole);
      localStorage.setItem('newara_user_avatar', userAvatar);
    } catch (error) {
      console.error("Profile update error:", error);
      playErrorSound();
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const hashPassword = async (password: string): Promise<string> => {
    if (!password) return '';
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (err) {
      console.error("Hashing error:", err);
      return password; // Fallback to plain text if crypto fails (unlikely in modern browsers)
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    auth.signOut(); // Ensure Firebase Auth session is also cleared
    setUserName('Estudiante');
    setUserPassword('');
    setUserRole('Estudiante');
    setUserAvatar('');
    setUserBio('Explorador del conocimiento en NewAra.');
    setIsModAuthorized(false);
    setUserClasses([]);
    setNotifications([]);
    setClassAnnouncements([]);
    setClassMessages([]);
    setClassMembers([]);
    setClassResources([]);
    setClassAssignments([]);
    setClassSubmissions([]);
    setActiveClass(null);
    setCompletedUnits([]);
    setActivityHistory([]);
    setHasCheckedDaily(false);
    
    // Clear all user-related localStorage
    localStorage.removeItem('newara_user_name');
    localStorage.removeItem('newara_user_password');
    localStorage.removeItem('newara_user_role');
    localStorage.removeItem('newara_user_avatar');
    localStorage.removeItem('newara_user_bio');
    localStorage.removeItem('newara_logged_in');
    localStorage.removeItem('newara_mod_auth');
    localStorage.removeItem('newara_activity_history');
    localStorage.removeItem('newara_completed_units');
    localStorage.removeItem('newara_visited');
    
    playExternalBubble();
    
    // Force a reload to ensure all states are completely fresh
    setTimeout(() => {
      window.location.href = '/inicio';
    }, 100);
  };

  useEffect(() => {
    // If somehow the avatar became too large, we clear it to avoid sync errors
    if (userAvatar.length > 800000) { 
      setUserAvatar('');
      localStorage.removeItem('newara_user_avatar');
    }
  }, [userAvatar]);

  const syncProfile = async () => {
    if (!isLoggedIn || !userName.trim() || userName.trim() === 'Estudiante') return;
    const path = `users/${userName.trim()}`;
    try {
      // Safeguard: Ensure we don't try to sync data that is too large
      const safeAvatar = userAvatar.length > 800000 ? '' : userAvatar;
      const safeBio = userBio.slice(0, 300);

      const updateData: any = {
        bio: safeBio,
        role: userRole,
        avatar: safeAvatar,
        updatedAt: serverTimestamp()
      };

      // Include password if we are not signed in to Firebase Auth
      // This allows the Firestore rules to verify ownership via password match
      if (!auth.currentUser && userPassword) {
        const hashedPassword = await hashPassword(userPassword);
        updateData.password = hashedPassword;
      }

      await updateDoc(doc(db, 'users', userName.trim()), updateData);
    } catch (error) {
      console.error("Sync error:", error);
      try {
        handleFirestoreError(error, OperationType.UPDATE, path);
      } catch (e) {}
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      syncProfile();
    }, 2000);
    return () => clearTimeout(timer);
  }, [userBio, userAvatar, userRole]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserClasses();
    }
  }, [isLoggedIn, userName]);

  useEffect(() => {
    if (activeClass && isAuthReady && auth.currentUser) {
      fetchClassDetails(activeClass.id);
    }
  }, [activeClass, isAuthReady, auth.currentUser]);

  useEffect(() => {
    if (activeClass && currentView === 'class-detail' && isAuthReady && auth.currentUser) {
      const msgQ = query(
        collection(db, 'classes', activeClass.id, 'messages'), 
        orderBy('createdAt', 'asc'), 
        limit(150)
      );
      const unsubscribe = onSnapshot(msgQ, async (snap) => {
        const messages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Fetch fresh avatars for authors
        const uniqueAuthors = Array.from(new Set(messages.map((m: any) => m.authorName))).filter(Boolean);
        const avatarMap: Record<string, string> = {};
        
        await Promise.all(uniqueAuthors.map(async (name) => {
          const userDoc = await getDoc(doc(db, 'users', name.trim()));
          if (userDoc.exists()) {
            avatarMap[name] = userDoc.data().avatar || '';
          }
        }));

        const enrichedMessages = messages.map((m: any) => ({
          ...m,
          authorAvatar: avatarMap[m.authorName] || m.authorAvatar
        }));
        
        setClassMessages(enrichedMessages);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, `classes/${activeClass.id}/messages`);
      });
      return () => unsubscribe();
    } else {
      setClassMessages([]);
    }
  }, [activeClass, currentView]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persist view changes
  useEffect(() => {
    localStorage.setItem('newara_view', currentView);
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('newara_disable_animations', disableAnimations.toString());
  }, [disableAnimations]);

  useEffect(() => {
    if (isLoggedIn && userName && userName !== 'Estudiante' && isAuthReady && auth.currentUser) {
      const checkDailyRewards = async () => {
        const today = new Date().toISOString().split('T')[0];
        const rewardKey = `last_daily_rank_reward_${userName}`;
        
        if (localStorage.getItem(rewardKey) === today) return;

        try {
          const userRef = doc(db, 'users', userName.trim());
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
             const data = userDoc.data();
             if (data.lastLeaderboardRewardDate === today) {
                localStorage.setItem(rewardKey, today);
                return;
             }

             const usersSnap = await getDocs(query(collection(db, 'users'), limit(200)));
             const usersData = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

             const actSnap = await getDocs(collection(db, 'activities'));
             const activities = actSnap.docs.map(d => d.data());

             let totalArasToReward = 0;

             const lb = usersData.map((u: any) => {
                const userActs = activities.filter(a => a.creatorName === u.id);
                const computedViews = userActs.reduce((acc, a) => acc + (a.views || 0), 0);
                const computedLikes = userActs.reduce((acc, a) => acc + (a.likes?.length || 0), 0);
                const computedCorrect = (u.completedUnits?.length || 0) + (u.stats?.totalCorrect || 0);
                return { id: u.id, correct: computedCorrect, likes: computedLikes, views: computedViews };
             });

             const ranks = {
                correct: [...lb].sort((a,b) => b.correct - a.correct),
                likes: [...lb].sort((a,b) => b.likes - a.likes),
                views: [...lb].sort((a,b) => b.views - a.views)
             };

             const categories = ['correct', 'likes', 'views'] as const;
             for (const cat of categories) {
                const rank = ranks[cat].findIndex(u => u.id === userName.trim());
                if (rank !== -1 && ranks[cat][rank][cat] > 0) {
                   if (rank === 0) totalArasToReward += 20;
                   else if (rank === 1) totalArasToReward += 10;
                   else if (rank === 2) totalArasToReward += 5;
                   else if (rank === 3 || rank === 4) totalArasToReward += 2;
                }
             }

             await updateDoc(userRef, {
                lastLeaderboardRewardDate: today,
                aras: increment(totalArasToReward)
             });

             if (totalArasToReward > 0) {
                 setUserAras(prev => {
                   const newAras = prev + totalArasToReward;
                   localStorage.setItem('newara_user_aras', newAras.toString());
                   return newAras;
                 });
                 logAraTransaction(userName.trim(), totalArasToReward, 'leaderboard_reward', 'Premio por top en tabla de posiciones');
             }
             localStorage.setItem(rewardKey, today);
          }
        } catch (e) {
          console.error("Error checking daily rewards", e);
        }
      };
      // Timeout to not block initial render excessively
      const to = setTimeout(() => { checkDailyRewards(); }, 3000);
      return () => clearTimeout(to);
    }
  }, [isLoggedIn, userName, isAuthReady, auth.currentUser]);

  const [expandedUnit, setExpandedUnit] = useState<number | null>(null);
  const [activeExercise, setActiveExercise] = useState<{unitIndex: number, subjectId: string, currentQuestion: number, activityCode?: string} | null>(null);
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

  // Activity States
  const [activityCodeInput, setActivityCodeInput] = useState('');
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [currentSharedActivity, setCurrentSharedActivity] = useState<any>(null);
  const [galleryActivities, setGalleryActivities] = useState<any[]>([]);
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryFilter, setGalleryFilter] = useState<'newest' | 'oldest' | 'most_views' | 'least_views' | 'most_likes' | 'least_likes'>('newest');
  const [showGalleryFilters, setShowGalleryFilters] = useState(false);
  const [selectedActivityDetail, setSelectedActivityDetail] = useState<any>(null);
  const [showActivityMenu, setShowActivityMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState<{id: string, name: string, creatorName?: string, type?: 'announcement' | 'comment' | 'activity', classId?: string, parentId?: string} | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reports, setReports] = useState<any[]>([]);
  const [isReportsLoading, setIsReportsLoading] = useState(false);
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isTakingAction, setIsTakingAction] = useState(false);

  // Minigames Logic
  const createMinigameSession = async (activity: any, bypassConfirm = false) => {
    if (!isLoggedIn) {
      setAuthRequiredMsg("Inicia sesión para crear un servidor de minijuego y jugar con tus amigos.");
      return;
    }

    if (userAras < 15) {
      setConfirmModal({
        show: true,
        title: 'Aras Insuficientes',
        message: 'No tienes suficientes Aras para crear un servidor de minijuegos (costo: 15 Aras). Elige actividades o completa misiones para ganar más.',
        type: 'warning',
        onConfirm: () => setConfirmModal(prev => ({ ...prev, show: false }))
      });
      return;
    }

    if (!bypassConfirm) {
      setConfirmModal({
        show: true,
        title: 'Comprar servidor?',
        message: 'Crear un servidor de minijuegos cuesta 15 Aras. ¿Deseas comprar el servidor?',
        type: 'warning',
        onConfirm: () => {
          setConfirmModal(prev => ({ ...prev, show: false }));
          createMinigameSession(activity, true);
        }
      });
      return;
    }

    setIsTakingAction(true);
    try {
      const userRef = doc(db, 'users', userName.trim());
      await updateDoc(userRef, { aras: increment(-15) });
      setUserAras(prev => {
        const newAras = prev - 15;
        localStorage.setItem('newara_user_aras', newAras.toString());
        return newAras;
      });
      await logAraTransaction(userName.trim(), -15, 'server_created', 'Creaste un servidor de minijuegos');

      const generateCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < 5; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };

      const code = generateCode();
      const sessionData = {
        code,
        hostName: userName,
        activityId: activity.id,
        activity: activity,
        status: 'waiting',
        currentQuestionIndex: 0,
        timer: 15,
        lastActivityAt: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'gameSessions'), sessionData);
      setMinigameSessionId(docRef.id);
      setIsMinigameHost(true);
      navigateTo('minigames', { gameCode: code });
      setSelectedActivityDetail(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'gameSessions');
      alert("Error al crear sesión.");
    } finally {
      setIsTakingAction(false);
    }
  };

  const joinMinigameSession = async (code: string) => {
    if (!isLoggedIn) {
      setAuthRequiredMsg("Inicia sesión para unirte a partidas multijugador.");
      return;
    }
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setIsLoadingActivity(true);
    try {
      const q = query(collection(db, 'gameSessions'), where('code', '==', cleanCode), where('status', '!=', 'ended'), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        alert("Código de servidor no válido o expirado.");
        return;
      }

      const sessionDoc = querySnapshot.docs[0];
      const sessionId = sessionDoc.id;
      const sessionData = sessionDoc.data();
      
      // Inactivity check
      const lastActivity = sessionData.lastActivityAt?.toDate ? sessionData.lastActivityAt.toDate() : new Date();
      const now = new Date();
      if (now.getTime() - lastActivity.getTime() > 3 * 60 * 1000) {
        alert("El servidor ha expirado por inactividad (3 min).");
        return;
      }
      
      // Auto-join as player
      await setDoc(doc(db, 'gameSessions', sessionId, 'players', userName), {
        name: userName,
        avatar: userAvatar || null,
        score: 0,
        joinedAt: serverTimestamp()
      });

      setMinigameSessionId(sessionId);
      setIsMinigameHost(false);
      navigateTo('minigames', { gameCode: sessionData.code });
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'gameSessions');
      alert("Error al unirse.");
    } finally {
      setIsLoadingActivity(false);
    }
  };

  const leaveMinigame = () => {
    setMinigameSessionId(null);
    setMinigameSession(null);
    setMinigamePlayers([]);
    setIsMinigameHost(false);
    stopMinigameMusic();
    navigateTo('home');
  };

  const startMinigame = async () => {
    if (!isMinigameHost || !minigameSessionId) return;
    try {
      await updateDoc(doc(db, 'gameSessions', minigameSessionId), {
        status: 'playing',
        currentQuestionIndex: 0,
        timer: 15,
        questionStartTime: serverTimestamp(),
        lastActivityAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `gameSessions/${minigameSessionId}`);
    }
  };

  const nextMinigameQuestion = async () => {
    if (!isMinigameHost || !minigameSessionId || !minigameSession) return;
    const nextIndex = minigameSession.currentQuestionIndex + 1;
    const isLast = nextIndex >= minigameSession.activity.questions.length;
    
    try {
      if (isLast) {
        playCheer();
        await updateDoc(doc(db, 'gameSessions', minigameSessionId), {
          status: 'ended',
          lastActivityAt: serverTimestamp()
        });
      } else {
        try { playWhoosh(); } catch(e) {}
        await updateDoc(doc(db, 'gameSessions', minigameSessionId), {
          status: 'playing',
          currentQuestionIndex: nextIndex,
          timer: 15,
          questionStartTime: serverTimestamp(),
          lastActivityAt: serverTimestamp()
        });
        setHasAnsweredCurrentQuestion(false);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `gameSessions/${minigameSessionId}`);
    }
  };

  const submitMinigameAnswer = async (answer: string) => {
    if (hasAnsweredCurrentQuestion || !minigameSessionId || !minigameSession) return;
    
    const currentQ = minigameSession.activity.questions[minigameSession.currentQuestionIndex];
    let isCorrect = false;

    const actualCorrectAnswer = String(currentQ.correctAnswer || currentQ.correct || '');

    if (currentQ.type === 'writing' || currentQ.type === 'written') {
      const cleanAnswer = String(answer || '').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const cleanCorrect = actualCorrectAnswer.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      isCorrect = cleanAnswer === cleanCorrect;
    } else {
      isCorrect = String(answer) === actualCorrectAnswer;
    }

    if (isCorrect) {
      playSuccessSound();
    } else {
      playErrorSound();
    }
    
    const points = isCorrect ? 450 : 0;
    
    setHasAnsweredCurrentQuestion(true);
    playExternalBubble();

    try {
      await updateDoc(doc(db, 'gameSessions', minigameSessionId, 'players', userName), {
        score: increment(points),
        lastResponse: { 
          answer, 
          isCorrect, 
          points, 
          questionIndex: minigameSession.currentQuestionIndex 
        },
        isCorrect: isCorrect,
        pointsLastRound: points
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `gameSessions/${minigameSessionId}/players/${userName}`);
    }
  };

  const showMinigameResults = async () => {
    if (!isMinigameHost || !minigameSessionId) return;
    playGong();
    try {
      await updateDoc(doc(db, 'gameSessions', minigameSessionId), {
        status: 'reveal',
        lastActivityAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `gameSessions/${minigameSessionId}`);
    }
  };

  const showMinigameLeaderboard = async () => {
    if (!isMinigameHost || !minigameSessionId) return;
    try { playWhoosh(); } catch(e) {}
    try {
      await updateDoc(doc(db, 'gameSessions', minigameSessionId), {
        status: 'results',
        lastActivityAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `gameSessions/${minigameSessionId}`);
    }
  };

  // Minigames State
  const [minigameSessionId, setMinigameSessionId] = useState<string | null>(null);
  const [minigameSession, setMinigameSession] = useState<any | null>(null);
  const [minigamePlayers, setMinigamePlayers] = useState<any[]>([]);
  const [minigameJoinCode, setMinigameJoinCode] = useState('');
  const [minigameWrittenInput, setMinigameWrittenInput] = useState('');
  const [isMinigameHost, setIsMinigameHost] = useState(false);
  const [hasAnsweredCurrentQuestion, setHasAnsweredCurrentQuestion] = useState(false);
  const [minigameTimer, setMinigameTimer] = useState(15);
  const [minigameMusicPlaying, setMinigameMusicPlaying] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning';
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
  });
  const [loadingActivityDetail, setLoadingActivityDetail] = useState<string | null>(null);
  const [viewingProfile, setViewingProfile] = useState<any | null>(null);
  const [viewingProfileActivities, setViewingProfileActivities] = useState<any[]>([]);
  const [showDonateModal, setShowDonateModal] = useState<any | null>(null);
  const [donateAmount, setDonateAmount] = useState<number>(0);
  const [isDonating, setIsDonating] = useState(false);

  const handleDonateAras = async () => {
    if (!isLoggedIn || !userName || !showDonateModal || donateAmount <= 0) return;
    if (donateAmount > userAras) {
      alert("No tienes suficientes Aras para donar.");
      return;
    }
    
    setIsDonating(true);
    try {
      const myRef = doc(db, 'users', userName.trim());
      const targetId = (showDonateModal.id || showDonateModal.name || "").trim();
      if (!targetId) throw new Error("No target ID found");
      const targetRef = doc(db, 'users', targetId);
      
      const userTargetName = showDonateModal.name || targetId;
      
      await updateDoc(myRef, {
        aras: increment(-donateAmount)
      });
      await updateDoc(targetRef, {
        aras: increment(donateAmount)
      });
      
      setUserAras(prev => prev - donateAmount);
      await logAraTransaction(userName.trim(), -donateAmount, 'donacion_enviada', `Has donado a ${userTargetName}`);
      await logAraTransaction(targetId, donateAmount, 'donacion_recibida', `Recibiste donación de ${userName.trim()}`);
      
      playSuccessSound();
      setShowDonateModal(null);
      setDonateAmount(0);
      alert(`Has donado ${donateAmount} Aras a ${userTargetName}!!`);
      
    } catch (error) {
      console.error("Error donating aras:", error);
      alert("Error al donar Aras.");
    } finally {
      setIsDonating(false);
    }
  };

  const [showProgramModal, setShowProgramModal] = useState(false);
  const [selectedProgramSubject, setSelectedProgramSubject] = useState<any>(null);
  const [expandedProgramUnits, setExpandedProgramUnits] = useState<Set<number>>(new Set());
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [loadingLikes, setLoadingLikes] = useState<Set<string>>(new Set());
  const [activityQuestions, setActivityQuestions] = useState([
    { type: 'multiple-choice', question: '', options: ['', '', '', ''], correct: 0 as number | string },
    { type: 'multiple-choice', question: '', options: ['', '', '', ''], correct: 0 as number | string },
    { type: 'multiple-choice', question: '', options: ['', '', '', ''], correct: 0 as number | string }
  ]);

  const addQuestion = () => {
    setActivityQuestions([...activityQuestions, { type: 'multiple-choice', question: '', options: ['', '', '', ''], correct: 0 as number | string }]);
  };

  const removeQuestion = (index: number) => {
    if (activityQuestions.length > 1) {
      setActivityQuestions(activityQuestions.filter((_, i) => i !== index));
    }
  };

  const addOption = (qIdx: number) => {
    const newQs = [...activityQuestions];
    if (newQs[qIdx].options.length < 6) {
      newQs[qIdx].options = [...newQs[qIdx].options, ''];
      setActivityQuestions(newQs);
      playExternalBubble();
    }
  };

  const removeOption = (qIdx: number, optIdx: number) => {
    const newQs = [...activityQuestions];
    if (newQs[qIdx].options.length > 2) {
      const currentOptions = [...newQs[qIdx].options];
      currentOptions.splice(optIdx, 1);
      newQs[qIdx].options = currentOptions;
      
      // Adjust correct index
      const currentCorrect = newQs[qIdx].correct as number;
      if (currentCorrect === optIdx) {
        newQs[qIdx].correct = 0;
      } else if (currentCorrect > optIdx) {
        newQs[qIdx].correct = currentCorrect - 1;
      }
      
      setActivityQuestions(newQs);
      playErrorSound();
    }
  };
  const [activityName, setActivityName] = useState('');
  const [newActivityCode, setNewActivityCode] = useState('');
  // Security: Ensure isModerator requires isLoggedIn
  const isModerator = isLoggedIn && MODERATORS.includes((userName || '').trim()) && isModAuthorized;
  const isClaudia = isLoggedIn && (userName || '').trim().toLowerCase() === 'claudia';
  
  // History State
  const [activityHistory, setActivityHistory] = useState<{code: string, name: string, date: number}[]>(() => {
    const saved = localStorage.getItem('newara_activity_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('newara_activity_history', JSON.stringify(activityHistory));
  }, [activityHistory]);

  const addToHistory = (code: string, name: string) => {
    setActivityHistory(prev => {
      // Remove if already exists and add to top
      const filtered = prev.filter(item => item.code !== code);
      return [{ code, name, date: Date.now() }, ...filtered].slice(0, 5); // Keep last 5
    });
  };

  // Real Progress State
  const [completedUnits, setCompletedUnits] = useState<string[]>(() => {
    const saved = localStorage.getItem('newara_completed_units');
    return saved ? JSON.parse(saved) : [];
  });

  const totalUnitsCount = SUBJECTS.reduce((acc, s) => acc + s.units.length, 0);
  const globalProgress = totalUnitsCount > 0 
    ? Math.round((completedUnits.length / totalUnitsCount) * 100) 
    : 0;
  
  const currentLevel = Math.floor(globalProgress / 10) + 1;

  useEffect(() => {
    localStorage.setItem('newara_completed_units', JSON.stringify(completedUnits));
  }, [completedUnits]);

  const markUnitAsCompleted = async (subjectId: string, unitIndex: number, activityCode?: string) => {
    const unitKey = activityCode ? `shared-${activityCode}` : `${subjectId}-${unitIndex}`;
    if (!completedUnits.includes(unitKey)) {
      setCompletedUnits(prev => [...prev, unitKey]);
      incrementUserStat(userName, 'totalCorrect', 1);

      // Sync to cloud
      if (isLoggedIn && userName !== 'Estudiante') {
        try {
          const userRef = doc(db, 'users', userName.trim());
          await updateDoc(userRef, {
            completedUnits: arrayUnion(unitKey)
          });
        } catch (e) {
          console.error("Sync error", e);
        }
      }
    }
  };

  const incrementUserStat = async (userNameToUpdate: string, stat: 'totalViews' | 'totalLikes' | 'totalCorrect', amount: number = 1) => {
    if (isOffline || !userNameToUpdate) return;
    try {
      const userRef = doc(db, 'users', userNameToUpdate.trim());
      // Use increment for atomic updates
      await updateDoc(userRef, {
        [`stats.${stat}`]: increment(amount)
      });
    } catch (error) {
      // If doc doesn't exist, it might fail. For now, we assume user docs are created on profile save.
      // We could add a check but updateDoc is faster if it exists.
    }
  };

  useEffect(() => {
    if (currentView === 'gallery' || (currentView === 'minigames' && userRole === 'Profesor')) {
      fetchGallery();
    }
  }, [currentView, userRole]);

  const fetchReports = async () => {
    if (!isModerator) return;
    setIsReportsLoading(true);
    try {
      const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const reportsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(reportsData);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsReportsLoading(false);
    }
  };

  const handleIgnoreReport = async (reportId: string) => {
    if (!isModerator) return;
    
    setConfirmModal({
      show: true,
      title: '¿Ignorar Reporte?',
      message: '¿Estás seguro de que deseas ignorar este reporte? La actividad permanecerá pública y el reporte será eliminado.',
      type: 'warning',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
        try {
          await deleteDoc(doc(db, 'reports', reportId));
          setReports(prev => prev.filter(r => r.id !== reportId));
          playSuccessSound();
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `reports/${reportId}`);
        }
      }
    });
  };

  const handleTakeActionReport = (report: any) => {
    // Already handled directly in UI now
  };

  const handleViewProfile = async (creatorId: string, creatorName?: string, activityFallback?: any) => {
    if (!creatorId && !creatorName) return;
    
    setIsProfileLoading(true);
    // Prefer activity detail modal closure if opening profile
    setSelectedActivityDetail(null);

    try {
      let userData: any = null;
      let activities: any[] = [];

      // 1. Try to fetch user data with multiple possible IDs
      // Try UID first, then creatorName
      const possibleIds = Array.from(new Set([creatorId, creatorName, activityFallback?.creatorId])).filter(Boolean);
      
      for (const id of possibleIds) {
        if (!userData) {
          const userSnap = await getDoc(doc(db, 'users', id!));
          if (userSnap.exists()) {
            userData = { id: userSnap.id, ...userSnap.data() };
          }
        }
      }

      // 2. Fetch activities by this user (trying multiple fields for compatibility)
      // We try searching by creatorId first
      if (creatorId || activityFallback?.creatorId) {
        const qId = query(
          collection(db, 'activities'), 
          where('creatorId', '==', creatorId || activityFallback?.creatorId),
          limit(30)
        );
        const snapId = await getDocs(qId);
        snapId.forEach(doc => activities.push({ id: doc.id, ...doc.data() }));
      }

      // If we found nothing, try searching by creatorName (for old activities)
      if (activities.length === 0 && (creatorName || activityFallback?.creatorName)) {
        const qName = query(
          collection(db, 'activities'),
          where('creatorName', '==', creatorName || activityFallback?.creatorName),
          limit(30)
        );
        const snapName = await getDocs(qName);
        snapName.forEach(doc => {
          if (!activities.find(a => a.id === doc.id)) {
            activities.push({ id: doc.id, ...doc.data() });
          }
        });
      }

      // 3. Fallback/Synthetic user if doc doesn't exist
      if (!userData) {
        // Try to recover bio/avatar from the activity that triggered this view
        const fallbackBio = activityFallback?.creatorBio || localStorage.getItem('newara_user_bio') || "Este usuario aún no ha configurado su biografía.";
        const fallbackAvatar = activityFallback?.creatorAvatar || "";
        const fallbackRole = activityFallback?.creatorRole || "Usuario de NewAra";
        const fallbackIsHelper = activityFallback?.creatorIsHelper || false;
        
        userData = {
          id: creatorId || creatorName || 'explorador',
          name: creatorName || creatorId || 'Explorador',
          bio: fallbackBio,
          avatar: fallbackAvatar,
          role: fallbackRole,
          isHelper: fallbackIsHelper,
          stats: {
            totalViews: activities.reduce((acc, curr) => acc + (curr.views || 0), 0),
            totalLikes: activities.reduce((acc, curr) => acc + (curr.likes?.length || 0), 0),
            totalCorrect: 0
          }
        };
      } else {
        // Ensure name exists if it's not in the object
        if (!userData.name) userData.name = userData.id || creatorName || creatorId || 'Explorador';
        
        // Aggregate correct answers from completedUnits and stats (matching leaderboard logic)
        const completedCount = userData.completedUnits?.length || 0;
        const statsCorrect = userData.stats?.totalCorrect || 0;
        
        if (!userData.stats) userData.stats = { totalViews: 0, totalLikes: 0, totalCorrect: 0 };
        userData.stats.totalCorrectAggregated = completedCount + statsCorrect;
      }

      setViewingProfile(userData);
      setViewingProfileActivities(activities);
    } catch (error) {
      console.error("Error viewing profile:", error);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleDeleteTargetAndReport = async (report: any) => {
    if (!isModerator) return;
    
    const targetId = report.targetId || report.contentId || report.activityId;
    const targetType = report.targetType || report.contentType || 'activity';
    const classId = report.classId;

    if (!targetId) {
      alert("Error: No se encontró el ID del contenido a eliminar.");
      return;
    }

    if (targetType === 'announcement' && !classId) {
      alert("Error: Faltan datos (classId) para eliminar este anuncio.");
      return;
    }

    setConfirmModal({
      show: true,
      title: '¿ELIMINAR CONTENIDO?',
      message: `Esta acción es irreversible. Se eliminará el/la ${targetType} de forma permanente.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
        setIsTakingAction(true);
        try {
          if (targetType === 'activity') {
            await deleteDoc(doc(db, 'activities', targetId));
          } else if (targetType === 'announcement') {
            await deleteDoc(doc(db, 'classes', classId, 'announcements', targetId));
          } else if (targetType === 'comment') {
            const parentId = report.parentId;
            if (parentId) {
               await deleteDoc(doc(db, 'classes', classId, 'announcements', parentId, 'comments', targetId));
            } else {
               throw new Error("Missing parentId for comment deletion");
            }
          } else if (targetType === 'chat-message') {
            await deleteDoc(doc(db, 'classes', classId, 'messages', targetId));
          }
          
          // Eliminar el reporte solo si la eliminación del contenido funcionó (o no arrojó error)
          await deleteDoc(doc(db, 'reports', report.id));
          setReports(prev => prev.filter(r => r.id !== report.id));
          
          if (targetType === 'activity') {
            setGalleryActivities(prev => prev.filter(a => a.id !== targetId));
          }
          
          playSuccessSound();
          alert("Eliminado con éxito.");
        } catch (error) {
          console.error("Error deleting target:", error);
          alert("Hubo un error al eliminar el contenido. Es posible que ya no exista o haya un problema de permisos.");
        } finally {
          setIsTakingAction(false);
        }
      }
    });
  };

  const deleteUserAndReport = async (report: any) => {
    if (!isModerator) return;
    
    const targetId = report.targetId || report.contentId || report.activityId;
    const targetType = report.targetType || report.contentType || 'activity';
    let creatorToDelete = report.creatorName || report.authorName;
    
    if (!creatorToDelete && targetId && targetType === 'activity') {
        try {
          const actDoc = await getDoc(doc(db, 'activities', targetId));
          if (actDoc.exists()) {
            creatorToDelete = actDoc.data().creatorName;
          }
        } catch (error) {
          console.error("Error fetching activity for creator:", error);
        }
    }

    if (!creatorToDelete) {
      alert("No se pudo identificar al usuario creador.");
      return;
    }

    setConfirmModal({
      show: true,
      title: '¿BANEAR USUARIO?',
      message: `¿Estás seguro de que deseas ELIMINAR a ${creatorToDelete}? Esta acción es irreversible y borrará su cuenta y su contenido.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
        setIsTakingAction(true);
        try {
          // 1. Add to blacklist
          await setDoc(doc(db, 'banned_users', creatorToDelete), {
            bannedAt: serverTimestamp(),
            bannedBy: userName
          });

          // 2. Delete the user document
          await deleteDoc(doc(db, 'users', creatorToDelete));
          
          if (targetId) {
            if (report.contentType === 'activity') {
              await deleteDoc(doc(db, 'activities', targetId));
            }
          }
          await deleteDoc(doc(db, 'reports', report.id));
          
          setReports(prev => prev.filter(r => r.id !== report.id));
          if (targetId && report.contentType === 'activity') {
            setGalleryActivities(prev => prev.filter(a => a.id !== targetId));
          }
          
          playSuccessSound();
          alert(`Usuario ${creatorToDelete} eliminado con éxito.`);
        } catch (error) {
          console.error("Error eliminando usuario:", error);
          alert("Hubo un error al eliminar al usuario.");
        } finally {
          setIsTakingAction(false);
        }
      }
    });
  };

  // Minigame Synchronization
  useEffect(() => {
    if (!minigameSessionId) return;

    const sessionRef = doc(db, 'gameSessions', minigameSessionId);
    const unsubscribeSession = onSnapshot(sessionRef, (docSnap: any) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMinigameSession({ id: docSnap.id, ...data });
        
        // Timer local sync
        if (data.status === 'playing') {
          if (data.timer !== minigameTimer && data.timer <= 5 && data.timer > 0) {
            playTick();
          }
          setMinigameTimer(data.timer);
        }
      } else {
        leaveMinigame();
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `gameSessions/${minigameSessionId}`);
    });

    const playersRef = collection(db, 'gameSessions', minigameSessionId, 'players');
    const unsubscribePlayers = onSnapshot(query(playersRef, orderBy('score', 'desc')), (snapshot: any) => {
      const players = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      setMinigamePlayers(players);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `gameSessions/${minigameSessionId}/players`);
    });

    return () => {
      unsubscribeSession();
      unsubscribePlayers();
    };
  }, [minigameSessionId]);

  useEffect(() => {
    if (minigameSession?.status === 'ended' && userName && !isMinigameHost) {
      const rewardKey = `reward_${minigameSessionId}`;
      if (!sessionStorage.getItem(rewardKey)) {
        const myRankIndex = minigamePlayers.findIndex(p => p.name === userName);
        if (myRankIndex !== -1) {
          let reward = 0;
          if (myRankIndex === 0) reward = 30;
          else if (myRankIndex === 1) reward = 15;
          else if (myRankIndex === 2) reward = 5;
          else reward = 2; // Participating or below top 3
          
          if (reward > 0) {
            const userRef = doc(db, 'users', userName.trim());
            updateDoc(userRef, { aras: increment(reward) }).catch(console.error);
            setUserAras(prev => {
              const newAras = prev + reward;
              localStorage.setItem('newara_user_aras', newAras.toString());
              return newAras;
            });
            logAraTransaction(userName.trim(), reward, 'minigame_reward', 'Recompensa por jugar minijuego');
          }
        }
        sessionStorage.setItem(rewardKey, 'true');
      }
    }
  }, [minigameSession?.status, minigamePlayers, userName, isMinigameHost, minigameSessionId]);

  // Handle music and sounds
  useEffect(() => {
    if (minigameSession?.currentQuestionIndex !== undefined) {
      setHasAnsweredCurrentQuestion(false);
      setMinigameWrittenInput('');
    }
  }, [minigameSession?.currentQuestionIndex]);

  useEffect(() => {
    if (minigameSession?.status === 'playing') {
      playMinigameMusic();
      setMinigameMusicPlaying(true);
    } else if (minigameSession?.status === 'results' || minigameSession?.status === 'reveal' || minigameSession?.status === 'ended') {
      stopMinigameMusic();
      setMinigameMusicPlaying(false);
      if (minigameSession?.status === 'results' || minigameSession?.status === 'reveal') {
        playGong();
      }
    } else {
      stopMinigameMusic();
      setMinigameMusicPlaying(false);
    }
  }, [minigameSession?.status]);

  // Host Timer Tick
  useEffect(() => {
    if (!isMinigameHost || !minigameSessionId || minigameSession?.status !== 'playing') return;

    const interval = setInterval(async () => {
      if (minigameSession.timer > 0) {
        const nextTimer = minigameSession.timer - 1;
        await updateDoc(doc(db, 'gameSessions', minigameSessionId), {
          timer: nextTimer
        });
        if (nextTimer === 0) {
          showMinigameResults();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isMinigameHost, minigameSessionId, minigameSession?.status, minigameSession?.timer]);

  // Auto-advance minigame if everyone has answered
  useEffect(() => {
    if (!isMinigameHost || !minigameSessionId || !minigameSession || minigameSession.status !== 'playing') return;
    
    const playersCount = minigamePlayers.length;
    if (playersCount === 0) return;
    
    const currentQIdx = minigameSession.currentQuestionIndex;
    const answeredCount = minigamePlayers.filter(p => 
      p.lastResponse && p.lastResponse.questionIndex === currentQIdx
    ).length;
    
    if (answeredCount >= playersCount) {
      showMinigameResults();
    }
  }, [isMinigameHost, minigameSessionId, minigameSession?.status, minigameSession?.currentQuestionIndex, minigamePlayers.length, minigamePlayers]);

  // Auto-advance from Reveal to Results after 5 seconds
  useEffect(() => {
    if (!isMinigameHost || !minigameSessionId || !minigameSession || minigameSession.status !== 'reveal') return;
    
    const timer = setTimeout(() => {
      showMinigameLeaderboard();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [isMinigameHost, minigameSessionId, minigameSession?.status]);

  const fetchUserClasses = async () => {
    if (!isLoggedIn || !isAuthReady || !auth.currentUser) return;
    setIsClassesLoading(true);
    try {
      const ownedQuery = query(collection(db, 'classes'), where('ownerName', '==', userName.trim()));
      const ownedSnap = await getDocs(ownedQuery);
      const owned = ownedSnap.docs.map(d => ({ id: d.id, ...d.data(), isOwner: true }));

      const userDoc = await getDoc(doc(db, 'users', userName.trim()));
      const joinedIds = userDoc.exists() ? (userDoc.data().joinedClasses || []) : [];
      
      const joinedClasses: any[] = [];
      for (const id of joinedIds) {
        if (owned.find(o => (o as any).id === id)) continue;
        const cDoc = await getDoc(doc(db, 'classes', id));
        if (cDoc.exists()) {
          joinedClasses.push({ id: cDoc.id, ...cDoc.data(), isOwner: false });
        }
      }

      setUserClasses([...owned, ...joinedClasses]);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'classes');
      console.error("Error fetching classes:", error);
    } finally {
      setIsClassesLoading(false);
    }
  };

  const fetchPendingTasks = async () => {
    if (!isLoggedIn || userClasses.length === 0) return;
    setIsPendingTasksLoading(true);
    try {
      const allPending: any[] = [];
      for (const cls of userClasses) {
        if (cls.isArchived) continue;
        const assSnap = await getDocs(collection(db, 'classes', cls.id, 'assignments'));
        const assignments = assSnap.docs.map(d => ({ id: d.id, ...d.data(), classId: cls.id, className: cls.name }));
        
        for (const ass of assignments) {
          const subSnap = await getDocs(query(
            collection(db, 'classes', cls.id, 'assignments', ass.id, 'submissions'),
            where('studentName', '==', userName)
          ));
          if (subSnap.empty) {
            allPending.push(ass);
          }
        }
      }
      setPendingTasks(allPending.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      }));
    } catch (e) {
      console.error("Error fetching pending tasks:", e);
    } finally {
      setIsPendingTasksLoading(false);
    }
  };

  const createClass = async (name: string, description: string) => {
    if (!isLoggedIn) {
      setAuthRequiredMsg("Inicia sesión para crear y gestionar tus propias clases.");
      return;
    }
    if (userRole !== 'Profesor') return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      const newClass = {
        name,
        description,
        code,
        ownerName: userName,
        createdAt: serverTimestamp(),
        isArchived: false,
        themeColor: ['blue', 'purple', 'green', 'amber', 'rose'][Math.floor(Math.random() * 5)]
      };
      const docRef = await addDoc(collection(db, 'classes'), newClass);
      
      await setDoc(doc(db, 'classes', docRef.id, 'members', userName.trim()), {
        userName,
        joinedAt: serverTimestamp(),
        role: 'Profesor'
      });

      await updateDoc(doc(db, 'users', userName.trim()), {
        joinedClasses: arrayUnion(docRef.id)
      });

      fetchUserClasses();
      setShowCreateClassModal(false);
      playSuccessSound();
    } catch (error) {
      console.error("Error creating class:", error);
    }
  };

  const joinClass = async (code: string) => {
    if (!isLoggedIn) {
      setAuthRequiredMsg("Inicia sesión para unirte a clases con código.");
      return;
    }
    try {
      const q = query(collection(db, 'classes'), where('code', '==', code.trim().toUpperCase()));
      const snap = await getDocs(q);
      if (snap.empty) {
        alert("Código de clase no válido.");
        return;
      }
      const classData = snap.docs[0];
      const classId = classData.id;

      await setDoc(doc(db, 'classes', classId, 'members', userName.trim()), {
        userName,
        joinedAt: serverTimestamp(),
        role: userRole
      });

      await updateDoc(doc(db, 'users', userName.trim()), {
        joinedClasses: arrayUnion(classId)
      });

      fetchUserClasses();
      setShowJoinClassModal(false);
      playSuccessSound();
      alert(`¡Te has unido a: ${classData.data().name}!`);
    } catch (error) {
      console.error("Error joining class:", error);
    }
  };

  const leaveClass = async (classId: string) => {
    if (!isLoggedIn) return;
    try {
      await deleteDoc(doc(db, 'classes', classId, 'members', userName.trim()));
      await updateDoc(doc(db, 'users', userName.trim()), {
        joinedClasses: arrayRemove(classId)
      });
      fetchUserClasses();
      setCurrentView('classes');
      setActiveClass(null);
    } catch (error) {
      console.error("Error leaving class:", error);
    }
  };

  const archiveClassAction = async (classId: string) => {
    if (!isLoggedIn || activeClass?.ownerName !== userName) return;
    try {
      await updateDoc(doc(db, 'classes', classId), { isArchived: true });
      fetchUserClasses();
      setCurrentView('classes');
      setActiveClass(null);
      alert("Clase archivada correctamente.");
    } catch (error) {
      console.error("Error archiving class:", error);
    }
  };

  const postAnnouncement = async (classId: string, content: string, attachment?: any) => {
    if (!isLoggedIn) {
      setAuthRequiredMsg("Inicia sesión para publicar novedades en esta clase.");
      return;
    }
    try {
      await addDoc(collection(db, 'classes', classId, 'announcements'), {
        authorName: userName,
        authorAvatar: userAvatar,
        content,
        attachment: attachment || null,
        createdAt: serverTimestamp(),
        isDraft: false,
        commentsCount: 0
      });
      fetchClassDetails(classId);
      const cls = userClasses.find(c => c.id === classId);
      if (cls) {
        notifyClassMembers(classId, cls.name, t('nuevoAnuncio'), content.substring(0, 60) + (content.length > 60 ? '...' : ''), 'announcement', `/classes/${classId}`);
      }
      playSuccessSound();
    } catch (error) {
      console.error("Error posting announcement:", error);
    }
  };

  const postMessage = async (classId: string, content: string) => {
    if (!isLoggedIn) {
      setAuthRequiredMsg("Inicia sesión para participar en el chat grupal de la clase.");
      return;
    }
    if (!content.trim()) return;
    const path = `classes/${classId}/messages`;
    try {
      await addDoc(collection(db, path), {
        authorName: userName,
        content: content.trim(),
        createdAt: serverTimestamp()
      });
      playWaterDrop();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const postComment = async (classId: string, announcementId: string, content: string) => {
    if (!isLoggedIn) {
      setAuthRequiredMsg("Inicia sesión para comentar en las publicaciones.");
      return;
    }
    try {
      await addDoc(collection(db, 'classes', classId, 'announcements', announcementId, 'comments'), {
        authorName: userName,
        authorAvatar: userAvatar,
        content,
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'classes', classId, 'announcements', announcementId), {
        commentsCount: increment(1)
      });
      fetchClassDetails(classId);
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const createAssignment = async (classId: string, title: string, description: string, dueDate: string, attachments?: any[]) => {
    if (!isLoggedIn) {
      setAuthRequiredMsg("Inicia sesión para crear tareas para tus alumnos.");
      return;
    }
    if (userRole !== 'Profesor') return;
    try {
      await addDoc(collection(db, 'classes', classId, 'assignments'), {
        classId,
        title,
        description,
        dueDate,
        attachments: attachments || [],
        createdAt: serverTimestamp()
      });
      fetchClassDetails(classId);
      const cls = userClasses.find(c => c.id === classId);
      if (cls) {
        notifyClassMembers(classId, cls.name, t('nuevaTarea'), title, 'assignment', `/classes/${classId}`);
      }
      playSuccessSound();
      alert("Tarea publicada con éxito.");
    } catch (error) {
      console.error("Error creating assignment:", error);
    }
  };

  const submitTask = async (assignmentId: string, attachment: any) => {
    if (!isLoggedIn) {
      setAuthRequiredMsg("Inicia sesión para realizar tus tareas y llevar un seguimiento de tu progreso.");
      return;
    }
    if (!activeClass) return;
    try {
      await addDoc(collection(db, 'classes', activeClass.id, 'assignments', assignmentId, 'submissions'), {
        assignmentId,
        studentName: userName,
        studentAvatar: userAvatar,
        attachment,
        submittedAt: serverTimestamp(),
        grade: null,
        feedback: ""
      });
      fetchClassDetails(activeClass.id);
      playSuccessSound();
      alert("¡Tarea entregada con éxito!");
    } catch (error) {
       console.error("Error submitting task:", error);
    }
  };

  const shareResourceCode = async (classId: string, title: string, code: string) => {
    if (!isLoggedIn || userRole !== 'Profesor') return;
    try {
      await addDoc(collection(db, 'classes', classId, 'resources'), {
        title,
        code,
        createdAt: serverTimestamp()
      });
      fetchClassDetails(classId);
    } catch (error) {
      console.error("Error sharing resource:", error);
    }
  };


  const editAnnouncement = async (classId: string, annId: string, content: string) => {
    if (!isLoggedIn || !content.trim()) return;
    try {
      await updateDoc(doc(db, 'classes', classId, 'announcements', annId), {
        content: content.trim(),
        updatedAt: serverTimestamp()
      });
      fetchClassDetails(classId);
      playSuccessSound();
    } catch (error) {
      console.error("Error editing announcement:", error);
    }
  };

  const editComment = async (classId: string, annId: string, commId: string, content: string) => {
    if (!isLoggedIn || !content.trim()) return;
    try {
      await updateDoc(doc(db, 'classes', classId, 'announcements', annId, 'comments', commId), {
        content: content.trim(),
        updatedAt: serverTimestamp()
      });
      fetchClassDetails(classId);
      playSuccessSound();
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const deleteAnnouncement = async (classId: string, annId: string) => {
    if (!isLoggedIn || !classId || !annId) return;
    setConfirmModal({
      show: true,
      title: '¿Eliminar Anuncio?',
      message: 'Esta acción no se puede deshacer. El anuncio y sus comentarios desaparecerán.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'classes', classId, 'announcements', annId));
          fetchClassDetails(classId);
          playSuccessSound();
          setConfirmModal(prev => ({ ...prev, show: false }));
        } catch (error) {
          console.error("Error deleting announcement:", error);
        }
      }
    });
  };

  const deleteComment = async (classId: string, annId: string, commId: string) => {
    if (!isLoggedIn) return;
    setConfirmModal({
      show: true,
      title: '¿Eliminar Comentario?',
      message: '¿Estás seguro de que quieres borrar este comentario?',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'classes', classId, 'announcements', annId, 'comments', commId));
          await updateDoc(doc(db, 'classes', classId, 'announcements', annId), {
            commentsCount: increment(-1)
          });
          fetchClassDetails(classId);
          playSuccessSound();
          setConfirmModal(prev => ({ ...prev, show: false }));
        } catch (error) {
          console.error("Error deleting comment:", error);
        }
      }
    });
  }

  const reportAbuse = async (type: 'announcement' | 'comment' | 'activity' | 'chat-message', id: string, content: string, authorName: string, classId?: string, parentId?: string) => {
    if (!isLoggedIn) {
      setAuthRequiredMsg("Inicia sesión para denunciar contenido inapropiado y ayudarnos a mantener la comunidad segura.");
      return;
    }
    setShowReportModal({ id, name: content, creatorName: authorName, type, classId, parentId });
  };

  const submitReport = async () => {
    if (!showReportModal || !reportReason.trim()) return;
    setIsReporting(true);
    try {
      await addDoc(collection(db, 'reports'), {
        targetType: showReportModal.type || 'activity',
        targetId: showReportModal.id,
        targetName: showReportModal.name.substring(0, 500),
        creatorName: showReportModal.creatorName || 'Anónimo',
        classId: showReportModal.classId || "",
        parentId: showReportModal.parentId || "",
        reporterName: userName,
        reason: reportReason.trim(),
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      setIsReporting(false);
      setShowReportModal(null);
      setReportReason('');
      playSuccessSound();
      setConfirmModal({
        show: true,
        title: 'Reporte Enviado',
        message: 'Gracias por ayudar a mantener la comunidad segura. Revisaremos tu denuncia pronto.',
        type: 'warning',
        onConfirm: () => setConfirmModal(prev => ({ ...prev, show: false }))
      });
    } catch (error) {
      console.error("Error reporting abuse:", error);
      setIsReporting(false);
      alert("Error al enviar la denuncia.");
    }
  };

  const fetchClassDetails = async (classId: string) => {
    try {
      const annQ = query(collection(db, 'classes', classId, 'announcements'), orderBy('createdAt', 'desc'));
      const annSnap = await getDocs(annQ);
      const rawAnnouncements = annSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Fetch comments for each announcement
      const rawComments: Record<string, any[]> = {};
      for (const ann of rawAnnouncements) {
        const commQ = query(collection(db, 'classes', classId, 'announcements', ann.id, 'comments'), orderBy('createdAt', 'asc'));
        const commSnap = await getDocs(commQ);
        rawComments[ann.id] = commSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      }

      const memSnap = await getDocs(collection(db, 'classes', classId, 'members'));
      const rawMembers = memSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const assQ = query(collection(db, 'classes', classId, 'assignments'), orderBy('createdAt', 'desc'));
      const assSnap = await getDocs(assQ);
      const rawAssignments = assSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const rawSubmissions: any[] = [];
      for (const ass of rawAssignments) {
        const subSnap = await getDocs(collection(db, 'classes', classId, 'assignments', ass.id, 'submissions'));
        subSnap.docs.forEach(doc => rawSubmissions.push({ id: doc.id, ...doc.data(), assignmentId: ass.id }));
      }

      // Collect all unique users whose avatars we need to fetch
      const namesToFetch = new Set<string>();
      rawMembers.forEach((m: any) => namesToFetch.add(m.id || m.name));
      rawAnnouncements.forEach((a: any) => namesToFetch.add(a.authorName));
      Object.values(rawComments).flat().forEach((c: any) => namesToFetch.add(c.authorName));
      rawSubmissions.forEach((s: any) => namesToFetch.add(s.studentName));
      
      const profileMap: Record<string, { avatar: string, isHelper: boolean }> = {};
      await Promise.all(Array.from(namesToFetch).filter(Boolean).map(async (name) => {
        try {
          const userDoc = await getDoc(doc(db, 'users', name.trim()));
          if (userDoc.exists()) {
            const data = userDoc.data();
            profileMap[name] = { 
              avatar: data.avatar || '', 
              isHelper: data.isHelper || false 
            };
          }
        } catch (e) {
          console.error(`Error fetching profile for ${name}:`, e);
        }
      }));

      // Enrich everything
      const enrichedAnnouncements = rawAnnouncements.map((a: any) => ({
        ...a,
        authorAvatar: profileMap[a.authorName]?.avatar || a.authorAvatar
      }));

      const enrichedComments: Record<string, any[]> = {};
      Object.entries(rawComments).forEach(([annId, comms]) => {
        enrichedComments[annId] = comms.map((c: any) => ({
          ...c,
          authorAvatar: profileMap[c.authorName]?.avatar || c.authorAvatar
        }));
      });

      const enrichedMembers = rawMembers.map((m: any) => {
        const profile = profileMap[m.id || m.name];
        return { 
          ...m, 
          name: m.name || m.id,
          avatar: profile?.avatar || m.avatar,
          isHelper: profile?.isHelper || m.isHelper || false
        };
      });

      const enrichedSubmissions = rawSubmissions.map((s: any) => ({
        ...s,
        studentAvatar: profileMap[s.studentName]?.avatar || s.studentAvatar
      }));

      setClassAnnouncements(enrichedAnnouncements);
      setAnnouncementComments(enrichedComments);
      setClassMembers(enrichedMembers);
      setClassAssignments(rawAssignments);
      setClassSubmissions(enrichedSubmissions);

      const resQ = query(collection(db, 'classes', classId, 'resources'), orderBy('createdAt', 'desc'));
      const resSnap = await getDocs(resQ);
      setClassResources(resSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error fetching class details:", error);
    }
  };

  const fetchNotifications = async () => {
    if (!isLoggedIn || !userName || userName === 'Estudiante' || !isAuthReady || !auth.currentUser) return;
    try {
      const q = query(
        collection(db, 'notifications'), 
        where('userId', '==', userName), 
        orderBy('createdAt', 'desc'), 
        limit(20)
      );
      const querySnapshot = await getDocs(q);
      const notifs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      
      // Check for new unread notifications to trigger native alert
      const unreadCount = notifs.filter(n => !n.isRead).length;
      const prevUnreadCount = notifications.filter(n => !n.isRead).length;
      
      if (unreadCount > prevUnreadCount && "Notification" in window && Notification.permission === "granted") {
        const newNotif = notifs.find(n => !n.isRead && !notifications.some(on => on.id === n.id));
        if (newNotif) {
          new Notification(newNotif.title, {
            body: newNotif.message,
            icon: '/favicon.ico'
          });
        }
      }

      setNotifications(notifs);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const batch: any[] = [];
      notifications.filter(n => !n.isRead).forEach(n => {
        batch.push(updateDoc(doc(db, 'notifications', n.id), { isRead: true }));
      });
      await Promise.all(batch);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notifications/${id}`);
    }
  };

  const createNotification = async (userId: string, title: string, message: string, type: NotificationType, link?: string) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        title,
        message,
        type,
        link: link || "",
        isRead: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  const notifyClassMembers = async (classId: string, className: string, title: string, message: string, type: NotificationType, link: string) => {
    try {
      const memSnap = await getDocs(collection(db, 'classes', classId, 'members'));
      const members = memSnap.docs.map(doc => doc.id);
      
      const batch = members.filter(m => m !== userName).map((memberId) => 
        createNotification(memberId, `${className}: ${title}`, message, type, link)
      );
      await Promise.all(batch);
    } catch (error) {
      console.error("Error notifying class members:", error);
    }
  };

  useEffect(() => {
    if (selectedActivityDetail && selectedActivityDetail.id) {
       trackActivityView(selectedActivityDetail.id, selectedActivityDetail.creatorName);
    }
  }, [selectedActivityDetail]);

  const fetchGallery = async () => {
    setIsGalleryLoading(true);
    try {
      const q = query(collection(db, 'activities'), orderBy('createdAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      const activitiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get unique creators to fetch their latest avatars
      const creatorNames = Array.from(new Set(activitiesData.map((a: any) => a.creatorName).filter(Boolean)));
      
      // Fetch avatars in chunks or individually (since limit is 50, it's manageable)
      const avatarMap: Record<string, string> = {};
      await Promise.all(creatorNames.map(async (name: any) => {
        try {
          const userDoc = await getDoc(doc(db, 'users', name));
          if (userDoc.exists()) {
            avatarMap[name] = userDoc.data().avatar || '';
          }
        } catch (e) {
          console.error(`Error fetching avatar for ${name}:`, e);
        }
      }));

      // Map activities with fresh avatars
      const enrichedActivities = activitiesData.map((a: any) => ({
        ...a,
        creatorAvatar: avatarMap[a.creatorName] !== undefined ? avatarMap[a.creatorName] : a.creatorAvatar
      }));

      setGalleryActivities(enrichedActivities);
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      setIsGalleryLoading(false);
    }
  };

  const handleDeleteActivity = async (id: string, e: React.MouseEvent, creatorName?: string, activityTitle?: string, creatorId?: string) => {
    e.stopPropagation();
    const canDelete = isModerator || 
      (creatorName?.trim().toLowerCase() === userName?.trim().toLowerCase()) ||
      (creatorId?.trim().toLowerCase() === userName?.trim().toLowerCase());
    if (!canDelete) return;

    setConfirmModal({
      show: true,
      title: '¿Eliminar Actividad?',
      message: '¿Estás seguro de que deseas eliminar esta actividad? No se podrá recuperar.',
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
        try {
          await deleteDoc(doc(db, 'activities', id));
          if (isModerator && creatorName && creatorName !== userName) {
            createNotification(
              creatorName, 
              t('contenidoEliminado'), 
              `Tu contenido "${activityTitle || id}" ha sido eliminado por moderación.`, 
              'moderation'
            );
          }
          setGalleryActivities(prev => prev.filter(a => a.id !== id));
          playSuccessSound();
        } catch (error) {
           handleFirestoreError(error, OperationType.DELETE, `activities/${id}`);
        }
      }
    });
  };

  const handleEditActivity = async (activity: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const canEdit = isModerator || 
      (activity.creatorName?.trim().toLowerCase() === userName?.trim().toLowerCase()) || 
      (activity.creatorId?.trim().toLowerCase() === userName?.trim().toLowerCase());
    if (!canEdit) return;

    setSelectedActivityDetail(null);
    setEditingActivityId(activity.id);
    setActivityName(activity.name);
    
    // Map questions back to the creator format
    const mappedQuestions = (activity.questions || []).filter(Boolean).map((q: any) => {
      let correctIdx = q.correctAnswer;
      if (q.type !== 'writing') {
        correctIdx = (q.options || []).indexOf(q.correctAnswer);
        if (correctIdx === -1) correctIdx = 0;
      }
      return {
        question: q.question || '',
        type: q.type || 'multiple-choice',
        options: q.options || ['', '', '', ''],
        correct: correctIdx
      };
    });
    
    setActivityQuestions(mappedQuestions);
    handleCreateActivityClick();
  };

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
    
    // Shuffle all 20 questions and select exactly 10 of them
    const selectedTenQuestions = shuffleArray(unit.exercises).slice(0, 10);
    
    const randomizedQuestions = selectedTenQuestions.map(ex => {
      if (ex.type === 'writing') {
        return { ...ex };
      }
      
      const originalOptions = ex.options.map((opt, idx) => ({ text: opt, isCorrect: idx === ex.correct }));
      const shuffledOptions = shuffleArray(originalOptions);
      return {
        ...ex,
        options: shuffledOptions.map(o => o.text),
        correct: shuffledOptions.findIndex(o => o.isCorrect)
      };
    });

    setActiveExercise({ unitIndex, subjectId: selectedSubject.id, currentQuestion: 0 });
    setExerciseState({ score: 0, finished: false, shuffled: randomizedQuestions, userAnswers: [] });
    setSelectedAnswer(null);
  };

  const handleExerciseAnswer = (answer: number | string) => {
    if (selectedAnswer !== null || !activeExercise) return;
    
    const currentQ = exerciseState.shuffled[activeExercise.currentQuestion];
    
    // Use index -1 as a special value for string answers to indicate "answered"
    setSelectedAnswer(typeof answer === 'number' ? answer : -1);
    
    let isCorrect = false;
    if (currentQ.type === 'writing') {
      isCorrect = String(answer).toLowerCase().trim() === String(currentQ.correct).toLowerCase().trim();
    } else {
      isCorrect = answer === currentQ.correct;
    }
    
    if (isCorrect) {
      playSuccessSound();
      if (isLoggedIn && userName !== 'Estudiante') {
        incrementUserStat(userName, 'totalCorrect', 1);
      }
    } else {
      playErrorSound();
    }

    const newScore = isCorrect ? exerciseState.score + 1 : exerciseState.score;
    
    const answerLog = {
      question: currentQ.question,
      selected: answer,
      correct: currentQ.correct,
      isCorrect,
      options: currentQ.options,
      type: currentQ.type || 'multiple-choice'
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
        // Mark unit as completed "for real"
        markUnitAsCompleted(activeExercise.subjectId, activeExercise.unitIndex, activeExercise.activityCode);
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
      navigateTo('unit-study', { subjectId: selectedSubject.id, unitIndex: nextIndex });
    }
  };

  const handleSubjectClick = (subject: Subject) => {
    playExternalBubble();
    setSelectedSubject(subject);
    setSelectedUnitIndex(null);
    navigateTo('subject', { subjectId: subject.id });
  };

  const getIcon = (name: string, size = 20) => {
    switch (name) {
      case 'Leaf': return <Leaf size={size} />;
      case 'Globe': return <Globe size={size} />;
      case 'Scroll': return <Scroll size={size} />;
      case 'ShieldCheck': return <ShieldCheck size={size} />;
      case 'Languages': return <Languages size={size} />;
      case 'Calculator': return <Calculator size={size} />;
      case 'BookOpen': return <BookOpen size={size} />;
      case 'Croissant': return <Croissant size={size} />;
      case 'Pizza': return <Pizza size={size} />;
      default: return <BookOpen size={size} />;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green': return 'from-green-400 to-green-600';
      case 'blue': return 'from-blue-400 to-blue-600';
      case 'sky': return 'from-sky-400 to-sky-600';
      case 'yellow': return 'from-yellow-400 to-yellow-600';
      case 'orange': return 'from-orange-400 to-orange-600';
      case 'amber': return 'from-amber-400 to-amber-600';
      case 'indigo': return 'from-indigo-400 to-indigo-600';
      case 'emerald': return 'from-emerald-400 to-emerald-600 shadow-emerald-500/30';
      case 'red': return 'from-red-400 to-red-600';
      case 'violet':
      case 'purple': return 'from-violet-400 to-violet-600 shadow-violet-500/20';
      case 'pink':
      case 'rose': return 'from-rose-400 to-rose-600 shadow-rose-500/30';
      default: return 'from-sky-400 to-sky-600';
    }
  };

  const generateShortCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateActivity = async () => {
    if (isCreatingActivity) return;
    
    setCreationError(null);
    if (!userName || userName.trim() === 'Estudiante') {
      setCreationError("Debes configurar un nombre de usuario real en Ajustes antes de publicar.");
      playErrorSound();
      return;
    }
    if (!activityName.trim()) {
      setCreationError("Falta el nombre de la actividad.");
      playErrorSound();
      return;
    }
    
    // Improved validation
    const isValid = activityQuestions.every((q, idx) => {
      if (!q.question.trim()) return false;
      if (q.type === 'writing' || q.type === 'written') return String(q.correct).trim() !== '';
      if (q.type === 'true-false' || q.type === 'boolean') return q.options.length === 2 && q.correct !== undefined;
      // Multiple choice needs at least 2 non-empty options
      const nonEmptyOptions = q.options.filter(o => o.trim() !== '');
      return nonEmptyOptions.length >= 2 && q.correct !== undefined && q.correct !== null;
    });

    if (!isValid) {
      setCreationError("Asegúrate de que todas las preguntas tengan texto y al menos 2 opciones válidas.");
      playErrorSound();
      return;
    }

      // Publishing activity is free (no cost, no check required)

      let timeoutId: any;
      setIsCreatingActivity(true);

      try {
        // Safety timeout
        timeoutId = setTimeout(() => {
          setIsCreatingActivity(false);
          setCreationError("La conexión está tardando demasiado. Reintenta.");
        }, 25000);

        const processedQuestions = activityQuestions.map(q => {
          let finalCorrectAnswer = '';
          if (q.type === 'writing' || q.type === 'written') {
            finalCorrectAnswer = String(q.correct || '').trim();
          } else {
            const idx = Number(q.correct);
            finalCorrectAnswer = q.options[idx] || q.options[0] || '';
          }

          return {
            type: q.type === 'written' ? 'writing' : (q.type === 'boolean' ? 'true-false' : (q.type === 'multiple' ? 'multiple-choice' : (q.type || 'multiple-choice'))),
            question: q.question.trim(),
            options: q.options.filter(o => o.trim() !== ''),
            correctAnswer: finalCorrectAnswer,
            correct: q.correct // Keep for backwards compatibility and MC index
          };
        });

        const activityData: any = {
          name: activityName.trim(),
          creatorName: userName.trim(),
          creatorId: userName.trim(), // Force use of username
          creatorAvatar: userAvatar || '',
          creatorBio: userBio || '', // Keep bio with the activity for fallback
          creatorRole: userRole || 'Explorador', // Keep role for fallback
          questions: processedQuestions,
          updatedAt: serverTimestamp(),
        };

        if (!editingActivityId) {
          activityData.createdAt = serverTimestamp();
          activityData.likes = [];
          activityData.views = 0;
        }

        const docId = editingActivityId || generateShortCode();
        const docRef = doc(db, 'activities', docId);
        
        if (editingActivityId) {
          await updateDoc(docRef, activityData);
        } else {
          await setDoc(docRef, activityData);
          logAraTransaction(userName.trim(), 0, 'activity_created', 'Publicaste una nueva actividad');
        }

      if (timeoutId) clearTimeout(timeoutId);
      
      if (!editingActivityId) {
        setNewActivityCode(docId);
        addToHistory(docId, activityName.trim());
      }
      
      setEditingActivityId(null);
      playSuccessSound();
      // Si todo salió bien, cerramos el estado de creación
      setIsCreatingActivity(false); 
    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);
      setIsCreatingActivity(false);
      console.error("Error detallado al publicar:", error);
      
      let msg = "Error al conectar con el servidor.";
      if (error.code === 'permission-denied') {
        msg = "No tienes permisos para publicar esta actividad.";
      } else if (error.message?.includes('quota')) {
        msg = "Se ha alcanzado el límite de almacenamiento gratuito.";
      }
      
      setCreationError(msg);
      playErrorSound();
      try { handleFirestoreError(error, OperationType.WRITE, 'activities'); } catch(e) {}
    }
  };

  const handleLikeActivity = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      setAuthRequiredMsg("Inicia sesión para dar like a las actividades que te gusten.");
      return;
    }
    if (loadingLikes.has(id)) return;
    
    setLoadingLikes(prev => new Set(prev).add(id));
    try {
      const docRef = doc(db, 'activities', id);
      const activity = galleryActivities.find(a => a.id === id);
      if (!activity) return;

      const currentLikes = activity.likes || [];
      let newLikes;
      
      if (currentLikes.includes(userName)) {
        newLikes = currentLikes.filter((name: string) => name !== userName);
      } else {
        newLikes = [...currentLikes, userName];
      }

      await updateDoc(docRef, { likes: newLikes });
      
      // Update creator's total likes
      if (activity.creatorName) {
        const diff = newLikes.length > currentLikes.length ? 1 : -1;
        incrementUserStat(activity.creatorName, 'totalLikes', diff);
      }
      
      setGalleryActivities(prev => prev.map(a => a.id === id ? { ...a, likes: newLikes } : a));
      if (selectedActivityDetail && selectedActivityDetail.id === id) {
        setSelectedActivityDetail((prev: any) => ({ ...prev, likes: newLikes }));
      }
      playExternalBubble();
    } catch (error) {
       handleFirestoreError(error, OperationType.UPDATE, `activities/${id}`);
    } finally {
      setLoadingLikes(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Helper para incrementar vistas de actividad de forma segura (una por sesión)
  const trackActivityView = async (activityId: string, creatorName?: string) => {
    if (!activityId || !isLoggedIn || userName === 'Estudiante') return;
    
    const viewedKey = `viewed_activity_${activityId}`;
    if (sessionStorage.getItem(viewedKey)) return;
    
    try {
      const docRef = doc(db, 'activities', activityId);
      await updateDoc(docRef, { views: increment(1) });
      sessionStorage.setItem(viewedKey, 'true');
      
      if (creatorName) {
        incrementUserStat(creatorName, 'totalViews', 1);
      }
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  const handleLoadActivity = async (code: string) => {
    if (!code) return;
    setLoadError(null);
    setIsLoadingActivity(true);
    try {
      const docRef = doc(db, 'activities', code);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Incrementar vistas con protección de sesión
        trackActivityView(code, data.creatorName);

        // Transform back to exercise format
        const unitExtras = {
          name: data.name,
          creator: data.creatorName,
          exercises: (data.questions || []).filter(Boolean).map((q: any) => ({
            type: q.type || 'multiple-choice',
            question: q.question,
            options: q.options || [],
            correct: (q.type === 'writing') ? q.correctAnswer : (q.options || []).indexOf(q.correctAnswer)
          }))
        };
        setCurrentSharedActivity(unitExtras);
        addToHistory(code, data.name);
        
        // Prepare exercise state with same logic as startExercise
        const randomizedQuestions = shuffleArray(unitExtras.exercises).map(ex => {
          if (ex.type === 'writing') {
            return { ...ex };
          }
          const originalOptions = ex.options.map((opt: string, idx: number) => ({ text: opt, isCorrect: idx === ex.correct }));
          const shuffledOptions = shuffleArray(originalOptions);
          return {
            ...ex,
            options: shuffledOptions.map(o => o.text),
            correct: shuffledOptions.findIndex(o => o.isCorrect)
          };
        });

        // Use a "fake" subject/unit for the exercise runner
        setActiveExercise({ unitIndex: -1, subjectId: 'shared', currentQuestion: 0, activityCode: code });
        setExerciseState({ score: 0, finished: false, shuffled: randomizedQuestions, userAnswers: [] });
        navigateTo('play-activity');
        playExternalBubble();
      } else {
        playErrorSound();
        setLoadError("Actividad no encontrada. Verifica el código.");
      }
    } catch (error) {
      console.error("Error loading activity:", error);
      setLoadError("No se pudo cargar. Revisa tu conexión o intenta más tarde.");
      try { handleFirestoreError(error, OperationType.GET, `activities/${code}`); } catch(e) {}
    } finally {
      setIsLoadingActivity(false);
    }
  };

  return (
    <MotionConfig reducedMotion={disableAnimations ? "always" : "never"}>
    <div className={`flex h-screen w-screen overflow-hidden font-sans relative flex-col lg:flex-row transition-colors duration-500 ${theme === 'black' ? 'text-white' : ''}`}>

      {showWelcome && (
        <WelcomeTutorial 
          onComplete={() => {
            setShowWelcome(false);
            localStorage.setItem('newara_visited', 'true');
          }} 
          onLogin={() => {
            setAuthMode('login');
            setIsRegistering(true);
          }}
        />
      )}

      <AnimatePresence>
        {showGalleryTutorial && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGalleryTutorial(false)}
              className="absolute inset-0 bg-sky-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              className={`relative w-full max-w-2xl rounded-[40px] md:rounded-[48px] border-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] p-6 md:p-12 overflow-hidden ${
                theme === 'black' ? 'bg-zinc-900 border-white/10 text-white shadow-blue-500/10' : 'bg-white border-white text-sky-950 shadow-blue-500/10'
              }`}
            >
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl opacity-50" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl home-orb opacity-50" />
              
              <div className="relative z-10 text-center space-y-6 md:space-y-10">
                <div className="space-y-2">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-500/20 text-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6 border-2 border-orange-500/30 transform -rotate-6">
                    <Server size={32} className="md:w-10 md:h-10" />
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">Guía de Servidores</h2>
                  <p className="text-[9px] md:text-xs font-black uppercase tracking-[0.3em] opacity-40">¡Tu clase, tus reglas!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-left">
                  <div className="p-4 md:p-5 rounded-3xl md:rounded-[32px] bg-white/5 border border-white/10 flex items-start gap-3 md:gap-4 hover:bg-white/10 transition-colors">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center font-black shrink-0 border border-blue-500/20 shadow-lg text-sm">1</div>
                    <div>
                      <p className="font-black text-[10px] md:text-[11px] uppercase tracking-wider mb-0.5 md:mb-1">Explora la Galería</p>
                      <p className="text-[9px] md:text-[10px] font-bold opacity-40 leading-relaxed">Busca una actividad en la biblioteca de NewAra.</p>
                    </div>
                  </div>
                  <div className="p-4 md:p-5 rounded-3xl md:rounded-[32px] bg-white/5 border border-white/10 flex items-start gap-3 md:gap-4 hover:bg-white/10 transition-colors">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-purple-500/20 text-purple-500 flex items-center justify-center font-black shrink-0 border border-purple-500/20 shadow-lg text-sm">2</div>
                    <div>
                      <p className="font-black text-[10px] md:text-[11px] uppercase tracking-wider mb-0.5 md:mb-1">Crea el Servidor</p>
                      <p className="text-[9px] md:text-[10px] font-bold opacity-40 leading-relaxed">Toca el botón naranja <span className="text-orange-500">"HOST"</span> dentro de la actividad.</p>
                    </div>
                  </div>
                  <div className="p-4 md:p-5 rounded-3xl md:rounded-[32px] bg-white/5 border border-white/10 flex items-start gap-3 md:gap-4 hover:bg-white/10 transition-colors">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-black shrink-0 border border-emerald-500/20 shadow-lg text-sm">3</div>
                    <div>
                      <p className="font-black text-[10px] md:text-[11px] uppercase tracking-wider mb-0.5 md:mb-1">Invita Estudiantes</p>
                      <p className="text-[9px] md:text-[10px] font-bold opacity-40 leading-relaxed">Comparte el código de 5 letras que aparecerá.</p>
                    </div>
                  </div>
                  <div className="p-4 md:p-5 rounded-3xl md:rounded-[32px] bg-white/5 border border-white/10 flex items-start gap-3 md:gap-4 hover:bg-white/10 transition-colors">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-black shrink-0 border border-amber-500/20 shadow-lg text-sm">4</div>
                    <div>
                      <p className="font-black text-[10px] md:text-[11px] uppercase tracking-wider mb-0.5 md:mb-1">¡Que empiece el juego!</p>
                      <p className="text-[9px] md:text-[10px] font-bold opacity-40 leading-relaxed">Cuando todos estén listos, presiona "Empezar".</p>
                    </div>
                  </div>
                </div>

                <GlossyButton 
                  onClick={() => setShowGalleryTutorial(false)}
                  className="w-full py-5 md:py-6 text-xs md:text-sm font-black tracking-[0.3em] bg-blue-500 shadow-2xl shadow-blue-500/30 active:scale-[0.98]"
                >
                  ¡VAMOS A LA GALERÍA!
                </GlossyButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRoleSelection && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-sky-950/40 backdrop-blur-3xl"
            />
            <motion.div
               initial={{ scale: 0.9, y: 30, opacity: 0 }}
               animate={{ scale: 1, y: 0, opacity: 1 }}
               exit={{ scale: 0.9, y: 30, opacity: 0 }}
               className={`relative w-full max-w-lg rounded-[48px] border-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] p-10 flex flex-col items-center gap-8 ${
                 theme === 'black' ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-white text-sky-950'
               }`}
            >
               <div className="text-center space-y-2">
                 <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">¡Bienvenido!</h2>
                 <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Personaliza tu experiencia</p>
               </div>

               <div className="w-full space-y-4">
                 <p className="text-center text-sm font-medium opacity-60 px-4">
                   Para empezar, dinos cuál es tu rol en <span className="font-logo font-bold">NewAra</span>.
                 </p>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleSelectRole('Estudiante')}
                      disabled={isAuthLoading}
                      className={`group relative p-6 rounded-[32px] bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-xl shadow-blue-500/20 active:scale-95 transition-all overflow-hidden ${isAuthLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 pointer-events-none" />
                      <div className="relative z-10 flex flex-col items-center gap-3">
                        <div className="p-4 rounded-2xl bg-white/20 group-hover:bg-white/30 transition-colors">
                          {isAuthLoading ? (
                            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <GraduationCap size={32} />
                          )}
                        </div>
                        <span className="font-black text-sm uppercase tracking-widest text-center">Estudiante</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => handleSelectRole('Profesor')}
                      disabled={isAuthLoading}
                      className={`group relative p-6 rounded-[32px] bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl shadow-orange-500/20 active:scale-95 transition-all overflow-hidden ${isAuthLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 pointer-events-none" />
                      <div className="relative z-10 flex flex-col items-center gap-3">
                        <div className="p-4 rounded-2xl bg-white/20 group-hover:bg-white/30 transition-colors">
                          {isAuthLoading ? (
                            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Presentation size={32} />
                          )}
                        </div>
                        <span className="font-black text-sm uppercase tracking-widest text-center">Profesor</span>
                      </div>
                    </button>
                 </div>
               </div>
               
               <p className="text-[10px] font-black uppercase tracking-widest opacity-20 text-center">
                 Podrás cambiar esto más tarde en los ajustes.
               </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notifications Modal */}
      <AnimatePresence>
        {showNotifications && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowNotifications(false)}
               className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
               initial={{ scale: 0.9, y: 20, opacity: 0 }}
               animate={{ scale: 1, y: 0, opacity: 1 }}
               exit={{ scale: 0.9, y: 20, opacity: 0 }}
               className={`relative w-full max-w-lg md:rounded-[40px] rounded-[40px] md:border-4 border shadow-2xl flex flex-col max-h-[80vh] overflow-hidden md:self-center self-center ${
                 theme === 'black' ? 'bg-zinc-950 border-white/10 text-white' : 'bg-white border-white text-sky-950'
               }`}
            >
               {/* Mobile Drag Handle */}
               <div className="md:hidden w-full flex justify-center pt-3 pb-1">
                 <div className={`w-12 h-1.5 rounded-full ${theme === 'black' ? 'bg-white/10' : 'bg-slate-200'}`} />
               </div>

               <div className="p-8 pb-4 flex flex-col border-b border-white/10">
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-500">
                        <Bell size={24} />
                      </div>
                      <h2 className="text-2xl font-black uppercase tracking-tight">{t('notificaciones')}</h2>
                   </div>
                   <button 
                     onClick={() => setShowNotifications(false)}
                     className={`p-2 rounded-xl transition-all ${theme === 'black' ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'}`}
                   >
                     <X size={20} />
                   </button>
                 </div>
                 
                 <div className="flex gap-2">
                   {notifications.some(n => !n.isRead) && (
                     <button 
                       onClick={() => markAllNotificationsRead()}
                       className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all"
                     >
                       <CheckCheck size={14} />
                       {t('marcarTodoLeido')}
                     </button>
                   )}
                   <button 
                     onClick={async () => {
                       if (window.confirm('¿Deseas borrar todo el historial de notificaciones?')) {
                         for (const n of notifications) {
                           await deleteNotification(n.id);
                         }
                       }
                     }}
                     className="px-4 py-2 rounded-xl border-2 border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                   >
                     Reiniciar
                   </button>
                 </div>
               </div>

               <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                 {notifications.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-20 opacity-40 text-center">
                      <BellRing size={48} className="mb-4 opacity-20" />
                      <p className="font-bold">{t('noHayNotificaciones')}</p>
                   </div>
                 ) : (
                   notifications.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()).map(n => {
                     const isExpanded = n.id === expandedNotificationId;
                     const hasMore = n.message.length > 120;
                     const displayText = isExpanded ? n.message : (hasMore ? n.message.substring(0, 120) + '...' : n.message);

                     return (
                       <motion.div 
                         key={n.id}
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1, x: 0 }}
                         className={`p-5 rounded-3xl border-2 transition-all group relative ${
                           n.isRead 
                             ? (theme === 'black' ? 'bg-white/5 border-transparent opacity-60' : 'bg-slate-50 border-transparent opacity-70')
                             : (theme === 'black' ? 'bg-blue-500/10 border-blue-500/20 shadow-lg' : 'bg-blue-50 border-blue-200 shadow-xl shadow-blue-500/5')
                         }`}
                         onClick={() => {
                           if (!n.isRead) markNotificationRead(n.id);
                         }}
                       >
                         <div className="flex gap-4">
                           <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                             n.type === 'assignment' ? 'bg-orange-500/20 text-orange-500' :
                             n.type === 'announcement' ? 'bg-blue-500/20 text-blue-500' :
                             n.type === 'moderation' ? 'bg-red-500/20 text-red-500' :
                             'bg-purple-500/20 text-purple-500'
                           }`}>
                             {n.type === 'assignment' ? <ClipboardList size={20} /> :
                              n.type === 'announcement' ? <Users2 size={20} /> :
                              n.type === 'moderation' ? <ShieldCheck size={20} /> :
                              <Sparkles size={20} />}
                           </div>
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between mb-1">
                               <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                                 {n.type === 'assignment' ? t('nuevaTarea') :
                                  n.type === 'announcement' ? t('nuevoAnuncio') :
                                  n.type === 'moderation' ? t('contenidoEliminado') :
                                  t('actualizacionSistema')}
                               </p>
                               <span className="text-[10px] font-bold opacity-30">
                                 {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleDateString() : 'Reciente'}
                               </span>
                             </div>
                             <h3 className="font-black text-sm mb-1 leading-tight">{n.title}</h3>
                             <p className="text-xs font-medium opacity-70 leading-relaxed mb-1 italic">
                               {displayText}
                             </p>
                             
                             {hasMore && (
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   setExpandedNotificationId(isExpanded ? null : n.id);
                                 }}
                                 className="text-[10px] font-black text-blue-500 hover:underline mb-3"
                               >
                                 {isExpanded ? 'Ver menos' : 'Ver más'}
                               </button>
                             )}
                             
                             <div className="flex items-center gap-3">
                               {!n.isRead && !isExpanded && (
                                 <button 
                                   onClick={() => markNotificationRead(n.id)}
                                   className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
                                  >
                                   <Check size={12} /> {t('marcarComoLeido')}
                                 </button>
                               )}
                               {n.link && (
                                 <button 
                                   onClick={() => {
                                     if (n.link && n.link.startsWith('/classes/')) {
                                        // Handle class link
                                        const classId = n.link.split('/')[2];
                                        const cls = userClasses.find(c => c.id === classId);
                                        if (cls) {
                                          setActiveClass(cls);
                                          navigateTo('class-detail');
                                          setShowNotifications(false);
                                        }
                                     } else {
                                        setShowNotifications(false);
                                     }
                                     if (!n.isRead) markNotificationRead(n.id);
                                   }}
                                   className="px-3 py-1.5 rounded-xl border-2 border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                                 >
                                   Ir al contenido
                                 </button>
                               )}
                             </div>
                           </div>
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               deleteNotification(n.id);
                             }}
                             className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-pink-500 hover:bg-pink-500/10 rounded-xl transition-all"
                             title={t('borrarNotificacion')}
                           >
                             <Trash2 size={16} />
                           </button>
                         </div>
                       </motion.div>
                     );
                   })
                 )}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <BubbleBackground theme={theme} />
      {/* Create Class Modal */}
      <AnimatePresence>
        {showCreateClassModal && (
          <div className="fixed inset-0 z-[180] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowCreateClassModal(false)}
               className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 20 }}
               className={`relative w-full max-w-md rounded-[40px] border-4 p-10 shadow-2xl ${
                 theme === 'black' ? 'bg-zinc-950 border-white/10 text-white' : 'bg-white border-white'
               }`}
            >
               <h2 className="text-2xl font-black mb-6">Crear nueva clase</h2>
               <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Nombre de la clase</label>
                    <input 
                      type="text"
                      className={`w-full p-4 rounded-2xl border font-bold ${theme === 'black' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}
                      placeholder="Ej: Historia 3ero A"
                      id="new-class-name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Descripción (opcional)</label>
                    <textarea 
                      className={`w-full p-4 rounded-2xl border font-bold h-24 ${theme === 'black' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}
                      placeholder="Ej: Unidad 2 de historia moderna..."
                      id="new-class-desc"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setShowCreateClassModal(false)}
                      className="flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest opacity-40 hover:opacity-100"
                    >
                      Cancelar
                    </button>
                    <GlossyButton 
                      onClick={() => {
                        const name = (document.getElementById('new-class-name') as HTMLInputElement)?.value;
                        const desc = (document.getElementById('new-class-desc') as HTMLTextAreaElement)?.value;
                        if (name) createClass(name, desc);
                      }}
                      className="flex-1 py-4 bg-sky-500 text-white"
                    >
                      Crear Clase
                    </GlossyButton>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Join Class Modal */}
      <AnimatePresence>
        {showJoinClassModal && (
          <div className="fixed inset-0 z-[180] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowJoinClassModal(false)}
               className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 20 }}
               className={`relative w-full max-w-sm rounded-[40px] border-4 p-10 shadow-2xl ${
                 theme === 'black' ? 'bg-zinc-950 border-white/10 text-white' : 'bg-white border-white'
               }`}
            >
               <div className="text-center space-y-6">
                 <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto text-blue-500">
                    <Users size={32} />
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-2xl font-black">Unirse a una clase</h2>
                    <p className="text-xs font-bold opacity-60">Pide a tu profesor el código de la clase e ingrésalo debajo.</p>
                 </div>
                 <input 
                   type="text"
                   maxLength={6}
                   placeholder="CÓDIGO"
                   id="join-class-code"
                   className={`w-full p-6 rounded-2xl border-4 text-center text-4xl font-logo font-black tracking-[0.2em] uppercase focus:ring-4 focus:ring-blue-500/20 outline-none transition-all ${
                     theme === 'black' ? 'bg-zinc-900 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-sky-950'
                   }`}
                 />
                 <div className="flex gap-3">
                    <button 
                      onClick={() => setShowJoinClassModal(false)}
                      className="flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest opacity-40 hover:opacity-100"
                    >
                      Cancelar
                    </button>
                    <GlossyButton 
                      onClick={() => {
                        const code = (document.getElementById('join-class-code') as HTMLInputElement)?.value;
                        if (code) joinClass(code);
                      }}
                      className="flex-1 py-4 bg-sky-500 text-white"
                    >
                      Unirse
                    </GlossyButton>
                 </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Activity Details Modal */}
      <AnimatePresence>
        {selectedActivityDetail && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedActivityDetail(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            
            <motion.div
              layoutId={`activity-${selectedActivityDetail.id}`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-[32px] md:rounded-[48px] border-4 shadow-2xl p-6 md:p-10 custom-scrollbar ${
                theme === 'black' ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-white text-sky-950'
              }`}
            >
              <div className="glossy-overlay opacity-20" />
              
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      <Globe size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Actividad de la Comunidad</p>
                        <p className="text-xs font-bold text-blue-500">ID: {selectedActivityDetail.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <button 
                        onClick={() => setShowActivityMenu(!showActivityMenu)}
                        className="aero-icon-button bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
                        title="Más opciones"
                      >
                        <MoreVertical size={20} />
                      </button>
                      {showActivityMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-800 rounded-xl p-2 shadow-2xl border border-white/10 z-20 flex flex-col gap-1">
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(selectedActivityDetail.id);
                              playExternalBubble();
                              setShowActivityMenu(false);
                            }}
                            className="flex items-center gap-2 w-full p-2 text-sm rounded-lg hover:bg-white/5 text-blue-400"
                          >
                            <Copy size={16} /> Copiar Código
                          </button>
                          {(isModerator || (selectedActivityDetail && (
                            selectedActivityDetail.creatorName?.trim().toLowerCase() === userName?.trim().toLowerCase() ||
                            selectedActivityDetail.creatorId?.trim().toLowerCase() === userName?.trim().toLowerCase()
                          ))) && (
                            <>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleEditActivity(selectedActivityDetail, e); setShowActivityMenu(false); }}
                                className="flex items-center gap-2 w-full p-2 text-sm rounded-lg hover:bg-white/5 text-blue-400"
                              >
                                <Edit3 size={16} /> Editar
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteActivity(selectedActivityDetail.id, e, selectedActivityDetail.creatorName, selectedActivityDetail.title, selectedActivityDetail.creatorId); setShowActivityMenu(false); }}
                                className="flex items-center gap-2 w-full p-2 text-sm rounded-lg hover:bg-white/5 text-red-400"
                              >
                                <Trash2 size={16} /> Eliminar
                              </button>
                            </>
                          )}
                          {(isLoggedIn && userName !== 'Estudiante') && (
                            <button 
                              onClick={() => {
                                setShowReportModal({id: selectedActivityDetail.id, name: selectedActivityDetail.name, creatorName: selectedActivityDetail.creatorName});
                                setShowActivityMenu(false);
                              }}
                              className="flex items-center gap-2 w-full p-2 text-sm rounded-lg hover:bg-white/5 text-red-400"
                            >
                              <AlertTriangle size={16} /> Denunciar
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedActivityDetail(null);
                        setShowActivityMenu(false);
                      }}
                      className="aero-icon-button bg-white/10"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl md:text-3xl font-black leading-tight tracking-tight">
                    {selectedActivityDetail.name}
                  </h2>
                  
                  <div className="flex flex-wrap gap-4 items-center">
                    <button 
                      onClick={() => handleViewProfile(selectedActivityDetail.creatorId, selectedActivityDetail.creatorName, selectedActivityDetail)}
                      className="flex items-center text-left gap-3 px-4 py-2 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all active:scale-95 group"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-blue-400 transition-colors">
                        {selectedActivityDetail.creatorAvatar ? (
                          <img src={selectedActivityDetail.creatorAvatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-blue-400 flex items-center justify-center text-white font-black">
                            {selectedActivityDetail.creatorName?.[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase opacity-40">Creador</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold truncate max-w-[120px] group-hover:text-blue-400 transition-colors">{selectedActivityDetail.creatorName || 'Anónimo'}</span>
                          {selectedActivityDetail.creatorIsHelper && (
                             <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-500" title="AYUDANTE">
                                <Sparkles size={10} />
                                <span className="text-[8px] font-black">AYUDANTE</span>
                             </div>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-60 transition-opacity ml-auto" />
                    </button>

                    <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/10 border border-white/10">
                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                          <Calendar size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase opacity-40">Fecha</span>
                          <span className="text-sm font-bold">
                            {selectedActivityDetail.createdAt?.toDate ? selectedActivityDetail.createdAt.toDate().toLocaleDateString() : 'Antigua'}
                          </span>
                        </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-3xl bg-blue-500/5 border border-blue-500/10 text-center">
                      <div className="flex items-center justify-center gap-2 text-blue-500 mb-1">
                        <Play size={16} />
                        <span className="text-[11px] font-black uppercase tracking-widest">Vistas</span>
                      </div>
                      <p className="text-2xl font-black">{selectedActivityDetail.views || 0}</p>
                    </div>
                    <div className="p-4 rounded-3xl bg-pink-500/5 border border-pink-500/10 text-center">
                      <div className="flex items-center justify-center gap-2 text-pink-500 mb-1">
                        <Heart size={16} />
                        <span className="text-[11px] font-black uppercase tracking-widest">Likes</span>
                      </div>
                      <p className="text-2xl font-black">{selectedActivityDetail.likes?.length || 0}</p>
                    </div>
                </div>

                <div className="p-5 rounded-3xl bg-amber-400/10 border border-amber-400/20 text-[11px] font-medium leading-relaxed opacity-80 flex gap-3">
                    <Lightbulb className="text-amber-500 shrink-0" size={20} />
                    <p>Esta actividad contiene <strong>{selectedActivityDetail.questions?.length || 0}</strong> preguntas interactivas. ¡Prueba tus conocimientos!</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <GlossyButton 
                      loading={loadingLikes.has(selectedActivityDetail.id)}
                      onClick={(e) => { e.stopPropagation(); handleLikeActivity(selectedActivityDetail.id, e); }}
                      variant={selectedActivityDetail.likes?.includes(userName) ? 'gray' : 'pink'}
                      className="flex-1 py-4 text-xs font-black tracking-[0.2em] gap-3"
                    >
                      {selectedActivityDetail.likes?.includes(userName) ? 'SACAR LIKE' : 'DAR LIKE'} <Heart size={18} fill={selectedActivityDetail.likes?.includes(userName) ? 'currentColor' : 'none'} />
                    </GlossyButton>
                    <GlossyButton 
                      onClick={() => {
                        handleLoadActivity(selectedActivityDetail.id);
                        setSelectedActivityDetail(null);
                      }}
                      className="flex-1 py-4 text-[10px] md:text-sm font-black tracking-[0.2em] gap-3"
                    >
                      ¡JUGAR! <Play size={20} fill="currentColor" />
                    </GlossyButton>

                    {userRole === 'Profesor' && (
                      <GlossyButton 
                        onClick={() => createMinigameSession(selectedActivityDetail)}
                        className="flex-1 py-4 text-[10px] md:text-sm font-black tracking-[0.2em] gap-3 bg-gradient-to-br from-amber-400 to-orange-500"
                      >
                        HOST <Gamepad2 size={20} />
                      </GlossyButton>
                    )}
                </div>

                {selectedActivityDetail && (
                  selectedActivityDetail.creatorName?.trim().toLowerCase() === userName?.trim().toLowerCase() ||
                  selectedActivityDetail.creatorId?.trim().toLowerCase() === userName?.trim().toLowerCase() || 
                  isModerator
                ) && selectedActivityDetail.likes?.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 ml-1 flex items-center gap-2">
                       <Heart size={10} fill="currentColor" className="text-pink-500" /> {t('usuariosLike')}
                    </p>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                      {selectedActivityDetail.likes.map((name: string) => (
                        <span key={name} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-blue-400">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Profile Modal */}
      <AnimatePresence>
        {viewingProfile && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingProfile(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xl"
            />
            
            <motion.div
              layoutId={`user-${viewingProfile.id || viewingProfile.name}`}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] md:rounded-[40px] border-2 md:border-4 shadow-2xl p-6 md:p-12 ${
                theme === 'black' ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-white text-sky-950'
              }`}
            >
              <div className="glossy-overlay opacity-30" />
              
              <div className="relative z-10 flex flex-col gap-6 md:gap-8">
                <div className="flex justify-between items-start">
                   <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-start text-center md:text-left">
                      <div className="w-20 h-20 md:w-32 md:h-32 rounded-full overflow-hidden border-2 md:border-4 border-white/20 shadow-2xl relative group items-center justify-center flex bg-zinc-800">
                        {viewingProfile.avatar ? (
                          <img src={viewingProfile.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center text-white text-2xl md:text-4xl font-black ${theme === 'black' ? 'bg-gradient-to-br from-zinc-700 to-zinc-900' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                            {viewingProfile.name?.[0]?.toUpperCase() || 'E'}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-black uppercase tracking-tighter text-center px-4">
                           <User size={20} className="mb-1" />
                           Perfil
                        </div>
                      </div>
                      <div className="space-y-1 md:space-y-2">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-2">
                          <h2 className="text-2xl md:text-5xl font-black tracking-tight leading-tight">
                            {viewingProfile.name || viewingProfile.id}
                          </h2>
                          {viewingProfile.isHelper && (
                             <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shadow-lg shadow-emerald-500/10 mb-2 md:mb-0 md:mt-2">
                                <Sparkles size={12} className="animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.1em]">AYUDANTE</span>
                             </div>
                          )}
                        </div>
                        <div className="flex gap-2 items-center justify-center md:justify-start opacity-60">
                          <ShieldCheck size={14} className="text-blue-500" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{viewingProfile.role || 'Usuario de NewAra'}</span>
                        </div>
                      </div>
                   </div>
                   <button 
                     onClick={() => setViewingProfile(null)}
                     className="aero-icon-button bg-white/10 hover:bg-white/20 transition-all p-2 md:p-3"
                   >
                     <X size={20} className="md:w-6 md:h-6" />
                   </button>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 md:p-6 rounded-[24px] md:rounded-[32px] bg-white/5 border border-white/10">
                    <div className="flex-1">
                      <p className="text-[9px] md:text-xs font-black uppercase tracking-[0.2em] opacity-40 mb-2 md:mb-3">BIOGRAFÍA</p>
                      <p className="text-xs md:text-base leading-relaxed font-medium">
                        {viewingProfile.bio || "Este usuario prefiere mantener su biografía en secreto..."}
                      </p>
                    </div>
                    {isLoggedIn && viewingProfile.name !== userName && viewingProfile.name !== 'Estudiante' && (
                        <div className="sm:ml-4 flex-shrink-0">
                          <GlossyButton onClick={() => setShowDonateModal(viewingProfile)} className="!bg-amber-500 hover:!bg-amber-600 !border-amber-400 !text-white text-xs px-4 py-2 uppercase font-black tracking-widest shadow-lg shadow-amber-500/20">
                            DONAR!!
                          </GlossyButton>
                        </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <div className="p-3 md:p-4 rounded-2xl md:rounded-3xl bg-blue-500/10 border border-blue-500/10 text-center">
                      <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">PUBLICACIONES</p>
                      <p className="text-xl md:text-2xl font-black">{viewingProfileActivities.length}</p>
                    </div>
                    <div className="p-3 md:p-4 rounded-2xl md:rounded-3xl bg-orange-500/10 border border-orange-500/10 text-center">
                      <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">VISITAS</p>
                      <p className="text-xl md:text-2xl font-black">{viewingProfile.stats?.totalViews || 0}</p>
                    </div>
                    <div className="p-3 md:p-4 rounded-2xl md:rounded-3xl bg-pink-500/10 border border-pink-500/10 text-center">
                      <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">LIKES RECIBIDOS</p>
                      <p className="text-xl md:text-2xl font-black">{viewingProfile.stats?.totalLikes || 0}</p>
                    </div>
                    <div className="p-3 md:p-4 rounded-2xl md:rounded-3xl bg-green-500/10 border border-green-500/10 text-center">
                      <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">RESP. CORRECTAS</p>
                      <p className="text-xl md:text-2xl font-black">{viewingProfile.stats?.totalCorrectAggregated ?? (viewingProfile.stats?.totalCorrect || 0)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                   <div className="flex items-center justify-between">
                     <h3 className="text-lg md:text-xl font-black tracking-tight flex items-center gap-2">
                       <Play className="text-blue-500 w-4 h-4 md:w-5 md:h-5" fill="currentColor" /> ACTIVIDADES
                     </h3>
                     <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Recientes</span>
                   </div>

                   <div className="max-h-[300px] md:max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 pb-4">
                        {viewingProfileActivities.length > 0 ? (
                          viewingProfileActivities.map(activity => (
                            <motion.div 
                              key={activity.id}
                              whileHover={{ y: -5 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setSelectedActivityDetail(activity);
                                setViewingProfile(null);
                              }}
                              className={`p-3 md:p-4 rounded-2xl md:rounded-3xl border-2 cursor-pointer transition-all ${
                                theme === 'black' ? 'bg-zinc-800 border-white/5 hover:border-blue-500/50' : 'bg-gray-50 border-white hover:border-blue-500'
                              }`}
                            >
                               <p className="text-[8px] font-black opacity-40 mb-1">ID: {activity.id}</p>
                               <p className="font-bold mb-2 md:mb-3 line-clamp-1 text-xs md:text-sm">{activity.name}</p>
                               <div className="flex items-center justify-between text-[8px] font-black uppercase opacity-60">
                                  <span className="flex items-center gap-1"><Heart size={8} className="md:w-[10px] md:h-[10px]" /> {activity.likes?.length || 0}</span>
                                  <span className="flex items-center gap-1"><Play size={8} className="md:w-[10px] md:h-[10px]" /> {activity.views || 0}</span>
                                  <span className="text-blue-500">Ver →</span>
                               </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="col-span-full py-8 md:py-12 text-center opacity-40 italic text-sm">
                            No hay publicaciones recientes.
                          </div>
                        )}
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Donate Modal */}
      <AnimatePresence>
        {showDonateModal && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowDonateModal(null); setDonateAmount(0); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-sm rounded-[32px] overflow-hidden border-2 shadow-2xl p-6 ${
                theme === 'black' ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-white text-sky-950'
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black flex items-center gap-2">
                  <Coins className="text-amber-500" /> Donar Aras
                </h3>
                <button 
                  onClick={() => { setShowDonateModal(null); setDonateAmount(0); }}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6 space-y-4 text-center">
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-white/20 shadow-lg relative group items-center justify-center flex bg-zinc-800">
                   {showDonateModal.avatar ? (
                     <img src={showDonateModal.avatar} alt="" className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-white text-2xl font-black bg-gradient-to-br from-blue-500 to-indigo-600">
                       {showDonateModal.name?.[0]?.toUpperCase() || 'E'}
                     </div>
                   )}
                </div>
                <p className="font-bold opacity-80">
                  ¿Cuántas Aras quieres donar a <span className="text-amber-500 font-black">{showDonateModal.name || showDonateModal.id}</span>?
                </p>
                <div className="flex flex-col items-center gap-2">
                    <input 
                      type="number"
                      min="1"
                      max={userAras}
                      value={donateAmount || ''}
                      onChange={(e) => setDonateAmount(Math.min(userAras, Math.max(1, parseInt(e.target.value) || 0)))}
                      className={`w-full max-w-[200px] text-center text-3xl font-black bg-transparent border-b-4 border-amber-500/30 focus:border-amber-500 outline-none pb-2 transition-all ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}
                      placeholder="0"
                    />
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">
                      Saldo disponible: <span className="text-amber-500">{userAras}</span>
                    </span>
                </div>
              </div>

              <GlossyButton 
                onClick={handleDonateAras}
                disabled={isDonating || donateAmount <= 0}
                className="w-full !bg-amber-500 hover:!bg-amber-600 !border-amber-400 !text-white text-lg py-4 font-black flex items-center justify-center gap-2"
              >
                {isDonating ? <RefreshCw className="animate-spin" /> : <Heart fill="currentColor" />}
                {isDonating ? 'DONANDO...' : `DONAR ${donateAmount || 0} ARAS`}
              </GlossyButton>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {isProfileLoading && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/20 backdrop-blur-sm">
           <div className="flex flex-col items-center gap-4">
              <RefreshCw className="text-blue-500 animate-spin" size={48} />
              <p className="text-white font-black uppercase tracking-[0.3em] text-xs">Cargando Perfil...</p>
           </div>
        </div>
      )}

      {/* Sidebar - Navigation Rail (Desktop) / Bottom Nav (Mobile) */}
      <nav className={`fixed bottom-0 left-0 right-0 h-[70px] lg:h-auto lg:relative z-[100] transition-all duration-500 ${
        theme === 'black' ? 'bg-black/90 border-white/10' : theme === 'aero' ? 'theme-aero-card !bg-white/85 !border-white/80' : 'bg-white/95 border-white'
      } lg:rounded-[40px] border-t shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-2xl flex flex-row lg:flex-col items-center justify-between lg:justify-start py-1 lg:py-8 px-2 lg:px-0 gap-0 lg:gap-6 ${
        (showWelcome || minigameSessionId || activeExercise !== null || currentView === 'play-activity' || currentView === 'create-activity') 
          ? 'translate-y-[120%] lg:translate-y-0 opacity-0 pointer-events-none scale-95 origin-bottom lg:origin-center lg:w-0 lg:m-0 lg:border-0 lg:p-0 lg:overflow-hidden' 
          : 'translate-y-0 opacity-100 lg:w-64 lg:m-4 lg:border-4'
      }`}>
        <div className="glossy-overlay opacity-10 lg:opacity-20 pointer-events-none" />
        
        {/* LOGO NewAra - Hidden on Mobile Bottom Nav */}
        <div className="hidden lg:flex flex-col items-center gap-0 lg:gap-2 mb-0 lg:mb-1 px-4 scale-90 lg:scale-100">
           <div className="lg:hidden">
             <NewAraLogo size="sm" theme={theme} onClick={() => playExternalBubble()} />
           </div>
           <div className="hidden lg:block">
             <NewAraLogo size="lg" theme={theme} onClick={() => playExternalBubble()} />
           </div>
          
           <div className="hidden lg:block w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
        </div>

        {/* PC Offline Status - Positioned between logo and user profile */}
        <div className="hidden lg:flex flex-col items-center gap-3 mb-2">
          <AnimatePresence>
            {isOffline && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full border border-red-500/30 mb-2"
              >
                <WifiOff size={12} className="text-red-500" />
                <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">Desconectado</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2 justify-center">
            {isLoggedIn && (
              <button 
                onClick={() => {
                  playExternalBubble();
                  setShowNotifications(true);
                }}
                className={`group relative p-3 rounded-2xl transition-all active:scale-95 border-2 hover:scale-105 ${
                  theme === 'black' ? 'bg-white/5 border-white/10 hover:border-blue-500/30' : theme === 'aero' ? 'bg-white border-blue-200 shadow-xl' : 'bg-white/60 border-white hover:border-blue-300 shadow-sm'
                }`}
              >
                <Bell size={20} className={theme === 'black' ? 'text-white/70 group-hover:text-amber-400' : theme === 'aero' ? 'text-blue-600 group-hover:text-amber-500' : 'text-sky-900 group-hover:text-amber-500'} />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </button>
            )}
            {isLoggedIn && (
              <div 
                onClick={() => navigateTo('aras')}
                className={`relative overflow-hidden flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all hover:scale-105 active:scale-95 cursor-pointer group ${
                  theme === 'black' 
                    ? 'bg-gradient-to-b from-amber-500/20 to-amber-700/20 border-amber-500/40 text-amber-300 shadow-[inset_0_1px_3px_rgba(251,191,36,0.3)]' 
                    : theme === 'aero' 
                    ? 'bg-gradient-to-b from-amber-200 to-amber-400 border-amber-300/80 text-amber-950 shadow-[inset_0_2px_8px_rgba(255,255,255,0.8),0_4px_12px_rgba(251,191,36,0.4)]' 
                    : 'bg-gradient-to-b from-amber-50 to-amber-100 border-amber-200 text-amber-700 shadow-sm'
                }`}
                title="Historial de Aras"
              >
                {theme === 'aero' && <div className="absolute top-0 left-0 w-full h-1/2 bg-white/40 rounded-t-2xl pointer-events-none"></div>}
                
                <div className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full ${
                  theme === 'aero' ? 'bg-gradient-to-br from-yellow-100 to-amber-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_2px_4px_rgba(0,0,0,0.1)] border border-amber-200/50' : ''
                }`}>
                  <Coins size={14} className={theme === 'black' ? 'text-amber-400' : theme === 'aero' ? 'text-amber-600 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]' : 'text-amber-600'} />
                </div>
                
                <div className="flex flex-col items-start leading-none relative z-10 -ml-0.5">
                  <span className={`text-sm tracking-tighter ${theme === 'aero' ? 'font-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]' : 'font-black'}`}>
                    {userAras}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-80 mt-0.5">Aras</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-center gap-2 mb-4">
          {isLoggedIn ? (
            <>
              <div 
                className="w-14 h-14 rounded-full p-1 bg-white/20 backdrop-blur-md border border-white/40 shadow-xl overflow-hidden group cursor-pointer"
                onClick={() => navigateTo('settings')}
              >
                {userAvatar ? (
                  <img 
                    src={userAvatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={`w-full h-full rounded-full flex items-center justify-center transition-colors duration-500 ${theme === 'black' ? 'bg-white/10 text-white' : 'bg-gradient-to-br from-blue-400 to-sky-600 text-white shadow-inner'}`}>
                    <User size={28} />
                  </div>
                )}
              </div>
              <div className="hidden lg:flex flex-col items-center cursor-pointer" onClick={() => navigateTo('settings')}>
                <span className={`hidden lg:block text-[11px] font-black uppercase tracking-widest ${theme === 'black' ? 'text-white' : 'text-sky-900/80'}`}>{userName}</span>
                <span className={`hidden lg:block text-[9px] font-bold uppercase tracking-widest opacity-40 ${theme === 'black' ? 'text-white' : 'text-sky-800'}`}>{userRole}</span>
              </div>
            </>
          ) : (
            <div className="w-full px-4">
              <GlossyButton onClick={() => setIsRegistering(true)} className="w-full py-3 flex items-center justify-center text-[10px] font-black tracking-widest uppercase !rounded-[20px]">
                INICIAR SESIÓN
              </GlossyButton>
            </div>
          )}
        </div>

        <div className="flex-1 w-full lg:px-4 lg:overflow-y-auto lg:custom-scrollbar flex lg:flex-col flex-row justify-around lg:justify-start items-center gap-1 lg:gap-4">
          {/* Desktop Search Bar */}
          <div className="hidden lg:flex w-full mb-2">
            <div className="relative w-full group">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 ${theme === 'black' ? 'text-white/30 group-focus-within:text-blue-400' : 'text-sky-900/40 group-focus-within:text-blue-500'}`} size={16} />
              <input 
                type="text"
                value={gallerySearch}
                onChange={(e) => {
                  const val = e.target.value;
                  const normalized = val.toLowerCase().trim();
                  const secret = 'newen.araoz.ar/horario';
                  const secretAlt = 'newen.araoz.ar/horarios';
                  const secretShort = '/horario';
                  const secretShortAlt = '/horarios';
                  
                  // Solo redirigir si es el match exacto
                  if (normalized === secret || normalized === secretAlt || normalized === secretShort || normalized === secretShortAlt) {
                    navigateTo('horario');
                    setGallerySearch('');
                    return;
                  }

                  if (normalized === 'newen.araoz.ar/materia/italiano' || normalized === '/materia/italiano') {
                    const sub = SUBJECTS.find(s => s.id === 'italiano');
                    if (sub) {
                      setSelectedSubject(sub);
                      navigateTo('subject', { subjectId: 'italiano' });
                      setGallerySearch('');
                      return;
                    }
                  }

                  const unitMatch = normalized.match(/newen\.araoz\.ar\/materia\/italiano\/unidad\/(\d+)/) || normalized.match(/\/materia\/italiano\/unidad\/(\d+)/);
                  if (unitMatch) {
                    const sub = SUBJECTS.find(s => s.id === 'italiano');
                    const unitIdx = parseInt(unitMatch[1]) - 1;
                    if (sub && sub.units[unitIdx]) {
                      setSelectedSubject(sub);
                      setSelectedUnitIndex(unitIdx);
                      navigateTo('unit-study', { subjectId: 'italiano', unitIndex: unitIdx });
                      setGallerySearch('');
                      return;
                    }
                  }

                  setGallerySearch(val);
                  
                  // Siempre navegar a la galería al escribir algo (incluyendo la URL secreta) 
                  // para evitar quedarnos trabados en "Inicio"
                  if (currentView !== 'gallery' && val.trim() !== '') {
                    navigateTo('gallery');
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const normalized = gallerySearch.toLowerCase().trim();
                    if (
                      normalized === 'newen.araoz.ar/horario' || 
                      normalized === 'newen.araoz.ar/horarios' ||
                      normalized === '/horario' ||
                      normalized === '/horarios'
                    ) {
                      navigateTo('horario');
                      setGallerySearch('');
                    }
                  }
                }}
                placeholder="Buscar actividades..."
                className={`w-full lg:pl-10 lg:pr-4 py-2.5 rounded-2xl text-[11px] font-black transition-all duration-300 outline-none border-2 ${
                  theme === 'black' 
                    ? 'bg-zinc-900/50 border-white/5 focus:border-blue-500/50 text-white placeholder:text-white/20' 
                    : theme === 'aero'
                      ? 'bg-white/90 border-blue-100 focus:border-blue-500 shadow-lg text-sky-950 placeholder:text-sky-900/40'
                      : 'bg-white border-slate-100 focus:border-blue-500 shadow-sm text-sky-950 placeholder:text-sky-900/30'
                }`}
              />
              {gallerySearch && (
                <button 
                  onClick={() => setGallerySearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-500 hover:text-pink-600 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-col gap-3 w-full">
            <NavButton 
              id="nav-home"
              active={currentView === 'home'} 
              onClick={() => {
                navigateTo('home');
                setShowMobileSubjects(false);
              }} 
              icon={<Home size={22} />} 
              label={t('inicio')} 
              theme={theme}
            />
            <NavButton 
              id="nav-gallery"
              active={currentView === 'gallery'} 
              onClick={() => {
                navigateTo('gallery');
                setShowMobileSubjects(false);
              }} 
              icon={<Globe size={22} />} 
              label="Galería" 
              theme={theme}
            />
            <NavButton 
              id="nav-minigames"
              active={currentView === 'minigames'} 
              onClick={() => {
                navigateTo('minigames');
                setShowMobileSubjects(false);
              }} 
              icon={<Gamepad2 size={22} />} 
              label="Minijuegos" 
              theme={theme}
              badge="BETA"
            />
            <NavButton 
              id="nav-classes"
              active={currentView === 'classes' || currentView === 'class-detail'} 
              onClick={() => {
                navigateTo('classes');
                setShowMobileSubjects(false);
              }} 
              icon={<Users size={22} />} 
              label="Clases" 
              theme={theme}
            />
            <NavButton 
              id="nav-materias"
              active={currentView === 'materias'} 
              onClick={() => {
                navigateTo('materias');
                setShowMobileSubjects(false);
              }} 
              icon={<BookOpen size={22} />} 
              label={t('materias')} 
              theme={theme}
            />
            <NavButton 
              id="nav-settings"
              active={currentView === 'settings'} 
              onClick={() => {
                navigateTo('settings');
                setShowMobileSubjects(false);
              }} 
              icon={<Settings size={22} />} 
              label={t('ajustes')} 
              theme={theme}
            />
            {isModerator && (
              <NavButton 
                id="nav-users"
                active={currentView === 'users'} 
                onClick={() => {
                  navigateTo('users');
                  setShowMobileSubjects(false);
                }} 
                icon={<Users2 size={22} />} 
                label="Usuarios" 
                theme={theme}
              />
            )}
            {isModerator && (
              <NavButton 
                id="nav-reports"
                active={currentView === 'reports'} 
                onClick={() => {
                  navigateTo('reports');
                  fetchReports();
                }} 
                icon={<AlertTriangle size={22} />} 
                label="Denunciados" 
                theme={theme}
                badge={reports.length > 0 ? reports.length.toString() : undefined}
              />
            )}
            {isClaudia && (
              <NavButton 
                active={currentView === 'horario'} 
                onClick={() => navigateTo('horario')} 
                icon={<Calendar size={22} />} 
                label="Horarios" 
                theme={theme}
              />
            )}
          </div>

          {/* Mobile Navigation - Redesigned Bottom Tab Bar */}
          {!minigameSessionId && (
            <div className="flex lg:hidden justify-around items-center w-full h-full relative z-10 px-1">
              <MobileTabButton 
                active={currentView === 'home'} 
                onClick={() => {
                  navigateTo('home');
                  setShowMoreMobileMenu(false);
                  setShowMobileSubjects(false);
                }} 
                icon={<Home size={20} />} 
                label={t('inicio')} 
                theme={theme}
              />
              <MobileTabButton 
                active={currentView === 'classes' || currentView === 'class-detail'} 
                onClick={() => {
                  navigateTo('classes');
                  setShowMoreMobileMenu(false);
                  setShowMobileSubjects(false);
                }} 
                icon={<Users size={20} />} 
                label="Clases" 
                theme={theme}
              />
              <MobileTabButton 
                active={false} 
                onClick={handleCreateActivityClick} 
                icon={<Plus size={20} strokeWidth={4} />} 
                label="" 
                theme={theme}
                isCenter={true}
              />
              <MobileTabButton 
                active={currentView === 'gallery'} 
                onClick={() => {
                  navigateTo('gallery');
                  setShowMoreMobileMenu(false);
                  setShowMobileSubjects(false);
                }} 
                icon={<Globe size={20} />} 
                label="Galería" 
                theme={theme}
              />
              <MobileTabButton 
                active={showMoreMobileMenu} 
                onClick={() => {
                  setShowMoreMobileMenu(!showMoreMobileMenu);
                  setShowMobileSubjects(false);
                }} 
                icon={<Menu size={20} />} 
                label={t('mas')} 
                theme={theme}
              />
            </div>
          )}

          {/* Mobile Menu Overlay */}
          <AnimatePresence>
            {showMoreMobileMenu && !minigameSessionId && (
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className={`fixed bottom-[85px] left-4 right-4 p-4 rounded-[32px] border-4 shadow-2xl backdrop-blur-3xl z-50 flex flex-col max-h-[70vh] overflow-hidden ${
                  theme === 'black' 
                    ? 'bg-black/90 border-white/10' 
                    : 'bg-white/95 border-white/60'
                }`}
              >
                <div className="glossy-overlay opacity-30 rounded-3xl" />
                <div className="flex items-center justify-between mb-4 px-2 flex-shrink-0">
                  <p className={`text-[11px] font-black uppercase tracking-widest ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
                    Menú Principal
                  </p>
                  <button 
                    onClick={() => setShowMoreMobileMenu(false)}
                    className={`p-1.5 rounded-full ${theme === 'black' ? 'bg-white/10' : 'bg-slate-100'} hover:scale-110 active:scale-95 transition-transform`}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
                  <div className="h-0.5 bg-white/10 my-2" />
                  <MobileMenuButton 
                    id="nav-minigames"
                    active={currentView === 'minigames'} 
                    onClick={() => { navigateTo('minigames'); setShowMoreMobileMenu(false); }} 
                    icon={<Gamepad2 size={20} />} 
                    label="Minijuegos" 
                    theme={theme}
                    badge="BETA"
                  />

                  <MobileMenuButton 
                    id="nav-materias"
                    active={currentView === 'materias'} 
                    onClick={() => { navigateTo('materias'); setShowMoreMobileMenu(false); }} 
                    icon={<BookOpen size={20} />} 
                    label={t('materias')} 
                    theme={theme}
                  />

                  <MobileMenuButton 
                    id="nav-settings"
                    active={currentView === 'settings'} 
                    onClick={() => { navigateTo('settings'); setShowMoreMobileMenu(false); }} 
                    icon={<Settings size={20} />} 
                    label={t('ajustes')} 
                    theme={theme}
                  />
                  {isModerator && (
                    <>
                      <MobileMenuButton 
                        id="nav-users"
                        active={currentView === 'users'} 
                        onClick={() => { navigateTo('users'); setShowMoreMobileMenu(false); }} 
                        icon={<Users2 size={20} />} 
                        label="Usuarios" 
                        theme={theme}
                      />
                      <MobileMenuButton 
                        id="nav-reports"
                        active={currentView === 'reports'} 
                        onClick={() => { navigateTo('reports'); fetchReports(); setShowMoreMobileMenu(false); }} 
                        icon={<AlertTriangle size={20} />} 
                        label={t('denunciados')} 
                        theme={theme}
                        badge={reports.length > 0 ? reports.length.toString() : undefined}
                      />
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showMobileSubjects && (
                  <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className={`fixed bottom-[85px] left-4 right-4 p-5 rounded-[32px] border-4 shadow-2xl backdrop-blur-3xl z-50 overflow-hidden flex flex-col max-h-[70vh] ${
                      theme === 'black' 
                        ? 'bg-black/90 border-white/10' 
                        : 'bg-white/95 border-white/60'
                    }`}
                  >
                    <div className="glossy-overlay opacity-30 rounded-3xl" />
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                      <p className={`text-[11px] font-black uppercase tracking-widest ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
                        {t('explorarMaterias')}
                      </p>
                      <button 
                        onClick={() => setShowMobileSubjects(false)}
                        className={`p-1.5 rounded-full ${theme === 'black' ? 'bg-white/10' : 'bg-slate-100'} hover:scale-110 active:scale-95 transition-transform`}
                      >
                        <ArrowLeft size={14} className="rotate-[-90deg]" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 overflow-y-auto pr-1 custom-scrollbar">
                      {[...SUBJECTS].sort((a, b) => {
                        const colorOrder = ['red', 'orange', 'amber', 'yellow', 'green', 'emerald', 'sky', 'blue', 'indigo', 'violet', 'purple', 'rose', 'pink'];
                        const idxA = colorOrder.indexOf(a.color);
                        const idxB = colorOrder.indexOf(b.color);
                        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
                      }).map(s => (
                        <button 
                          key={s.id}
                          onClick={() => {
                            playExternalBubble();
                            setSelectedSubject(s);
                            navigateTo('subject', { subjectId: s.id });
                            setShowMobileSubjects(false);
                          }}
                          className={`flex flex-row items-center gap-4 p-4 rounded-3xl transition-all active:scale-95 border-2 ${
                            theme === 'black' 
                              ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                              : 'bg-slate-50 border-transparent hover:border-blue-200 shadow-[0_4px_10px_-4px_rgba(0,0,0,0.1)]'
                          }`}
                        >
                          <div className={`p-2.5 rounded-2xl text-white shadow-lg bg-gradient-to-b ${getColorClasses(s.color)} flex-shrink-0`}>
                            {getIcon(s.icon, 18)}
                          </div>
                          <div className="flex flex-col items-start overflow-hidden">
                            <span className={`text-sm font-black transition-colors duration-500 uppercase tracking-tighter truncate w-full ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{s.name}</span>
                            <span className={`text-[10px] font-medium opacity-60 truncate w-full ${theme === 'black' ? 'text-white/60' : 'text-sky-800'}`}>{s.description}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Main Content Area Logo for Mobile */}
      {!(currentView === 'minigames' && minigameSession && !isMinigameHost && (minigameSession.status === 'playing' || minigameSession.status === 'results' || minigameSession.status === 'reveal' || minigameSession.status === 'ended')) && (
        <div className={`lg:hidden w-full flex flex-col items-center justify-center h-16 px-4 z-30 sticky top-0 transition-all duration-500 bg-transparent`}>
          <div className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2">
             {isLoggedIn ? (
               <div 
                 className="w-11 h-11 rounded-full p-0.5 bg-white/20 border-2 border-white/40 shadow-lg overflow-hidden cursor-pointer active:scale-90 transition-transform"
                 onClick={() => navigateTo('settings')}
               >
                 {userAvatar ? (
                   <img src={userAvatar} alt="Profile" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                 ) : (
                   <div className={`w-full h-full rounded-full flex items-center justify-center ${theme === 'black' ? 'bg-white/10' : 'bg-gradient-to-br from-blue-400 to-sky-600 text-white shadow-inner'}`}>
                     <User size={20} />
                   </div>
                 )}
               </div>
             ) : (
               <GlossyButton onClick={() => setIsRegistering(true)} className="px-3 py-1.5 text-[9px] font-black tracking-widest uppercase !rounded-[14px]">
                 INICIAR SESIÓN
               </GlossyButton>
             )}
          </div>
          
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
             {isLoggedIn && (
               <div 
                 onClick={() => navigateTo('aras')}
                 className={`relative overflow-hidden flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all active:scale-95 cursor-pointer group ${
                   theme === 'black' 
                     ? 'bg-gradient-to-b from-amber-500/20 to-amber-700/20 border-amber-500/40 text-amber-300 shadow-[inset_0_1px_3px_rgba(251,191,36,0.3)]' 
                     : theme === 'aero' 
                     ? 'bg-gradient-to-b from-amber-200 to-amber-400 border-amber-300/80 text-amber-950 shadow-[inset_0_2px_8px_rgba(255,255,255,0.8),0_4px_12px_rgba(251,191,36,0.4)]' 
                     : 'bg-gradient-to-b from-amber-50 to-amber-100 border-amber-200 text-amber-700 shadow-sm'
                 }`}
                 title="Historial de Aras"
               >
                 {theme === 'aero' && <div className="absolute top-0 left-0 w-full h-1/2 bg-white/40 rounded-t-2xl pointer-events-none"></div>}
                 
                 <div className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full ${
                  theme === 'aero' ? 'bg-gradient-to-br from-yellow-100 to-amber-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_2px_4px_rgba(0,0,0,0.1)] border border-amber-200/50' : ''
                 }`}>
                   <Coins size={16} className={theme === 'black' ? 'text-amber-400' : theme === 'aero' ? 'text-amber-600 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]' : 'text-amber-600'} />
                 </div>
                 
                 <div className="flex flex-col items-start leading-none relative z-10 -ml-0.5">
                   <span className={`text-base tracking-tighter ${theme === 'aero' ? 'font-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]' : 'font-black'}`}>
                     {userAras}
                   </span>
                   <span className="text-[9px] font-black uppercase tracking-widest opacity-80 mt-0.5">Aras</span>
                 </div>
               </div>
             )}
          </div>

          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
             {isLoggedIn && (
               <button 
                 onClick={() => {
                   playExternalBubble();
                   setShowNotifications(true);
                 }}
                 className={`relative p-2.5 rounded-2xl transition-all active:scale-90 border-2 hover:scale-105 ${
                   theme === 'black' ? 'bg-white/5 border-white/10' : 'bg-white/40 border-white shadow-inner'
                 }`}
               >
                 <Bell size={20} className={theme === 'black' ? 'text-white' : 'text-sky-950'} />
                 {notifications.filter(n => !n.isRead).length > 0 && (
                   <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-white animate-pulse" />
                 )}
               </button>
             )}
          </div>

          <AnimatePresence>
            {isOffline && (
              <motion.div 
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="mt-4 flex items-center gap-2 px-4 py-1.5 bg-red-500/90 backdrop-blur-md rounded-full border border-white/30 shadow-lg"
              >
                 <WifiOff size={14} className="text-white" />
                 <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{t('sistemaOffline')}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <main className={`flex-1 overflow-y-auto overflow-x-hidden relative transition-all duration-500 ${
        (minigameSessionId || activeExercise !== null || currentView === 'play-activity' || currentView === 'create-activity') 
          ? 'p-0' 
          : 'p-4 pb-32 lg:p-8'
      }`}>
        <AnimatePresence>
          {isOffline && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:flex absolute top-8 right-8 z-50 items-center gap-3 px-6 py-2.5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl group overflow-hidden"
            >
              <div className="absolute inset-0 bg-red-500/10 opacity-50 group-hover:opacity-100 transition-opacity" />
              <WifiOff size={20} className="text-red-400 relative z-10 animate-pulse" />
              <div className="relative z-10">
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-none">{t('modoSinConexion')}</p>
                <p className={`text-xs font-bold transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>OFFLINE</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          {currentView === 'classes' && (
            <motion.div 
              key="classes"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                   <h1 className={`text-4xl font-black tracking-tighter ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{t('misClases')}</h1>
                   <p className={`font-bold opacity-60 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>
                     {userRole === 'Profesor' ? t('gestionaAulas') : t('participaClases')}
                   </p>
                </div>
                <div className="flex gap-3">
                  {userRole === 'Profesor' && (
                    <GlossyButton onClick={() => setShowCreateClassModal(true)} className="px-6 py-3 bg-sky-500 text-white flex items-center gap-2">
                       <Plus size={20} /> {t('crearClase')}
                    </GlossyButton>
                  )}
                   <GlossyButton onClick={() => setShowJoinClassModal(true)} className="px-6 py-3 bg-zinc-900 text-white flex items-center gap-2 border border-white/10">
                      <Users size={20} /> {t('unirseCodigo')}
                   </GlossyButton>
                </div>
              </header>

              {isClassesLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                  <RefreshCw className="animate-spin" size={48} />
                  <p className="font-black uppercase tracking-widest text-xs">{t('sincronizandoAulas')}</p>
                </div>
              ) : userClasses.length === 0 ? (
                <div className="text-center py-32 space-y-6 opacity-30">
                   <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-white/20">
                     <Users2 size={48} />
                   </div>
                   <div className="space-y-2">
                     <h3 className="text-xl font-bold italic">{t('noClasesAun')}</h3>
                     <p className="text-sm">{t('creaAunaClase')}</p>
                   </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {userClasses.filter(c => !c.isArchived).map(cls => (
                    <ClassCard 
                      key={cls.id} 
                      cls={cls} 
                      theme={theme}
                      userName={userName}
                      onClick={() => {
                        setActiveClass(cls);
                        setCurrentView('class-detail');
                      }}
                    />
                  ))}
                </div>
              )}
              
              {userClasses.some(c => c.isArchived) && (
                 <div className="pt-12 border-t border-white/5">
                    <h3 className={`text-xs font-black uppercase tracking-[0.2em] opacity-40 mb-6 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{t('clasesArchivadas')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 opacity-40 hover:opacity-100 transition-opacity">
                      {userClasses.filter(c => c.isArchived).map(cls => (
                        <ClassCard 
                          key={cls.id} 
                          cls={cls} 
                          theme={theme}
                          userName={userName}
                          onClick={() => {
                            if (cls.ownerName === userName) {
                               setConfirmModal({
                                 show: true,
                                 title: t('restaurarClase'),
                                 message: t('mensajeRestaurar'),
                                 type: 'warning',
                                 onConfirm: () => {
                                   updateDoc(doc(db, 'classes', cls.id), { isArchived: false }).then(() => {
                                     fetchUserClasses();
                                     setConfirmModal(prev => ({ ...prev, show: false }));
                                   });
                                 }
                               });
                             } else {
                               setConfirmModal({
                                 show: true,
                                 title: 'Clase Archivada',
                                 message: 'Esta clase ha sido archivada por el profesor.',
                                 type: 'warning',
                                 onConfirm: () => setConfirmModal(prev => ({ ...prev, show: false }))
                               });
                             }
                          }}
                        />
                      ))}
                    </div>
                 </div>
              )}
            </motion.div>
          )}

          {currentView === 'class-detail' && activeClass && (
             <motion.div
               key="class-detail"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
             >
                <ClassDetail 
                  key={activeClass.id}
                  cls={activeClass}
                  initialTab={initialClassTab}
                  theme={theme}
                  onBack={() => { setCurrentView('classes'); setActiveClass(null); setInitialClassTab('anuncios'); }}
                  isOwner={activeClass.ownerName === userName}
                  announcements={classAnnouncements}
                  comments={announcementComments}
                  members={classMembers}
                  resources={classResources}
                  assignments={classAssignments}
                  submissions={classSubmissions}
                  messages={classMessages}
                  userName={userName}
                  onViewProfile={handleViewProfile}
                  onPostAnnouncement={(content, att) => postAnnouncement(activeClass.id, content, att)}
                  onPostComment={(annId, content) => postComment(activeClass.id, annId, content)}
                  onEditAnnouncement={(annId, content) => editAnnouncement(activeClass.id, annId, content)}
                  onDeleteAnnouncement={(annId) => deleteAnnouncement(activeClass.id, annId)}
                  onEditComment={(annId, commId, content) => editComment(activeClass.id, annId, commId, content)}
                  onDeleteComment={(annId, commId) => deleteComment(activeClass.id, annId, commId)}
                  onReportAbuse={(type, id, content, author, cId, pId) => reportAbuse(type, id, content, author, cId, pId)}
                  onPostMessage={(content) => postMessage(activeClass.id, content)}
                  onShareResource={(title, code) => shareResourceCode(activeClass.id, title, code)}
                  onPlayActivity={(code) => {
                    handleLoadActivity(code);
                  }}
                  onCreateAssignment={(t, d, due, att) => createAssignment(activeClass.id, t, d, due, att)}
                  onSubmitTask={(assId, att) => submitTask(assId, att)}
                  onArchive={() => archiveClassAction(activeClass.id)}
                  onLeave={() => leaveClass(activeClass.id)}
                />
             </motion.div>
          )}

          {currentView === 'home' && (
            <motion.div 
              key="home"
              initial={disableAnimations ? { opacity: 1 } : { opacity: 0, x: 20 }}
              animate={disableAnimations ? { opacity: 1 } : { opacity: 1, x: 0 }}
              exit={disableAnimations ? { opacity: 1 } : { opacity: 0, scale: 0.9, y: 30 }}
              transition={disableAnimations ? { duration: 0 } : { duration: 0.4 }}
              className="space-y-8 max-w-7xl mx-auto"
            >
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border-2 border-red-500/20 rounded-[28px] overflow-hidden relative group">
                <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
                <AlertTriangle size={24} className="text-red-500 relative z-10 shrink-0" />
                <div className="relative z-10">
                  <p className="text-[11px] font-black uppercase tracking-[0.1em] text-red-600">NewAra BETA ahora es newen.araoz.ar</p>
                  <p className={`text-[10px] font-bold opacity-70 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
                    Avisa a Newen.Araoz para denunciar bugs.
                  </p>
                </div>
              </div>

              <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h1 className={`text-3xl md:text-4xl font-bold tracking-tight font-logo uppercase transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
                    {t('inicio')}
                  </h1>
                  <p className={`text-sm md:text-base font-medium transition-colors duration-500 ${theme === 'black' ? 'text-white/60' : 'text-sky-800/60'}`}>{t('explorar')} <span className={`font-logo font-bold transition-colors duration-500 ${theme === 'black' ? 'text-blue-400' : 'text-sky-900'}`}>NewAra</span>.</p>
                </div>
                
                <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
                  <HomeShortcut 
                    icon={<BookOpen size={18} />} 
                    label="Materias" 
                    onClick={() => navigateTo('materias')} 
                    color="bg-sky-500" 
                    theme={theme} 
                  />
                  <HomeShortcut 
                    icon={<LayoutGrid size={18} />} 
                    label="Galería" 
                    onClick={() => navigateTo('gallery')} 
                    color="bg-blue-500" 
                    theme={theme} 
                  />
                  <HomeShortcut 
                    icon={<Gamepad2 size={18} />} 
                    label="Minijuegos" 
                    onClick={() => navigateTo('minigames')} 
                    color="bg-orange-500" 
                    theme={theme} 
                  />
                  <HomeShortcut 
                    icon={<Plus size={18} />} 
                    label="Crear" 
                    onClick={handleCreateActivityClick} 
                    color="bg-emerald-500" 
                    theme={theme} 
                  />
                  <HomeShortcut 
                    icon={<Settings size={18} />} 
                    label="Ajustes" 
                    onClick={() => navigateTo('settings')} 
                    color="bg-slate-500" 
                    theme={theme} 
                  />
                  <HomeShortcut 
                    icon={<Calendar size={18} />} 
                    label="Horarios" 
                    onClick={() => navigateTo('horario')} 
                    color="bg-[#ff2696]" 
                    theme={theme} 
                  />
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                <AeroCard title="Minijuegos en Vivo" theme={theme} className="bg-gradient-to-br from-amber-400/10 to-orange-500/10">
                  <div className="space-y-4">
                    <p className={`text-[10px] font-black uppercase tracking-widest opacity-40 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>Unirse a una Partida</p>
                    <p className="text-[10px] opacity-60 leading-tight">Compite en tiempo real con tus compañeros.</p>
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         value={minigameJoinCode}
                         onChange={(e) => setMinigameJoinCode(e.target.value.toUpperCase())}
                         placeholder="Ej: 29VNA"
                         className={`flex-1 px-3 py-2 rounded-xl border text-xs font-bold transition-all focus:ring-2 focus:ring-amber-400 outline-none ${
                           theme === 'black' ? 'bg-white/5 border-white/10 text-white' : 'bg-white/60 border-white/40 text-sky-950'
                         }`}
                         onKeyDown={(e) => e.key === 'Enter' && joinMinigameSession(minigameJoinCode)}
                       />
                       <button 
                         onClick={() => joinMinigameSession(minigameJoinCode)}
                         className="p-2 rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/30 active:scale-90 transition-all"
                       >
                         <Users size={18} />
                       </button>
                    </div>
                    <div className={`p-3 rounded-2xl bg-white/5 border border-amber-500/10 text-[9px] font-medium leading-tight opacity-60 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>
                      Puntos por respuesta correcta: <span className="font-black text-amber-500">+450</span>
                    </div>

                    {userRole === 'Profesor' && (
                      <div className="pt-4 border-t border-white/10 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="h-[1px] flex-1 bg-white/10" />
                          <span className="text-[9px] font-black opacity-30 uppercase tracking-tighter">O crear un servidor</span>
                          <div className="h-[1px] flex-1 bg-white/10" />
                        </div>
                        <button 
                          onClick={() => navigateTo('minigames')}
                          className="w-full py-3 rounded-2xl bg-orange-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <Server size={16} /> Panel de Control
                        </button>
                      </div>
                    )}
                  </div>
                </AeroCard>

                <AeroCard title="Práctica Individual" theme={theme} className="bg-gradient-to-br from-purple-400/10 to-pink-500/10">
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <p className={`text-[10px] font-black uppercase tracking-widest opacity-40 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>Ingresar Código de Actividad</p>
                       <p className="text-[10px] opacity-60 leading-tight">Resuelve actividades compartidas a tu propio ritmo.</p>
                       <div className="flex gap-2">
                         <input 
                           type="text" 
                           value={activityCodeInput}
                           onChange={(e) => {
                             setActivityCodeInput(e.target.value.trim());
                             if (loadError) setLoadError(null);
                           }}
                           placeholder="Ej: XyZ789"
                           className={`flex-1 px-3 py-2 rounded-xl border text-xs font-bold transition-all focus:ring-2 focus:ring-purple-400 outline-none ${
                             theme === 'black' ? 'bg-white/5 border-white/10 text-white' : 'bg-white/60 border-white/40 text-sky-950'
                           } ${loadError ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                           onKeyDown={(e) => e.key === 'Enter' && handleLoadActivity(activityCodeInput)}
                         />
                         <button 
                           onClick={() => handleLoadActivity(activityCodeInput)}
                           disabled={isLoadingActivity}
                           className={`p-2 rounded-xl bg-purple-500 text-white shadow-lg shadow-purple-500/30 active:scale-90 transition-all ${isLoadingActivity ? 'opacity-50' : ''}`}
                         >
                           {isLoadingActivity ? (
                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                           ) : (
                             <Play size={18} />
                           )}
                         </button>
                       </div>
                       {loadError && (
                         <motion.p 
                           initial={{ opacity: 0, y: -5 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="text-[9px] font-black uppercase tracking-tight text-red-500 ml-1"
                         >
                           {loadError}
                         </motion.p>
                       )}
                    </div>

                    {activityHistory.length > 0 && (
                      <div className="space-y-1">
                        <p className={`text-[9px] font-black uppercase tracking-widest opacity-40 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>Recientes</p>
                        <div className="flex flex-wrap gap-1">
                          {activityHistory.map(item => (
                            <button
                              key={item.code}
                              onClick={() => handleLoadActivity(item.code)}
                              className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition-all active:scale-95 ${
                                theme === 'black' ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10' : 'bg-white/80 border-purple-200 text-purple-700 hover:bg-purple-50 shadow-sm'
                              }`}
                            >
                              {item.name.length > 12 ? item.name.substring(0, 10) + '...' : item.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AeroCard>

                <AeroCard title="Tus Actividades" theme={theme} className="bg-gradient-to-br from-blue-400/10 to-indigo-500/10 col-span-1 lg:col-span-2 xl:col-span-1">
                    <div className="space-y-4">
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                        {(() => {
                          const myActivities = galleryActivities.filter(a => 
                            (a.creatorName?.trim().toLowerCase() === userName?.trim().toLowerCase() || 
                             a.creatorId?.trim().toLowerCase() === userName?.trim().toLowerCase()) && 
                            a.creatorName
                          );
                          
                          if (myActivities.length === 0) {
                            return (
                              <div className="py-8 text-center space-y-4">
                                <div className="relative inline-block mb-2">
                                  <Library size={48} className="mx-auto opacity-10" />
                                  <Plus className="absolute -top-1 -right-1 text-blue-500 opacity-50" size={20} />
                                </div>
                                <p className="text-[10px] font-black uppercase opacity-40 tracking-widest px-6 leading-relaxed">No tienes actividades creadas todavía</p>
                                <GlossyButton 
                                  onClick={handleCreateActivityClick}
                                  className="w-full py-4 text-[10px] font-black bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/20 rounded-2xl group"
                                >
                                  <div className="flex items-center justify-center gap-2">
                                    <PlusCircle size={16} className="group-hover:scale-110 transition-transform" />
                                    Crear mi primera actividad
                                  </div>
                                </GlossyButton>
                              </div>
                            );
                          }

                          return (
                            <>
                              {myActivities.map(activity => (
                                <div key={activity.id} className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${theme === 'black' ? 'bg-white/5 border-white/10' : 'bg-white/40 border-white/60'}`}>
                                  <div className="overflow-hidden">
                                    <p className={`text-xs font-black truncate ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{activity.name}</p>
                                    <p className="text-[9px] opacity-40 font-bold uppercase">{activity.id}</p>
                                  </div>
                                  <button
                                    onClick={() => createMinigameSession(activity)}
                                    className="p-2 rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-90 transition-all flex-shrink-0"
                                    title="Hostear Minijuego"
                                  >
                                    <Gamepad2 size={16} />
                                  </button>
                                </div>
                              ))}
                              <div className="pt-2">
                                <button
                                  onClick={handleCreateActivityClick}
                                  className={`w-full py-3 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 transition-all active:scale-95 group ${
                                    theme === 'black' 
                                      ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white/60 hover:text-white' 
                                      : 'bg-white/20 border-blue-500/30 hover:border-blue-500/60 text-blue-600/60 hover:text-blue-600'
                                  }`}
                                >
                                  <PlusCircle size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Crear Nueva Actividad</span>
                                </button>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </AeroCard>

                <AeroCard title="Top 5 - Ranking Global" theme={theme} className="bg-gradient-to-br from-emerald-400/10 to-teal-500/10">
                   <div className="space-y-4">
                     <div className="flex items-center justify-between">
                       <p className={`text-[10px] font-black uppercase tracking-widest opacity-40 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>Líderes de la Semana</p>
                       <button onClick={() => navigateTo('leaderboard')} className="text-[10px] font-black text-blue-500 hover:underline">VER TODO</button>
                     </div>
                     <LeaderboardPreview theme={theme} onViewProfile={handleViewProfile} isAuthReady={isAuthReady} />
                     <div className={`p-3 rounded-2xl bg-white/5 border border-emerald-500/10 flex items-center gap-3`}>
                       <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                         <Trophy size={16} />
                       </div>
                       <p className="text-[10px] font-medium leading-tight opacity-70">Sigue completando unidades para subir en el ranking.</p>
                     </div>
                   </div>
                </AeroCard>

                <AeroCard title="Tareas Pendientes" theme={theme} className="bg-gradient-to-br from-rose-400/10 to-orange-500/10 col-span-1 lg:col-span-2">
                   {!isLoggedIn ? (
                     <div className="py-12 text-center space-y-4">
                       <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
                          <UserX size={32} className="text-rose-500 opacity-60 transition-all" />
                       </div>
                       <div className="space-y-2">
                          <h2 className={`text-2xl font-black uppercase tracking-tight ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>NO TIENES CUENTA!</h2>
                          <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Inicia sesión para ver tus tareas.</p>
                       </div>
                     </div>
                   ) : (
                     <div className="space-y-4">
                        {isPendingTasksLoading ? (
                          <div className="flex flex-col items-center justify-center py-10 gap-3">
                            <div className="w-8 h-8 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
                            <p className="text-[10px] font-black uppercase opacity-40">Buscando tareas pendientes...</p>
                          </div>
                        ) : pendingTasks.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {pendingTasks.map(task => (
                              <div 
                                key={task.id} 
                                className={`p-4 rounded-3xl border flex flex-col gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                                  theme === 'black' ? 'bg-white/5 border-white/10' : 'bg-white/40 border-white/60 shadow-sm'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-500 flex-shrink-0">
                                    <ClipboardList size={20} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-black truncate ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{task.title}</p>
                                    <p className="text-[10px] font-bold opacity-40 uppercase truncate">{task.className}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                                  <div className="flex items-center gap-1.5 opacity-50">
                                    <Calendar size={12} />
                                    <span className="text-[10px] font-bold">Vence: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}</span>
                                  </div>
                                  <GlossyButton 
                                    onClick={() => {
                                      playExternalBubble();
                                      const cls = userClasses.find(c => c.id === task.classId);
                                      if (cls) {
                                        setActiveClass(cls);
                                        setInitialClassTab('tareas');
                                        navigateTo('class-detail', { classId: task.classId });
                                      }
                                    }}
                                    className="py-2 px-4 text-[9px] font-black bg-rose-500 shadow-lg shadow-rose-500/20"
                                  >
                                    IR A TAREA
                                  </GlossyButton>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-12 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                              <CheckCircle2 size={32} className="text-emerald-500 opacity-40" />
                            </div>
                            <div className="space-y-1">
                              <p className={`text-base font-black tracking-tight ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>¡Estás al día!</p>
                              <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">No tienes tareas pendientes por ahora.</p>
                            </div>
                          </div>
                        )}
                     </div>
                     )}
                  </AeroCard>
              </div>

              <AeroCard title="Estado NewAra" theme={theme}>
                  <div className="space-y-4">
                    <div className={`p-4 rounded-2xl border shadow-inner ${theme === 'black' ? 'bg-white/5 border-white/10' : 'bg-white/40 border-white/60'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="text-amber-500" size={16} />
                        <span className={`text-xs font-bold uppercase ${theme === 'black' ? 'text-white/80' : 'text-sky-950'}`}>Progreso Global</span>
                      </div>
                      <div className="w-full h-3 bg-sky-100/20 rounded-full overflow-hidden border border-white/20">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${globalProgress}%` }}
                          className="h-full bg-gradient-to-r from-blue-400 to-green-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                        ></motion.div>
                      </div>
                      <div className="flex justify-between mt-2">
                        <p className={`text-[10px] font-bold uppercase ${theme === 'black' ? 'text-white/40' : 'text-sky-800/60'}`}>Nivel {currentLevel}</p>
                        <p className={`text-[10px] font-bold uppercase ${theme === 'black' ? 'text-white/40' : 'text-sky-800/60'}`}>{globalProgress}%</p>
                      </div>
                    </div>
                    
                    <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors cursor-pointer group ${theme === 'black' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/20 border-white/30 hover:bg-white/40'}`}>
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                        <TrendingUp size={16} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-[10px] font-black uppercase leading-none opacity-40 ${theme === 'black' ? 'text-indigo-300' : 'text-indigo-900'}`}>Próxima Sugerencia</p>
                        <p className={`text-xs font-bold ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
                          {(() => {
                            let nextUnit = null;
                            for (const subject of SUBJECTS) {
                              for (let i = 0; i < subject.units.length; i++) {
                                if (!completedUnits.includes(`${subject.id}-${i}`)) {
                                  nextUnit = { subject, unit: subject.units[i], index: i };
                                  break;
                                }
                              }
                              if (nextUnit) break;
                            }
                            return nextUnit 
                              ? `Estudiar ${nextUnit.unit.title.length > 25 ? nextUnit.unit.title.slice(0, 25) + "..." : nextUnit.unit.title} (${nextUnit.subject.name})` 
                              : "¡Todo completado! Repasa tus apuntes.";
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                </AeroCard>

                <AeroCard title={t('materias')} theme={theme} className="lg:col-span-2 xl:col-span-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                    {[...SUBJECTS].sort((a, b) => {
                        const colorOrder = ['red', 'orange', 'amber', 'yellow', 'green', 'emerald', 'sky', 'blue', 'indigo', 'violet', 'purple', 'rose', 'pink'];
                        const idxA = colorOrder.indexOf(a.color);
                        const idxB = colorOrder.indexOf(b.color);
                        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
                    }).map(s => (
                      <button 
                        key={s.id} 
                        onClick={() => handleSubjectClick(s)}
                        className={`p-3 md:p-4 rounded-3xl border transition-all flex flex-row items-center gap-4 group shadow-sm hover:shadow-lg active:scale-95 text-left ${theme === 'black' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/40 border-white/60 hover:bg-white/60'}`}
                      >
                        <div className={`p-2.5 md:p-3 rounded-2xl text-white shadow-lg bg-gradient-to-br ${getColorClasses(s.color)} group-hover:scale-110 transition-transform flex-shrink-0`}>
                          {getIcon(s.icon, 20)}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className={`text-sm md:text-base font-black uppercase tracking-tight truncate ${theme === 'black' ? 'text-white/80' : 'text-sky-900'}`}>
                            {s.name}
                          </span>
                          <span className={`text-[10px] md:text-xs font-medium opacity-60 truncate ${theme === 'black' ? 'text-white/50' : 'text-sky-800/70'}`}>
                            {s.description}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </AeroCard>

                <AeroCard title="Guía de Control" theme={theme}>
                  <div className={`space-y-3 text-sm font-medium ${theme === 'black' ? 'text-white/70' : 'text-sky-900'}`}>
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 rounded bg-blue-100/20 flex items-center justify-center text-[10px]">🖱️</div>
                       <span>Toca los botones de las unidades para ver su contenido.</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 rounded bg-blue-100/20 flex items-center justify-center text-[10px]">🔑</div>
                       <span>Ingresa un código en la caja para acceder a actividades compartidas.</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 rounded bg-blue-100/20 flex items-center justify-center text-[10px]">📈</div>
                       <span>Completa actividades para aumentar tu progreso global automáticamente.</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 rounded bg-blue-100/20 flex items-center justify-center text-[10px]">🏠</div>
                       <span>Navega entre secciones usando la barra lateral izquierda.</span>
                    </div>
                  </div>
                </AeroCard>

              <div className="flex justify-center pt-8">
                <a 
                  href="https://drive.google.com/file/d/1cL9Xm28JXQOe8niwTywc1JqjvdB3SmFO/view?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full md:w-auto px-12 py-5 rounded-3xl bg-gradient-to-br from-green-400 to-green-600 hover:scale-105 active:scale-95 transition-all shadow-[0_8px_30px_rgba(34,197,94,0.4)] text-white font-black text-xl md:text-2xl uppercase tracking-widest flex items-center justify-center gap-4"
                >
                  <Download size={28} />
                  DESCARGAR NEWARA
                </a>
              </div>
              
              </motion.div>
          )}

          {/* Remove play-activity block here to consolidate into the main overlay */}
          {currentView === 'create-activity' && (
            <motion.div 
              key="create-activity"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } }
              }}
              className="max-w-4xl mx-auto space-y-8 relative"
            >
               {/* Decorative Aero Bubbles */}
               {!disableAnimations && (
                 <div className="absolute -z-10 inset-0 overflow-hidden pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/20 backdrop-blur-[2px]"
                        style={{
                          width: Math.random() * 100 + 50,
                          height: Math.random() * 100 + 50,
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [0, -30, 0],
                          x: [0, 20, 0],
                          scale: [1, 1.1, 1],
                          rotate: [0, 45, 0],
                        }}
                        transition={{
                          duration: 4 + Math.random() * 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: Math.random() * 5
                        }}
                      />
                    ))}
                 </div>
               )}

               <motion.header 
                 variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                 className="flex items-center gap-4 py-2"
               >
                  <button 
                    onClick={() => setCurrentView(lastView)}
                    className="p-3 rounded-2xl bg-white/30 border-t-white/80 border-l-white/60 border border-white/20 shadow-xl backdrop-blur-md active:scale-90 transition-all group"
                  >
                    <ArrowLeft size={24} className="text-sky-600 group-hover:-translate-x-1 transition-transform" />
                  </button>
                  <div>
                    <h1 className={`text-5xl font-black tracking-tight ${theme === 'black' ? 'text-white' : 'text-sky-950'} drop-shadow-sm`}>
                      Crear <span className="text-blue-500">Actividad</span>
                    </h1>
                    <p className={`font-bold text-sm tracking-wide flex items-center gap-2 opacity-60 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>
                      <Sparkles size={14} className="text-blue-400" /> Rapido Y Portatil - Todo Gratis
                    </p>
                  </div>
               </motion.header>

               {newActivityCode ? (
                 <motion.div variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}>
                   <AeroCard title="¡Actividad Publicada!" theme={theme}>
                      <div className="flex flex-col items-center py-8 text-center space-y-8">
                         <div className="relative">
                            <div className="absolute inset-0 bg-green-400/30 blur-2xl rounded-full scale-150 animate-pulse" />
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white shadow-2xl shadow-green-500/40 relative z-10 animate-bounce">
                              <CheckCircle2 size={48} />
                            </div>
                         </div>
                         <div className="space-y-2">
                           <h2 className={`text-3xl font-black ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>¡Listo para Compartir!</h2>
                           <p className={`font-medium ${theme === 'black' ? 'text-white/60' : 'text-sky-900/60'}`}>Copia el código y dáselo a tus amigos.</p>
                         </div>
                         
                         <div className="w-full p-8 rounded-[2.5rem] bg-white/30 border border-white/60 shadow-inner flex flex-col items-center gap-6 relative overflow-hidden group">
                           <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                            <p className={`text-xs font-black uppercase tracking-[0.2em] opacity-40 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>Código de Actividad</p>
                            <div className="text-6xl font-black tracking-[0.15em] text-blue-500 font-mono select-all drop-shadow-[0_2px_10px_rgba(59,130,246,0.2)]">
                               {newActivityCode}
                            </div>
                            <GlossyButton 
                              onClick={() => {
                                navigator.clipboard.writeText(newActivityCode);
                                playExternalBubble();
                              }}
                              className="px-10 py-4 flex items-center gap-3 group-hover:scale-105 transition-transform"
                            >
                              <Copy size={18} /> COPIAR CÓDIGO
                            </GlossyButton>
                         </div>

                         <GlossyButton 
                           onClick={() => {
                             setNewActivityCode('');
                             setActivityName('');
                             setActivityQuestions([
                               { question: '', options: ['', '', '', ''], correct: 0 },
                               { question: '', options: ['', '', '', ''], correct: 0 },
                               { question: '', options: ['', '', '', ''], correct: 0 }
                             ]);
                             setCurrentView('home');
                           }}
                           className="w-full py-5 text-white bg-sky-500 border-2 border-white/20 shadow-2xl"
                         >
                           VOLVER AL INICIO
                         </GlossyButton>
                      </div>
                   </AeroCard>
                 </motion.div>
               ) : (
                 <>
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <motion.div 
                      variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                      className="lg:col-span-5 space-y-6 lg:sticky lg:top-8"
                    >
                       <AeroCard title="General" theme={theme} className="relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10">
                            <PlusCircle size={64} />
                         </div>
                         <div className="space-y-6 pt-2">
                            <GlossyInput 
                              label="Nombre de la Actividad"
                              theme={theme}
                              value={activityName}
                              onChange={(e) => setActivityName(e.target.value)}
                              placeholder="Ej: Quiz de Historia Argentina"
                              className="text-lg py-4"
                            />
                         </div>
                       </AeroCard>

                       <AeroCard theme={theme} className="bg-blue-400/5 border-blue-400/20 backdrop-blur-sm">
                          <div className="flex gap-4 p-2 text-xs font-bold leading-relaxed">
                             <Lightbulb className="text-blue-500 flex-shrink-0 animate-pulse" size={24} />
                             <div className="space-y-1">
                               <p className={theme === 'black' ? 'text-white' : 'text-sky-900'}>Consejo Aero</p>
                               <p className="opacity-60">
                                 Usa títulos descriptivos y preguntas claras.
                                 <br/>
                                 <span className="text-blue-500 font-bold">¡Tip!</span> Las actividades pueden jugarse como <span className="font-bold underline">Minijuegos en Vivo</span> con toda tu clase.
                               </p>
                             </div>
                          </div>
                       </AeroCard>

                    </motion.div>

                    <motion.div 
                      variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
                      className="lg:col-span-7 space-y-6"
                    >
                      <div className="flex items-center justify-between px-2">
                         <h2 className={`text-xl font-black uppercase tracking-widest ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
                           Contenido <span className="text-blue-500">({activityQuestions.length})</span>
                         </h2>
                         <button 
                           onClick={() => {
                             if (activityQuestions.length < 15) {
                               setActivityQuestions([...activityQuestions, { question: '', options: ['', '', '', ''], correct: 0, type: 'multiple-choice' }]);
                               playExternalBubble();
                             }
                           }}
                           className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:brightness-110 active:scale-95 transition-all"
                         >
                           <Plus size={16} /> Añadir Pregunta
                         </button>
                      </div>

                      <div className="space-y-8">
                        {activityQuestions.map((q, qIdx) => (
                           <motion.div
                             key={qIdx}
                             variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                           >
                             <AeroCard 
                               title={`Pregunta ${qIdx + 1}`} 
                               theme={theme}
                               className="group"
                               extra={
                                 <div className="flex items-center gap-2">
                                   {activityQuestions.length > 1 && (
                                     <button 
                                       onClick={() => {
                                         removeQuestion(qIdx);
                                         playErrorSound();
                                       }}
                                       className="p-2.5 bg-red-500/10 text-red-500 border border-red-500/10 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90 group/del flex items-center gap-1.5"
                                       title="Eliminar pregunta"
                                     >
                                       <Trash2 size={16} className="group-hover/del:animate-bounce" />
                                       <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Eliminar</span>
                                     </button>
                                   )}
                                 </div>
                               }
                             >
                               <div className="space-y-6">
                                 <div className="flex flex-wrap gap-2 pt-1">
                                    {['multiple-choice', 'true-false', 'writing'].map((type: any) => (
                                       <button 
                                          key={type}
                                          onClick={() => {
                                             const newQs = [...activityQuestions];
                                             (newQs[qIdx] as any).type = type;
                                             if (type === 'true-false') {
                                                newQs[qIdx].options = ['Verdadero', 'Falso'];
                                                newQs[qIdx].correct = 0;
                                             } else if (type === 'writing') {
                                                newQs[qIdx].options = [];
                                                newQs[qIdx].correct = '';
                                             } else {
                                                newQs[qIdx].options = ['', '', '', ''];
                                                newQs[qIdx].correct = 0;
                                             }
                                             setActivityQuestions(newQs);
                                             playExternalBubble();
                                          }}
                                          className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-300 flex items-center gap-2 ${
                                             q.type === type 
                                             ? 'bg-blue-500 text-white border-blue-400 shadow-[0_5px_15px_-5px_rgba(59,130,246,0.6)] scale-105 z-10' 
                                             : (theme === 'black' ? 'bg-white/5 border-white/10 text-white/40 opacity-60 hover:opacity-100 hover:bg-white/10' : 'bg-white/60 border-white/40 text-sky-900/40 opacity-60 hover:opacity-100 hover:bg-white/80')
                                          }`}
                                       >
                                          {type === 'multiple-choice' && <MessageSquare size={12} />}
                                          {type === 'true-false' && <CheckCircle size={12} />}
                                          {type === 'writing' && <Edit3 size={12} />}
                                          {type === 'multiple-choice' ? 'Quiz' : type === 'true-false' ? 'V/F' : 'Escribir'}
                                       </button>
                                    ))}
                                 </div>

                                 <GlossyInput 
                                   theme={theme}
                                   label="Enunciado"
                                   value={q.question}
                                   onChange={(e) => {
                                     const newQs = [...activityQuestions];
                                     newQs[qIdx].question = e.target.value;
                                     setActivityQuestions(newQs);
                                   }}
                                   placeholder={q.type === 'writing' ? "Instrucción (Ej: Pasa a negativo...)" : "Escribe la pregunta..."}
                                   className="text-md"
                                 />
                                 
                                 <motion.div layout className="space-y-4">
                                   {q.type === 'writing' ? (
                                     <GlossyInput 
                                       theme={theme}
                                       label="Respuesta Correcta"
                                       value={q.correct as string}
                                       onChange={(e) => {
                                         const newQs = [...activityQuestions];
                                         newQs[qIdx].correct = e.target.value;
                                         setActivityQuestions(newQs);
                                       }}
                                       placeholder="Ingresa la respuesta exacta..."
                                       className="border-green-500/30 focus:border-green-500"
                                     />
                                   ) : (
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                       {q.options.map((opt: string, optIdx: number) => (
                                         <div key={optIdx} className="flex gap-2 items-center group/opt relative">
                                           <div className="flex-1 relative group/input">
                                              <input 
                                                type="text" 
                                                value={opt}
                                                readOnly={q.type === 'true-false'}
                                                onChange={(e) => {
                                                  const newQs = [...activityQuestions];
                                                  newQs[qIdx].options[optIdx] = e.target.value;
                                                  setActivityQuestions(newQs);
                                                }}
                                                className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm font-bold transition-all duration-300 outline-none ${
                                                  theme === 'black' ? 'bg-white/5 border-white/5' : 'bg-white/60 border-white/20'
                                                } ${q.correct === optIdx 
                                                    ? 'ring-4 ring-green-500/20 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.15)] bg-green-500/5' 
                                                    : 'hover:border-blue-400/50'
                                                }`}
                                                placeholder={`Opción ${optIdx + 1}`}
                                              />
                                              <div 
                                                onClick={() => {
                                                  const newQs = [...activityQuestions];
                                                  newQs[qIdx].correct = optIdx;
                                                  setActivityQuestions(newQs);
                                                  playExternalBubble();
                                                }}
                                                className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                                                  q.correct === optIdx 
                                                  ? 'bg-green-500 border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]' 
                                                  : 'bg-white/20 border-white/40 group-hover/input:border-blue-400'
                                                }`}
                                              >
                                                {q.correct === optIdx && <Check size={12} className="text-white" />}
                                              </div>
                                           </div>
                                           
                                           {q.type === 'multiple-choice' && q.options.length > 2 && (
                                             <button 
                                               onClick={() => removeOption(qIdx, optIdx)}
                                               className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center opacity-0 group-hover/opt:opacity-100 focus:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-sm"
                                               title="Eliminar opción"
                                             >
                                               <X size={16} />
                                             </button>
                                           )}
                                         </div>
                                       ))}
                                       
                                       {q.type === 'multiple-choice' && q.options.length < 6 && (
                                          <button 
                                            onClick={() => {
                                              const newQs = [...activityQuestions];
                                              newQs[qIdx].options.push('');
                                              setActivityQuestions(newQs);
                                              playExternalBubble();
                                            }}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed transition-all hover:scale-[1.02] active:scale-95 ${
                                              theme === 'black' ? 'border-white/10 text-white/30 hover:border-white/30' : 'border-sky-900/10 text-sky-950/30 hover:border-sky-900/30'
                                            }`}
                                          >
                                            <Plus size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Añadir Opción</span>
                                          </button>
                                       )}
                                     </div>
                                   )}
                                 </motion.div>
                               </div>
                             </AeroCard>
                           </motion.div>
                        ))}
                      </div>

                      <motion.button 
                        whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (activityQuestions.length < 15) {
                            setActivityQuestions([...activityQuestions, { question: '', options: ['', '', '', ''], correct: 0, type: 'multiple-choice' }]);
                            playExternalBubble();
                          }
                        }}
                        className={`w-full py-10 rounded-[2rem] border-4 border-dashed transition-all flex flex-col items-center justify-center gap-4 group ${
                          theme === 'black' 
                            ? 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/30' 
                            : 'bg-white/40 border-sky-900/10 text-sky-950/40 hover:bg-white/80 hover:border-sky-900/20 shadow-inner'
                        }`}
                      >
                         <div className="w-16 h-16 rounded-[1.5rem] bg-blue-500/20 text-blue-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 shadow-lg shadow-blue-500/20">
                            <Plus size={32} strokeWidth={3} />
                         </div>
                         <div className="text-center">
                            <p className="text-xl font-black uppercase tracking-[0.2em] group-hover:text-blue-500 transition-colors">Añadir otra Pregunta</p>
                            <p className="text-xs font-bold opacity-60">¡Haz tu actividad más completa!</p>
                         </div>
                      </motion.button>
                    </motion.div>
                 </div>

                 {/* Publicar al fondo */}
                 <div className="max-w-xl mx-auto space-y-6 pt-12 pb-8">
                    {creationError && (
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="p-5 rounded-[1.5rem] bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-black text-center shadow-lg"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <AlertCircle size={18} />
                          {creationError}
                        </div>
                      </motion.div>
                    )}

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <GlossyButton 
                        onClick={handleCreateActivity}
                        loading={isCreatingActivity}
                        className={`w-full py-10 text-2xl font-black tracking-[0.2em] gap-4 shadow-[0_20px_40px_-10px_rgba(59,130,246,0.5)] border-t-white/50 border-l-white/40 ${isCreatingActivity ? 'opacity-80 pointer-events-none' : ''}`}
                      >
                         {isCreatingActivity ? (
                           <div className="flex items-center gap-4">
                              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>PUBLICANDO...</span>
                           </div>
                         ) : (
                           <div className="flex flex-col items-center justify-center">
                             <div className="flex items-center gap-3">
                               PUBLICAR ACTIVIDAD <Share2 size={32} />
                             </div>
                           </div>
                         )}
                      </GlossyButton>
                    </motion.div>
                 </div>
                 </>
               )}
            </motion.div>
          )}

          {currentView === 'leaderboard' && (
            <motion.div 
              key="leaderboard"
              initial={disableAnimations ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
              animate={disableAnimations ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={disableAnimations ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
              transition={disableAnimations ? { duration: 0 } : { duration: 0.4 }}
              className="space-y-8"
            >
              <header className="flex flex-col gap-1">
                <h1 className={`text-3xl md:text-4xl font-bold tracking-tight font-logo uppercase transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
                  Leaderboard
                </h1>
                <p className={`text-sm md:text-base font-medium transition-colors duration-500 ${theme === 'black' ? 'text-white/60' : 'text-sky-800/60'}`}>Los mejores exploradores de <span className="font-logo font-bold">NewAra</span>.</p>
              </header>
              <Leaderboard theme={theme} onViewProfile={handleViewProfile} />
            </motion.div>
          )}

          {currentView === 'minigames' && !minigameSession && (
            <motion.div 
              key="minigames-join"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="min-h-[70vh] flex flex-col items-center justify-center gap-8"
            >
               <NewAraLogo size="lg" theme={theme} />
               <div className="text-center space-y-2">
                 <h1 className={`text-4xl font-black ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>Unirse a Minijuego</h1>
                 <p className="font-bold opacity-60">Ingresa el código del servidor para empezar.</p>
               </div>
               
               <div className="w-full max-w-md p-8 rounded-[40px] border-4 shadow-2xl space-y-6 relative overflow-hidden bg-white/5 border-white/10">
                  <div className="glossy-overlay opacity-20" />
                  <div className="space-y-4 relative z-10">
                    <input 
                      type="text" 
                      value={minigameJoinCode}
                      onChange={(e) => setMinigameJoinCode(e.target.value.toUpperCase())}
                      placeholder="CÓDIGO (Ej: 29VNA)"
                      className="w-full p-6 rounded-3xl bg-white/10 border-2 border-white/20 text-center font-black tracking-[0.5em] text-3xl focus:border-blue-400 outline-none transition-all"
                    />
                    <GlossyButton 
                      onClick={() => joinMinigameSession(minigameJoinCode)}
                      className="w-full py-6 text-xl tracking-widest"
                      loading={isLoadingActivity}
                    >
                      UNIRSE AL SERVIDOR <ChevronRight />
                    </GlossyButton>
                  </div>
               </div>
               <div className="flex flex-col items-center gap-4">
                 <button 
                   onClick={() => navigateTo('home')}
                   className="text-xs font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity"
                 >
                   Volver al inicio
                 </button>
                 {userRole === 'Profesor' && (
                   <div className="flex flex-col items-center gap-2 pt-4">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">O crear un servidor</span>
                     <button 
                       onClick={() => {
                         setShowGalleryTutorial(true);
                         navigateTo('gallery');
                       }}
                       className="px-10 py-5 rounded-3xl bg-orange-500 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/30 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                     >
                       <Server size={18} className="group-hover:rotate-12 transition-transform" /> 
                       <span>Crear Servidor</span>
                     </button>
                   </div>
                 )}
               </div>
            </motion.div>
          )}

          {currentView === 'minigames' && minigameSession && (
            <motion.div 
              key="minigames"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="min-h-[85vh] flex flex-col gap-10 p-6 md:p-12"
            >
              {isMinigameHost && (
                <div className="flex flex-col md:flex-row items-center md:justify-between mb-8 md:mb-6 gap-8 md:gap-4 px-2 md:px-4">
                  <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                    <button onClick={leaveMinigame} className="aero-icon-button bg-white/10 hover:bg-white/20 transition-all p-3 md:p-4 flex-shrink-0">
                      <ArrowLeft className="w-6 h-6 md:w-7 md:h-7" />
                    </button>
                    <div className="flex-1 md:flex-none text-left">
                      <h1 className={`text-2xl md:text-5xl font-black tracking-tight leading-tight ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>Minijuego en Vivo</h1>
                      <p className={`font-bold opacity-60 flex items-center gap-2 text-[10px] md:text-lg ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>
                        <Gamepad2 className="w-3 h-3 md:w-5 md:h-5" /> {minigameSession.activity.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
                     <div className="px-8 py-5 md:px-8 md:py-3 rounded-[32px] md:rounded-2xl bg-blue-600 md:bg-blue-500 text-white font-black tracking-normal md:tracking-widest text-4xl md:text-2xl shadow-[0_20px_50px_-10px_rgba(59,130,246,0.5)] md:shadow-xl md:shadow-blue-500/30 animate-pulse">
                        {minigameSession.code}
                     </div>
                     <p className={`text-[10px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-widest opacity-40 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>Código del Servidor</p>
                  </div>
                </div>
              )}

              {minigameSession.status === 'waiting' && (
                <div className="flex-1 flex flex-col items-center justify-center gap-12 py-12">
                   {!isMinigameHost ? (
                     <div className="flex flex-col items-center gap-8 text-center animate-bounce-slow">
                        <div className="w-24 h-24 rounded-[32px] bg-blue-500 shadow-2xl flex items-center justify-center text-white scale-110">
                           <User size={48} />
                        </div>
                        <div className="space-y-2">
                           <h2 className="text-3xl font-black uppercase tracking-tight">¡Estás dentro!</h2>
                           <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">¿Ves tu nombre en la pantalla?</p>
                        </div>
                        <div className="px-8 py-4 rounded-full bg-white/5 border border-white/10 font-black text-2xl tracking-widest text-white">
                           {userName}
                        </div>
                     </div>
                   ) : (
                     <>
                       <div className="text-center space-y-4">
                          <h2 className={`text-4xl md:text-6xl font-black uppercase tracking-tighter ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>Esperando Jugadores</h2>
                          <div className="flex items-center justify-center gap-3">
                             <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                             <p className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Servidor Activo • {minigamePlayers.length} Conectados</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full max-w-6xl px-4">
                          <AnimatePresence>
                             {minigamePlayers.map((player, idx) => (
                               <motion.div
                                 key={player.name}
                                 initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                 animate={{ opacity: 1, scale: 1, y: 0 }}
                                 exit={{ opacity: 0, scale: 0.5 }}
                                 className={`p-6 rounded-[32px] border-4 text-center relative overflow-hidden group shadow-xl ${
                                   theme === 'black' ? 'bg-zinc-800 border-white/5' : 'bg-white border-white/60'
                                 }`}
                               >
                                  <div className="glossy-overlay opacity-5 group-hover:opacity-10 transition-opacity" />
                                  <p className="text-xl md:text-2xl font-black truncate relative z-10">{player.name}</p>
                                  <div className="absolute top-0 right-0 p-1 opacity-10">
                                     <User size={12} />
                                  </div>
                               </motion.div>
                             ))}
                          </AnimatePresence>
                       </div>

                       {isMinigameHost && minigamePlayers.length > 0 && (
                        <div className="mt-8 flex flex-col items-center gap-4">
                          <GlossyButton onClick={startMinigame} className="px-16 py-6 text-xl bg-green-500 hover:scale-105 active:scale-95 transition-all shadow-2xl">
                             EMPEZAR AHORA <Play className="ml-2" fill="currentColor" />
                          </GlossyButton>
                          <p className="text-[10px] font-black uppercase opacity-20 tracking-widest">El profesor debe iniciar la partida</p>
                        </div>
                       )}
                     </>
                   )}
                </div>
              )}

              {minigameSession.status === 'playing' && (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                   {isMinigameHost ? (
                     /* TEACHER VIEW (Big Screen - Kahoot-Inspired Compact Layout) */
                     <div className="flex-1 flex flex-col gap-4 py-2">
                        {/* Question Area - Large and centered */}
                        <div className={`p-6 md:p-8 rounded-[32px] md:rounded-[48px] border-4 text-center relative overflow-hidden shadow-2xl ${
                          theme === 'black' ? 'bg-zinc-900 border-white/5' : 'bg-white border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)]'
                        }`}>
                           <div className="glossy-overlay opacity-5" />
                           <h2 className={`text-2xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight relative z-10 px-4 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
                             {minigameSession.activity.questions[minigameSession.currentQuestionIndex].question}
                           </h2>
                        </div>
                        {/* Middle Section: Timer | Content | Responses */}
                        <div className="flex-1 min-h-0 flex items-center justify-between gap-4 md:gap-8 px-4">
                           {/* Left: Timer */}
                           <div className="w-[15%] md:w-1/5 flex flex-col items-center">
                              <div className="relative w-20 h-20 md:w-40 md:h-40 lg:w-48 lg:h-48">
                                 <svg className="w-full h-full -rotate-90">
                                    <circle cx="50%" cy="50%" r="45%" className="stroke-white/10 fill-none" strokeWidth="12" />
                                    <motion.circle
                                      cx="50%" cy="50%" r="45%"
                                      className={`fill-none ${minigameTimer <= 5 ? 'stroke-red-500' : 'stroke-purple-500'}`}
                                      strokeWidth="12"
                                      strokeLinecap="round"
                                      initial={{ pathLength: 1 }}
                                      animate={{ pathLength: minigameTimer / 15 }}
                                      transition={{ duration: 1, ease: 'linear' }}
                                    />
                                 </svg>
                                 <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={`text-3xl md:text-6xl lg:text-7xl font-black ${minigameTimer <= 5 ? 'text-red-500 animate-pulse' : 'text-purple-500'}`}>
                                       {minigameTimer}
                                    </span>
                                 </div>
                              </div>
                              <p className="mt-2 text-[10px] font-black uppercase tracking-widest opacity-20">Segundos</p>
                           </div>

                           {/* Center: Interactive Area (Image Placeholder or Status) */}
                           <div className="flex-1 h-full max-h-[40vh] flex items-center justify-center">
                              <div className="w-full h-full max-w-2xl bg-white/5 border-4 border-dashed border-white/10 rounded-[40px] flex flex-col items-center justify-center p-6 relative overflow-hidden group">
                                 <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-30" />
                                 <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity }} className="relative z-10 text-center">
                                    <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                                       <Gamepad2 size={48} className="text-white opacity-20" />
                                    </div>
                                    <p className="text-[10px] md:text-sm font-black uppercase tracking-[0.4em] opacity-30 mt-2">{minigameSession.activity.name}</p>
                                 </motion.div>
                              </div>
                           </div>

                           {/* Right: Response count & Skip */}
                           <div className="w-[15%] md:w-1/5 flex flex-col items-center justify-center gap-6">
                              <div className="text-center group">
                                 <motion.p 
                                   key={minigamePlayers.filter(p => p.lastResponse?.questionIndex === minigameSession.currentQuestionIndex).length}
                                   initial={{ scale: 0.5, opacity: 0 }}
                                   animate={{ scale: 1, opacity: 1 }}
                                   className="text-4xl md:text-7xl font-black text-blue-500 drop-shadow-lg"
                                 >
                                    {minigamePlayers.filter(p => p.lastResponse?.questionIndex === minigameSession.currentQuestionIndex).length}
                                 </motion.p>
                                 <p className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-40 mt-1">Respuestas</p>
                              </div>
                              <GlossyButton 
                                onClick={showMinigameResults}
                                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:scale-105 transition-all"
                              >
                                SALTEAR <ChevronRight size={14} className="ml-1" />
                              </GlossyButton>
                           </div>
                        </div>

                        {/* Bottom Section: Options Grid (2x2) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2 min-h-[25vh]">
                           { (minigameSession.activity.questions[minigameSession.currentQuestionIndex].type === 'writing' || minigameSession.activity.questions[minigameSession.currentQuestionIndex].type === 'written' ) ? (
                             <div className="col-span-full flex flex-wrap justify-center items-center gap-3 p-4">
                                <AnimatePresence>
                                  {minigamePlayers
                                    .filter(p => p.lastResponse?.questionIndex === minigameSession.currentQuestionIndex)
                                    .map((p, i) => (
                                      <motion.div
                                        key={p.name + i}
                                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className="px-6 py-4 rounded-full bg-white/10 border-2 border-white/10 text-white font-black shadow-xl"
                                      >
                                        {p.name}
                                      </motion.div>
                                    ))}
                                </AnimatePresence>
                             </div>
                           ) : (
                             (minigameSession.activity.questions[minigameSession.currentQuestionIndex].type === 'true-false' ? ['Verdadero', 'Falso'] : minigameSession.activity.questions[minigameSession.currentQuestionIndex].options).map((option: string, idx: number) => {
                               const colors = ['bg-red-500', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500'];
                               const shadows = ['shadow-red-500/10', 'shadow-blue-500/10', 'shadow-amber-500/10', 'shadow-emerald-500/10'];
                               const shapes = ['▲', '◆', '●', '■'];
                               return (
                                 <div key={idx} className={`flex items-center gap-4 p-4 md:p-6 rounded-[24px] md:rounded-[32px] ${colors[idx]} ${shadows[idx]} text-white shadow-xl relative overflow-hidden transition-all hover:brightness-110`}>
                                    <div className="glossy-overlay opacity-20" />
                                    <div className="w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-2xl bg-white/15 flex items-center justify-center text-xl md:text-3xl lg:text-4xl font-black relative z-10 shrink-0">
                                       {shapes[idx]}
                                    </div>
                                    <span className="text-lg md:text-2xl lg:text-3xl font-black relative z-10 break-words line-clamp-2 leading-tight">{option}</span>
                                 </div>
                               );
                             })
                           )}
                        </div>
                     </div>
                   ) : (
                     /* STUDENT VIEW (Kahoot-Style) */
                     <div className="fixed inset-0 flex flex-col bg-slate-900 z-[200]">
                         {/* PIN & Question Top Bar */}
                         <div className="bg-white px-4 md:px-8 py-4 md:py-6 flex items-center justify-between shadow-md border-b">
                           <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-3">
                             <span className="text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-widest leading-tight">PIN DE ACCESO</span>
                             <span className="text-xl md:text-2xl font-black text-blue-600 tracking-normal">{minigameSession.code}</span>
                           </div>
                           <div className="flex items-center gap-4">
                             <div className="flex flex-col items-end">
                               <span className="text-[10px] font-black text-slate-400 uppercase leading-none">Pregunta</span>
                               <span className="text-xl font-black text-slate-800">{minigameSession.currentQuestionIndex + 1}</span>
                             </div>
                             <div className="w-2 h-10 bg-slate-100 rounded-full" />
                             <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-blue-500/10">
                                {userName?.charAt(0).toUpperCase()}
                             </div>
                           </div>
                         </div>

                         {/* Input Area */}
                         <div className="flex-1 flex flex-col p-4 md:p-10 gap-4">
                            { (minigameSession.activity.questions[minigameSession.currentQuestionIndex].type === 'writing' || minigameSession.activity.questions[minigameSession.currentQuestionIndex].type === 'written' ) ? (
                              <div className="flex-1 flex flex-col items-center justify-center gap-6 p-4">
                                 <input 
                                   type="text"
                                   disabled={hasAnsweredCurrentQuestion}
                                   placeholder="ESCRIBE TU RESPUESTA..."
                                   value={minigameWrittenInput}
                                   onChange={(e) => setMinigameWrittenInput(e.target.value)}
                                   className={`w-full p-8 rounded-[32px] border-4 text-center font-black text-2xl outline-none transition-all uppercase ${
                                     hasAnsweredCurrentQuestion 
                                       ? 'bg-white/5 border-blue-500/50 opacity-50 text-white' 
                                       : 'bg-white/10 border-white/20 focus:border-blue-400 text-white'
                                   }`}
                                   onKeyDown={(e) => {
                                     if (e.key === 'Enter' && !hasAnsweredCurrentQuestion && minigameWrittenInput.trim()) {
                                       submitMinigameAnswer(minigameWrittenInput);
                                     }
                                   }}
                                 />
                                 {!hasAnsweredCurrentQuestion && (
                                   <GlossyButton onClick={() => minigameWrittenInput.trim() && submitMinigameAnswer(minigameWrittenInput)} className="w-full py-10 text-2xl font-black">
                                     ENVIAR
                                   </GlossyButton>
                                 )}
                              </div>
                            ) : (
                              <div className="flex-1 grid grid-cols-2 gap-2">
                                 {(minigameSession.activity.questions[minigameSession.currentQuestionIndex].type === 'true-false' ? ['Verdadero', 'Falso'] : minigameSession.activity.questions[minigameSession.currentQuestionIndex].options).map((option: string, idx: number) => {
                                    const colors = ['bg-red-500', 'bg-blue-600', 'bg-amber-500', 'bg-emerald-500'];
                                    const shapes = ['▲', '◆', '●', '■'];
                                    const isAnswered = hasAnsweredCurrentQuestion;
                                    
                                    return (
                                      <motion.button
                                        key={idx}
                                        disabled={isAnswered}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => submitMinigameAnswer(option)}
                                        className={`relative flex flex-col items-center justify-center transition-all ${colors[idx]} ${
                                          isAnswered ? 'opacity-20 grayscale-[0.5]' : ''
                                        } h-full p-4 group`}
                                      >
                                         <div className="glossy-overlay opacity-20" />
                                         <span className="text-7xl font-black text-white drop-shadow-2xl mb-4 group-active:scale-95 transition-transform">{shapes[idx]}</span>
                                         <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{option}</span>
                                      </motion.button>
                                    );
                                 })}
                              </div>
                            )}
                         </div>

                         {/* Footer Bar */}
                         <div className="bg-white px-8 py-4 flex items-center justify-between border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                           <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              <span className="text-sm font-black text-slate-800 uppercase tracking-widest">{userName}</span>
                           </div>
                           <div className="bg-slate-900 text-white px-6 py-2 rounded-xl font-black text-lg shadow-lg">
                             {minigamePlayers.find(p => p.name === userName)?.score || 0}
                           </div>
                         </div>
                      </div>
                   )}
                </div>
              )}

               {minigameSession.status === 'reveal' && (
                 <div className="flex-1 flex flex-col gap-10">
                    {!isMinigameHost ? (
                      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-900 z-[200]">
                         {minigamePlayers.find(p => p.name === userName)?.lastResponse?.isCorrect ? (
                           <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-6">
                              <div className="w-32 h-32 rounded-full bg-green-500 shadow-2xl flex items-center justify-center text-white scale-125">
                                 <CheckCircle size={64} strokeWidth={3} />
                              </div>
                              <h2 className="text-5xl font-black text-white uppercase tracking-tighter">¡CORRECTO!</h2>
                              <div className="bg-white/10 px-6 py-2 rounded-full text-white/60 font-black tracking-widest uppercase text-xs">
                                Sigue así, {userName}
                              </div>
                           </motion.div>
                         ) : (
                           <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-6">
                              <div className="w-32 h-32 rounded-full bg-red-500 shadow-2xl flex items-center justify-center text-white scale-110">
                                 <XCircle size={64} strokeWidth={3} />
                              </div>
                              <h2 className="text-4xl font-black text-white uppercase tracking-tighter">INCORRECTO</h2>
                              <div className="bg-white/10 px-6 py-2 rounded-full text-white/60 font-black tracking-widest uppercase text-xs">
                                No te rindas, {userName}
                              </div>
                           </motion.div>
                         )}
                         <div className="absolute bottom-12 left-0 right-0 px-8">
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                               <motion.div 
                                 initial={{ width: "100%" }} 
                                 animate={{ width: "0%" }} 
                                 transition={{ duration: 5, ease: "linear" }}
                                 className="h-full bg-white/40" 
                               />
                            </div>
                            <p className="text-center text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mt-4">Esperando al profesor...</p>
                         </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-center space-y-6 mb-10">
                           <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white drop-shadow-2xl">Resultados</h2>
                           <div className="inline-flex items-center gap-4 px-10 py-4 rounded-3xl bg-green-500/10 border-2 border-green-500/20 text-green-400 font-black text-lg shadow-xl shadow-green-500/5">
                              <CheckCircle size={24} /> {(minigameSession.activity.questions[minigameSession.currentQuestionIndex].type === 'writing' || minigameSession.activity.questions[minigameSession.currentQuestionIndex].type === 'written') ? '¡Tiempo Agotado! Revisando Respuestas...' : `Respuesta Correcta: ${minigameSession.activity.questions[minigameSession.currentQuestionIndex].correctAnswer}`}
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           {minigameSession.activity.questions[minigameSession.currentQuestionIndex].type === 'writing' || minigameSession.activity.questions[minigameSession.currentQuestionIndex].type === 'written' ? (
                              <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {minigamePlayers.filter(p => p.lastResponse?.questionIndex === minigameSession.currentQuestionIndex).map((p, i) => (
                                   <motion.div 
                                     key={i} 
                                     initial={{ opacity: 0, scale: 0.9 }} 
                                     animate={{ opacity: 1, scale: 1 }}
                                     className={`p-6 rounded-3xl border-2 flex items-center justify-between gap-4 ${
                                       p.isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
                                     }`}
                                   >
                                      <div className="flex items-center gap-4">
                                         <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black">{p.name.charAt(0)}</div>
                                         <span className="font-bold text-xl tracking-tight text-white">{p.name}</span>
                                      </div>
                                      {p.isCorrect ? <CheckCircle className="text-green-500" size={24} /> : <XCircle className="text-red-500" size={24} />}
                                   </motion.div>
                                 ))}
                              </div>
                           ) : (
                              (minigameSession.activity.questions[minigameSession.currentQuestionIndex].type === 'true-false' || minigameSession.activity.questions[minigameSession.currentQuestionIndex].type === 'boolean' ? ['Verdadero', 'Falso'] : minigameSession.activity.questions[minigameSession.currentQuestionIndex].options).map((opt: string, idx: number) => {
                                const count = minigamePlayers.filter(p => p.lastResponse?.questionIndex === minigameSession.currentQuestionIndex && p.lastResponse?.answer === opt).length;
                                const percentage = minigamePlayers.length > 0 ? (count / minigamePlayers.length) * 100 : 0;
                                const colors = ['bg-red-500', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500'];
                                const color = (minigameSession.activity.questions[minigameSession.currentQuestionIndex].type === 'true-false' || minigameSession.activity.questions[minigameSession.currentQuestionIndex].type === 'boolean') ? (opt === 'Verdadero' ? 'bg-blue-500' : 'bg-red-500') : colors[idx];
                                const isCorrect = opt === minigameSession.activity.questions[minigameSession.currentQuestionIndex].correctAnswer;

                                return (
                                  <div key={opt} className={`p-6 rounded-[32px] border-2 space-y-4 ${isCorrect ? 'border-green-500 bg-green-500/5' : 'border-white/10 bg-white/5'}`}>
                                     <div className="flex justify-between items-center font-black">
                                       <div className="flex items-center gap-2">
                                          <div className={`w-3 h-3 rounded-full ${color}`} />
                                          <span className="text-sm uppercase tracking-widest text-white">{opt}</span>
                                          {isCorrect && <CheckCircle size={16} className="text-green-500" />}
                                       </div>
                                       <div className="flex flex-col items-end">
                                          <span className="text-2xl tracking-tighter text-white">{count}</span>
                                          <span className="text-[10px] opacity-40 uppercase tracking-wider font-extrabold">Eligieron esta opción</span>
                                        </div>
                                     </div>
                                     <div className="h-4 bg-white/5 rounded-full overflow-hidden p-0.5">
                                        <motion.div 
                                          initial={{ width: 0 }}
                                          animate={{ width: `${percentage}%` }}
                                          className={`h-full rounded-full ${color} shadow-lg`}
                                        />
                                     </div>
                                  </div>
                                );
                              })
                           )}
                        </div>

                        {isMinigameHost && (
                          <div className="mt-auto flex justify-center">
                             <GlossyButton onClick={showMinigameLeaderboard} className="px-16 py-6 text-xl bg-orange-500 shadow-2xl">
                               VER TABLA DE POSICIONES <Trophy size={24} />
                             </GlossyButton>
                          </div>
                        )}
                      </>
                    )}
                 </div>
               )}

               {minigameSession.status === 'results' && (
                 isMinigameHost ? (
                  <div className="flex-1 flex flex-col gap-12 items-center justify-center">
                     <div className="text-center space-y-4">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight flex items-center justify-center gap-4">
                           <Trophy className="text-amber-500" size={48} /> POSICIONES
                        </h2>
                        <p className="text-sm font-black uppercase tracking-[0.3em] opacity-40">Resultados Parciales</p>
                     </div>

                     <div className="w-full max-w-2xl space-y-4">
                        {minigamePlayers.slice(0, 5).map((player, idx) => (
                          <motion.div
                            key={player.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-6 rounded-[32px] border-2 flex items-center justify-between relative overflow-hidden ${
                              idx === 0 ? 'bg-gradient-to-r from-amber-400/20 to-amber-600/20 border-amber-500/30' :
                              idx === 2 ? 'bg-gradient-to-r from-orange-400/20 to-orange-600/20 border-orange-500/30' :
                              'bg-white/5 border-white/10'
                            }`}
                          >
                             <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
                                  idx === 0 ? 'bg-amber-500 text-white shadow-lg' : 'bg-white/10'
                                }`}>
                                  {idx + 1}
                                </div>
                                <span className="text-lg md:text-xl font-black uppercase tracking-widest">{player.name}</span>
                                {player.pointsLastRound > 0 && (
                                  <span className="px-2 py-0.5 rounded-lg bg-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-tighter">
                                     +{player.pointsLastRound}
                                  </span>
                                )}
                             </div>
                             <div className="text-xl md:text-2xl font-black tracking-tighter">
                                {player.score.toLocaleString()}
                             </div>
                             <div className="glossy-overlay opacity-20" />
                          </motion.div>
                        ))}
                     </div>

                     {isMinigameHost && (
                       <GlossyButton onClick={nextMinigameQuestion} className="px-20 py-5 text-xl">
                          {minigameSession.currentQuestionIndex + 1 >= minigameSession.activity.questions.length ? 'VER PODIO FINAL' : 'SIGUIENTE PREGUNTA'} <ChevronRight size={24} />
                       </GlossyButton>
                     )}
                  </div>
                 ) : (
                   <div className="flex-1 flex flex-col items-center justify-center gap-8">
                     <motion.div 
                       animate={{ 
                         scale: [1, 1.2, 1], 
                         rotate: [0, 5, -5, 0],
                         opacity: [0.5, 1, 0.5]
                       }}
                       transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                       className="w-24 h-24 rounded-[32px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.3)] mb-4"
                     >
                       <Gamepad2 size={48} className="text-blue-400" />
                     </motion.div>
                     <div className="text-center space-y-3">
                        <motion.h3 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white"
                        >
                          ESPERANDO AL PROFESOR
                        </motion.h3>
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-sm font-black uppercase tracking-[0.3em] text-white/40"
                        >
                          Mira la pantalla principal
                        </motion.p>
                     </div>
                   </div>
                 )
               )}

              {minigameSession.status === 'ended' && (
                <div className="flex-1 flex flex-col items-center justify-center gap-16 py-12">
                   <div className="text-center space-y-6">
                      <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-2xl mx-auto mb-8 relative"
                      >
                         <Trophy size={60} />
                         <motion.div 
                           animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                           transition={{ duration: 2, repeat: Infinity }}
                           className="absolute inset-0 rounded-full bg-amber-400 blur-xl -z-10"
                         />
                      </motion.div>
                      <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase whitespace-pre-wrap bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent drop-shadow-2xl">¡FIN DEL JUEGO!</h1>
                      <p className="text-xl font-black uppercase tracking-[0.4em] opacity-40">Podio de Campeones</p>
                   </div>

                   <div className="flex items-end justify-center gap-4 md:gap-12 w-full max-w-5xl px-4 mt-8">
                      {/* Podio 2 - PLATA */}
                      {minigamePlayers[1] && (
                        <motion.div 
                          initial={{ opacity: 0, y: 100 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
                          className="flex flex-col items-center gap-4 flex-1 group"
                        >
                           <div className="relative mb-4">
                             <motion.div 
                               initial={{ scale: 0 }}
                               animate={{ scale: 1 }}
                               transition={{ delay: 1.2, type: 'spring' }}
                               className="w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-slate-300 shadow-2xl overflow-hidden bg-slate-800"
                             >
                               {minigamePlayers[1].avatar ? (
                                 <img src={minigamePlayers[1].avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center text-2xl font-black text-slate-300 bg-slate-700">
                                   {minigamePlayers[1].name?.[0].toUpperCase()}
                                 </div>
                               )}
                             </motion.div>
                             <div className="absolute -bottom-2 -right-2 bg-slate-300 text-slate-900 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-lg border-2 border-slate-900">
                               2
                             </div>
                           </div>
                           <div className="text-center mb-2">
                             <p className="text-sm md:text-xl font-black line-clamp-1 text-slate-300">{minigamePlayers[1].name}</p>
                             <p className="text-[10px] md:text-sm opacity-60 font-black tracking-widest uppercase">{minigamePlayers[1].score} PTS</p>
                           </div>
                           <div className="w-full h-32 md:h-56 rounded-t-[32px] bg-gradient-to-t from-slate-500/40 via-slate-400/20 to-transparent border-x-4 border-t-4 border-slate-300/40 relative flex items-center justify-center overflow-hidden">
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(148,163,184,0.2),transparent)]" />
                              <span className="text-4xl md:text-7xl font-black text-slate-300/20 relative z-10">2</span>
                              <div className="podium-reflection" />
                           </div>
                        </motion.div>
                      )}
                      
                      {/* Podio 1 - ORO */}
                      {minigamePlayers[0] && (
                        <motion.div 
                          initial={{ opacity: 0, y: 150 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8, duration: 1, type: 'spring' }}
                          className="flex flex-col items-center gap-4 flex-1 mb-16 group"
                        >
                           <div className="relative mb-6">
                             <motion.div 
                               animate={{ y: [0, -15, 0] }}
                               transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                               className="absolute -top-14 left-1/2 -translate-x-1/2 text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]"
                             >
                                <Award size={56} />
                             </motion.div>
                             <motion.div 
                               initial={{ scale: 0 }}
                               animate={{ scale: 1 }}
                               transition={{ delay: 1.5, type: 'spring' }}
                               className="w-24 h-24 md:w-36 md:h-36 rounded-full border-4 border-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.4)] overflow-hidden bg-amber-900 ring-8 ring-amber-400/10"
                             >
                               {minigamePlayers[0].avatar ? (
                                 <img src={minigamePlayers[0].avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center text-4xl font-black text-amber-400 bg-amber-950/50">
                                   {minigamePlayers[0].name?.[0].toUpperCase()}
                                 </div>
                               )}
                             </motion.div>
                             <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-950 w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-lg border-2 border-amber-950">
                               1
                             </div>
                           </div>
                           <div className="text-center mb-2">
                             <p className="text-lg md:text-4xl font-black line-clamp-1 text-amber-400 drop-shadow-sm">{minigamePlayers[0].name}</p>
                             <p className="text-xs md:text-xl text-amber-400 font-black tracking-[0.2em]">{minigamePlayers[0].score} PTS</p>
                           </div>
                           <div className="w-full h-48 md:h-80 rounded-t-[40px] bg-gradient-to-t from-amber-600/40 via-amber-500/20 to-transparent border-x-4 border-t-4 border-amber-400/50 relative flex items-center justify-center shadow-[0_-20px_60px_rgba(245,158,11,0.2)] overflow-hidden">
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.4),transparent)]" />
                              <span className="text-7xl md:text-[10rem] font-black text-amber-400/20 relative z-10">1</span>
                              <div className="podium-reflection" />
                              <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400/30" />
                           </div>
                        </motion.div>
                      )}

                      {/* Podio 3 - BRONCE */}
                      {minigamePlayers[2] && (
                        <motion.div 
                          initial={{ opacity: 0, y: 100 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
                          className="flex flex-col items-center gap-4 flex-1 group"
                        >
                           <div className="relative mb-4">
                             <motion.div 
                               initial={{ scale: 0 }}
                               animate={{ scale: 1 }}
                               transition={{ delay: 1, type: 'spring' }}
                               className="w-14 h-14 md:w-20 md:h-20 rounded-full border-4 border-orange-400 shadow-xl overflow-hidden bg-orange-900"
                             >
                               {minigamePlayers[2].avatar ? (
                                 <img src={minigamePlayers[2].avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center text-xl font-black text-orange-400 bg-orange-800">
                                   {minigamePlayers[2].name?.[0].toUpperCase()}
                                 </div>
                               )}
                             </motion.div>
                             <div className="absolute -bottom-1 -right-1 bg-orange-400 text-orange-950 w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-lg border-2 border-orange-950">
                               3
                             </div>
                           </div>
                           <div className="text-center mb-2">
                             <p className="text-xs md:text-lg font-black line-clamp-1 text-orange-400">{minigamePlayers[2].name}</p>
                             <p className="text-[10px] md:text-sm opacity-60 font-black tracking-widest uppercase">{minigamePlayers[2].score} PTS</p>
                           </div>
                           <div className="w-full h-24 md:h-40 rounded-t-[32px] bg-gradient-to-t from-orange-700/40 via-orange-600/20 to-transparent border-x-4 border-t-4 border-orange-400/40 relative flex items-center justify-center overflow-hidden">
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(194,65,12,0.2),transparent)]" />
                              <span className="text-3xl md:text-5xl font-black text-orange-400/20 relative z-10">3</span>
                              <div className="podium-reflection" />
                           </div>
                        </motion.div>
                      )}
                   </div>
                   <div className="w-full max-w-xl space-y-2 mt-8">
                      {minigamePlayers.slice(3, 10).map((player, idx) => (
                        <div key={player.name} className="flex justify-between items-center p-3 px-6 rounded-2xl bg-white/5 border border-white/5 opacity-60">
                           <span className="font-bold">{idx + 4}. {player.name}</span>
                           <span className="font-black">{player.score}</span>
                        </div>
                      ))}
                   </div>
                   <div className="flex gap-4">
                      <GlossyButton onClick={leaveMinigame} className="px-12 py-4">
                        VOLVER AL INICIO
                      </GlossyButton>
                   </div>
                </div>
              )}
            </motion.div>
          )}

          {currentView === 'horario' && (
            <motion.div 
              key="horario"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 md:space-y-8 max-w-5xl mx-auto"
            >
               <header className="flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-4">
                    <button 
                      onClick={() => navigateTo('home')}
                      className="p-2.5 md:p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/10"
                    >
                      <ArrowLeft size={20} className="md:w-6 md:h-6" />
                    </button>
                    <div>
                      <h1 className={`text-xl md:text-4xl font-black ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>Horarios Escolares</h1>
                      <p className="hidden md:block text-xs md:text-sm font-bold opacity-60">Consulta tu cronograma semanal de clases.</p>
                      <p className="md:hidden text-[10px] font-bold opacity-60">Tu cronograma semanal.</p>
                    </div>
                  </div>
                  <a 
                      href="https://newen.araoz.ar/horario-static" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hidden md:flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/25"
                    >
                      <ExternalLink size={14} /> Fuente Original
                  </a>
               </header>
               
               <AeroCard theme={theme} className="p-3 md:p-8">
                  <ScheduleTable theme={theme} />
               </AeroCard>

               <div className="md:hidden flex justify-center">
                  <a 
                    href="https://newen.araoz.ar/horario-static" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                  >
                    <ExternalLink size={14} /> Abrir Fuente Original
                  </a>
               </div>
            </motion.div>
          )}

          {currentView === 'gallery' && (
            <motion.div 
              key="gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <header className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className={`text-4xl font-black transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>Galería</h1>
                    <p className={`font-medium transition-colors duration-500 ${theme === 'black' ? 'text-white/60' : 'text-sky-800/60'}`}>Explora actividades creadas por la comunidad.</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mt-2">
                      NewAra no es responsable por la actitud de sus usuarios. Miren a sus hijos/hijas.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative">
                      <button
                        onClick={() => { playExternalBubble(); setShowGalleryFilters(!showGalleryFilters); }}
                        className={`p-3 rounded-2xl border-2 transition-all shadow-lg active:scale-95 ${
                          theme === 'black'
                            ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                            : 'bg-white/60 border-white/40 text-sky-950 hover:bg-white'
                        } ${showGalleryFilters ? (theme === 'black' ? 'bg-white/20' : 'bg-white') : ''}`}
                      >
                        <ListFilter size={18} />
                      </button>
                      
                      <AnimatePresence>
                        {showGalleryFilters && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className={`absolute top-full left-0 mt-2 p-2 rounded-2xl border-2 shadow-2xl z-50 min-w-[180px] ${
                              theme === 'black'
                                ? 'bg-slate-900/95 border-white/10 backdrop-blur-xl'
                                : 'bg-white/95 border-white/20 backdrop-blur-xl'
                            }`}
                          >
                            {[
                              { id: 'newest', label: 'Más Nuevo' },
                              { id: 'oldest', label: 'Más Viejo' },
                              { id: 'most_views', label: 'Más Visitas' },
                              { id: 'least_views', label: 'Menos Visitas' },
                              { id: 'most_likes', label: 'Más Likes' },
                              { id: 'least_likes', label: 'Menos Likes' },
                            ].map(f => (
                              <button
                                key={f.id}
                                onClick={() => {
                                  setGalleryFilter(f.id as any);
                                  setShowGalleryFilters(false);
                                  playExternalBubble();
                                }}
                                className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                  galleryFilter === f.id
                                    ? (theme === 'black' ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white')
                                    : (theme === 'black' ? 'text-white/60 hover:bg-white/10 hover:text-white' : 'text-sky-900 hover:bg-slate-100')
                                }`}
                              >
                                {f.label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 opacity-40 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`} />
                      <input 
                        type="text"
                        placeholder="Buscar por nombre, autor, código..."
                        value={gallerySearch}
                        onChange={(e) => {
                          const val = e.target.value;
                          const normalized = val.toLowerCase().trim();
                          if (
                            normalized === 'newen.araoz.ar/horario' || 
                            normalized === 'newen.araoz.ar/horarios' ||
                            normalized === '/horario' ||
                            normalized === '/horarios'
                          ) {
                            navigateTo('horario');
                            setGallerySearch('');
                            return;
                          }
                          setGallerySearch(val);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const normalized = gallerySearch.toLowerCase().trim();
                            if (
                              normalized === 'newen.araoz.ar/horario' || 
                              normalized === 'newen.araoz.ar/horarios' ||
                              normalized === '/horario' ||
                              normalized === '/horarios'
                            ) {
                              navigateTo('horario');
                              setGallerySearch('');
                            }
                          }
                        }}
                        className={`w-full pl-12 pr-4 py-3 rounded-2xl border-2 transition-all outline-none font-bold text-sm ${
                          theme === 'black'
                            ? 'bg-white/5 border-white/10 text-white focus:border-white/30'
                            : 'bg-white/60 border-white/40 text-sky-950 focus:border-blue-500'
                        }`}
                      />
                    </div>
                    <button 
                      onClick={fetchGallery}
                      disabled={isGalleryLoading}
                      className={`p-3 rounded-2xl bg-white/10 border border-white/20 shadow-lg active:scale-95 transition-all ${isGalleryLoading ? 'opacity-50' : ''}`}
                    >
                      <RefreshCw size={20} className={isGalleryLoading ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>
              </header>

              {isGalleryLoading && galleryActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-blue-400/30 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-sm font-black uppercase tracking-widest opacity-40">Cargando Galería...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {(() => {
                    const filteredAndSorted = galleryActivities.filter(activity => {
                      const search = gallerySearch.toLowerCase();
                      const date = activity.createdAt?.toDate ? activity.createdAt.toDate().toLocaleDateString() : '';
                      return (
                        activity.name?.toLowerCase().includes(search) ||
                        activity.creatorName?.toLowerCase().includes(search) ||
                        activity.id?.toLowerCase().includes(search) ||
                        date.includes(search)
                      );
                    }).sort((a, b) => {
                      switch (galleryFilter) {
                        case 'most_views': return (b.views || 0) - (a.views || 0);
                        case 'least_views': return (a.views || 0) - (b.views || 0);
                        case 'most_likes': return (b.likes?.length || 0) - (a.likes?.length || 0);
                        case 'least_likes': return (a.likes?.length || 0) - (b.likes?.length || 0);
                        case 'oldest': {
                          const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
                          const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
                          return ta - tb;
                        }
                        case 'newest':
                        default: {
                          const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
                          const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
                          return tb - ta;
                        }
                      }
                    });

                    if (filteredAndSorted.length === 0 && gallerySearch.trim() !== '') {
                      return (
                        <div className="col-span-full py-20 text-center space-y-6">
                          <div className="relative inline-block">
                             <SearchX size={80} className={`mx-auto opacity-10 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`} />
                          </div>
                          <div className="space-y-2">
                             <h2 className={`text-2xl md:text-5xl font-black uppercase tracking-tighter ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>¡NO HAY NADA!</h2>
                             <p className={`text-xs md:text-sm font-bold opacity-40 uppercase tracking-widest px-8 md:px-12 transition-colors ${theme === 'black' ? 'text-white' : 'text-sky-800'}`}>No se encontró ninguna actividad que coincida con "{gallerySearch}"</p>
                          </div>
                          <GlossyButton 
                            onClick={handleCreateActivityClick}
                            className="px-8 md:px-12 py-3 md:py-4 text-[10px] md:text-xs font-black bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/20 rounded-2xl group mx-auto"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <PlusCircle size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                              CREAR ACTIVIDAD
                            </div>
                          </GlossyButton>
                        </div>
                      );
                    }

                    return filteredAndSorted.map((activity) => {
                      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                      const dateStr = activity.createdAt?.toDate ? activity.createdAt.toDate().toLocaleDateString() : 'Desconocida';
                      return (
                        <motion.div
                          layout={!isMobile}
                          key={activity.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={!isMobile ? { y: -5 } : {}}
                          className={`group relative p-3 md:p-6 rounded-[24px] md:rounded-[32px] border transition-all duration-500 flex flex-col justify-between h-52 md:h-64 overflow-hidden shadow-sm hover:shadow-2xl ${
                            theme === 'black' 
                              ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                              : 'bg-white/60 border-white/40 hover:bg-white/80'
                          }`}
                        >
                          <div className="glossy-overlay opacity-10 group-hover:opacity-30 transition-opacity" />
                          
                          <div className="space-y-2 relative z-10">
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-blue-500/20 text-blue-500 text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-blue-500/30">
                                {activity.id}
                              </span>
                              <div className="flex gap-0.5 md:gap-1">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); reportAbuse('activity', activity.id, activity.name, activity.creatorName); }}
                                  className="aero-icon-button text-amber-500 bg-amber-500/10"
                                  title="Denunciar Abuso"
                                >
                                  <Flag className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                </button>
                                {(isModerator || 
                                    activity.creatorName?.trim().toLowerCase() === userName?.trim().toLowerCase() ||
                                    activity.creatorId?.trim().toLowerCase() === userName?.trim().toLowerCase()
                                  ) && (
                                  <>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleEditActivity(activity, e); }}
                                      className="aero-icon-button text-blue-500 bg-blue-500/10"
                                      title="Editar Actividad"
                                    >
                                      <Edit3 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleDeleteActivity(activity.id, e, activity.creatorName, activity.title, activity.creatorId); }}
                                      className="aero-icon-button text-red-500 bg-red-500/10"
                                      title="Eliminar Actividad"
                                    >
                                      <Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            <div onClick={async () => {
                              // Fetch if the creator is a helper for the "Ver más" modal
                              let creatorIsHelper = false;
                              try {
                                const userDoc = await getDoc(doc(db, 'users', String(activity.creatorId || activity.creatorName)));
                                if (userDoc.exists()) {
                                  creatorIsHelper = userDoc.data().isHelper || false;
                                }
                              } catch (e) {}
                              
                              setSelectedActivityDetail({ ...activity, creatorIsHelper });
                            }}>
                              <h3 className={`text-sm md:text-xl font-black leading-tight group-hover:text-blue-500 transition-colors ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
                                {activity.name && activity.name.length > 35 ? activity.name.substring(0, 35) + '...' : activity.name}
                              </h3>
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  handleViewProfile(activity.creatorId, activity.creatorName, activity); 
                                }}
                                className={`text-[8px] md:text-[10px] font-bold mt-1 opacity-50 hover:opacity-100 hover:text-blue-500 transition-all ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}
                              >
                                Por {activity.creatorName || 'Anónimo'}
                              </button>
                            </div>
                          </div>
    
                          <div className="space-y-3 relative z-10 pt-4 border-t border-white/10">
                            <div className="flex flex-col gap-2">
                               <div className="flex gap-1 md:gap-2">
                                  <GlossyButton 
                                    onClick={(e) => { e.stopPropagation(); setSelectedActivityDetail(activity); }}
                                    variant="gray"
                                    className="flex-1 px-1 md:px-3 py-1.5 md:py-2 rounded-xl text-[8px] md:text-[10px] whitespace-nowrap overflow-hidden text-ellipsis"
                                  >
                                    Ver más
                                  </GlossyButton>
                                  {userRole === 'Profesor' && (
                                    <GlossyButton 
                                      onClick={(e) => { e.stopPropagation(); createMinigameSession(activity); }}
                                      className="flex-1 px-1 md:px-3 py-1.5 md:py-2 rounded-xl text-[8px] md:text-[10px] whitespace-nowrap overflow-hidden text-ellipsis bg-gradient-to-br from-amber-400 to-orange-500"
                                    >
                                      HOST <Gamepad2 size={12} className="inline-block ml-0.5 md:ml-1 scale-75 md:scale-100" />
                                    </GlossyButton>
                                  )}
                               </div>
                               <GlossyButton 
                                 onClick={(e) => { e.stopPropagation(); handleLoadActivity(activity.id); }}
                                 loading={isLoadingActivity && !currentSharedActivity}
                                 className="w-full py-1.5 md:py-2 rounded-xl text-[9px] md:text-[10px]"
                               >
                                 JUGAR <Play size={10} fill="currentColor" className="ml-1" />
                               </GlossyButton>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })
                  })()}
                </div>
              )}
              
              {galleryActivities.length === 0 && !isGalleryLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                  <Globe size={48} className="opacity-10 animate-pulse" />
                  <p className="text-sm font-black uppercase tracking-widest opacity-40">No hay actividades todavía. ¡Sé el primero!</p>
                  <GlossyButton onClick={handleCreateActivityClick}>
                    Crear Actividad
                  </GlossyButton>
                </div>
              )}

            </motion.div>
          )}

          {currentView === 'users' && isModerator && (
            <motion.div
              key="users"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-7xl mx-auto"
            >
              <UsersManager 
                theme={theme} 
                onViewProfile={handleViewProfile} 
                onClose={() => navigateTo('home')}
                currentUserName={userName}
              />
            </motion.div>
          )}

          {currentView === 'aras' && isLoggedIn && (
            <motion.div
              key="aras"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-5xl mx-auto"
            >
              <ArasHistory 
                theme={theme}
                userName={userName.trim()}
                userAras={userAras}
              />
            </motion.div>
          )}

          {currentView === 'reports' && isModerator && (
            <motion.div 
              key="reports"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <header className="flex justify-between items-center">
                <div>
                  <h1 className={`text-4xl font-black ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>Denunciados</h1>
                  <p className={`font-medium opacity-60 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>Moderación de contenido comunitario</p>
                </div>
                <button 
                  onClick={fetchReports}
                  className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 hover:rotate-180 transition-all duration-700"
                >
                  <RefreshCw size={24} />
                </button>
              </header>

              <div className={`p-8 rounded-[40px] border-4 shadow-xl ${theme === 'black' ? 'bg-white/5 border-white/10' : 'bg-white border-blue-50 shadow-blue-500/5'}`}>
                 <h3 className="text-lg font-black mb-4 uppercase tracking-tighter flex items-center gap-2">
                   <Sparkles className="text-purple-500" size={20} />
                   Enviar Actualización del Sistema
                 </h3>
                 <div className="flex flex-col md:flex-row gap-4">
                   <input 
                     type="text"
                     placeholder="Mensaje de actualización para todos los usuarios..."
                     className={`flex-1 p-4 rounded-2xl border font-bold ${theme === 'black' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}
                     value={broadcastMessage}
                     onChange={(e) => setBroadcastMessage(e.target.value)}
                    />
                    <GlossyButton 
                      loading={isBroadcasting}
                      onClick={async () => {
                        if (!broadcastMessage.trim()) return;
                        setIsBroadcasting(true);
                        try {
                          const userSnap = await getDocs(collection(db, 'users'));
                          const userIds = userSnap.docs.map(doc => doc.id);
                          
                          const batchSize = 10; // Batching to avoid blocking too much
                          for (let i = 0; i < userIds.length; i += batchSize) {
                            const chunk = userIds.slice(i, i + batchSize);
                            await Promise.all(chunk.map(uid => 
                              createNotification(uid, t('actualizacionSistema'), broadcastMessage, 'update')
                            ));
                          }
                          
                          setBroadcastMessage('');
                          alert(`Actualización enviada a ${userIds.length} usuarios.`);
                        } catch (error) {
                          console.error("Broadcast error:", error);
                        } finally {
                          setIsBroadcasting(false);
                        }
                      }}
                      className="px-8 whitespace-nowrap"
                    >
                      Mandar a todos
                    </GlossyButton>
                  </div>
               </div>

               <div className="space-y-4">
                 {isReportsLoading ? (
                   <div className="flex justify-center py-20">
                     <RefreshCw className="animate-spin text-blue-500" size={40} />
                   </div>
                 ) : reports.length > 0 ? (
                   reports.map((report) => {
                      const targetId = report.targetId || report.contentId || report.activityId;
                      const targetType = report.targetType || report.contentType || 'activity';
                      const targetName = report.targetName || report.contentPreview || report.activityName;
                      
                      return (
                        <div 
                          key={report.id}
                          className={`p-6 rounded-[32px] border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-xl ${
                            theme === 'black' ? 'bg-white/5 border-white/10' : 'bg-white/80 border-white/60'
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-1">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                               targetType === 'activity' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                               targetType === 'chat-message' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                               'bg-amber-500/10 text-amber-500 border-amber-500/20'
                             }`}>
                               {targetType === 'activity' ? <AlertTriangle size={24} /> : 
                                targetType === 'chat-message' ? <Send size={24} /> :
                                <MessageSquare size={24} />}
                             </div>
                             <div className="min-w-0 flex-1">
                               <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">
                                 {targetType === 'activity' ? 'Actividad' : 
                                  targetType === 'chat-message' ? 'Chat de Clase' :
                                  'Anuncio de Clase'} • Por {report.creatorName || report.authorName}
                               </p>
                               <h3 className={`font-black text-lg leading-tight truncate ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
                                 {report.reporterName} : <span className="text-red-500">{report.reason}</span>
                               </h3>
                               <div className={`mt-2 p-3 rounded-xl text-xs font-bold ${theme === 'black' ? 'bg-white/5' : 'bg-slate-50'}`}>
                                 "{targetName}"
                               </div>
                             </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {targetType === 'activity' && (
                              <>
                                <GlossyButton 
                                  variant="gray"
                                  loading={loadingActivityDetail === targetId}
                                  onClick={async () => {
                                     const localActivity = galleryActivities.find(a => a.id === targetId);
                                     if (localActivity) {
                                       setSelectedActivityDetail(localActivity);
                                       return;
                                     }
                                     
                                     setLoadingActivityDetail(targetId);
                                     try {
                                       const docRef = doc(db, 'activities', targetId);
                                       const docSnap = await getDoc(docRef);
                                       if (docSnap.exists()) {
                                         setSelectedActivityDetail({ id: docSnap.id, ...docSnap.data() });
                                       } else {
                                         alert("La actividad ya no existe.");
                                       }
                                     } catch (error) {
                                       console.error("Error fetching activity detail:", error);
                                     } finally {
                                       setLoadingActivityDetail(null);
                                     }
                                  }}
                                  className="px-4 py-2 text-[10px]"
                                >
                                  Ver más
                                </GlossyButton>
                                <GlossyButton 
                                   onClick={() => handleLoadActivity(targetId)}
                                   loading={isLoadingActivity}
                                   className="px-4 py-2 text-[10px]"
                                >
                                  Cargar
                                </GlossyButton>
                              </>
                            )}
                            
                            <button 
                              onClick={() => handleIgnoreReport(report.id)}
                              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                theme === 'black' ? 'bg-white/5 text-white/50 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              Ignorar
                            </button>

                            <button 
                              onClick={() => handleDeleteTargetAndReport(report)}
                              className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all whitespace-nowrap"
                            >
                              Borrar {targetType === 'activity' ? 'Actividad' : targetType === 'chat-message' ? 'Mensaje' : 'Anuncio'}
                            </button>

                            <button 
                              onClick={() => deleteUserAndReport(report)}
                              className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-950 text-red-500 hover:bg-red-600 hover:text-white transition-all"
                              title="Banear Usuario"
                            >
                              <ShieldAlert size={18} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
                    <ShieldCheck size={64} />
                    <p className="font-black uppercase tracking-[0.2em] mt-4">Todo está en orden</p>
                    <p className="text-xs">No hay denuncias pendientes.</p>
                  </div>
                )}
              </div>
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
                <h1 className={`text-4xl font-black transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{t('ajustes')}</h1>
                <p className={`font-medium transition-colors duration-500 ${theme === 'black' ? 'text-white/60' : 'text-sky-800/60'}`}>{t('explorar')}</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AeroCard title={t('perfil')} theme={theme}>
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-4 text-center sm:text-left">
                      <div className="flex flex-col items-center gap-3 shrink-0">
                        <div className="relative group/avatar">
                          <div className="w-24 h-24 sm:w-20 sm:h-20 rounded-full p-1 bg-white/20 backdrop-blur-md border border-white/40 shadow-xl overflow-hidden">
                            {userAvatar ? (
                              <img 
                                src={userAvatar} 
                                alt="New Avatar" 
                                className="w-full h-full object-cover rounded-full"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className={`w-full h-full rounded-full flex items-center justify-center transition-colors duration-500 ${theme === 'black' ? 'bg-white/10 text-white' : 'bg-gradient-to-br from-blue-400 to-sky-600 text-white'}`}>
                                <User className="w-10 h-10 sm:w-8 sm:h-8" />
                              </div>
                            )}
                          </div>
                          <input 
                            type="file" 
                            id="avatar-upload" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = async () => {
                                  const compressed = await compressImage(reader.result as string);
                                  setUserAvatar(compressed);
                                  playSuccessSound();
                                  // Auto-save if logged in
                                  if (isLoggedIn) {
                                    const userRef = doc(db, 'users', userName.trim());
                                    await updateDoc(userRef, { avatar: compressed });
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <label 
                            htmlFor="avatar-upload"
                            className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-blue-500 text-white border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform shadow-lg"
                            title="Subir imagen"
                          >
                            <Sparkles size={11} />
                          </label>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setShowAvatarLibraryModal(true);
                            playExternalBubble();
                          }}
                          className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border transition-all active:scale-[0.97] flex items-center gap-1.5 shadow-sm ${
                            theme === 'black' 
                              ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white hover:border-white/20' 
                              : 'bg-blue-50 border-blue-100 hover:bg-blue-100/70 text-blue-600'
                          }`}
                        >
                          <Library size={11} />
                          Biblioteca
                        </button>
                      </div>
                      
                      <div className="flex-1 w-full space-y-4 sm:space-y-3">
                        <div className="space-y-1">
                          <label className={`text-[10px] font-black uppercase tracking-wider opacity-60 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>{t('nombreVisible')}</label>
                          <input 
                            type="text" 
                            disabled={true} 
                            value={userName}
                            className={`w-full px-4 py-3 sm:px-3 sm:py-2 rounded-xl border text-sm font-bold opacity-50 cursor-not-allowed ${
                              theme === 'black' ? 'bg-white/5 border-white/10 text-white' : 'bg-white/60 border-white/40 text-sky-950'
                            }`}
                            placeholder={t('nombreVisible')}
                          />
                        </div>

                        <div className="space-y-1 text-left">
                          <label className={`text-[10px] font-black uppercase tracking-wider opacity-60 ml-2 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>{t('tuRol')}</label>
                          <div className={`flex p-1 rounded-2xl border transition-all ${theme === 'black' ? 'bg-white/5 border-white/10' : 'bg-white/40 border-white/20'}`}>
                            <button 
                              onClick={() => { 
                                setUserRole('Estudiante'); 
                                playExternalBubble(); 
                                if (isLoggedIn) {
                                  updateDoc(doc(db, 'users', userName.trim()), { role: 'Estudiante' });
                                }
                              }}
                              className={`flex-1 py-2 sm:py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${userRole === 'Estudiante' ? (theme === 'black' ? 'bg-white/20 text-white shadow-lg' : 'bg-blue-500 text-white shadow-lg') : 'opacity-40 hover:opacity-100'}`}
                            >
                              {t('estudiante')}
                            </button>
                            <button 
                              onClick={() => { 
                                setUserRole('Profesor'); 
                                playExternalBubble(); 
                                if (isLoggedIn) {
                                  updateDoc(doc(db, 'users', userName.trim()), { role: 'Profesor' });
                                }
                              }}
                              className={`flex-1 py-2 sm:py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${userRole === 'Profesor' ? (theme === 'black' ? 'bg-white/20 text-white shadow-lg' : 'bg-purple-500 text-white shadow-lg') : 'opacity-40 hover:opacity-100'}`}
                            >
                              {t('profesor')}
                            </button>
                          </div>
                        </div>

                        {!isLoggedIn && (
                          <div className="pt-2">
                             <button 
                               onClick={() => setIsRegistering(true)} 
                               className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-[1px] rounded-2xl group transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-blue-500/20"
                             >
                               <div className="bg-slate-950/90 rounded-[15px] py-4 px-6 flex flex-col items-center justify-center gap-2 group-hover:bg-transparent transition-colors">
                                 <span className="text-white font-black text-sm md:text-base tracking-tight uppercase italic line-clamp-1">
                                   ¡Registrate en NewAra!
                                 </span>
                                 <div className="flex items-center gap-4 text-[9px] sm:text-[10px] font-bold text-white/60 group-hover:text-white/90">
                                   <span className="flex items-center gap-1"><Heart size={10} /> Likes</span>
                                   <span className="flex items-center gap-1"><Play size={10} /> Visitas</span>
                                   <span className="flex items-center gap-1"><Plus size={10} /> Crear</span>
                                 </div>
                                </div>
                              </button>
                          </div>
                        )}
                        
                        {isLoggedIn && (
                          <div className="pt-2">
                            <button 
                              onClick={logout}
                              className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                            >
                              {t('cerrarSesión')}
                            </button>
                          </div>
                        )}

                        {MODERATORS.includes(userName.trim()) && !isModAuthorized && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-1 text-left"
                          >
                            <label className="text-[10px] font-black uppercase tracking-wider text-red-500 ml-2">Contraseña de Moderador</label>
                            <input 
                              type="password" 
                              value={moderatorPassword}
                              onChange={(e) => setModeratorPassword(e.target.value)}
                              className={`w-full px-4 py-3 rounded-xl border text-sm font-bold border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all ${
                                theme === 'black' ? 'bg-red-500/5 text-white' : 'bg-red-50/50 text-sky-950'
                              }`}
                              placeholder="Introducir contraseña..."
                            />
                          </motion.div>
                        )}

                        <div className="space-y-1 text-left">
                          <label className={`text-[10px] font-black uppercase tracking-wider opacity-60 ml-2 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>Tu Contraseña</label>
                          <div className="relative group/passwd">
                            <input 
                              type="password" 
                              disabled={true}
                              readOnly={true}
                              value={userPassword}
                              className={`w-full px-4 py-3 sm:px-3 sm:py-2 rounded-xl border text-sm font-bold transition-all opacity-50 cursor-not-allowed ${
                                theme === 'black' ? 'bg-white/5 border-white/20 text-white' : 'bg-white/60 border-white/40 text-sky-950'
                              }`}
                              placeholder="Contraseña"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[8px] font-black uppercase tracking-tighter text-red-500 opacity-0 group-hover/passwd:opacity-100 transition-opacity">
                              <Lock size={10} />
                              No Editable
                            </div>
                          </div>
                          <p className={`text-[8px] font-bold mt-1 ml-2 uppercase tracking-tighter opacity-40 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>
                            Protegido: La contraseña no puede ser modificada por seguridad.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className={`text-[10px] font-black uppercase tracking-wider opacity-60 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>{t('bio')}</label>
                      <textarea 
                        value={userBio}
                        onChange={(e) => setUserBio(e.target.value.slice(0, 300))}
                        maxLength={300}
                        className={`w-full px-3 py-2 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all resize-none h-20 ${
                          theme === 'black' ? 'bg-white/5 border-white/10 text-white' : 'bg-white/60 border-white/40 text-sky-950'
                        }`}
                        placeholder={t('bioPlaceholder')}
                      />
                      <div className="flex justify-end pr-2">
                        <span className="text-[8px] font-bold opacity-30">{userBio.length}/300</span>
                      </div>
                    </div>

                    {isLoggedIn && (
                      <div className="pt-4 border-t border-white/10">
                        <GlossyButton 
                          onClick={handleUpdateProfile} 
                          className="w-full text-[12px] py-3 flex items-center justify-center gap-2 group"
                          disabled={isUpdatingProfile}
                        >
                          {isUpdatingProfile ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            <Save size={16} className="group-hover:scale-110 transition-transform" />
                          )}
                          {isUpdatingProfile ? t('guardando') : t('guardarCambios')}
                        </GlossyButton>
                      </div>
                    )}

                    {userAvatar && (
                      <button 
                        onClick={() => {
                          setUserAvatar('');
                          playExternalBubble();
                        }}
                        className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                      >
                        {t('eliminarFoto')}
                      </button>
                    )}
                  </div>
                </AeroCard>

                <AeroCard title={t('apariencia')} theme={theme}>
                  <div className="space-y-6">
                    <div>
                      <p className={`text-sm font-bold mb-4 flex items-center gap-2 transition-colors duration-500 ${theme === 'black' ? 'text-white/80' : 'text-sky-900'}`}>
                        {t('temaWeb')}
                      </p>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <button 
                          onClick={() => { playExternalBubble(); setTheme('white'); }}
                          className={`p-4 rounded-3xl flex flex-col items-center gap-3 transition-all border-2 ${theme === 'white' ? 'bg-white border-blue-400 shadow-xl scale-105' : theme === 'aero' ? 'bg-white/90 border-white/80 hover:bg-white text-sky-950' : 'bg-white/40 border-white/60 hover:bg-white/60 text-white/70'}`}
                        >
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-100 to-white shadow-inner border border-sky-100" />
                          <span className={`text-sm font-bold ${theme === 'white' ? 'text-sky-950' : theme === 'black' ? 'text-white' : 'text-sky-900'}`}>{t('blanco')}</span>
                        </button>
                        <button 
                          onClick={() => { playExternalBubble(); setTheme('black'); }}
                          className={`p-4 rounded-3xl flex flex-col items-center gap-3 transition-all border-2 ${theme === 'black' ? 'bg-white border-blue-400 shadow-xl scale-105 text-sky-950' : theme === 'aero' ? 'bg-black/40 border-white/20 hover:bg-black/60 text-white' : 'bg-white/40 border-white/60 hover:bg-white/60 text-white/70'}`}
                        >
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 to-black shadow-inner border border-slate-800" />
                          <span className={`text-sm font-bold ${theme === 'black' ? 'text-sky-950' : theme === 'black' ? 'text-white' : theme === 'white' ? 'text-sky-900' : 'text-white'}`}>{t('negro')}</span>
                        </button>
                        <button 
                          onClick={() => { playExternalBubble(); setTheme('aero'); }}
                          className={`p-4 rounded-3xl flex flex-col items-center gap-3 transition-all border-2 ${theme === 'aero' ? 'bg-blue-500 border-blue-200 shadow-xl scale-105 text-white' : theme === 'black' ? 'bg-blue-900/40 border-blue-500/30 hover:bg-blue-900/60 text-white' : 'bg-blue-400/20 border-white/60 hover:bg-blue-400/30 text-sky-950'}`}
                        >
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 via-green-400 to-blue-200 shadow-xl border border-white/40 overflow-hidden relative">
                            <BubbleBackground theme="aero" preview={true} />
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-bold">{t('aeroBeta')}</span>
                            <span className={`text-[8px] font-black uppercase tracking-widest ${theme === 'aero' ? 'text-white/60' : 'text-blue-600/60'}`}>Beta</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className={`text-sm font-bold mb-4 flex items-center gap-2 transition-colors duration-500 ${theme === 'black' ? 'text-white/80' : 'text-sky-900'}`}>
                        {t('idioma')}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <button 
                          onClick={() => { playExternalBubble(); setLanguage('es'); }}
                          className={`py-3 rounded-2xl flex flex-col items-center gap-1 transition-all border-2 ${language === 'es' ? 'bg-blue-500 text-white border-blue-400 shadow-lg scale-105' : 'bg-white/20 border-white/30 hover:bg-white/40'}`}
                        >
                          <span className="text-[10px] font-bold">Español</span>
                        </button>
                        <button 
                          onClick={() => { playExternalBubble(); setLanguage('en'); }}
                          className={`py-3 rounded-2xl flex flex-col items-center gap-1 transition-all border-2 ${language === 'en' ? 'bg-blue-500 text-white border-blue-400 shadow-lg scale-105' : 'bg-white/20 border-white/30 hover:bg-white/40'}`}
                        >
                          <span className="text-[10px] font-bold">English</span>
                        </button>
                        <button 
                          onClick={() => { playExternalBubble(); setLanguage('ru'); }}
                          className={`py-3 rounded-2xl flex flex-col items-center gap-1 transition-all border-2 ${language === 'ru' ? 'bg-blue-500 text-white border-blue-400 shadow-lg scale-105' : 'bg-white/20 border-white/30 hover:bg-white/40'}`}
                        >
                          <span className="text-[10px] font-bold">Русский</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/20 border border-white/30">
                      <div>
                        <p className={`font-black uppercase tracking-widest text-[11px] ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{t('desactivarAnimaciones')}</p>
                        <p className={`text-[10px] font-bold opacity-60 ${theme === 'black' ? 'text-white' : 'text-sky-800'}`}>{t('mejoraRendimiento')}</p>
                      </div>
                      <button 
                        onClick={() => { playExternalBubble(); setDisableAnimations(!disableAnimations); }}
                        className={`w-14 h-8 rounded-full p-1 transition-all flex items-center ${disableAnimations ? 'bg-blue-600 justify-end' : 'bg-slate-200 justify-start border-2 border-slate-300'}`}
                      >
                        <motion.div 
                          layout={!disableAnimations}
                          className="w-6 h-6 rounded-full shadow-md bg-white flex items-center justify-center font-black text-[8px] text-blue-600"
                        >
                          {disableAnimations ? 'ON' : ''}
                        </motion.div>
                      </button>
                    </div>
                  </div>
                </AeroCard>

                <AeroCard title={t('acercaDe')} theme={theme}>
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white/20 border border-white/30">
                      <p className={`text-xs font-black uppercase transition-colors duration-500 ${theme === 'black' ? 'text-white/40' : 'text-sky-900/40'} mb-2`}>{t('desarrollador')}</p>
                      <p className={`text-sm font-bold transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>NewAra Team</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/20 border border-white/30">
                      <p className={`text-xs font-black uppercase transition-colors duration-500 ${theme === 'black' ? 'text-white/40' : 'text-sky-900/40'} mb-2`}>{t('version')}</p>
                      <div className="flex justify-between items-center">
                        <p className={`text-sm font-bold transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{APP_VERSION}</p>
                        <p className="text-[10px] font-black opacity-40">{APP_LAST_BUILD}</p>
                      </div>
                    </div>
                  </div>
                </AeroCard>

                <AeroCard title="Mantenimiento" theme={theme}>
                   <div className="space-y-3">
                     <button 
                       onClick={() => {
                         playExternalBubble();
                         if (confirm('¿Deseas recargar la aplicación? Esto limpiará la memoria temporal.')) {
                           window.location.reload();
                         }
                       }}
                       className="w-full py-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center gap-3 hover:bg-blue-500/20 transition-all font-black uppercase tracking-tighter text-blue-600"
                     >
                       <RefreshCw size={20} /> Forzar Recarga
                     </button>
                     <button 
                       onClick={async () => {
                         playExternalBubble();
                         if (confirm('Esto eliminará los archivos cacheados (Service Workers). ¿Continuar?')) {
                           if ('serviceWorker' in navigator) {
                             const regs = await navigator.serviceWorker.getRegistrations();
                             for(let r of regs) r.unregister();
                             alert('Caché limpiado. Reiniciando...');
                             window.location.reload();
                           } else {
                             alert('No se encontraron Service Workers.');
                           }
                         }
                       }}
                       className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center gap-3 hover:bg-red-500/20 transition-all font-black uppercase tracking-tighter text-red-600"
                     >
                       <WifiOff size={20} /> Limpiar Caché Fuertemente
                     </button>
                   </div>
                </AeroCard>

                <AeroCard title={t('terminos')} theme={theme} className="md:col-span-2">
                  <div className="space-y-4">
                    <div className={`p-4 rounded-2xl border ${theme === 'black' ? 'bg-white/5 border-white/10' : 'bg-white/40 border-white/60 shadow-inner'}`}>
                      <p className={`text-sm font-bold mb-4 flex items-center gap-2 transition-colors duration-500 ${theme === 'black' ? 'text-white/90' : 'text-sky-950'}`}>
                        {t('legalTitle')}
                      </p>
                      <ul className={`space-y-3 text-xs md:text-sm transition-colors duration-500 ${theme === 'black' ? 'text-white/70' : 'text-sky-900'}`}>
                        <li className="flex gap-3">
                          <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                          <span><b>{t('usoAcademico')}:</b> {t('usoAcademicoDesc')}</span>
                        </li>
                        <li className="flex gap-3">
                          <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                          <span><b>{t('privacidad')}:</b> {t('privacidadDesc')}</span>
                        </li>
                        <li className="flex gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                          <User size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                          <span>
                            <b>{t('cuentasUsuario')}:</b> {t('cuentasUsuarioDesc')}
                          </span>
                        </li>
                        <li className="flex gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                          <ShieldCheck size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                          <span>
                            <b className="text-red-500">{t('integridadAcademica')}:</b> <span className="italic font-bold text-red-600/80 underline decoration-red-300">{t('integridadAcademicaDesc')}</span>
                          </span>
                        </li>
                      </ul>
                    </div>
                    <p className={`text-[10px] font-black uppercase tracking-widest text-center opacity-30 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>
                      {t('ultimaActualizacion')}
                    </p>
                  </div>
                </AeroCard>
              </div>
            </motion.div>
          )}

          {currentView === 'materias' && (
             <motion.div 
               key="materias"
               initial={disableAnimations ? { opacity: 1 } : { opacity: 0, y: 30 }}
               animate={disableAnimations ? { opacity: 1 } : { opacity: 1, y: 0 }}
               exit={disableAnimations ? { opacity: 1 } : { opacity: 0, y: -30 }}
               className="max-w-7xl mx-auto px-4 py-12"
             >
                <div className="relative mb-20 text-center flex flex-col items-center overflow-hidden">
                  <h1 className={`text-5xl md:text-8xl font-black tracking-tighter mb-4 drop-shadow-xl ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
                    {t('materias')}
                  </h1>
                  <p className={`text-xl font-medium opacity-60 max-w-2xl mx-auto leading-relaxed ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
                    {t('explorarMateriasDesc')}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:gap-6 max-w-3xl mx-auto pb-20">
                  {[...SUBJECTS].sort((a, b) => {
                    const colorOrder = ['red', 'orange', 'amber', 'yellow', 'green', 'emerald', 'sky', 'blue', 'indigo', 'violet', 'purple', 'rose', 'pink'];
                    const idxA = colorOrder.indexOf(a.color);
                    const idxB = colorOrder.indexOf(b.color);
                    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
                  }).map(subject => (
                    <AeroCard 
                      key={subject.id} 
                      theme={theme} 
                      className={`group p-0 md:p-0 overflow-visible! h-full transition-all duration-500 hover:-translate-y-1 ${theme === 'black' ? 'border-white/10 hover:border-white/30 bg-gradient-to-br from-white/5 to-transparent hover:from-white/10 hover:to-transparent shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2),inset_0_2px_5px_rgba(255,255,255,0.2)]' : 'border border-white/30 hover:border-white/60 bg-gradient-to-br from-white/40 to-white/10 hover:from-white/60 hover:to-white/20 shadow-[inset_0_1px_3px_rgba(255,255,255,0.6),0_8px_32px_rgba(0,0,0,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.8),inset_0_2px_8px_rgba(255,255,255,1),0_8px_32px_rgba(0,0,0,0.1)]'}`}
                    >
                      <button
                        onClick={() => {
                          playExternalBubble();
                          setSelectedSubject(subject);
                          navigateTo('subject', { subjectId: subject.id });
                        }}
                        className="w-full h-full flex flex-row items-center gap-4 p-4 md:p-6 text-left group"
                      >
                        <div className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 bg-gradient-to-br ${
                          subject.color === 'yellow' ? 'from-yellow-400 to-yellow-600 shadow-yellow-500/40 text-white' :
                          subject.color === 'emerald' ? 'from-emerald-400 to-emerald-600 shadow-emerald-500/40' :
                          subject.color === 'green' ? 'from-green-400 to-green-600 shadow-green-500/40' :
                          subject.color === 'blue' ? 'from-blue-400 to-blue-600 shadow-blue-500/40' :
                          subject.color === 'orange' ? 'from-orange-400 to-orange-600 shadow-orange-500/40 text-white' :
                          subject.color === 'amber' ? 'from-amber-400 to-amber-600 shadow-amber-500/40' :
                          subject.color === 'red' ? 'from-red-400 to-red-600 shadow-red-500/40' :
                          subject.color === 'sky' ? 'from-sky-400 to-sky-600 shadow-sky-500/40' :
                          subject.color === 'violet' ? 'from-violet-400 to-violet-600 shadow-violet-500/40' :
                          subject.color === 'pink' ? 'from-pink-400 to-pink-600 shadow-pink-500/40' :
                          subject.color === 'indigo' ? 'from-indigo-400 to-indigo-600 shadow-indigo-500/40' :
                          'from-blue-400 to-blue-600 shadow-blue-500/40'
                        }`}>
                          <div className="absolute inset-0 bg-white/20 rounded-[inherit] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative transform transition-transform group-hover:scale-110">
                            {getIcon(subject.icon, isMobile ? 24 : 32)}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`text-xl md:text-3xl font-black tracking-tighter ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
                              {subject.name}
                            </h3>
                          </div>
                          <p className={`text-xs md:text-sm leading-relaxed line-clamp-2 opacity-60 font-medium ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>
                            {subject.description}
                          </p>
                          <div className="mt-4 flex items-center gap-6">
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${theme === 'black' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                              {subject.units.length} {subject.units.length === 1 ? 'UNIDAD' : 'UNIDADES'}
                            </span>
                          </div>
                        </div>

                        <div className={`p-3 rounded-2xl transition-all duration-300 transform group-hover:translate-x-2 ${theme === 'black' ? 'bg-white/5 opacity-40 group-hover:opacity-100 group-hover:bg-blue-500 text-white' : 'bg-slate-50 text-sky-950 group-hover:bg-blue-500 group-hover:text-white shadow-sm'}`}>
                          <ChevronRight size={20} />
                        </div>
                      </button>
                    </AeroCard>
                  ))}
                </div>
             </motion.div>
          )}

          {currentView === 'subject' && selectedSubject && (
             <motion.div 
               key="subject"
               initial={disableAnimations ? { opacity: 1 } : { opacity: 0, scale: 0.8, y: 30 }}
               animate={disableAnimations ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
               exit={disableAnimations ? { opacity: 1 } : { opacity: 0, x: -100, scale: 0.95 }}
               transition={disableAnimations ? { duration: 0 } : { type: "spring", damping: 25, stiffness: 120 }}
               className="space-y-6"
             >
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 max-w-7xl mx-auto">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700 text-white shadow-xl flex-shrink-0">
                  {getIcon(selectedSubject.icon, 24)}
                </div>
                <h1 className={`text-3xl md:text-5xl font-black tracking-tighter text-center md:text-left transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{selectedSubject.name}</h1>
              </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                  <div className="lg:col-span-2 space-y-6">
                    <AeroCard title={t('unidadesYTemas')} theme={theme}>
                      <div className="flex flex-col gap-6">
                        {/* Unit Search Bar */}
                        <div className="relative group">
                          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${theme === 'black' ? 'text-white/30 group-focus-within:text-blue-400' : 'text-sky-900/40 group-focus-within:text-blue-500'}`} size={18} />
                          <input 
                            type="text"
                            value={unitSearch}
                            onChange={(e) => {
                              const val = e.target.value;
                              const normalized = val.toLowerCase().trim();
                              if (normalized === 'newen.araoz.ar/horario' || normalized === 'newen.araoz.ar/horarios') {
                                navigateTo('horario');
                                setUnitSearch('');
                                return;
                              }
                              setUnitSearch(val);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const normalized = unitSearch.toLowerCase().trim();
                                if (normalized === 'newen.araoz.ar/horario' || normalized === 'newen.araoz.ar/horarios') {
                                  navigateTo('horario');
                                  setUnitSearch('');
                                }
                              }
                            }}
                            placeholder={t('buscarTemas')}
                            className={`w-full pl-12 pr-4 py-4 rounded-3xl text-sm font-bold transition-all duration-300 outline-none border-2 bg-white/10 ${
                              theme === 'black' 
                                ? 'border-white/10 focus:border-blue-500/50 text-white placeholder:text-white/20' 
                                : 'border-slate-100 focus:border-blue-500 shadow-sm text-sky-950 placeholder:text-sky-900/30'
                            }`}
                          />
                          {unitSearch && (
                            <button 
                              onClick={() => setUnitSearch('')}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-500 hover:text-pink-600 transition-colors"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>

                        <DuolingoPath 
                          units={selectedSubject.units
                            .map((u, idx) => ({ ...u, originalIndex: idx }))
                            .filter(u => 
                              u.title.toLowerCase().includes(unitSearch.toLowerCase()) || 
                              u.description.toLowerCase().includes(unitSearch.toLowerCase())
                            )
                          } 
                          subjectColor={selectedSubject.color}
                          subjectId={selectedSubject.id}
                          completedUnits={completedUnits}
                          onUnitClick={(index) => {
                             playExternalBubble();
                             setSelectedUnitIndex(index);
                             navigateTo('unit-study', { subjectId: selectedSubject.id, unitIndex: index });
                          }}
                          theme={theme}
                        />
                      </div>
                    </AeroCard>
                  </div>

                  <div className="flex flex-col gap-6">
                    <AeroCard title={t('informacion')} theme={theme} className="h-fit">
                      <p className={`font-medium leading-relaxed italic text-sm transition-colors duration-500 ${theme === 'black' ? 'text-white/70' : 'text-sky-900'}`}>
                        "{selectedSubject.description}"
                      </p>
                    </AeroCard>

                    {selectedSubject.id === 'geografia' && (
                       <GlossyButton 
                        onClick={() => setShowGeoGuide(true)}
                        className="w-full max-w-[280px] py-4 text-sm gap-2 border-2 border-white/40 mx-auto"
                       >
                         <div className="flex items-center gap-2 whitespace-nowrap">📖 {t('guiaVisual')} <span className="text-[9px] opacity-50 font-black">(.HTML)</span></div>
                       </GlossyButton>
                    )}

                    {selectedSubject.id === 'matematica' && (
                       <GlossyButton 
                        onClick={() => setShowMathGuide(true)}
                        className="w-full max-w-[280px] py-4 text-sm gap-2 border-2 border-white/40 mx-auto"
                       >
                         <div className="flex items-center gap-2 whitespace-nowrap">🔢 {t('guiaVisual')} <span className="text-[9px] opacity-50 font-black">(PDF)</span></div>
                        </GlossyButton>
                    )}
                    
                    <GlossyButton 
                      onClick={() => {
                        setSelectedProgramSubject(selectedSubject);
                        setShowProgramModal(true);
                      }}
                      className="w-full max-w-[280px] py-4 text-sm gap-3 border-2 border-white/40 active:scale-95 transition-all mx-auto"
                    >
                      <BookOpen size={16} /> {t('verProgramas')}
                    </GlossyButton>
                  </div>
                </div>
             </motion.div>
          )}

          {currentView === 'unit-study' && selectedSubject && selectedUnitIndex !== null && (
             <UnitStudyView 
               unit={selectedSubject.units[selectedUnitIndex]} 
               color={selectedSubject.color}
               onBack={() => navigateTo('subject')}
               onStartExercise={() => startExercise(selectedUnitIndex)}
               theme={theme}
               disableAnimations={disableAnimations}
               hasNextUnit={selectedUnitIndex < selectedSubject.units.length - 1}
               onNextUnit={handleNextUnit}
             />
          )}


        </AnimatePresence>
      </main>

      {/* Decorative Bubbles for Frutiger Aero feel - Simplified for performance */}
      <div className="fixed -bottom-20 -left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-2xl pointer-events-none -z-10" />
      <div className="fixed -top-20 -right-20 w-72 h-72 bg-green-400/5 rounded-full blur-2xl pointer-events-none -z-10" />
      
      {/* Exercise Overlay */}
      <AnimatePresence>
        {showGeoGuide && <GeographyGuide theme={theme} onClose={() => setShowGeoGuide(false)} />}
        {showMathGuide && <MathGuide theme={theme} onClose={() => setShowMathGuide(false)} />}
        {activeExercise && (activeExercise.subjectId === 'shared' || selectedSubject) && exerciseState.shuffled.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6 bg-sky-400/20 backdrop-blur-2xl"
          >
            <BubbleBackground theme={theme} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="max-w-2xl w-full relative"
            >
              <AeroCard className="max-h-[90vh] overflow-y-auto border-t-white/80 border-l-white/60 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]" theme={theme}>
                <div className="space-y-6 relative z-10 pb-4 pt-2">
                  <header className="flex items-center gap-4 mb-2">
                    <div className={`p-3 rounded-2xl text-white shadow-lg bg-gradient-to-br ${
                      activeExercise.subjectId === 'shared' ? 'from-purple-400 to-indigo-600' : (
                        selectedSubject?.color === 'green' ? 'from-green-400 to-green-600' :
                        selectedSubject?.color === 'blue' ? 'from-blue-400 to-blue-600' :
                        selectedSubject?.color === 'amber' ? 'from-amber-400 to-amber-600' :
                        selectedSubject?.color === 'red' ? 'from-red-400 to-red-600' :
                        'from-indigo-400 to-indigo-600'
                      )
                    }`}>
                      {activeExercise.subjectId === 'shared' ? <Sparkles size={24} /> : getIcon(selectedSubject?.icon || 'book', 24)}
                    </div>
                    <div>
                      <h2 className={`text-2xl font-black ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
                        {activeExercise.subjectId === 'shared' ? 'Actividad Compartida' : (selectedSubject?.name || 'Lección')}
                      </h2>
                      <p className={`text-[10px] font-black uppercase tracking-widest opacity-40 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>
                        {activeExercise.subjectId === 'shared' ? 'Comunidad' : 'Lección de Práctica'}
                      </p>
                    </div>
                  </header>

                  <div className="w-full h-1.5 bg-sky-200/20 rounded-full mb-8 overflow-hidden border border-white/10">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(activeExercise.currentQuestion / exerciseState.shuffled.length) * 100}%` }}
                      className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    />
                  </div>

                  <ExerciseRunner 
                    subjectId={activeExercise.subjectId}
                    shuffled={exerciseState.shuffled}
                    currentQuestion={activeExercise.currentQuestion}
                    finished={exerciseState.finished}
                    score={exerciseState.score}
                    selectedAnswer={selectedAnswer}
                    onAnswer={handleExerciseAnswer}
                    onClose={() => {
                      if (activeExercise.subjectId === 'shared') {
                        setCurrentView(lastView === 'play-activity' ? 'gallery' : lastView);
                      }
                      setActiveExercise(null);
                      setExerciseState({ score: 0, finished: false, shuffled: [], userAnswers: [] });
                    }}
                    onFinish={() => {
                      if (activeExercise.subjectId === 'shared') {
                        setCurrentView(lastView === 'play-activity' ? 'gallery' : lastView);
                      }
                      setActiveExercise(null);
                      setExerciseState({ score: 0, finished: false, shuffled: [], userAnswers: [] });
                    }}
                    userAnswers={exerciseState.userAnswers}
                    title={activeExercise.subjectId === 'shared' ? 'Actividad Compartida' : (selectedSubject.units[activeExercise.unitIndex]?.title || 'Lección')}
                    theme={theme}
                    onReport={activeExercise.subjectId === 'shared' ? () => reportAbuse('activity', activeExercise.id, activeExercise.name || 'Actividad', activeExercise.creatorName) : undefined}
                  />
                </div>
              </AeroCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Predefined Avatar Library Modal */}
      <AnimatePresence>
        {showAvatarLibraryModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className={`w-full max-w-xl rounded-[32px] border-4 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh] ${
                theme === 'black' ? 'bg-slate-900/95 border-white/10 text-white' : 'bg-white border-blue-100 text-sky-950'
              }`}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                    <Sparkles className="text-yellow-400" size={24} />
                    Avatar Clásico
                  </h3>
                  <p className="text-xs opacity-60 font-medium">Elige tu personaje e identidad para NewAra</p>
                </div>
                <button 
                  onClick={() => {
                    setShowAvatarLibraryModal(false);
                    playExternalBubble();
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    theme === 'black' ? 'bg-white/5 text-white/70 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Category Filter Tabs */}
              <div className="px-6 py-3 border-b border-white/5 flex gap-2 overflow-x-auto scrollbar-none">
                {['Todos', 'Académico', 'Ciencia', 'Tecnología', 'Creatividad'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setAvatarCategoryFilter(cat);
                      playExternalBubble();
                    }}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      avatarCategoryFilter === cat 
                        ? (theme === 'black' ? 'bg-white text-black font-black' : 'bg-blue-600 text-white') 
                        : (theme === 'black' ? 'bg-white/5 text-white/50 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid of Avatars */}
              <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-[50vh]">
                {PREDEFINED_AVATARS.filter(av => avatarCategoryFilter === 'Todos' || av.category === avatarCategoryFilter).map(av => {
                  const isCurrent = userAvatar === av.dataUrl;
                  return (
                    <motion.button
                      key={av.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        setUserAvatar(av.dataUrl);
                        playSuccessSound();
                        setShowAvatarLibraryModal(false);
                        
                        // Auto-save if logged in
                        if (isLoggedIn) {
                          const userRef = doc(db, 'users', userName.trim());
                          await updateDoc(userRef, { avatar: av.dataUrl });
                        }
                      }}
                      className={`relative p-3 rounded-2xl border-2 flex flex-col items-center gap-2 group transition-all duration-300 ${
                        isCurrent 
                          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10' 
                          : (theme === 'black' ? 'border-white/5 bg-white/5 hover:border-white/20' : 'border-slate-100 bg-slate-50 hover:border-blue-200')
                      }`}
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden shadow-md relative">
                        <img 
                          src={av.dataUrl} 
                          alt={av.name} 
                          className="w-full h-full object-cover rounded-full"
                          referrerPolicy="no-referrer"
                        />
                        {isCurrent && (
                          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                            <Check className="text-white drop-shadow-md" size={24} />
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <p className={`text-[11px] font-black tracking-tight ${isCurrent ? 'text-blue-500' : ''}`}>{av.name}</p>
                        <p className="text-[8px] font-bold uppercase tracking-widest opacity-40">{av.category}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer text */}
              <div className="p-4 bg-black/10 border-t border-white/5 text-center text-[10px] font-medium opacity-50">
                Al seleccionar un avatar de la biblioteca, se aplica instantáneamente a tu perfil.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmModal.show && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`w-full max-w-sm p-6 rounded-[32px] border-4 shadow-2xl relative overflow-hidden ${
                theme === 'black' ? 'bg-slate-900 border-white/20' : 'bg-white border-white'
              }`}
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${confirmModal.type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                   {confirmModal.type === 'danger' ? <Trash2 size={24} /> : <AlertTriangle size={24} />}
                </div>
                <div className="space-y-1">
                  <h3 className={`text-xl font-black ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{confirmModal.title}</h3>
                  <p className={`text-sm font-medium opacity-60 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>{confirmModal.message}</p>
                </div>
                <div className="flex gap-3 w-full mt-2">
                  <button 
                    onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                    className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      theme === 'black' ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    Cancelar
                  </button>
                  <GlossyButton 
                    onClick={confirmModal.onConfirm}
                    className={`flex-1 py-3 text-[10px] ${confirmModal.type === 'danger' ? 'bg-red-500' : ''}`}
                  >
                    Confirmar
                  </GlossyButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Aras Reward Modal */}
      <AnimatePresence>
        {showDailyArasModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`w-full max-w-sm p-8 rounded-[40px] border-4 shadow-2xl relative overflow-hidden text-center flex flex-col items-center gap-6 ${
                theme === 'black' ? 'bg-slate-950 border-blue-500/30' : 'bg-white border-blue-500/25'
              }`}
            >
              {/* Background Glow */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Icon Container */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/20 antialiased transform rotate-6">
                  <Sparkles size={36} className="text-amber-100" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-teal-400 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-black animate-bounce font-mono">
                  !
                </div>
              </div>

              {/* Title & Info */}
              <div className="space-y-2">
                <h3 className={`text-2xl font-black uppercase tracking-tight leading-none ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
                  ¡Regalo Diario!
                </h3>
                <p className={`text-xs font-bold opacity-60 leading-relaxed px-4 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>
                  ¡Hola {userName}! Tienes disponible tu recompensa diaria por ingresar hoy como <b className="text-orange-500 font-extrabold uppercase">{userRole === 'Profesor' ? 'Profesor' : 'Estudiante'}</b>.
                </p>
              </div>

              {/* Reward Amount Container */}
              <div className={`w-full py-5 rounded-3xl border-2 flex flex-col items-center justify-center relative overflow-hidden ${
                theme === 'black' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'
              }`}>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Recibes</span>
                <span className="text-4xl font-black tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent flex items-center gap-2">
                  +{claimableDailyAras} ARAS
                </span>
                <span className="text-[8px] font-bold opacity-30 mt-1 uppercase tracking-widest">¡Vuelve mañana para ganar más!</span>
              </div>

              {/* Primary Claim Button */}
              <GlossyButton 
                onClick={claimDailyAras}
                loading={isClaimingDaily}
                className="w-full py-4 text-xs font-black uppercase tracking-widest shadow-2xl shadow-orange-500/20"
              >
                RECLAMAR AHORA
              </GlossyButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Abuse Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`w-full max-w-sm p-6 rounded-[32px] border-4 shadow-2xl relative overflow-hidden ${
                theme === 'black' ? 'bg-slate-900 border-white/20' : 'bg-white border-white'
              }`}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Flag size={20} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-black ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>Denunciar Abuso</h3>
                    <p className={`text-[10px] font-black opacity-40 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>{showReportModal.creatorName}</p>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border text-xs italic ${theme === 'black' ? 'bg-white/5 border-white/10 text-white/60' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                  "{showReportModal.name.substring(0, 100)}{showReportModal.name.length > 100 ? '...' : ''}"
                </div>

                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-wider opacity-40 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>Motivo de la denuncia</label>
                  <textarea 
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Describe por qué este contenido es inapropiado..."
                    className={`w-full p-4 rounded-2xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all min-h-[100px] resize-none ${
                       theme === 'black' ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-100 text-sky-950'
                    }`}
                  />
                </div>

                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => { setShowReportModal(null); setReportReason(''); }}
                    className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      theme === 'black' ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={submitReport}
                    disabled={isReporting || !reportReason.trim()}
                    className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all bg-amber-500 text-white shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 disabled:grayscale`}
                  >
                    {isReporting ? 'Enviando...' : 'Enviar Reporte'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Alert */}
      <AeroAuthAlert 
        isOpen={!!authRequiredMsg} 
        onClose={() => setAuthRequiredMsg(null)}
        onLogin={() => setIsRegistering(true)}
        message={authRequiredMsg || undefined}
        theme={theme}
      />

      {/* Register Modal */}
      <AnimatePresence>
        {isRegistering && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`w-full max-w-sm p-8 rounded-[40px] border-4 shadow-2xl relative overflow-hidden ${
                theme === 'black' ? 'bg-slate-900 border-white/20' : 'bg-white border-white/100'
              }`}
            >
              <div className="glossy-overlay opacity-20 pointer-events-none" />
              <button 
                onClick={() => setIsRegistering(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors text-sky-500"
                id="close-register-modal"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner">
                  <User size={32} />
                </div>
                <div className="text-center">
                  <h2 className={`text-2xl font-black uppercase tracking-tight ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
                    {authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                  </h2>
                  <p className={`text-xs font-bold opacity-40 uppercase tracking-widest ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
                    {authMode === 'login' ? 'Entra a tu perfil escolar' : 'Unete a la comunidad NewAra'}
                  </p>
                </div>
              </div>

              <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
                <div className="space-y-1">
                  <label className={`text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>Nombre de Usuario</label>
                  <div className="relative">
                    <input 
                      type="text"
                      required
                      value={loginUserName}
                      onChange={(e) => {
                        setLoginUserName(e.target.value);
                        setAuthError(null);
                      }}
                      onBlur={() => checkUsername(loginUserName)}
                      placeholder="Ej: Profe Juan"
                      className={`w-full px-6 py-4 rounded-3xl border-2 font-bold focus:ring-4 transition-all outline-none ${
                          theme === 'black' 
                          ? 'bg-white/5 border-white/10 text-white focus:ring-blue-500/20 focus:border-blue-500/50' 
                          : 'bg-slate-50 border-slate-200 focus:ring-blue-500/10 focus:border-blue-400'
                      }`}
                    />
                    {isCheckingAccount && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <RefreshCw size={16} className="animate-spin text-blue-500" />
                      </div>
                    )}
                  </div>
                </div>

                {MODERATORS.includes(loginUserName.trim()) && !isModAuthorized && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-1"
                  >
                    <label className={`text-[10px] font-black uppercase tracking-widest text-red-500 ml-2`}>Contraseña de Moderador</label>
                    <input 
                      type="password"
                      value={moderatorPassword}
                      onChange={(e) => setModeratorPassword(e.target.value)}
                      placeholder="Introducir contraseña..."
                      className={`w-full px-6 py-4 rounded-3xl border-2 border-red-500/50 font-bold focus:ring-4 transition-all outline-none ${
                          theme === 'black' ? 'bg-red-500/5 text-white' : 'bg-red-50/50 text-sky-950'
                      }`}
                    />
                  </motion.div>
                )}
                <div className="space-y-1">
                  <label className={`text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>Tu Contraseña</label>
                  <input 
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-6 py-4 rounded-3xl border-2 font-bold focus:ring-4 transition-all outline-none ${
                        theme === 'black' 
                        ? 'bg-white/5 border-white/10 text-white focus:ring-blue-500/20 focus:border-blue-500/50' 
                        : 'bg-slate-50 border-slate-200 focus:ring-blue-500/10 focus:border-blue-400'
                    }`}
                  />
                </div>

                {authError && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center"
                  >
                    {authError}
                  </motion.p>
                )}

                <div className="pt-2 flex flex-col gap-3">
                  <GlossyButton 
                    type="submit"
                    loading={isAuthLoading}
                    className="w-full py-5 text-sm tracking-widest uppercase font-black"
                  >
                    {authMode === 'login' ? 'Entrar Ahora' : 'Confirmar Registro'}
                  </GlossyButton>

                  <button
                    type="button"
                    onClick={() => {
                        setAuthMode(authMode === 'login' ? 'register' : 'login');
                        setAuthError(null);
                    }}
                    className={`text-[9px] font-black uppercase tracking-widest text-center hover:underline opacity-60 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}
                  >
                    {authMode === 'login' ? '¿No tienes cuenta? Registrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProgramModal && selectedProgramSubject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[260] flex items-center justify-center p-2 md:p-4 bg-black/70 backdrop-blur-xl"
            onClick={() => {
              setShowProgramModal(false);
              setExpandedProgramUnits(new Set());
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              onClick={e => e.stopPropagation()}
              className={`max-w-4xl w-full max-h-[80vh] md:max-h-[85vh] rounded-[2rem] md:rounded-[3rem] border-2 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col ${
                theme === 'black' ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-slate-100 text-slate-900'
              }`}
            >
              {/* Header */}
              <div className={`p-6 md:p-12 pb-6 border-b flex justify-between items-start ${theme === 'black' ? 'border-white/5 bg-white/2' : 'border-slate-50 bg-slate-50/50'}`}>
                <div className="flex items-center gap-4 md:gap-6">
                  <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center text-white shadow-2xl bg-gradient-to-br ${
                    selectedProgramSubject.color === 'green' ? 'from-green-400 to-green-600 shadow-green-500/20' :
                    selectedProgramSubject.color === 'blue' ? 'from-blue-400 to-blue-600 shadow-blue-500/20' :
                    selectedProgramSubject.color === 'amber' ? 'from-amber-400 to-amber-600 shadow-amber-500/20' :
                    selectedProgramSubject.color === 'indigo' ? 'from-indigo-400 to-indigo-600 shadow-indigo-500/20' :
                    selectedProgramSubject.color === 'red' ? 'from-red-400 to-red-600 shadow-red-500/20' :
                    'from-violet-400 to-violet-600 shadow-violet-500/20'
                  }`}>
                    <BookOpen className="w-8 h-8 md:w-10 md:h-10" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-5xl font-black tracking-tighter leading-none mb-1 md:mb-2">
                       PROGRAMA <span className="opacity-40">OFICIAL</span>
                    </h2>
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                      <span className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
                        selectedProgramSubject.color === 'green' ? 'bg-green-500' :
                        selectedProgramSubject.color === 'blue' ? 'bg-blue-500' :
                        selectedProgramSubject.color === 'amber' ? 'bg-amber-500' :
                        selectedProgramSubject.color === 'indigo' ? 'bg-indigo-500' :
                        selectedProgramSubject.color === 'red' ? 'bg-red-500' :
                        'bg-violet-500'
                      }`} />
                      {selectedProgramSubject.name} • 2024
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowProgramModal(false);
                    setExpandedProgramUnits(new Set());
                  }}
                  className={`p-2 md:p-3 rounded-xl md:rounded-2xl transition-all ${theme === 'black' ? 'hover:bg-white/10 text-white/40' : 'hover:bg-slate-200 text-slate-400'}`}
                >
                  <X size={20} className="md:w-6 md:h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
                <div className="space-y-8 md:y-12">
                  <section>
                    <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-3 md:mb-4 ml-2 md:ml-4">Descripción General</h3>
                    <div className={`p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-2 italic text-xs md:text-base leading-relaxed ${theme === 'black' ? 'bg-white/2 border-white/5 opacity-80' : 'bg-slate-50 border-white opacity-70'}`}>
                      "{selectedProgramSubject.description}"
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-4 md:mb-6 ml-2 md:ml-4">Contenidos Curriculares</h3>
                    <div className="space-y-3 md:space-y-4">
                      {selectedProgramSubject.units.map((unit: any, idx: number) => {
                        const isExpanded = expandedProgramUnits.has(idx);
                        return (
                          <div 
                            key={idx}
                            onClick={() => {
                              setExpandedProgramUnits(prev => {
                                const next = new Set(prev);
                                if (next.has(idx)) next.delete(idx);
                                else next.add(idx);
                                return next;
                              });
                            }}
                            className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all flex flex-col gap-2 md:gap-4 cursor-pointer group ${
                              theme === 'black' ? 'bg-zinc-800/50 border-white/5 hover:border-blue-500/30' : 'bg-white border-slate-100 hover:border-blue-500 shadow-sm'
                            }`}
                          >
                            <div className="flex gap-4 md:gap-6 items-center">
                              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-sm md:text-xl shadow-inner ${
                                theme === 'black' ? 'bg-white/5 text-white/20 group-hover:text-blue-400 group-hover:bg-blue-500/10' : 'bg-slate-50 text-slate-300 group-hover:text-blue-500 group-hover:bg-blue-50'
                              }`}>
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-black uppercase tracking-tight text-[11px] md:text-sm mb-0.5 md:mb-1">
                                  {unit.title.length > 30 ? `${unit.title.slice(0, 30)}...` : unit.title}
                                </h4>
                                <p className={`text-[10px] md:text-xs opacity-50 font-medium transition-all ${isExpanded ? '' : 'line-clamp-2'}`}>
                                  {unit.description}
                                </p>
                              </div>
                              <div className={`p-1.5 md:p-2 rounded-lg md:rounded-xl border transition-all ${
                                isExpanded ? 'rotate-90 bg-blue-500/10 border-blue-500/20 text-blue-500' : 
                                theme === 'black' ? 'border-white/10 opacity-40 group-hover:opacity-100' : 'border-slate-200 opacity-40 group-hover:opacity-100'
                              }`}>
                                <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                              </div>
                            </div>
                            
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className={`pt-4 md:pt-6 mt-4 md:mt-6 border-t ${theme === 'black' ? 'border-white/5' : 'border-slate-50'}`}>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-4">
                                           <h5 className="text-[9px] font-black uppercase tracking-widest opacity-40">Objetivos de la Unidad</h5>
                                           <ul className="space-y-2">
                                              {['Dominio de conceptos básicos', 'Aplicación en casos prácticos', 'Análisis crítico del tema'].map((obj, i) => (
                                                <li key={i} className="flex gap-2 items-center text-[10px] font-bold opacity-60">
                                                   <CheckCircle2 size={12} className="text-green-500" /> {obj}
                                                </li>
                                              ))}
                                           </ul>
                                        </div>
                                        <div className="space-y-4">
                                           <h5 className="text-[9px] font-black uppercase tracking-widest opacity-40">Recursos Sugeridos</h5>
                                           <div className="flex gap-2 flex-wrap">
                                              {['Video-Lección', 'Guía PDF', 'Simulacro'].map((tag, i) => (
                                                <span key={i} className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${theme === 'black' ? 'bg-white/5 border-white/10 opacity-60' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                                                  {tag}
                                                </span>
                                              ))}
                                           </div>
                                        </div>
                                     </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>
              </div>

              {/* Footer */}
              <div className={`p-6 md:p-8 border-t flex justify-end gap-4 ${theme === 'black' ? 'border-white/5' : 'border-slate-50'}`}>
                <GlossyButton 
                  onClick={() => {
                    setShowProgramModal(false);
                    setExpandedProgramUnits(new Set());
                  }}
                  className="px-8 md:px-12 py-3 text-[10px] font-black uppercase tracking-widest"
                >
                  Entendido
                </GlossyButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </MotionConfig>
  );
}

function ExerciseRunner({ 
  subjectId, 
  shuffled, 
  currentQuestion, 
  finished, 
  score, 
  selectedAnswer, 
  onAnswer, 
  onFinish, 
  onClose,
  onReport,
  userAnswers, 
  title, 
  theme = 'white' 
}: { 
  subjectId: string, 
  shuffled: any[], 
  currentQuestion: number, 
  finished: boolean, 
  score: number, 
  selectedAnswer: number | null, 
  onAnswer: (answer: number | string) => void, 
  onFinish: () => void, 
  onClose: () => void,
  onReport?: () => void,
  userAnswers: any[], 
  title: string, 
  theme?: 'white' | 'black' 
}) {
  const [writeInput, setWriteInput] = useState('');

  // Reset input when question changes
  useEffect(() => {
    setWriteInput('');
  }, [currentQuestion]);

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green': return 'from-green-400 to-green-600';
      case 'blue': return 'from-blue-400 to-blue-600';
      case 'sky': return 'from-sky-400 to-sky-600';
      case 'yellow': return 'from-yellow-400 to-yellow-600';
      case 'emerald': return 'from-emerald-400 to-emerald-600 shadow-emerald-500/30';
      case 'orange': return 'from-orange-400 to-orange-600';
      case 'amber': return 'from-amber-400 to-amber-600';
      case 'indigo': return 'from-indigo-400 to-indigo-600';
      case 'red': return 'from-red-400 to-red-600';
      case 'violet':
      case 'purple': return 'from-violet-400 to-violet-600';
      default: return 'from-sky-400 to-sky-600';
    }
  };

  const currentSubject = SUBJECTS.find(s => s.id === subjectId) || { color: 'blue', icon: 'Book' };
  const currentQ = shuffled[currentQuestion];
  const qType = (currentQ?.type === 'written' ? 'writing' : currentQ?.type) || 'multiple-choice';

  return (
    <div className="space-y-6 relative z-10 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className={`p-2 rounded-xl transition-all hover:scale-110 active:scale-95 flex items-center gap-2 group ${
              theme === 'black' ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-black/5 text-slate-400 hover:text-slate-600'
            }`}
            title="Volver"
            id="exit-exercise-btn"
          >
            <ChevronLeft size={24} />
          </button>
          <div className={`p-2 rounded-xl text-white shadow-lg bg-gradient-to-br ${getColorClasses(currentSubject.color)}`}>
             <Sparkles size={20} />
          </div>
          <div>
            <h2 className={`text-xl font-black leading-tight transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>{title}</h2>
            <p className={`text-[10px] uppercase font-black tracking-widest transition-colors duration-500 ${theme === 'black' ? 'text-blue-400' : 'text-sky-500'}`}>
              {qType === 'multiple-choice' ? 'Opción Múltiple' : qType === 'true-false' ? 'Verdadero o Falso' : 'Escritura'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-xs font-black transition-colors duration-500 ${theme === 'black' ? 'text-white/20' : 'text-sky-900/40'}`}>{currentQuestion + 1} / {shuffled.length}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!finished ? (
          <motion.div 
            key={currentQuestion}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="space-y-6"
          >
            <div className={`p-6 rounded-3xl backdrop-blur-xl border-2 transition-all duration-500 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] ${
              theme === 'black' 
                ? 'bg-white/5 border-white/10 text-white/90' 
                : 'bg-white/70 border-white/40 text-sky-950'
            }`}>
              <p className="text-xl font-black leading-snug drop-shadow-sm">
                {currentQ.question}
              </p>
            </div>

            {qType === 'writing' ? (
              <div className="space-y-4">
                <div className={`p-1.5 rounded-3xl border-2 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.1),0_5px_15px_-5px_rgba(0,0,0,0.1)] overflow-hidden ${
                  theme === 'black' ? 'bg-white/5 border-white/10' : 'bg-white/80 border-white/40'
                } ${selectedAnswer !== null ? (String(writeInput).toLowerCase().trim() === String(currentQ.correct).toLowerCase().trim() ? 'border-green-500 ring-4 ring-green-500/20' : 'border-red-500 ring-4 ring-red-500/20') : 'focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-400/20'}`}>
                  <input 
                    type="text"
                    id="exercise-input"
                    autoFocus
                    autoComplete="off"
                    value={writeInput}
                    onChange={(e) => setWriteInput(e.target.value)}
                    disabled={selectedAnswer !== null}
                    placeholder={currentQ.placeholder || "Escribe tu respuesta..."}
                    className={`w-full px-6 py-5 rounded-3xl bg-transparent font-black text-lg md:text-xl outline-none placeholder:opacity-40 tracking-tight ${
                      theme === 'black' ? 'text-white' : 'text-sky-950'
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && writeInput && selectedAnswer === null) {
                        onAnswer(writeInput);
                      }
                    }}
                  />
                </div>
                
                {selectedAnswer === null ? (
                  <GlossyButton 
                    onClick={() => onAnswer(writeInput)}
                    disabled={!writeInput}
                    className="w-full py-5 text-white shadow-xl"
                  >
                    ENVIAR RESPUESTA
                  </GlossyButton>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-5 rounded-3xl border-2 text-center shadow-lg ${
                    String(writeInput).toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === String(currentQ.correctAnswer || currentQ.correct).toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                      ? 'bg-gradient-to-b from-green-50 to-green-100 border-green-500 text-green-700'
                      : 'bg-gradient-to-b from-red-50 to-red-100 border-red-500 text-red-700'
                  }`}>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Respuesta Correcta:</p>
                    <p className="text-xl font-black">{currentQ.correctAnswer || currentQ.correct}</p>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-4">
                {currentQ.options.map((opt: string, i: number) => {
                  const isCorrect = i === currentQ.correct || opt === currentQ.correctAnswer;
                  const isSelected = i === selectedAnswer;
                  
                  let buttonStyle = theme === 'black' 
                    ? "bg-gradient-to-b from-white/10 to-white/5 border-white/10 text-white/80" 
                    : "bg-gradient-to-b from-white/90 to-white/60 border-white/80 text-sky-900";

                  if (selectedAnswer !== null) {
                    if (isSelected) {
                      buttonStyle = isCorrect 
                        ? "from-green-400 to-green-600 border-white text-white shadow-green-500/50" 
                        : "from-red-400 to-red-600 border-white text-white shadow-red-500/50";
                    } else if (isCorrect) {
                      buttonStyle = "from-green-400/20 to-green-600/20 border-green-500/50 text-green-600";
                    } else {
                      buttonStyle = "opacity-30 grayscale blur-[1px]";
                    }
                  }

                  return (
                    <motion.button 
                      key={i}
                      disabled={selectedAnswer !== null}
                      onClick={() => onAnswer(i)}
                      whileHover={selectedAnswer === null ? { scale: 1.02, y: -2 } : {}}
                      whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                      className={`relative p-3 md:p-5 rounded-2xl md:rounded-3xl text-left font-black transition-all border-2 flex items-center justify-between group overflow-hidden shadow-[0_8px_15px_-5px_rgba(0,0,0,0.1)] active:shadow-inner ${buttonStyle}`}
                    >
                      {/* Glossy Reflection Overlay */}
                      <div className="absolute top-0 left-0 w-full h-[50%] bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                      
                      <span className="relative z-10 text-xs md:text-base">{opt}</span>
                      
                      <div className={`relative z-10 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                        selectedAnswer !== null && isSelected 
                          ? 'bg-white border-white' 
                          : (theme === 'black' ? 'border-white/20' : 'border-sky-200 group-hover:border-blue-400')
                      }`}>
                        {selectedAnswer !== null && isSelected && (
                          <div className={`w-2 h-2 rounded-full ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`} />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-6 flex flex-col items-center gap-6"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-xl ring-8 ring-blue-50/10">
                {Math.round((score / shuffled.length) * 100)}%
              </div>
            </div>
            
            <div className="text-center space-y-1">
              <h3 className={`text-2xl font-black uppercase transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
                {score === shuffled.length ? '¡Excelente!' : score > 0 ? '¡Muy Bien!' : 'Sigue Intentando'}
              </h3>
              <p className={`text-sm font-medium transition-colors duration-500 ${theme === 'black' ? 'text-white/40' : 'text-sky-900/60'}`}>Has acertado {score} de {shuffled.length} preguntas.</p>
            </div>

            <div className="w-full space-y-2 max-h-48 overflow-y-auto px-2 custom-scrollbar">
              {userAnswers.map((log, i) => (
                <div key={i} className={`p-3 rounded-xl border flex items-center gap-3 ${log.isCorrect ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  {log.isCorrect ? <CheckCircle2 className="text-green-500" size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-red-500 flex items-center justify-center text-[10px] text-red-500 font-black">×</div>}
                  <p className={`text-xs font-bold transition-colors duration-500 ${theme === 'black' ? 'text-white/80' : 'text-sky-950'}`}>{log.question}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 w-full">
              <GlossyButton onClick={onFinish} className="flex-[2] py-4 bg-blue-500 text-white border-2 border-white/20 shadow-xl">
                 Finalizar
              </GlossyButton>
              {onReport && (
                <button 
                  onClick={onReport}
                  className="flex-1 py-4 rounded-full bg-red-500/10 text-red-500 font-black text-[10px] uppercase tracking-widest border border-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <AlertTriangle size={14} /> Denunciar
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileTabButton({ active, icon, label, onClick, theme = 'white', badge, isCenter = false }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void, theme?: 'white' | 'black' | 'aero', badge?: string, isCenter?: boolean }) {
  const isAero = theme === 'aero';
  const isDark = theme === 'black';

  if (isCenter) {
    return (
      <motion.button 
        onClick={() => {
          playExternalBubble();
          onClick();
        }}
        className="flex-1 flex flex-col items-center justify-center relative -mt-4"
        whileTap={{ scale: 0.9 }}
      >
        <div className={`relative p-3 rounded-full shadow-2xl transition-all duration-300 ${
          isAero 
            ? 'bg-gradient-to-br from-blue-400 via-green-400 to-blue-200 border-2 border-white shadow-[0_8px_25px_rgba(37,99,235,0.4)]' 
            : 'bg-blue-600 border-2 border-blue-400 shadow-[0_8px_25px_rgba(37,99,235,0.4)]'
        }`}>
          <div className="absolute inset-0 glossy-overlay opacity-50 rounded-full" />
          <div className="absolute inset-0 bg-white/10 rounded-full pointer-events-none" />
          <div className="text-white relative z-10 flex items-center justify-center drop-shadow-md">
            {icon}
          </div>
        </div>
        {label && (
          <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 ${isDark ? 'text-white/40' : 'text-sky-900/40'}`}>
            {label}
          </span>
        )}
      </motion.button>
    );
  }

  return (
    <motion.button 
      onClick={() => {
        playExternalBubble();
        onClick();
      }}
      className="flex-1 flex flex-col items-center justify-center relative py-1"
      whileTap={{ scale: 0.9 }}
    >
      <div className={`relative p-1 rounded-xl transition-all duration-300 ${
        active 
          ? (isAero ? 'bg-blue-400 text-white shadow-lg' : isDark ? 'bg-blue-600/30 text-blue-400' : 'bg-blue-50 text-blue-600') 
          : (isDark ? 'text-white/40 hover:text-white/60' : 'text-sky-900/40 hover:text-sky-900/60')
      }`}>
        {icon}
        {badge && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[7px] font-black px-1 py-0.5 rounded-full shadow-sm z-10">
            {badge}
          </span>
        )}
      </div>
      <span className={`text-[9px] font-black uppercase tracking-tighter mt-0.5 transition-colors duration-300 ${
        active 
          ? (isAero ? 'text-blue-600' : isDark ? 'text-blue-400' : 'text-blue-600') 
          : (isDark ? 'text-white/30' : 'text-sky-900/30')
      }`}>
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="mobile-tab-indicator"
          className={`absolute bottom-0 w-8 h-0.5 rounded-full ${isAero ? 'bg-blue-500' : isDark ? 'bg-blue-500' : 'bg-blue-600'}`}
        />
      )}
    </motion.button>
  );
}

function MobileMenuButton({ id, active, icon, label, onClick, theme = 'white', badge }: { id?: string, active: boolean, icon: React.ReactNode, label: string, onClick: () => void, theme?: 'white' | 'black' | 'aero', badge?: string }) {
  const isAero = theme === 'aero';
  return (
    <motion.button 
      id={id}
      onClick={() => {
        playExternalBubble();
        onClick();
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center gap-3 p-4 rounded-2xl transition-all border relative overflow-hidden ${
        active 
          ? (isAero ? 'bg-white border-blue-400 text-blue-600 shadow-xl scale-105' : theme === 'black' ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600') 
          : (theme === 'black' ? 'bg-white/5 border-white/10 text-white/70' : isAero ? 'bg-white/20 border-white/40 text-sky-950/80 hover:bg-white/40' : 'bg-slate-50 border-transparent text-sky-950')
      }`}
    >
      {(active || isAero) && <div className="glossy-overlay opacity-30" />}
      <div className={`${active ? 'opacity-100 relative z-10' : 'opacity-60 relative z-10'} ${isAero ? 'skeuo-icon-container !p-1.5' : ''}`}>
        {icon}
      </div>
      <span className="text-[11px] font-black uppercase tracking-widest relative z-10">{label}</span>
      {badge && (
        <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg animate-pulse border border-white/20 z-10">
          {badge}
        </span>
      )}
    </motion.button>
  );
}

function NavButton({ id, active, icon, label, onClick, theme = 'white', badge }: { id?: string, active: boolean, icon: React.ReactNode, label: string, onClick: () => void, theme?: 'white' | 'black' | 'aero', badge?: string }) {
  const isAero = theme === 'aero';
  const handleClick = () => {
    playExternalBubble();
    onClick();
  };

  const activeClasses = isAero
    ? 'bg-white/90 border-blue-400 text-blue-600 shadow-xl scale-105'
    : theme === 'black' 
      ? 'bg-blue-600/30 shadow-[0_0_20px_rgba(37,99,235,0.3)] text-blue-400 border-blue-500/50' 
      : 'bg-white/60 shadow-[0_5px_15px_rgba(59,130,246,0.2)] text-blue-600 border-white/80';

  const defaultClasses = isAero
    ? 'text-sky-900 border-transparent hover:bg-white/40'
    : theme === 'black' 
      ? 'text-white/60 border-transparent hover:bg-white/10 hover:text-white' 
      : 'text-sky-900/80 bg-slate-100/80 border-transparent hover:bg-slate-200/80 hover:text-sky-900 hover:shadow-md';

  return (
    <motion.button 
      id={id}
      onClick={handleClick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`flex-1 lg:w-full flex lg:flex-row flex-col items-center justify-center lg:justify-start gap-1 lg:gap-4 p-2 lg:p-3 xl:p-4 rounded-xl lg:rounded-2xl transition-all relative group border-2 overflow-hidden ${active ? activeClasses : defaultClasses}`}
      style={{ willChange: 'transform' }}
    >
      {(active || isAero) && <div className="glossy-overlay opacity-30" />}
      <motion.div 
        animate={active ? { scale: 1.1, rotate: [0, -5, 5, 0] } : { scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`${active ? (theme === 'black' ? 'text-blue-400' : 'text-blue-600') : 'opacity-60 group-hover:opacity-100'} ${isAero ? 'skeuo-icon-container scale-110 !p-1.5' : ''}`}
      >
        {icon}
      </motion.div>
      <span className={`text-[9px] lg:text-sm font-bold tracking-tight mt-1 lg:mt-0 ${isAero ? 'text-sky-950 font-black' : theme === 'black' ? 'text-white' : 'text-slate-800'}`}>{label}</span>
      
      {badge && (
        <span className="absolute top-1 right-1 md:top-2 md:right-2 bg-red-500 text-white text-[7px] md:text-[9px] font-black px-1.5 md:px-2 py-0.5 rounded-full shadow-lg animate-pulse border border-white/20 z-10">
          {badge}
        </span>
      )}

      {active && (
        <motion.div 
          layoutId="nav-indicator"
          className="hidden lg:block absolute right-2 w-1.5 h-8 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]"
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

function UnitButton({ number, title, color, onClick, theme = 'white', isCompleted = false, difficulty }: { number: number, title: string, color: string, onClick: () => void, theme?: 'white' | 'black' | 'aero', isCompleted?: boolean, difficulty?: string }) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green': return 'from-green-400 to-green-600 shadow-green-500/50';
      case 'blue': return 'from-blue-400 to-blue-600 shadow-blue-500/50';
      case 'sky': return 'from-sky-400 to-sky-600 shadow-sky-500/50';
      case 'yellow': return 'from-yellow-400 to-yellow-600 shadow-yellow-500/50';
      case 'emerald': return 'from-emerald-400 to-emerald-600 shadow-emerald-500/50';
      case 'orange': return 'from-orange-400 to-orange-600 shadow-orange-500/50';
      case 'amber': return 'from-amber-400 to-amber-600 shadow-amber-500/50';
      case 'indigo': return 'from-indigo-400 to-indigo-600 shadow-indigo-500/50';
      case 'red': return 'from-red-400 to-red-600 shadow-red-500/50';
      case 'violet':
      case 'purple': return 'from-violet-400 to-violet-600 shadow-violet-500/50';
      case 'pink':
      case 'rose': return 'from-rose-400 to-rose-600 shadow-rose-500/50';
      default: return 'from-sky-400 to-sky-600 shadow-sky-500/50';
    }
  };

  const getDifficultyColor = (diff?: string) => {
    switch(diff) {
      case 'Baja': return 'text-green-500';
      case 'Media': return 'text-amber-500';
      case 'Alta': return 'text-red-500';
      default: return 'text-sky-500';
    }
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.15, rotate: 2 }}
      whileTap={{ scale: 0.9, rotate: -2 }}
      className="flex flex-col items-center gap-4 group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        {/* Frutiger Aero Glossy Ring / Aura */}
        <div className={`absolute inset-0 rounded-full border-2 scale-125 opacity-20 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700 blur-[2px] ${theme === 'black' ? 'border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]'}`} />
        <div className={`absolute inset-0 rounded-full border-2 scale-135 opacity-10 group-hover:opacity-60 group-hover:scale-160 transition-all duration-1000 blur-[4px] ${theme === 'black' ? 'border-sky-300' : 'border-sky-400'}`} />
        
        {/* Main Button Body - Sphere Effect */}
        <div className={`w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-b ${isCompleted ? 'from-green-400 to-green-600' : getColorClasses(color)} flex items-center justify-center text-white text-3xl md:text-4xl font-black shadow-[0_12px_24px_-8px_rgba(0,0,0,0.5),inset_0_-4px_10px_rgba(0,0,0,0.3),inset_0_4px_10px_rgba(255,255,255,0.5)] border-4 border-white relative overflow-hidden active:translate-y-1 transition-all`}>
           {/* Top Gloss Flare */}
           <div className="absolute top-0 left-0 w-full h-[50%] bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
           {/* Center Light Reflection */}
           <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-gradient-to-br from-white/30 to-transparent rounded-full blur-[2px] pointer-events-none" />
           {/* Bottom Shading */}
           <div className="absolute bottom-0 left-0 w-full h-[20%] bg-black/10 pointer-events-none" />
           
           {/* Moving Shine Animation */}
           <div className="podium-reflection opacity-40 group-hover:opacity-70 transition-opacity" />

           {isCompleted ? <CheckCircle2 size={44} className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" /> : <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] tracking-tighter">{number}</span>}
        </div>

        {/* Dynamic Label Tooltip - Enhanced Aero Glass */}
        <div className={`absolute -top-16 left-1/2 -translate-x-1/2 px-5 py-3 rounded-[24px] shadow-2xl border backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-20 translate-y-3 group-hover:translate-y-0 flex flex-col items-center gap-1 ${
          theme === 'black' 
            ? 'bg-black/60 border-white/20 text-white' 
            : 'bg-white/80 border-white/60 text-sky-950'
        }`}>
          <div className="glossy-overlay opacity-20 rounded-[24px]" />
          <span className="text-xs md:text-sm font-black uppercase tracking-tight">
            {isCompleted ? '¡Completado!' : (title.length > 25 ? `${title.slice(0, 25)}...` : title)}
          </span>
          {difficulty && (
            <div className="flex items-center gap-1.5">
              <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-black/5 ${getDifficultyColor(difficulty)}`}>
                {difficulty}
              </span>
            </div>
          )}
          {/* Tooltip Triangle */}
          <div className={`absolute bottom-[-10px] left-1/2 -translate-x-1/2 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] ${theme === 'black' ? 'border-t-black/60' : 'border-t-white/80'}`} />
        </div>

        {/* Completion Checkmark Badge */}
        {isCompleted && (
          <motion.div 
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute -right-1 -bottom-1 bg-green-500 text-white p-1.5 rounded-full border-4 border-white shadow-lg z-10"
          >
            <Check size={16} strokeWidth={4} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function DuolingoPath({ units, subjectColor, onUnitClick, theme = 'white', subjectId, completedUnits = [] }: { units: any[], subjectColor: string, onUnitClick: (index: number) => void, theme?: 'white' | 'black' | 'aero', subjectId: string, completedUnits?: string[] }) {
  if (units.length === 0) {
    return (
      <div className="py-12 text-center opacity-40 italic flex flex-col items-center gap-3">
        <Search size={32} strokeWidth={1} />
        <p>No se encontraron temas con esa búsqueda.</p>
      </div>
    );
  }

  const getDotColor = (color: string) => {
    switch (color) {
      case 'green': return theme === 'black' ? 'bg-green-500/40' : 'bg-green-500/60';
      case 'blue': return theme === 'black' ? 'bg-blue-500/40' : 'bg-blue-500/60';
      case 'sky': return theme === 'black' ? 'bg-sky-500/40' : 'bg-sky-500/60';
      case 'amber': return theme === 'black' ? 'bg-amber-500/40' : 'bg-amber-500/60';
      case 'orange': return theme === 'black' ? 'bg-orange-500/40' : 'bg-orange-500/60';
      case 'yellow': return theme === 'black' ? 'bg-yellow-500/40' : 'bg-yellow-500/60';
      case 'indigo': return theme === 'black' ? 'bg-indigo-500/40' : 'bg-indigo-500/60';
      case 'red': return theme === 'black' ? 'bg-red-500/40' : 'bg-red-500/60';
      case 'violet':
      case 'purple': return theme === 'black' ? 'bg-violet-500/40' : 'bg-violet-500/60';
      case 'pink':
      case 'rose': return theme === 'black' ? 'bg-rose-500/40' : 'bg-rose-500/60';
      default: return theme === 'black' ? 'bg-sky-500/40' : 'bg-sky-500/60';
    }
  };

  return (
    <div className="flex flex-col items-center py-8 md:py-16 gap-16 md:gap-24 relative w-full overflow-visible">
      {/* Background Decorative Elements for Aero feel */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden select-none">
        <div className="absolute top-[10%] -left-10 w-40 h-40 bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute top-[40%] -right-10 w-60 h-60 bg-green-400/5 rounded-full blur-3xl" />
        <div className="absolute top-[70%] -left-20 w-80 h-80 bg-purple-400/5 rounded-full blur-3xl" />
      </div>

      {units.map((unit, i) => {
        const displayIndex = unit.originalIndex !== undefined ? unit.originalIndex : i;
        const offsetMultiplier = typeof window !== 'undefined' && window.innerWidth < 1024 ? 30 : 100;
        const offset = Math.sin(i * 1.4) * offsetMultiplier;
        const isCompleted = completedUnits.includes(`${subjectId}-${displayIndex}`);
        
        return (
          <div 
            key={displayIndex} 
            style={{ transform: `translateX(${offset}px)` }}
            className="relative z-10"
          >
            <UnitButton 
              number={displayIndex + 1} 
              title={unit.title} 
              color={subjectColor} 
              isCompleted={isCompleted}
              onClick={() => onUnitClick(displayIndex)} 
              theme={theme}
              difficulty={unit.difficulty}
            />
            
            {/* Connector dots - Styled more like organic "water drops" */}
            {i < units.length - 1 && (
              <div 
                className="absolute left-1/2 -translate-x-1/2 top-24 md:top-36 h-12 md:h-20 flex flex-col gap-4 items-center opacity-60"
                style={{
                   transform: `translateX(${-offset/1.5}px) rotate(${offset > 0 ? '-20deg' : '20deg'})`
                }}
              >
                <div className={`w-2 h-2 rounded-full ${getDotColor(subjectColor)} shadow-sm`} />
                <div className={`w-2 h-2 rounded-full ${getDotColor(subjectColor)} shadow-sm opacity-80`} />
                <div className={`w-2 h-2 rounded-full ${getDotColor(subjectColor)} shadow-sm opacity-60`} />
                <div className={`w-3 h-3 rounded-full border-2 border-white/20 ${getDotColor(subjectColor)} shadow-inner opacity-40`} />
              </div>
            )}
            
            {/* Unit Title Inline (Desktop Only) */}
            <div className={`hidden lg:block absolute top-[20%] ${offset > 0 ? 'right-[115%]' : 'left-[115%]'} w-48 lg:w-64 text-left ${offset > 0 ? 'text-right' : 'text-left'} transition-all group-hover:scale-105 pointer-events-none`}>
               <h4 className={`text-[10px] lg:text-sm font-black uppercase tracking-widest ${theme === 'black' ? 'text-white/60' : 'text-sky-950/60'}`}>
                 {unit.title.length > 22 ? `${unit.title.slice(0, 22)}...` : unit.title}
               </h4>
               <p className={`hidden lg:block text-[10px] font-bold opacity-40 line-clamp-1 italic ${theme === 'black' ? 'text-white/40' : 'text-sky-900/40'}`}>{unit.description}</p>
            </div>
          </div>
        );
      })}

      {/* Final "Castle" or "Finish" flag could go here */}
      <div className="mt-8 flex flex-col items-center gap-4 opacity-30 select-none">
        <div className={`w-16 h-1 h-px ${theme === 'black' ? 'bg-white/10' : 'bg-sky-950/10'}`} />
        <Trophy size={48} strokeWidth={1} />
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">META</p>
      </div>
    </div>
  );
}

function UnitStudyView({ unit, color, onBack, onStartExercise, theme = 'white', hasNextUnit, onNextUnit, disableAnimations }: { unit: any, color: string, onBack: () => void, onStartExercise: () => void, theme?: 'white' | 'black' | 'aero', hasNextUnit: boolean, onNextUnit: () => void, disableAnimations?: boolean }) {
  const getGradient = (color: string) => {
    switch (color) {
      case 'green': return 'from-green-400 to-green-600';
      case 'blue': return 'from-blue-400 to-blue-600';
      case 'amber': return 'from-amber-400 to-amber-600';
      case 'indigo': return 'from-indigo-400 to-indigo-600';
      case 'red': return 'from-red-400 to-red-600';
      case 'violet': return 'from-violet-400 to-violet-600';
      case 'pink':
      case 'rose': return 'from-rose-400 to-rose-600';
      default: return 'from-sky-400 to-sky-600';
    }
  };

  return (
    <motion.div 
      initial={disableAnimations ? { opacity: 1 } : { opacity: 0, x: 100, scale: 0.95 }}
      animate={disableAnimations ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
      exit={disableAnimations ? { opacity: 1 } : { opacity: 0, x: -100, scale: 0.95 }}
      transition={disableAnimations ? { duration: 0 } : { type: "spring", damping: 22, stiffness: 100 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <header className="flex items-center gap-4 lg:gap-6 sticky top-0 z-30 pt-2 pb-4 backdrop-blur-md">
        <button 
          onClick={onBack}
          className={`p-2 lg:p-4 rounded-3xl aero-glass transition-all active:scale-95 shadow-xl ${theme === 'black' ? 'hover:bg-white/10 text-white border-white/20' : 'hover:bg-white/80 text-sky-900 border-white/60'}`}
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            <h2 className={`text-xl lg:text-5xl font-black tracking-tighter leading-tight transition-colors duration-500 truncate ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{unit.title}</h2>
            {unit.difficulty && (
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all ${
                unit.difficulty === 'Baja' ? 'bg-green-500/20 border-green-500/30 text-green-500' :
                unit.difficulty === 'Media' ? 'bg-amber-500/20 border-amber-500/30 text-amber-500' :
                'bg-red-500/20 border-red-500/30 text-red-500'
              }`}>
                {unit.difficulty}
              </span>
            )}
          </div>
          <p className={`font-bold uppercase text-[10px] md:text-xs tracking-[0.25em] transition-colors duration-500 opacity-60 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>{unit.description}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        <div className="md:col-span-2 space-y-4 md:space-y-8">
          <AeroCard title="Lección Interactiva" theme={theme}>
            <div className="flex flex-col gap-4 md:gap-6">
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                <div className="p-4 rounded-3xl bg-amber-100/30 border border-amber-200/50 text-amber-600 w-fit h-fit shrink-0 shadow-inner">
                  <Lightbulb size={32} />
                </div>
                <div className="space-y-4 md:space-y-6 flex-1">
                  <p className={`text-lg md:text-2xl font-medium leading-relaxed transition-colors duration-500 ${theme === 'black' ? 'text-white/90' : 'text-sky-950'}`}>
                    {unit.explanation}
                  </p>
                  
                  <div className={`p-6 md:p-8 rounded-[40px] border relative overflow-hidden transition-all duration-500 ${theme === 'black' ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-gradient-to-br from-sky-50 to-white border-white shadow-xl'}`}>
                    <div className="glossy-overlay opacity-30 pointer-events-none" />
                    <h4 className={`text-sm md:text-base font-black mb-4 md:mb-6 flex items-center gap-3 transition-colors duration-500 uppercase tracking-widest ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>
                      <div className="p-2 rounded-xl bg-sky-500/20 text-sky-500">
                        <BookOpen size={20} />
                      </div>
                      Conceptos Clave
                    </h4>
                    <div className="grid grid-cols-1 gap-4 md:gap-6">
                      {unit.meanings.map((m: any, i: number) => (
                        <div key={i} className={`flex gap-4 p-4 rounded-3xl border transition-all hover:scale-[1.01] ${theme === 'black' ? 'bg-white/5 border-white/5' : 'bg-white/50 border-white/80 shadow-sm'}`}>
                          <div className="w-2 h-2 rounded-full bg-sky-400 mt-2 shrink-0 animate-pulse" />
                          <div className="flex-1">
                            <strong className={`block text-base md:text-lg transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{m.term}</strong>
                            <span className={`text-sm md:text-base transition-colors duration-500 leading-relaxed ${theme === 'black' ? 'text-white/50' : 'text-sky-800/70'}`}>{m.definition}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AeroCard>

          <AeroCard title="Vocabulario" theme={theme}>
             <div className="flex flex-wrap gap-4">
                {unit.meanings.map((m: any, i: number) => (
                   <motion.div 
                    key={i} 
                    whileHover={{ scale: 1.05, y: -2 }}
                    className={`px-6 py-3 rounded-full border shadow-lg flex items-center gap-3 group transition-all relative overflow-hidden ${theme === 'black' ? 'bg-white/5 border-white/10 hover:bg-white/15' : 'bg-white/60 border-white hover:bg-white'}`}
                   >
                      <div className="glossy-overlay opacity-10" />
                      <div className="p-1.5 rounded-full bg-green-500/20 text-green-500">
                        <CheckCircle2 size={16} />
                      </div>
                      <span className={`text-base font-black transition-colors duration-500 ${theme === 'black' ? 'text-white/90' : 'text-sky-950'}`}>{m.term}</span>
                   </motion.div>
                ))}
             </div>
          </AeroCard>
        </div>

        <div className="space-y-6">
          <AeroCard className={`bg-gradient-to-br ${getGradient(color)} text-white border-0 shadow-2xl relative overflow-hidden`} theme={theme}>
             <div className="podium-reflection opacity-30" />
             <div className="glossy-overlay opacity-40" />
             <div className="space-y-6 flex flex-col items-center text-center relative z-10 py-4">
                <div className="p-5 rounded-[32px] bg-white/20 border border-white/40 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <HelpCircle size={56} className="drop-shadow-lg" />
                </div>
                <div className="space-y-2 px-4 shadow-sm pb-2">
                   <h3 className="text-3xl font-black tracking-tighter">¿Listo para el reto?</h3>
                   <p className="text-white/90 font-bold text-sm leading-tight">Demuestra lo que sabes con nuestros ejercicios inteligentes.</p>
                </div>
                <GlossyButton 
                  onClick={onStartExercise}
                  className="w-full py-5 font-black shadow-2xl text-white text-lg bg-white/20 border-white/30 active:scale-95 transition-all"
                >
                  EMPEZAR AHORA
                </GlossyButton>
             </div>
          </AeroCard>

          {hasNextUnit && (
            <div className="space-y-4">
              <p className={`text-[10px] font-black uppercase tracking-[0.4em] text-center ${theme === 'black' ? 'text-white/40' : 'text-sky-900/40'}`}>PRÓXIMA PARADA</p>
              <GlossyButton 
                onClick={onNextUnit}
                className={`w-full py-5 text-xl shadow-2xl border-4 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all rounded-[32px] ${theme === 'black' ? 'bg-blue-600/20 border-blue-400/30 text-white' : 'bg-blue-600 border-blue-400 text-white'}`}
              >
                Siguiente Unidad <ChevronRight size={24} />
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

function UsersManager({ theme, onViewProfile, onClose, currentUserName }: { theme: 'white' | 'black', onViewProfile: (id: string, name?: string) => void, onClose: () => void, currentUserName: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isTogglingHelper, setIsTogglingHelper] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (userId: string) => {
    if (!window.confirm(`¿Seguro que quieres borrar a ${userId}? Esta acción es irreversible.`)) return;
    setIsDeleting(userId);
    try {
      // 1. Add to blacklist
      await setDoc(doc(db, 'banned_users', userId), {
        bannedAt: serverTimestamp(),
        bannedBy: currentUserName
      });

      // 2. Delete the user document
      await deleteDoc(doc(db, 'users', userId));
      
      setUsers(prev => prev.filter(u => u.id !== userId));
      playSuccessSound();
      
      // If we deleted ourselves (unlikely in this UI but good to handle)
      if (userId === currentUserName) {
        onClose(); // Just close, the syncProfile will handle logout on next tick
      }

      // Exit user management as requested
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (e) {
      console.error(e);
      playErrorSound();
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleHelper = async (userId: string, currentStatus: boolean) => {
    setIsTogglingHelper(userId);
    try {
      await updateDoc(doc(db, 'users', userId), {
        isHelper: !currentStatus
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isHelper: !currentStatus } : u));
      playSuccessSound();
    } catch (e) {
      console.error(e);
      playErrorSound();
    } finally {
      setIsTogglingHelper(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.id.toLowerCase().includes(search.toLowerCase()) || 
    (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className={`text-2xl font-black uppercase tracking-tight ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>Gestión de Usuarios</h2>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por ID o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-xl border text-sm font-bold outline-none transition-all ${
              theme === 'black' ? 'bg-white/5 border-white/10 text-white focus:border-blue-500' : 'bg-white border-slate-200 text-sky-950 focus:border-blue-500'
            }`}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20 gap-4">
           <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
           <p className="text-xs font-black uppercase tracking-widest opacity-40">Cargando base de datos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20 lg:pb-0">
          {filteredUsers.map(user => (
            <div key={user.id} className={`p-4 rounded-3xl border flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 transition-all hover:scale-[1.02] ${
              theme === 'black' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-blue-500/10 flex items-center justify-center shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.id} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={24} className="opacity-40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-black truncate ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{user.name || user.id}</p>
                    {user.isHelper && (
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-500 text-[8px] font-black uppercase tracking-tighter shrink-0 flex items-center gap-1">
                        <Award size={10} /> AYUDANTE
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold opacity-40 truncate">{user.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => onViewProfile(user.id, user.name)}
                  className={`flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all active:scale-95 ${
                    theme === 'black' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-sky-950'
                  }`}
                >
                  <User size={14} /> Perfil
                </button>
                <button 
                  disabled={isTogglingHelper === user.id}
                  onClick={() => toggleHelper(user.id, !!user.isHelper)}
                  className={`flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all active:scale-95 ${
                    user.isHelper 
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
                      : theme === 'black' ? 'bg-white/5 text-white/40 border border-white/10' : 'bg-slate-50 text-slate-400 border border-slate-100'
                  }`}
                >
                  {isTogglingHelper === user.id ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Award size={14} />} 
                  {user.isHelper ? 'Quitar Ayudante' : 'Dar Ayudante'}
                </button>
              </div>

              <button 
                disabled={isDeleting === user.id}
                onClick={() => deleteUser(user.id)}
                className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {isDeleting === user.id ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 size={14} /> Borrar Usuario
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Leaderboard({ theme, onViewProfile }: { theme: 'white' | 'black', onViewProfile: (id: string, name?: string) => void }) {
  const [filter, setFilter] = useState<'views' | 'likes' | 'correct' | 'aras'>('correct');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Users
        const usersRef = collection(db, 'users');
        const userSnap = await getDocs(query(usersRef, limit(200)));
        const userData = userSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // 2. Fetch Activities for Likes and Views aggregation
        const activitiesRef = collection(db, 'activities');
        const actSnap = await getDocs(activitiesRef);
        const activities = actSnap.docs.map(d => d.data());

        // 3. Aggregate Stats
        const leaderboard = userData.map((u: any) => {
          const userActivities = activities.filter(a => a.creatorName === u.id);
          const totalViews = userActivities.reduce((acc, a) => acc + (a.views || 0), 0);
          const totalLikes = userActivities.reduce((acc, a) => acc + (a.likes?.length || 0), 0);
          
          // Count completed units (from array)
          const totalCorrect = (u.completedUnits?.length || 0) + (u.stats?.totalCorrect || 0);
          
          // Aras count
          const totalAras = u.aras !== undefined ? u.aras : 150;

          return {
            ...u,
            computedStats: {
              views: totalViews,
              likes: totalLikes,
              correct: totalCorrect,
              aras: totalAras
            }
          };
        });

        const getScore = (u: any) => {
          if (filter === 'views') return u.computedStats.views;
          if (filter === 'likes') return u.computedStats.likes;
          if (filter === 'aras') return u.computedStats.aras;
          return u.computedStats.correct;
        };

        const sorted = leaderboard
          .filter(u => u.id !== 'Estudiante' && u.id !== 'AraTester' && u.id !== 'newen.araoz')
          .sort((a, b) => getScore(b) - getScore(a));

        setUsers(sorted);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'leaderboard_aggregate');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboardData();
  }, [filter]);

  const top3 = users.slice(0, 3);
  const others = users.slice(3, 50);

  const getStatValue = (u: any) => {
    if (filter === 'views') return u.computedStats.views;
    if (filter === 'likes') return u.computedStats.likes;
    if (filter === 'aras') return u.computedStats.aras;
    return u.computedStats.correct;
  };

  const getMetricLabel = () => {
    if (filter === 'views') return 'Vistas';
    if (filter === 'likes') return 'Likes';
    if (filter === 'aras') return 'Aras';
    return 'Correctos';
  };

  const getMetricIcon = (size = 14) => {
    if (filter === 'views') return <Globe size={size} />;
    if (filter === 'likes') return <Heart size={size} />;
    if (filter === 'aras') return <Coins size={size} className="text-amber-500" />;
    return <CheckCircle2 size={size} />;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {[
          { id: 'correct', label: 'Correctos', icon: <CheckCircle2 size={16} /> },
          { id: 'aras', label: 'Aras', icon: <Coins size={16} className="text-amber-500" /> },
          { id: 'likes', label: 'Likes', icon: <Heart size={16} /> },
          { id: 'views', label: 'Vistas', icon: <Globe size={16} /> }
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => {
              playExternalBubble();
              setFilter(btn.id as any);
            }}
            className={`px-4 py-2 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              filter === btn.id 
                ? 'bg-blue-500 text-white shadow-[0_8px_20px_-5px_rgba(59,130,246,0.6)] scale-105' 
                : theme === 'black' ? 'bg-white/5 text-white/50 hover:bg-white/10' : 'bg-white text-sky-900/60 hover:bg-sky-50 shadow-sm border border-slate-100'
            }`}
          >
            {btn.icon} {btn.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <RefreshCw className="animate-spin text-blue-500" size={32} />
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Compilando Rankings...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Trophy size={40} className="text-slate-300" />
          </div>
          <p className="text-xs font-black opacity-30 uppercase tracking-[0.2em]">Categoría desierta por ahora</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Podium */}
          <div className="flex flex-wrap items-end justify-center gap-4 md:gap-8 pt-10 px-2">
            {/* 2nd Place */}
            {top3[1] && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => onViewProfile(top3[1].id, top3[1].name)}
                className="flex flex-col items-center gap-4 order-2 md:order-1 scale-90 mb-2 cursor-pointer group hover:scale-95 transition-transform"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-slate-400 to-slate-200 shadow-xl overflow-hidden ring-4 ring-slate-400/20 group-hover:ring-blue-400 transition-all">
                    {top3[1].avatar ? (
                      <img src={top3[1].avatar} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <User size={24} />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center font-black text-slate-600 shadow-lg text-xs">2</div>
                </div>
                <div className="text-center w-24">
                  <div className="flex flex-col items-center gap-1">
                    <p className={`text-[11px] font-black truncate group-hover:text-blue-500 transition-colors w-full ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{top3[1].name || top3[1].id}</p>
                    {top3[1].isHelper && (
                      <div className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 text-[7px] font-black uppercase tracking-tighter flex items-center gap-0.5 border border-emerald-500/20">
                         <Sparkles size={8} /> AYUDANTE
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[9px] font-black text-slate-500 uppercase">
                    {getStatValue(top3[1])} {getMetricLabel()}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 1st Place */}
            {top3[0] && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => onViewProfile(top3[0].id, top3[0].name)}
                className="flex flex-col items-center gap-6 order-1 md:order-2 scale-110 mb-8 cursor-pointer group hover:scale-105 transition-transform"
              >
                <div className="relative">
                  <Trophy className="absolute -top-14 left-1/2 -translate-x-1/2 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,1)]" size={48} />
                  <div className="w-24 h-24 rounded-full p-1.5 bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-200 shadow-[0_20px_50px_-10px_rgba(234,179,8,0.5)] overflow-hidden ring-4 ring-yellow-400/30 group-hover:ring-yellow-500 transition-all">
                    {top3[0].avatar ? (
                      <img src={top3[0].avatar} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full bg-yellow-50 flex items-center justify-center text-yellow-500">
                        <User size={32} />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-yellow-500 border-4 border-white flex items-center justify-center font-black text-white shadow-xl text-lg min-w-[3rem]">1st</div>
                </div>
                <div className="text-center w-36 pt-2">
                  <div className="flex flex-col items-center gap-1 mb-1">
                    <p className={`text-sm font-black truncate group-hover:text-amber-500 transition-colors w-full ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{top3[0].name || top3[0].id}</p>
                    {top3[0].isHelper && (
                      <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase tracking-widest flex items-center gap-1 border border-emerald-500/20">
                         <Sparkles size={10} /> AYUDANTE
                      </div>
                    )}
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-xs font-black text-amber-600 mt-1">
                    {getMetricIcon(12)}
                    {getStatValue(top3[0])}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3rd Place */}
            {top3[2] && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => onViewProfile(top3[2].id, top3[2].name)}
                className="flex flex-col items-center gap-4 order-3 scale-[0.85] mb-2 cursor-pointer group hover:scale-[0.82] transition-transform"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-orange-400 to-orange-200 shadow-xl overflow-hidden ring-4 ring-orange-400/20 group-hover:ring-blue-400 transition-all">
                    {top3[2].avatar ? (
                      <img src={top3[2].avatar} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full bg-orange-50 flex items-center justify-center text-orange-400">
                        <User size={24} />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-orange-300 border-2 border-white flex items-center justify-center font-black text-orange-700 shadow-lg text-xs">3</div>
                </div>
                <div className="text-center w-24">
                  <div className="flex flex-col items-center gap-1">
                    <p className={`text-[11px] font-black truncate group-hover:text-blue-500 transition-colors w-full ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{top3[2].name || top3[2].id}</p>
                    {top3[2].isHelper && (
                      <div className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 text-[7px] font-black uppercase tracking-tighter flex items-center gap-0.5 border border-emerald-500/20">
                         <Sparkles size={8} /> AYUDANTE
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[9px] font-black text-orange-500 uppercase">
                    {getStatValue(top3[2])} {getMetricLabel()}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* List of others */}
          {others.length > 0 && (
            <div className="space-y-4">
               <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-2 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>Ranking General</h3>
               <AeroCard theme={theme} className="overflow-hidden">
                <div className="divide-y divide-slate-100/50">
                  {others.map((user, i) => (
                    <motion.div 
                      key={user.id} 
                      onClick={() => onViewProfile(user.id, user.name)}
                      className="flex items-center justify-between py-4 group hover:bg-sky-500/10 transition-all px-2 rounded-xl cursor-pointer active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-6 text-[10px] font-black text-slate-300 group-hover:text-blue-500 transition-colors uppercase tracking-widest leading-none">{i + 4}</span>
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 bg-slate-50 group-hover:border-blue-400 transition-all">
                          {user.avatar ? (
                            <img src={user.avatar} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                               <User size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`text-xs font-black group-hover:text-blue-500 transition-colors ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{user.name || user.id}</p>
                            {user.isHelper && (
                              <div className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 text-[7px] font-black uppercase tracking-tighter flex items-center gap-0.5">
                                 <Sparkles size={8} /> AYUDANTE
                              </div>
                            )}
                          </div>
                          <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">{user.role || 'Explorador'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/50 text-[10px] font-black text-blue-600 shadow-sm border border-white/40 group-hover:bg-blue-500 group-hover:text-white transition-all">
                        {getMetricIcon(12)}
                        {getStatValue(user)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AeroCard>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

