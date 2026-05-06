/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  TrendingDown,
  Bell,
  Check,
  CheckCircle,
  CheckCheck,
  BellRing,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, getDoc, serverTimestamp, setDoc, getDocs, query, where, orderBy, limit, deleteDoc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { SUBJECTS, Subject } from './types';
import { AeroCard, GlossyButton } from './components/AeroUI';
import { NewAraLogo } from './components/NewAraLogo';
import { GeographyGuide } from './components/GeographyGuide';
import { MathGuide } from './components/MathGuide';
import { BubbleBackground } from './components/BubbleBackground';
import { WelcomeTutorial } from './components/WelcomeTutorial';
import { playExternalBubble, playSuccessSound, playErrorSound } from './lib/sounds';
import { ClassCard, ClassDetail } from './components/ClassroomUI';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
const auth = getAuth(app);

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
};

type View = 'home' | 'subject' | 'schedule' | 'exam' | 'unit-study' | 'settings' | 'materias' | 'create-activity' | 'play-activity' | 'gallery' | 'leaderboard' | 'reports' | 'classes' | 'class-detail';

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

export default function App() {
  const [currentView, setCurrentView] = useState<View>(() => {
    return (localStorage.getItem('newara_view') as View) || 'home';
  });
  const [lastView, setLastView] = useState<View>('home');
  const [showWelcome, setShowWelcome] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedNotificationId, setExpandedNotificationId] = useState<string | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [userRole, setUserRole] = useState<'Estudiante' | 'Profesor'>(() => (localStorage.getItem('newara_user_role') as any) || 'Estudiante');

  useEffect(() => {
    const hasVisited = localStorage.getItem('newara_visited');
    if (!hasVisited) {
      setShowWelcome(true);
    }
  }, []);

  const navigateTo = (view: View) => {
    setLastView(currentView);
    setUnitSearch('');
    setCurrentView(view);
  };

  const [theme, setTheme] = useState<'white' | 'black'>(() => {
    return (localStorage.getItem('newara_theme') as 'white' | 'black') || 'white';
  });
  const [showMobileSubjects, setShowMobileSubjects] = useState(false);
  const [showMoreMobileMenu, setShowMoreMobileMenu] = useState(false);
  const [disableAnimations, setDisableAnimations] = useState(() => {
    return localStorage.getItem('newara_disable_animations') === 'true';
  });
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
      horario: "Horario",
      examen: "Examen",
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
      unidadesYTemas: "Unidades y Temas",
      informacion: "Información",
      verProgramas: "Ver Programas",
      miHorario: "Mi Horario Escolar",
      hora: "Hora",
      lunes: "Lunes",
      martes: "Martes",
      miercoles: "Miércoles",
      jueves: "Jueves",
      viernes: "Viernes",
      asistenteExamen: "Asistente de Examen Virtual",
      pregunta: "Pregunta",
      de: "de",
      examenFinalizado: "¡Examen Finalizado!",
      resultadoExamen: "Has respondido correctamente {score} de {total} preguntas.",
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
      actualizacionSistema: "Actualización del Sistema"
    },
    en: {
      materias: "Subjects",
      horario: "Schedule",
      examen: "Exam",
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
      unidadesYTemas: "Units and Topics",
      informacion: "Information",
      verProgramas: "View Programs",
      miHorario: "My School Schedule",
      hora: "Time",
      lunes: "Monday",
      martes: "Tuesday",
      miercoles: "Wednesday",
      jueves: "Thursday",
      viernes: "Friday",
      asistenteExamen: "Virtual Exam Assistant",
      pregunta: "Question",
      de: "of",
      examenFinalizado: "Exam Finished!",
      resultadoExamen: "You correctly answered {score} of {total} questions.",
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
      actualizacionSistema: "System Update"
    },
    ru: {
      materias: "Предметы",
      horario: "Расписание",
      examen: "Экзамен",
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
      unidadesYTemas: "Разделы и темы",
      informacion: "Информация",
      verProgramas: "Просмотреть программы",
      miHorario: "Моё школьное расписание",
      hora: "Время",
      lunes: "Понедельник",
      martes: "Вторник",
      miercoles: "Среда",
      jueves: "Четверг",
      viernes: "Пятница",
      asistenteExamen: "Виртуальный ассистент экзамена",
      pregunta: "Вопрос",
      de: "из",
      examenFinalizado: "Экзамен завершён!",
      resultadoExamen: "Вы правильно ответили на {score} из {total} вопросов.",
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

  // Classroom States
  const [userClasses, setUserClasses] = useState<any[]>([]);
  const [activeClass, setActiveClass] = useState<any | null>(null);
  const [classAnnouncements, setClassAnnouncements] = useState<any[]>([]);
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

  // Profile State
  const [userName, setUserName] = useState(() => (localStorage.getItem('newara_user_name') || 'Estudiante'));
  const [moderatorPassword, setModeratorPassword] = useState('');
  const [isModAuthorized, setIsModAuthorized] = useState(() => localStorage.getItem('newara_mod_auth') === 'true');
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('newara_logged_in') === 'true');

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
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginUserName, setLoginUserName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isCheckingAccount, setIsCheckingAccount] = useState(false);

  useEffect(() => {
    if (isLoggedIn && userName && userName !== 'Estudiante') {
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
    const syncProfile = async () => {
      if (isLoggedIn && userName && userName !== 'Estudiante') {
        try {
          const userRef = doc(db, 'users', userName.trim());
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            // Sync from Firestore as the source of truth
            if (data.avatar) setUserAvatar(data.avatar);
            if (data.role) setUserRole(data.role);
            if (data.bio) setUserBio(data.bio);
            if (data.completedUnits) {
              setCompletedUnits(data.completedUnits);
              localStorage.setItem('newara_completed_units', JSON.stringify(data.completedUnits));
            }
            
            // Sync local storage too
            if (data.bio) localStorage.setItem('newara_user_bio', data.bio);
            if (data.role) localStorage.setItem('newara_user_role', data.role);
            if (data.avatar) localStorage.setItem('newara_user_avatar', data.avatar);

            // Ensure stats structure exists for legacy users
            if (!data.stats) {
              await updateDoc(userRef, {
                stats: { totalViews: 0, totalLikes: 0, totalCorrect: 0 }
              });
            }
          } else {
            // Create profile for user if it doesn't exist but they are logged in
            const hashedPassword = await hashPassword(userPassword);
            await setDoc(userRef, {
              password: hashedPassword,
              role: userRole,
              bio: userBio,
              avatar: userAvatar,
              createdAt: serverTimestamp(),
              stats: { totalViews: 0, totalLikes: 0, totalCorrect: 0 }
            });
          }
        } catch (error) {
          console.error("Auto-sync error:", error);
        }
      }
    };
    syncProfile();
  }, [isLoggedIn, userName]); 

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
      const userDoc = await getDoc(doc(db, 'users', loginUserName.trim()));
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
          // Persist profile
          setUserBio(userData.bio || 'Explorador del conocimiento en NewAra.');
          setUserRole(userData.role || 'Estudiante');
          setUserAvatar(userData.avatar || '');
          localStorage.setItem('newara_user_name', loginUserName.trim());
          localStorage.setItem('newara_user_password', loginPassword);
          localStorage.setItem('newara_user_role', userData.role || 'Estudiante');
          localStorage.setItem('newara_logged_in', 'true');
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
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const userDoc = await getDoc(doc(db, 'users', loginUserName.trim()));
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
          role: userRole,
          avatar: safeAvatar,
          createdAt: serverTimestamp()
        });
        playSuccessSound();
        setUserName(loginUserName.trim());
        setUserPassword(loginPassword);
        setIsLoggedIn(true);
        setIsRegistering(false);
        localStorage.setItem('newara_user_name', loginUserName.trim());
        localStorage.setItem('newara_user_password', loginPassword);
        localStorage.setItem('newara_logged_in', 'true');
      }
    } catch (error) {
      console.error("Register error:", error);
      setAuthError("Error al crear la cuenta.");
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
    localStorage.removeItem('newara_user_name');
    localStorage.removeItem('newara_user_password');
    localStorage.removeItem('newara_logged_in');
    localStorage.removeItem('newara_mod_auth'); // Security: Clear moderator auth on logout
    setIsModAuthorized(false);
    playExternalBubble();
  };

  useEffect(() => {
    localStorage.setItem('newara_user_role', userRole);
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem('newara_user_password', userPassword);
  }, [userPassword]);

  useEffect(() => {
    localStorage.setItem('newara_user_bio', userBio);
  }, [userBio]);

  useEffect(() => {
    // If somehow the avatar became too large, we clear it to avoid sync errors
    if (userAvatar.length > 800000) { 
      setUserAvatar('');
      localStorage.removeItem('newara_user_avatar');
    } else {
      localStorage.setItem('newara_user_avatar', userAvatar);
    }
  }, [userAvatar]);

  const syncProfile = async () => {
    if (!isLoggedIn || !userName.trim() || userName.trim() === 'Estudiante') return;
    const path = `users/${userName.trim()}`;
    try {
      // Safeguard: Ensure we don't try to sync data that is too large
      const safeAvatar = userAvatar.length > 800000 ? '' : userAvatar;
      const safeBio = userBio.slice(0, 300);

      await updateDoc(doc(db, 'users', userName.trim()), {
        bio: safeBio,
        role: userRole,
        avatar: safeAvatar,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Sync error:", error);
      // We don't want to throw here as it's a background sync, but we want the detailed log if possible
      try {
        handleFirestoreError(error, OperationType.UPDATE, path);
      } catch (e) {
        // Log handled by handleFirestoreError
      }
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
    if (activeClass) {
      fetchClassDetails(activeClass.id);
    }
  }, [activeClass]);

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

  // Persist theme changes
  useEffect(() => {
    localStorage.setItem('newara_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('newara_disable_animations', disableAnimations.toString());
  }, [disableAnimations]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState<number | null>(null);
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
  const [unitSearch, setUnitSearch] = useState('');
  const [selectedActivityDetail, setSelectedActivityDetail] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState<{id: string, name: string, creatorName?: string, type?: 'announcement' | 'comment' | 'activity', classId?: string, parentId?: string} | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reports, setReports] = useState<any[]>([]);
  const [isReportsLoading, setIsReportsLoading] = useState(false);
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isTakingAction, setIsTakingAction] = useState(false);
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
    if (currentView === 'gallery') {
      fetchGallery();
    }
  }, [currentView]);

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
        
        userData = {
          name: creatorName || creatorId || 'Explorador',
          bio: fallbackBio,
          avatar: fallbackAvatar,
          role: fallbackRole,
          stats: {
            totalViews: activities.reduce((acc, curr) => acc + (curr.views || 0), 0),
            totalLikes: activities.reduce((acc, curr) => acc + (curr.likes?.length || 0), 0),
            totalCorrect: 0
          }
        };
      }

      setViewingProfile(userData);
      setViewingProfileActivities(activities);
    } catch (error) {
      console.error("Error viewing profile:", error);
      alert("No se pudo cargar el perfil.");
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

  const fetchUserClasses = async () => {
    if (!isLoggedIn) return;
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

  const createClass = async (name: string, description: string) => {
    if (!isLoggedIn || userRole !== 'Profesor') return;
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
    if (!isLoggedIn) return;
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
    if (!isLoggedIn) return;
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

  const postComment = async (classId: string, announcementId: string, content: string) => {
    if (!isLoggedIn) return;
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

  const createAssignment = async (classId: string, title: string, description: string, dueDate: string, attachment?: any) => {
    if (!isLoggedIn || userRole !== 'Profesor') return;
    try {
      await addDoc(collection(db, 'classes', classId, 'assignments'), {
        classId,
        title,
        description,
        dueDate,
        attachment: attachment || null,
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
    if (!isLoggedIn || !activeClass) return;
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
  };

  const reportAbuse = async (type: 'announcement' | 'comment' | 'activity', id: string, content: string, authorName: string, classId?: string, parentId?: string) => {
    if (!isLoggedIn) {
      setConfirmModal({
        show: true,
        title: 'Sesión Requerida',
        message: 'Debes iniciar sesión para denunciar contenido inapropiado.',
        type: 'warning',
        onConfirm: () => {
          setIsRegistering(true);
          setConfirmModal(prev => ({ ...prev, show: false }));
        }
      });
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
      const announcements = annSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setClassAnnouncements(announcements);

      // Fetch comments for each announcement
      for (const ann of announcements) {
        const commQ = query(collection(db, 'classes', classId, 'announcements', ann.id, 'comments'), orderBy('createdAt', 'asc'));
        const commSnap = await getDocs(commQ);
        setAnnouncementComments(prev => ({
          ...prev,
          [ann.id]: commSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        }));
      }

      const memSnap = await getDocs(collection(db, 'classes', classId, 'members'));
      const members = memSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Fetch full profiles for avatars
      const membersWithProfiles = await Promise.all(members.map(async (m: any) => {
        const userDoc = await getDoc(doc(db, 'users', m.id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          return { ...m, avatar: userData.avatar || null };
        }
        return m;
      }));
      
      setClassMembers(membersWithProfiles);

      const resQ = query(collection(db, 'classes', classId, 'resources'), orderBy('createdAt', 'desc'));
      const resSnap = await getDocs(resQ);
      setClassResources(resSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const assQ = query(collection(db, 'classes', classId, 'assignments'), orderBy('createdAt', 'desc'));
      const assSnap = await getDocs(assQ);
      const assignments = assSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setClassAssignments(assignments);

      // Fetch all submissions for these assignments (for teachers) or just for current user (for students)
      // For simplicity in this demo, we fetch all submissions linked to assignments in this class
      const allSubmissions: any[] = [];
      for (const ass of assignments) {
        const subSnap = await getDocs(collection(db, 'classes', classId, 'assignments', ass.id, 'submissions'));
        subSnap.docs.forEach(doc => allSubmissions.push({ id: doc.id, ...doc.data(), assignmentId: ass.id }));
      }
      setClassSubmissions(allSubmissions);

    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `classes/${classId}`);
      console.error("Error fetching class details:", error);
    }
  };

  const fetchNotifications = async () => {
    if (!isLoggedIn || !userName || userName === 'Estudiante') return;
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

  const handleDeleteActivity = async (id: string, e: React.MouseEvent, creatorName?: string, activityTitle?: string) => {
    e.stopPropagation();
    const canDelete = isModerator || (creatorName === userName);
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
    const canEdit = isModerator || (activity.creatorName === userName);
    if (!canEdit) return;

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
    navigateTo('create-activity');
    playExternalBubble();
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
    // Shuffle questions
    const randomizedQuestions = shuffleArray(unit.exercises).map(ex => {
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
      navigateTo('unit-study');
    }
  };

  const handleSubjectClick = (subject: Subject) => {
    playExternalBubble();
    setSelectedSubject(subject);
    setSelectedUnitIndex(null);
    navigateTo('subject');
  };

  const resetExam = () => {
    playExternalBubble();
    setExamState({ active: true, currentQuestion: 0, score: 0, finished: false });
    navigateTo('exam');
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
      case 'sky': return 'from-sky-400 to-sky-600';
      case 'amber': return 'from-amber-400 to-amber-600';
      case 'indigo': return 'from-indigo-400 to-indigo-600';
      case 'red': return 'from-red-400 to-red-600';
      case 'violet':
      case 'purple': return 'from-violet-400 to-violet-600';
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
      if (q.type === 'writing') return q.correct !== '';
      if (q.type === 'true-false') return q.options.length === 2 && q.correct !== undefined;
      // Multiple choice needs at least 2 non-empty options
      const nonEmptyOptions = q.options.filter(o => o.trim() !== '');
      return nonEmptyOptions.length >= 2 && q.correct !== undefined && q.correct !== null;
    });

    if (!isValid) {
      setCreationError("Asegúrate de que todas las preguntas tengan texto y al menos 2 opciones válidas.");
      playErrorSound();
      return;
    }

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
        if (q.type === 'writing') {
          finalCorrectAnswer = String(q.correct).trim();
        } else {
          const idx = Number(q.correct);
          finalCorrectAnswer = q.options[idx] || q.options[0] || '';
        }

        return {
          type: q.type || 'multiple-choice',
          question: q.question.trim(),
          options: q.options.filter(o => o.trim() !== ''),
          correctAnswer: finalCorrectAnswer
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
    if (!isLoggedIn || userName === 'Estudiante') {
      setIsRegistering(true);
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

  const handleLoadActivity = async (code: string) => {
    if (!code) return;
    setLoadError(null);
    setIsLoadingActivity(true);
    try {
      const docRef = doc(db, 'activities', code);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Incrementar vistas de la actividad y del creador solo si está logueado
        if (isLoggedIn && userName !== 'Estudiante') {
          updateDoc(docRef, { views: increment(1) });
          if (data.creatorName) {
            incrementUserStat(data.creatorName, 'totalViews', 1);
          }
        }

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
    <div className={`flex h-screen overflow-hidden font-sans relative flex-col md:flex-row transition-colors duration-500 ${theme === 'black' ? 'text-white' : ''}`}>

      {showWelcome && (
        <WelcomeTutorial onComplete={() => {
          setShowWelcome(false);
          localStorage.setItem('newara_visited', 'true');
        }} />
      )}

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
               className={`relative w-full max-w-lg md:rounded-[40px] rounded-t-[40px] md:border-4 border-x-0 border-b-0 md:border-b-4 shadow-2xl flex flex-col h-full md:h-auto max-h-[92vh] md:max-h-[80vh] overflow-hidden self-end md:self-center ${
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
              className={`relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-[32px] md:rounded-[48px] border-4 shadow-2xl p-6 md:p-10 ${
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
                    {(isModerator || (selectedActivityDetail && selectedActivityDetail.creatorName === userName)) && (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEditActivity(selectedActivityDetail, e); }}
                          className="aero-icon-button bg-blue-500/10 text-blue-500 shadow-lg shadow-blue-500/10"
                          title="Editar"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteActivity(selectedActivityDetail.id, e, selectedActivityDetail.creatorName, selectedActivityDetail.title); }}
                          className="aero-icon-button bg-red-500/10 text-red-500 shadow-lg shadow-red-500/10"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                      {(isLoggedIn && userName !== 'Estudiante') && (
                        <button 
                          onClick={() => {
                            setShowReportModal({id: selectedActivityDetail.id, name: selectedActivityDetail.name, creatorName: selectedActivityDetail.creatorName});
                          }}
                          className="aero-icon-button bg-red-500/10 text-red-500"
                          title="Denunciar actividad"
                        >
                          <AlertTriangle size={20} />
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedActivityDetail(null)}
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
                        <span className="text-sm font-bold truncate max-w-[120px] group-hover:text-blue-400 transition-colors">{selectedActivityDetail.creatorName || 'Anónimo'}</span>
                      </div>
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-60 transition-opacity ml-auto" />
                    </button>

                    <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/10 border border-white/10">
                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                          <CalendarIcon size={18} />
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
                      className="flex-[1.5] py-4 text-sm font-black tracking-[0.2em] gap-3"
                    >
                      ¡JUGAR AHORA! <Play size={20} fill="currentColor" />
                    </GlossyButton>
                </div>

                {selectedActivityDetail && (selectedActivityDetail.creatorName === userName || isModerator) && selectedActivityDetail.likes?.length > 0 && (
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
                        <h2 className="text-2xl md:text-5xl font-black tracking-tight leading-tight">
                          {viewingProfile.name}
                        </h2>
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
                  <div className="p-5 md:p-6 rounded-[24px] md:rounded-[32px] bg-white/5 border border-white/10">
                    <p className="text-[9px] md:text-xs font-black uppercase tracking-[0.2em] opacity-40 mb-2 md:mb-3">BIOGRAFÍA</p>
                    <p className="text-xs md:text-base leading-relaxed font-medium">
                      {viewingProfile.bio || "Este usuario prefiere mantener su biografía en secreto..."}
                    </p>
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
                      <p className="text-xl md:text-2xl font-black">{viewingProfile.stats?.totalCorrect || 0}</p>
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

      {isProfileLoading && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/20 backdrop-blur-sm">
           <div className="flex flex-col items-center gap-4">
              <RefreshCw className="text-blue-500 animate-spin" size={48} />
              <p className="text-white font-black uppercase tracking-[0.3em] text-xs">Cargando Perfil...</p>
           </div>
        </div>
      )}

      {/* Sidebar - Navigation Rail (Desktop) / Bottom Nav (Mobile) */}
      <nav className={`fixed bottom-0 left-0 right-0 h-32 md:relative md:h-auto md:w-64 aero-glass m-2 md:m-4 rounded-[32px] md:rounded-[40px] flex flex-col items-center justify-center md:justify-start py-3 md:py-8 gap-2 md:gap-6 border-4 shadow-2xl z-40 transition-all duration-500 ${theme === 'black' ? 'bg-black/90 border-white/10' : 'bg-white/95 border-white'}`}>
        <div className="glossy-overlay opacity-20 pointer-events-none" />
        
        {/* LOGO NewAra - Now visible on mobile too */}
        <div className="flex flex-col items-center gap-1 md:gap-2 mb-1 px-4 scale-90 md:scale-100">
           <div className="md:hidden">
             <NewAraLogo size="md" theme={theme} />
           </div>
           <div className="hidden md:block">
             <NewAraLogo size="lg" theme={theme} />
           </div>
          
          <div className="hidden md:block w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
        </div>

        {/* PC Offline Status - Positioned between logo and user profile */}
        <div className="hidden md:block mb-2">
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

          <button 
            onClick={() => {
              playExternalBubble();
              setShowNotifications(true);
            }}
            className={`group relative p-3 rounded-2xl transition-all active:scale-95 border-2 hover:scale-105 ${
              theme === 'black' ? 'bg-white/5 border-white/10 hover:border-blue-500/30' : 'bg-white/60 border-white hover:border-blue-300 shadow-sm'
            }`}
          >
            <Bell size={20} className={theme === 'black' ? 'text-white/70 group-hover:text-amber-400' : 'text-sky-900 group-hover:text-amber-500'} />
            {notifications.filter(n => !n.isRead).length > 0 && (
              <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </button>
        </div>

        <div className="hidden md:flex flex-col items-center gap-2 mb-4">
          <div className="w-14 h-14 rounded-full p-1 bg-white/20 backdrop-blur-md border border-white/40 shadow-xl overflow-hidden group">
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
          <div className="flex flex-col items-center">
            <span className={`hidden md:block text-[11px] font-black uppercase tracking-widest ${theme === 'black' ? 'text-white' : 'text-sky-900/80'}`}>{userName}</span>
            <span className={`hidden md:block text-[9px] font-bold uppercase tracking-widest opacity-40 ${theme === 'black' ? 'text-white' : 'text-sky-800'}`}>{userRole}</span>
          </div>
        </div>

        <div className="flex-1 w-full md:px-4 md:overflow-y-auto md:custom-scrollbar flex md:flex-col flex-row justify-around md:justify-start items-center gap-1 md:gap-8">
          {/* Desktop Search Bar */}
          <div className="hidden md:flex w-full mb-2">
            <div className="relative w-full group">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 ${theme === 'black' ? 'text-white/30 group-focus-within:text-blue-400' : 'text-sky-900/40 group-focus-within:text-blue-500'}`} size={16} />
              <input 
                type="text"
                value={gallerySearch}
                onChange={(e) => {
                  setGallerySearch(e.target.value);
                  if (currentView !== 'gallery') navigateTo('gallery');
                }}
                placeholder="Buscar actividades..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-[11px] font-black transition-all duration-300 outline-none border-2 ${
                  theme === 'black' 
                    ? 'bg-zinc-900/50 border-white/5 focus:border-blue-500/50 text-white placeholder:text-white/20' 
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
          <div className="hidden md:flex flex-col gap-4 w-full items-center">
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
              badge="NUEVO"
            />
            <NavButton 
              id="nav-leaderboard"
              active={currentView === 'leaderboard'} 
              onClick={() => {
                navigateTo('leaderboard');
                setShowMobileSubjects(false);
              }} 
              icon={<Trophy size={22} />} 
              label={t('leaderboard')} 
              theme={theme}
              badge="TOP"
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
              badge="NUEVO"
            />
            <NavButton 
              id="nav-schedule"
              active={currentView === 'schedule'} 
              onClick={() => {
                navigateTo('schedule');
                setShowMobileSubjects(false);
              }} 
              icon={<CalendarIcon size={22} />} 
              label={t('horario')} 
              theme={theme}
            />
            <NavButton 
              id="nav-exam"
              active={currentView === 'exam'} 
              onClick={() => {
                navigateTo('exam');
                setShowMobileSubjects(false);
              }} 
              icon={<ClipboardCheck size={22} />} 
              label={t('examen')} 
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
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden justify-around items-center w-full px-2 mt-auto">
            <NavButton 
              id="mobile-nav-home"
              active={currentView === 'home'} 
              onClick={() => {
                navigateTo('home');
                setShowMoreMobileMenu(false);
                setShowMobileSubjects(false);
              }} 
              icon={<Home size={22} />} 
              label={t('inicio')} 
              theme={theme}
            />
            <NavButton 
              id="mobile-nav-gallery"
              active={currentView === 'gallery'} 
              onClick={() => {
                navigateTo('gallery');
                setShowMoreMobileMenu(false);
                setShowMobileSubjects(false);
              }} 
              icon={<Globe size={22} />} 
              label="Galería" 
              theme={theme}
            />
            <NavButton 
              id="mobile-nav-classes"
              active={currentView === 'classes' || currentView === 'class-detail'} 
              onClick={() => {
                navigateTo('classes');
                setShowMoreMobileMenu(false);
                setShowMobileSubjects(false);
              }} 
              icon={<Users size={22} />} 
              label="Clases" 
              theme={theme}
            />
            <NavButton 
              id="mobile-nav-more"
              active={showMoreMobileMenu} 
              onClick={() => {
                setShowMoreMobileMenu(!showMoreMobileMenu);
                setShowMobileSubjects(false);
              }} 
              icon={<Menu size={22} />} 
              label={t('mas')} 
              theme={theme}
            />
          </div>

          {/* Mobile Menu Overlay */}
          <AnimatePresence>
            {showMoreMobileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className={`fixed bottom-24 left-4 right-4 p-4 rounded-[32px] border-4 shadow-2xl backdrop-blur-3xl z-50 overflow-hidden ${
                  theme === 'black' 
                    ? 'bg-black/90 border-white/10' 
                    : 'bg-white/95 border-white/60'
                }`}
              >
                <div className="glossy-overlay opacity-30 rounded-3xl" />
                <div className="flex items-center justify-between mb-4 px-2">
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
                <div className="flex flex-col gap-2">
                  <MobileMenuButton 
                    active={showMobileSubjects} 
                    onClick={() => { setShowMobileSubjects(!showMobileSubjects); setShowMoreMobileMenu(false); }} 
                    icon={<Book size={20} />} 
                    label={t('materias')} 
                    theme={theme}
                  />
                  <MobileMenuButton 
                    id="nav-schedule"
                    active={currentView === 'schedule'} 
                    onClick={() => { navigateTo('schedule'); setShowMoreMobileMenu(false); }} 
                    icon={<CalendarIcon size={20} />} 
                    label={t('horario')} 
                    theme={theme}
                  />
                  <MobileMenuButton 
                    id="nav-exam"
                    active={currentView === 'exam'} 
                    onClick={() => { navigateTo('exam'); setShowMoreMobileMenu(false); }} 
                    icon={<ClipboardCheck size={20} />} 
                    label={t('examen')} 
                    theme={theme}
                  />
                  <MobileMenuButton 
                    id="nav-leaderboard"
                    active={currentView === 'leaderboard'} 
                    onClick={() => { navigateTo('leaderboard'); setShowMoreMobileMenu(false); }} 
                    icon={<Trophy size={20} />} 
                    label={t('leaderboard')} 
                    theme={theme}
                    badge="TOP"
                  />
                  <MobileMenuButton 
                    active={showNotifications} 
                    onClick={() => { setShowNotifications(true); setShowMoreMobileMenu(false); }} 
                    icon={<Bell size={20} />} 
                    label={t('notificaciones')} 
                    theme={theme}
                    badge={notifications.filter(n => !n.isRead).length > 0 ? notifications.filter(n => !n.isRead).length.toString() : undefined}
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
                    <MobileMenuButton 
                      id="nav-reports"
                      active={currentView === 'reports'} 
                      onClick={() => { navigateTo('reports'); fetchReports(); setShowMoreMobileMenu(false); }} 
                      icon={<AlertTriangle size={20} />} 
                      label={t('denunciados')} 
                      theme={theme}
                      badge={reports.length > 0 ? reports.length.toString() : undefined}
                    />
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
                    className={`fixed bottom-24 left-4 right-4 p-5 rounded-[32px] border-4 shadow-2xl backdrop-blur-3xl z-50 overflow-hidden flex flex-col max-h-[70vh] ${
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
                      {SUBJECTS.map(s => (
                        <button 
                          key={s.id}
                          onClick={() => {
                            playExternalBubble();
                            setSelectedSubject(s);
                            navigateTo('subject');
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

          <div className="hidden md:flex flex-col gap-2 w-full pb-8">
            <p className="hidden md:block text-[10px] uppercase font-bold text-sky-800/40 tracking-tighter mb-2 px-2">{t('materias')}</p>
            {SUBJECTS.map(s => (
              <button 
                key={s.id}
                onClick={() => {
                  playExternalBubble();
                  setSelectedSubject(s);
                  navigateTo('subject');
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

      {/* Main Content Area Logo for Mobile */}
      <div className={`md:hidden flex flex-col items-center justify-center h-16 px-4 z-30 sticky top-0 transition-all duration-500 bg-transparent`}>
        <div className="absolute left-6 top-1/2 -translate-y-1/2">
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
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
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

      <main className="flex-1 overflow-y-auto p-4 pb-28 md:p-8 relative">
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
                  cls={activeClass}
                  theme={theme}
                  onBack={() => { setCurrentView('classes'); setActiveClass(null); }}
                  isOwner={activeClass.ownerName === userName}
                  announcements={classAnnouncements}
                  comments={announcementComments}
                  members={classMembers}
                  resources={classResources}
                  assignments={classAssignments}
                  submissions={classSubmissions}
                  userName={userName}
                  onPostAnnouncement={(content, att) => postAnnouncement(activeClass.id, content, att)}
                  onPostComment={(annId, content) => postComment(activeClass.id, annId, content)}
                  onEditAnnouncement={(annId, content) => editAnnouncement(activeClass.id, annId, content)}
                  onDeleteAnnouncement={(annId) => deleteAnnouncement(activeClass.id, annId)}
                  onEditComment={(annId, commId, content) => editComment(activeClass.id, annId, commId, content)}
                  onDeleteComment={(annId, commId) => deleteComment(activeClass.id, annId, commId)}
                  onReportAbuse={(type, id, content, author, cId, pId) => reportAbuse(type, id, content, author, cId, pId)}
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
              className="space-y-8"
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

              <header className="flex flex-col gap-1">
                <h1 className={`text-3xl md:text-4xl font-bold tracking-tight font-logo uppercase transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
                  {t('inicio')}
                </h1>
                <p className={`text-sm md:text-base font-medium transition-colors duration-500 ${theme === 'black' ? 'text-white/60' : 'text-sky-800/60'}`}>{t('explorar')} <span className={`font-logo font-bold transition-colors duration-500 ${theme === 'black' ? 'text-blue-400' : 'text-sky-900'}`}>NewAra</span>.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AeroCard title="Actividad Compartida" theme={theme} className="bg-gradient-to-br from-purple-400/10 to-pink-500/10">
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <p className={`text-[10px] font-black uppercase tracking-widest opacity-40 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>Ingresar Código</p>
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

                    <div className="pt-2 border-t border-purple-500/10">
                      <button 
                        onClick={() => {
                          playExternalBubble();
                          if (!userPassword) {
                            setIsRegistering(true);
                          } else {
                            navigateTo('create-activity');
                          }
                        }}
                        className={`w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed transition-all hover:border-purple-400 hover:bg-purple-400/10 ${
                          theme === 'black' ? 'border-white/10 text-white/60' : 'border-purple-200 text-purple-600'
                        }`}
                      >
                        <PlusCircle size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">Crear Actividad</span>
                      </button>
                    </div>
                  </div>
                </AeroCard>

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
                              ? `Estudiar ${nextUnit.unit.title} (${nextUnit.subject.name})` 
                              : "¡Todo completado! Repasa tus apuntes.";
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                </AeroCard>

                <AeroCard title={t('materias')} theme={theme}>
                  <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                    {SUBJECTS.map(s => (
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

          {/* Remove play-activity block here to consolidate into the main overlay */}
          {currentView === 'create-activity' && (
            <motion.div 
              key="create-activity"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="max-w-4xl mx-auto space-y-8"
            >
               <header className="flex items-center gap-4">
                  <button 
                    onClick={() => setCurrentView(lastView)}
                    className="p-2 rounded-xl bg-white/20 border border-white/40 shadow-lg"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <h1 className={`text-4xl font-black ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>Crear Actividad</h1>
                    <p className={`font-medium opacity-60 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>Wordwall Style - 3 Preguntas Gratis</p>
                  </div>
               </header>

               {newActivityCode ? (
                 <AeroCard title="¡Actividad Publicada!" theme={theme}>
                    <div className="flex flex-col items-center py-8 text-center space-y-6">
                       <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-white shadow-xl shadow-green-500/30 animate-bounce">
                         <CheckCircle2 size={42} />
                       </div>
                       <div className="space-y-2">
                         <h2 className={`text-2xl font-black ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>¡Listo para Compartir!</h2>
                         <p className={`text-sm font-medium ${theme === 'black' ? 'text-white/60' : 'text-sky-900/60'}`}>Comparte este código con tus amigos para que jueguen.</p>
                       </div>
                       
                       <div className="w-full p-6 rounded-3xl bg-white/20 border border-white/40 flex flex-col items-center gap-4">
                          <p className={`text-xs font-black uppercase tracking-widest opacity-40 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>Código de Actividad</p>
                          <div className="text-4xl font-black tracking-widest text-blue-500 font-mono select-all">
                             {newActivityCode}
                          </div>
                          <GlossyButton 
                            onClick={() => {
                              navigator.clipboard.writeText(newActivityCode);
                              playExternalBubble();
                            }}
                            className="text-xs px-6 py-2 flex items-center gap-2"
                          >
                            <Copy size={14} /> Copiar Código
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
                         className="w-full py-4 text-white bg-sky-500 border-2 border-white/20 shadow-xl"
                       >
                         Volver al Inicio
                       </GlossyButton>
                    </div>
                 </AeroCard>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <AeroCard title="General" theme={theme}>
                        <div className="space-y-4">
                           <div className="space-y-1">
                             <label className={`text-[10px] font-black uppercase tracking-widest opacity-60 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>Nombre de la Actividad</label>
                             <input 
                               type="text" 
                               value={activityName}
                               onChange={(e) => setActivityName(e.target.value)}
                               className={`w-full px-4 py-3 rounded-2xl border text-sm font-bold transition-all focus:ring-2 focus:ring-blue-400 outline-none ${
                                 theme === 'black' ? 'bg-white/5 border-white/10 text-white' : 'bg-white/60 border-white/40 text-sky-950'
                               }`}
                               placeholder="Ej: Quiz de Historia Argentina"
                             />
                           </div>
                        </div>
                      </AeroCard>

                      <AeroCard title="Atención" theme={theme} className="bg-amber-400/10 border-amber-400/20">
                         <div className="flex gap-4 p-2 text-xs font-medium leading-relaxed opacity-80">
                            <Lightbulb className="text-amber-500 flex-shrink-0" size={24} />
                            <p>Las actividades compartidas son públicas. Cualquier persona con el código podrá jugar tu actividad. Sé creativo y diviértete.</p>
                         </div>
                      </AeroCard>

                      {creationError && (
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold text-center animate-shake">
                          {creationError}
                        </div>
                      )}

                      <GlossyButton 
                        onClick={handleCreateActivity}
                        loading={isCreatingActivity}
                        className={`w-full py-6 text-xl tracking-widest gap-2 shadow-[0_10px_20px_-10px_rgba(59,130,246,0.5)] ${isCreatingActivity ? 'opacity-80 pointer-events-none' : ''}`}
                      >
                         {isCreatingActivity ? (
                           <div className="flex items-center gap-4">
                              <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>PUBLICANDO...</span>
                           </div>
                         ) : (
                           <>
                             PUBLICAR <Share2 size={24} />
                           </>
                         )}
                      </GlossyButton>
                   </div>

                   <div className="space-y-6">
                     {activityQuestions.map((q, qIdx) => (
                        <AeroCard 
                          key={qIdx} 
                          title={`Pregunta ${qIdx + 1}`} 
                          theme={theme}
                          extra={
                            activityQuestions.length > 1 && (
                              <button 
                                onClick={() => {
                                  removeQuestion(qIdx);
                                  playErrorSound();
                                }}
                                className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90 group flex items-center gap-1.5"
                                title="Eliminar pregunta"
                              >
                                <Trash2 size={14} className="group-hover:animate-bounce" />
                                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Eliminar</span>
                              </button>
                            )
                          }
                        >
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2 mb-2">
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
                                     className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                        q.type === type 
                                        ? 'bg-blue-500 text-white border-blue-400 shadow-md scale-105' 
                                        : (theme === 'black' ? 'bg-white/5 border-white/10 text-white/40' : 'bg-white/60 border-white/40 text-sky-900/40')
                                     }`}
                                  >
                                     {type === 'multiple-choice' ? 'Quiz' : type === 'true-false' ? 'V/F' : 'Escribir'}
                                  </button>
                               ))}
                            </div>

                            <input 
                              type="text" 
                              value={q.question}
                              onChange={(e) => {
                                const newQs = [...activityQuestions];
                                newQs[qIdx].question = e.target.value;
                                setActivityQuestions(newQs);
                              }}
                              className={`w-full px-3 py-2 rounded-xl border text-sm font-bold focus:ring-2 focus:ring-blue-400 outline-none ${
                                theme === 'black' ? 'bg-white/10 border-white/5 text-white' : 'bg-white/40 border-white/20 text-sky-950'
                              }`}
                              placeholder={q.type === 'writing' ? "Instrucción (Ej: Pasa a negativo...)" : "Escribe la pregunta..."}
                            />
                            
                            {q.type === 'writing' ? (
                              <div className="space-y-2">
                                <label className={`text-[10px] font-black uppercase tracking-widest opacity-60 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>Respuesta Correcta</label>
                                <input 
                                  type="text" 
                                  value={q.correct}
                                  onChange={(e) => {
                                    const newQs = [...activityQuestions];
                                    newQs[qIdx].correct = e.target.value;
                                    setActivityQuestions(newQs);
                                  }}
                                  className={`w-full px-3 py-2 rounded-xl border text-sm font-bold focus:ring-2 focus:ring-green-400 outline-none ${
                                    theme === 'black' ? 'bg-white/5 border-white/10 text-white' : 'bg-white/60 border-white/40 text-sky-950'
                                  }`}
                                  placeholder="Ingresa la respuesta exacta..."
                                />
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 gap-2">
                                {q.options.map((opt, optIdx) => (
                                  <div key={optIdx} className="flex gap-2 items-center group/opt">
                                    <input 
                                      type="text" 
                                      value={opt}
                                      readOnly={q.type === 'true-false'}
                                      onChange={(e) => {
                                        const newQs = [...activityQuestions];
                                        newQs[qIdx].options[optIdx] = e.target.value;
                                        setActivityQuestions(newQs);
                                      }}
                                      className={`flex-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                        theme === 'black' ? 'bg-white/5 border-white/5' : 'bg-white/60 border-white/20'
                                      } ${q.correct === optIdx ? 'ring-2 ring-green-500 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : ''}`}
                                      placeholder={`Opción ${optIdx + 1}`}
                                    />
                                    
                                    {q.type === 'multiple-choice' && q.options.length > 2 && (
                                      <button 
                                        onClick={() => removeOption(qIdx, optIdx)}
                                        className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center opacity-0 group-hover/opt:opacity-100 focus:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                        title="Eliminar opción"
                                      >
                                        <X size={14} />
                                      </button>
                                    )}

                                    <button 
                                      onClick={() => {
                                        const newQs = [...activityQuestions];
                                        newQs[qIdx].correct = optIdx;
                                        setActivityQuestions(newQs);
                                        playExternalBubble();
                                      }}
                                      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                                        q.correct === optIdx 
                                          ? 'bg-green-500 text-white border-green-500 shadow-lg scale-110' 
                                          : theme === 'black' ? 'border-white/10 text-white/40' : 'border-white/40 text-sky-950/20'
                                      }`}
                                    >
                                      <CheckCircle2 size={16} />
                                    </button>
                                  </div>
                                ))}

                                {q.type === 'multiple-choice' && q.options.length < 6 && (
                                  <button 
                                    onClick={() => addOption(qIdx)}
                                    className={`mt-1 py-2 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 ${
                                      theme === 'black' ? 'bg-white/5 border-white/10 text-white/30 hover:border-white/20 hover:text-white/60' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-blue-200 hover:text-blue-500 hover:bg-blue-50'
                                    }`}
                                  >
                                    <Plus size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Añadir opción</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </AeroCard>
                      ))}

                      <button 
                        onClick={addQuestion}
                        className={`w-full py-6 rounded-[32px] border-4 border-dashed flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 group ${
                          theme === 'black' 
                            ? 'bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:bg-white/10' 
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-blue-300 hover:bg-blue-50 active:bg-blue-100 hover:text-blue-500'
                        }`}
                      >
                        <Plus className="group-hover:rotate-90 transition-transform duration-500" />
                        <span className="font-black uppercase tracking-widest text-sm">Añadir otra pregunta</span>
                      </button>
                   </div>
                 </div>
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
                    <div className="relative w-full sm:w-64">
                      <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 opacity-40 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`} />
                      <input 
                        type="text"
                        placeholder="Buscar por nombre, autor, código..."
                        value={gallerySearch}
                        onChange={(e) => setGallerySearch(e.target.value)}
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
                  {galleryActivities.filter(activity => {
                    const search = gallerySearch.toLowerCase();
                    const date = activity.createdAt?.toDate ? activity.createdAt.toDate().toLocaleDateString() : '';
                    return (
                      activity.name?.toLowerCase().includes(search) ||
                      activity.creatorName?.toLowerCase().includes(search) ||
                      activity.id?.toLowerCase().includes(search) ||
                      date.includes(search)
                    );
                  }).map((activity) => {
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
                          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-widest border border-blue-500/30">
                            {activity.id}
                          </span>
                          <div className="flex gap-1">
                            <button 
                              onClick={(e) => { e.stopPropagation(); reportAbuse('activity', activity.id, activity.name, activity.creatorName); }}
                              className="aero-icon-button text-amber-500 bg-amber-500/10"
                              title="Denunciar Abuso"
                            >
                              <Flag size={14} />
                            </button>
                            {(isModerator || activity.creatorName === userName) && (
                              <>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleEditActivity(activity, e); }}
                                  className="aero-icon-button text-blue-500 bg-blue-500/10"
                                  title="Editar Actividad"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteActivity(activity.id, e, activity.creatorName, activity.title); }}
                                  className="aero-icon-button text-red-500 bg-red-500/10"
                                  title="Eliminar Actividad"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <div onClick={() => setSelectedActivityDetail(activity)}>
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
                        <div className="flex gap-2">
                           <GlossyButton 
                             onClick={(e) => { e.stopPropagation(); setSelectedActivityDetail(activity); }}
                             variant="gray"
                             className="flex-1 py-2 rounded-xl text-[10px]"
                           >
                             Ver más
                           </GlossyButton>
                           <GlossyButton 
                             onClick={(e) => { e.stopPropagation(); handleLoadActivity(activity.id); }}
                             loading={isLoadingActivity && !currentSharedActivity}
                             className="flex-[1.5] py-2 rounded-xl text-[10px]"
                           >
                             Jugar <Play size={10} fill="currentColor" />
                           </GlossyButton>
                        </div>
                      </div>
                    </motion.div>
                    );
                  })}
                </div>
              )}
              
              {galleryActivities.length === 0 && !isGalleryLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                  <Globe size={48} className="opacity-10 animate-pulse" />
                  <p className="text-sm font-black uppercase tracking-widest opacity-40">No hay actividades todavía. ¡Sé el primero!</p>
                  <GlossyButton onClick={() => navigateTo('create-activity')}>
                    Crear Actividad
                  </GlossyButton>
                </div>
              )}

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
                               targetType === 'activity' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                             }`}>
                               {targetType === 'activity' ? <AlertTriangle size={24} /> : <MessageSquare size={24} />}
                             </div>
                             <div className="min-w-0 flex-1">
                               <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">
                                 {targetType === 'activity' ? 'Actividad' : 'Anuncio de Clase'} • Por {report.creatorName || report.authorName}
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
                              Borrar {targetType === 'activity' ? 'Actividad' : 'Anuncio'}
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
                      <div className="relative group">
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
                          className="absolute -bottom-1 -right-1 w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-blue-500 text-white border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform shadow-lg"
                        >
                          <Sparkles size={14} />
                        </label>
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
                          <input 
                            type="password" 
                            disabled={!isLoggedIn}
                            value={userPassword}
                            onChange={(e) => setUserPassword(e.target.value)}
                            className={`w-full px-4 py-3 sm:px-3 sm:py-2 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${
                              !isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''
                            } ${
                              theme === 'black' ? 'bg-white/5 border-white/10 text-white' : 'bg-white/60 border-white/40 text-sky-950'
                            }`}
                            placeholder="Contraseña"
                          />
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
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => { playExternalBubble(); setTheme('white'); }}
                          className={`p-4 rounded-3xl flex flex-col items-center gap-3 transition-all border-2 ${theme === 'white' ? 'bg-white border-blue-400 shadow-xl scale-105' : 'bg-white/40 border-white/60 hover:bg-white/60'}`}
                        >
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-100 to-white shadow-inner border border-sky-100" />
                          <span className="text-sm font-bold text-sky-950">{t('blanco')}</span>
                        </button>
                        <button 
                          onClick={() => { playExternalBubble(); setTheme('black'); }}
                          className={`p-4 rounded-3xl flex flex-col items-center gap-3 transition-all border-2 ${theme === 'black' ? 'bg-white border-blue-400 shadow-xl scale-105' : 'bg-white/40 border-white/60 hover:bg-white/60'}`}
                        >
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 to-black shadow-inner border border-slate-800" />
                          <span className="text-sm font-bold text-sky-950">{t('negro')}</span>
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
                      <p className={`text-sm font-bold transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>RELEASE 2 - Frutiger Edition</p>
                    </div>
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

          {currentView === 'subject' && selectedSubject && (
             <motion.div 
               key="subject"
               initial={disableAnimations ? { opacity: 1 } : { opacity: 0, scale: 0.8, y: 30 }}
               animate={disableAnimations ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
               exit={disableAnimations ? { opacity: 1 } : { opacity: 0, x: -100, scale: 0.95 }}
               transition={disableAnimations ? { duration: 0 } : { type: "spring", damping: 25, stiffness: 120 }}
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
                    <AeroCard title={t('unidadesYTemas')} theme={theme}>
                      <div className="flex flex-col gap-6">
                        {/* Unit Search Bar */}
                        <div className="relative group">
                          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${theme === 'black' ? 'text-white/30 group-focus-within:text-blue-400' : 'text-sky-900/40 group-focus-within:text-blue-500'}`} size={18} />
                          <input 
                            type="text"
                            value={unitSearch}
                            onChange={(e) => setUnitSearch(e.target.value)}
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
                             navigateTo('unit-study');
                          }}
                          theme={theme}
                        />
                      </div>
                    </AeroCard>
                  </div>

                  <div className="space-y-6">
                    <AeroCard title={t('informacion')} theme={theme}>
                      <p className={`font-medium leading-relaxed italic text-sm transition-colors duration-500 ${theme === 'black' ? 'text-white/70' : 'text-sky-900'}`}>
                        "{selectedSubject.description}"
                      </p>
                    </AeroCard>

                    {selectedSubject.id === 'geografia' && (
                       <GlossyButton 
                        onClick={() => setShowGeoGuide(true)}
                        className="w-full py-3 text-sm gap-2 border-2 border-white/40"
                       >
                         <div className="flex items-center gap-2">📖 {t('guiaVisual')} <span className="text-[9px] opacity-50 font-black">(.HTML)</span></div>
                       </GlossyButton>
                    )}

                    {selectedSubject.id === 'matematica' && (
                       <GlossyButton 
                        onClick={() => setShowMathGuide(true)}
                        className="w-full py-3 text-sm gap-2 border-2 border-white/40"
                       >
                         <div className="flex items-center gap-2">🔢 {t('guiaVisual')} <span className="text-[9px] opacity-50 font-black">(PDF)</span></div>
                        </GlossyButton>
                    )}
                    
                    <GlossyButton 
                      onClick={() => {
                        setSelectedProgramSubject(selectedSubject);
                        setShowProgramModal(true);
                      }}
                      className="w-full py-3 text-sm gap-2 border-2 border-white/40 active:scale-95 transition-all"
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

          {currentView === 'schedule' && (
            <motion.div 
               key="schedule"
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -30 }}
               className="space-y-8"
            >
               <div className="flex flex-col gap-1">
                 <h1 className={`text-4xl font-black transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{t('miHorario')}</h1>
                 <p className={`font-medium transition-colors duration-500 ${theme === 'black' ? 'text-white/60' : 'text-sky-800/60'}`}>Ciclo Lectivo 2026 - 1º 1ª</p>
               </div>

               <div className="space-y-4">
                 <p className={`md:hidden text-[10px] text-center animate-pulse font-black uppercase tracking-widest ${theme === 'black' ? 'text-white/40' : 'text-sky-800/40'}`}>↔ {t('deslizaTabla')}</p>
                 <AeroCard className="p-0 overflow-x-auto shadow-2xl border-white/40" theme={theme}>
                    <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className={`backdrop-blur-sm ${theme === 'black' ? 'bg-white/5' : 'bg-white/30'}`}>
                        <th className={`p-4 text-xs font-black border-b border-white/10 uppercase tracking-tighter w-24 ${theme === 'black' ? 'text-white/60' : 'text-sky-900'}`}>{t('hora')}</th>
                        <th className={`p-4 text-xs font-black border-b border-white/10 border-l border-white/5 uppercase tracking-widest text-center ${theme === 'black' ? 'text-white/60' : 'text-sky-900'}`}>{t('lunes')}</th>
                        <th className={`p-4 text-xs font-black border-b border-white/10 border-l border-white/5 uppercase tracking-widest text-center ${theme === 'black' ? 'text-white/60' : 'text-sky-900'}`}>{t('martes')}</th>
                        <th className={`p-4 text-xs font-black border-b border-white/10 border-l border-white/5 uppercase tracking-widest text-center ${theme === 'black' ? 'text-white/60' : 'text-sky-900'}`}>{t('miercoles')}</th>
                        <th className={`p-4 text-xs font-black border-b border-white/10 border-l border-white/5 uppercase tracking-widest text-center ${theme === 'black' ? 'text-white/60' : 'text-sky-900'}`}>{t('jueves')}</th>
                        <th className={`p-4 text-xs font-black border-b border-white/10 border-l border-white/5 uppercase tracking-widest text-center ${theme === 'black' ? 'text-white/60' : 'text-sky-900'}`}>{t('viernes')}</th>
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
               <AeroCard title={t('asistenteExamen')} className="border-4 border-blue-400/30" theme={theme}>
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
                            <span className="text-[10px] uppercase font-black text-blue-500 tracking-widest">{t('pregunta')} {examState.currentQuestion + 1} {t('de')} {questions.length}</span>
                            <h2 className={`text-2xl font-black transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{questions[examState.currentQuestion].q}</h2>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-4">
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
                                className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all text-left font-bold group flex items-center justify-between shadow-sm hover:shadow-xl ${selectedAnswer !== null ? feedbackClass : defaultClass}`}
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
                          <h2 className={`text-3xl font-black transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{t('examenFinalizado')}</h2>
                          <p className={`font-medium transition-colors duration-500 ${theme === 'black' ? 'text-white/60' : 'text-sky-800'}`}>
                            {t('resultadoExamen').replace('{score}', examState.score.toString()).replace('{total}', questions.length.toString())}
                          </p>
                        </div>
                        <div className="flex gap-4">
                           <GlossyButton onClick={resetExam}>{t('reintentar')}</GlossyButton>
                           <button 
                             onClick={() => {
                               playExternalBubble();
                               navigateTo('home');
                             }} 
                             className={`font-bold hover:underline transition-colors duration-500 ${theme === 'black' ? 'text-white/80' : 'text-sky-950'}`}
                           >
                             {t('volverAlInicio')}
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
                    <p className={`text-[10px] font-black uppercase opacity-40 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>{showReportModal.creatorName}</p>
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
              className={`max-w-4xl w-full max-h-[90vh] md:max-h-[85vh] rounded-[2rem] md:rounded-[3rem] border-2 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col ${
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
                                <h4 className="font-black uppercase tracking-tight text-[11px] md:text-sm mb-0.5 md:mb-1">{unit.title}</h4>
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
  const qType = currentQ?.type || 'multiple-choice';

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
                    String(writeInput).toLowerCase().trim() === String(currentQ.correct).toLowerCase().trim()
                      ? 'bg-gradient-to-b from-green-50 to-green-100 border-green-500 text-green-700'
                      : 'bg-gradient-to-b from-red-50 to-red-100 border-red-500 text-red-700'
                  }`}>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Respuesta Correcta:</p>
                    <p className="text-xl font-black">{currentQ.correct}</p>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-4">
                {currentQ.options.map((opt: string, i: number) => {
                  const isCorrect = i === currentQ.correct;
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

function MobileMenuButton({ id, active, icon, label, onClick, theme = 'white', badge }: { id?: string, active: boolean, icon: React.ReactNode, label: string, onClick: () => void, theme?: 'white' | 'black', badge?: string }) {
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
          ? (theme === 'black' ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600') 
          : (theme === 'black' ? 'bg-white/5 border-white/10 text-white/70' : 'bg-slate-50 border-transparent text-sky-950')
      }`}
    >
      {active && <div className="glossy-overlay opacity-30" />}
      <div className={`${active ? 'opacity-100 relative z-10' : 'opacity-60 relative z-10'}`}>
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

function NavButton({ id, active, icon, label, onClick, theme = 'white', badge }: { id?: string, active: boolean, icon: React.ReactNode, label: string, onClick: () => void, theme?: 'white' | 'black', badge?: string }) {
  const handleClick = () => {
    playExternalBubble();
    onClick();
  };

  const activeClasses = theme === 'black' 
    ? 'bg-blue-600/30 shadow-[0_0_20px_rgba(37,99,235,0.3)] text-blue-400 border-blue-500/50' 
    : 'bg-white/60 shadow-[0_5px_15px_rgba(59,130,246,0.2)] text-blue-600 border-white/80';

  const defaultClasses = theme === 'black' 
    ? 'text-white/60 border-transparent hover:bg-white/10 hover:text-white' 
    : 'text-sky-900/40 bg-slate-100/80 border-transparent hover:bg-slate-200/80 hover:text-sky-900 hover:shadow-md';

  return (
    <motion.button 
      id={id}
      onClick={handleClick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`flex-1 md:w-full flex md:flex-row flex-col items-center justify-center md:justify-start gap-1 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl transition-all relative group border-2 overflow-hidden ${active ? activeClasses : defaultClasses}`}
      style={{ willChange: 'transform' }}
    >
      {active && <div className="glossy-overlay opacity-30" />}
      <motion.div 
        animate={active ? { scale: 1.1, rotate: [0, -5, 5, 0] } : { scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`${active ? (theme === 'black' ? 'text-blue-400' : 'text-blue-600') : 'opacity-60 group-hover:opacity-100'}`}
      >
        {icon}
      </motion.div>
      <span className={`text-[10px] md:text-sm font-bold tracking-tight`}>{label}</span>
      
      {badge && (
        <span className="absolute top-1 right-1 md:top-2 md:right-2 bg-red-500 text-white text-[7px] md:text-[9px] font-black px-1.5 md:px-2 py-0.5 rounded-full shadow-lg animate-pulse border border-white/20 z-10">
          {badge}
        </span>
      )}

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
      case 'sky': return 'from-sky-400/80 to-sky-600/80 text-white';
      case 'amber': return 'from-amber-400/80 to-amber-600/80 text-white';
      case 'red': return 'from-red-400/80 to-red-600/80 text-white';
      case 'indigo': return 'from-indigo-400/80 to-indigo-600/80 text-white';
      case 'violet':
      case 'purple': return 'from-violet-400/80 to-violet-600/80 text-white';
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
            <div className={`p-2 rounded-xl bg-gradient-to-br ${getColorClasses(colors[i])} text-center shadow-lg border border-white/20 transform transition-transform md:hover:scale-105 cursor-default`} style={{ willChange: 'transform' }}>
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

function UnitButton({ number, title, color, onClick, theme = 'white', isCompleted = false, difficulty }: { number: number, title: string, color: string, onClick: () => void, theme?: 'white' | 'black', isCompleted?: boolean, difficulty?: string }) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green': return 'from-green-400 to-green-600 shadow-green-500/50';
      case 'blue': return 'from-blue-400 to-blue-600 shadow-blue-500/50';
      case 'sky': return 'from-sky-400 to-sky-600 shadow-sky-500/50';
      case 'amber': return 'from-amber-400 to-amber-600 shadow-amber-500/50';
      case 'indigo': return 'from-indigo-400 to-indigo-600 shadow-indigo-500/50';
      case 'red': return 'from-red-400 to-red-600 shadow-red-500/50';
      case 'violet':
      case 'purple': return 'from-violet-400 to-violet-600 shadow-violet-500/50';
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
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="flex flex-col items-center gap-4 group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        {/* Ring */}
        <div className={`absolute inset-0 rounded-full border-4 scale-125 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-150 blur-sm ${theme === 'black' ? 'border-white/10' : 'border-white/40'}`} />
        
        {/* Main Button */}
        <div className={`w-20 h-20 rounded-full bg-gradient-to-b ${isCompleted ? 'from-green-400 to-green-600 shadow-green-500/50' : getColorClasses(color)} flex items-center justify-center text-white text-3xl font-black shadow-[0_8px_0_rgb(0,0,0,0.1),0_15px_20px_-5px_rgba(0,0,0,0.3)] border-4 border-white/60 relative overflow-hidden active:translate-y-1 active:shadow-[0_4px_0_rgb(0,0,0,0.1)] transition-all`}>
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent opacity-50" />
           {isCompleted ? <CheckCircle2 size={40} className="relative z-10 drop-shadow-lg" /> : number}
        </div>

        {/* Floating Tooltip */}
        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl shadow-xl border opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-10 translate-y-2 group-hover:translate-y-0 ${theme === 'black' ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-white text-sky-950'}`}>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold uppercase tracking-tighter">{isCompleted ? '¡Completado!' : title}</span>
            {difficulty && <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${getDifficultyColor(difficulty)}`}>{difficulty}</span>}
          </div>
          <div className={`absolute bottom-[-6px] left-1/2 -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] ${theme === 'black' ? 'border-t-slate-900' : 'border-t-white'}`} />
        </div>
      </div>
    </motion.div>
  );
}

function DuolingoPath({ units, subjectColor, onUnitClick, theme = 'white', subjectId, completedUnits = [] }: { units: any[], subjectColor: string, onUnitClick: (index: number) => void, theme?: 'white' | 'black', subjectId: string, completedUnits?: string[] }) {
  if (units.length === 0) {
    return (
      <div className="py-12 text-center opacity-40 italic flex flex-col items-center gap-3">
        <Search size={32} strokeWidth={1} />
        <p>No se encontraron temas con esa búsqueda.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-6 md:py-12 gap-8 md:gap-16 relative w-full">
      {/* Curved Path Svg background could go here, but we'll use a staggered layout for simplicity & feel */}
      {units.map((unit, i) => {
        const displayIndex = unit.originalIndex !== undefined ? unit.originalIndex : i;
        // Calculate horizontal offset for a zigzag path - reduced for mobile
        const offsetMultiplier = typeof window !== 'undefined' && window.innerWidth < 768 ? 40 : 80;
        const offset = Math.sin(i * 1.2) * offsetMultiplier;
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

function UnitStudyView({ unit, color, onBack, onStartExercise, theme = 'white', hasNextUnit, onNextUnit, disableAnimations }: { unit: any, color: string, onBack: () => void, onStartExercise: () => void, theme?: 'white' | 'black', hasNextUnit: boolean, onNextUnit: () => void, disableAnimations?: boolean }) {
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
      initial={disableAnimations ? { opacity: 1 } : { opacity: 0, x: 100, scale: 0.95 }}
      animate={disableAnimations ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
      exit={disableAnimations ? { opacity: 1 } : { opacity: 0, x: -100, scale: 0.95 }}
      transition={disableAnimations ? { duration: 0 } : { type: "spring", damping: 22, stiffness: 100 }}
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
          <div className="flex items-center gap-3">
            <h2 className={`text-2xl md:text-4xl font-black tracking-tighter leading-tight transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{unit.title}</h2>
            {unit.difficulty && (
              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                unit.difficulty === 'Baja' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                unit.difficulty === 'Media' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                'bg-red-500/10 border-red-500/20 text-red-500'
              }`}>
                {unit.difficulty}
              </span>
            )}
          </div>
          <p className={`font-bold uppercase text-[10px] md:text-xs tracking-widest transition-colors duration-500 ${theme === 'black' ? 'text-white/40' : 'text-sky-800/60'}`}>{unit.description}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        <div className="md:col-span-2 space-y-4 md:space-y-8">
          <AeroCard title="Explicación" theme={theme}>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <div className="p-2 md:p-3 rounded-2xl bg-amber-100 text-amber-600 w-fit h-fit shrink-0">
                <Lightbulb size={24} />
              </div>
              <div className="space-y-3 md:space-y-4">
                <p className={`text-base md:text-lg font-medium leading-relaxed transition-colors duration-500 ${theme === 'black' ? 'text-white/80' : 'text-sky-900'}`}>
                  {unit.explanation}
                </p>
                <div className={`p-4 md:p-6 rounded-3xl border transition-colors duration-500 ${theme === 'black' ? 'bg-white/5 border-white/10' : 'bg-sky-50/50 border-sky-100'}`}>
                  <h4 className={`text-sm font-black mb-3 md:mb-4 flex items-center gap-2 transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>
                    <Book className="text-sky-500" size={16} /> Conceptos Clave
                  </h4>
                  <div className="grid grid-cols-1 gap-3 md:gap-4">
                    {unit.meanings.map((m: any, i: number) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-2 shrink-0" />
                        <div>
                          <strong className={`block text-sm md:text-base transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{m.term}</strong>
                          <span className={`text-[13px] md:text-sm transition-colors duration-500 ${theme === 'black' ? 'text-white/50' : 'text-sky-800/70'}`}>{m.definition}</span>
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
                  className="w-full py-4 font-black shadow-xl text-white"
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
                className={`w-full py-4 text-lg shadow-[0_10px_20px_rgba(0,0,0,0.1)] border-2 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all ${theme === 'black' ? 'bg-blue-600/20 border-blue-400/30 text-white' : 'bg-blue-600 border-blue-400 text-white'}`}
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

function Leaderboard({ theme, onViewProfile }: { theme: 'white' | 'black', onViewProfile: (id: string, name?: string) => void }) {
  const [filter, setFilter] = useState<'views' | 'likes' | 'correct'>('correct');
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

          return {
            ...u,
            computedStats: {
              views: totalViews,
              likes: totalLikes,
              correct: totalCorrect
            }
          };
        });

        const getScore = (u: any) => {
          if (filter === 'views') return u.computedStats.views;
          if (filter === 'likes') return u.computedStats.likes;
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
    return u.computedStats.correct;
  };

  const getMetricLabel = () => {
    if (filter === 'views') return 'Vistas';
    if (filter === 'likes') return 'Likes';
    return 'Correctos';
  };

  const getMetricIcon = (size = 14) => {
    if (filter === 'views') return <Globe size={size} />;
    if (filter === 'likes') return <Heart size={size} />;
    return <CheckCircle2 size={size} />;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {[
          { id: 'correct', label: 'Correctos', icon: <CheckCircle2 size={16} /> },
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
                  <p className={`text-[11px] font-black truncate group-hover:text-blue-500 transition-colors ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{top3[1].name || top3[1].id}</p>
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
                  <p className={`text-sm font-black truncate group-hover:text-amber-500 transition-colors ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{top3[0].name || top3[0].id}</p>
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
                  <p className={`text-[11px] font-black truncate group-hover:text-blue-500 transition-colors ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{top3[2].name || top3[2].id}</p>
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
                          <p className={`text-xs font-black group-hover:text-blue-500 transition-colors ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{user.name || user.id}</p>
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

