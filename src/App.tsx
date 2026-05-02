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
  RefreshCw,
  Edit3,
  Save,
  ChevronLeft,
  Heart,
  Trophy,
  Award,
  TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, getDoc, serverTimestamp, setDoc, getDocs, query, orderBy, limit, deleteDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
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

type View = 'home' | 'subject' | 'schedule' | 'exam' | 'unit-study' | 'settings' | 'materias' | 'create-activity' | 'play-activity' | 'gallery' | 'leaderboard';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

const MODERATORS = ['AraTester', 'NewAra'];

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>(() => {
    return (localStorage.getItem('newara_view') as View) || 'home';
  });
  const [lastView, setLastView] = useState<View>('home');
  const [showWelcome, setShowWelcome] = useState(false);
  const [userRole, setUserRole] = useState<'Estudiante' | 'Profesor'>(() => (localStorage.getItem('newara_user_role') as any) || 'Estudiante');

  useEffect(() => {
    const hasVisited = localStorage.getItem('newara_visited');
    if (!hasVisited) {
      setShowWelcome(true);
    }
  }, []);

  const navigateTo = (view: View) => {
    setLastView(currentView);
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

  // Profile State
  const [userName, setUserName] = useState(() => (localStorage.getItem('newara_user_name') || 'Estudiante'));
  const [moderatorPassword, setModeratorPassword] = useState('');
  const [isModAuthorized, setIsModAuthorized] = useState(() => localStorage.getItem('newara_mod_auth') === 'true');
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('newara_logged_in') === 'true');

  useEffect(() => {
    if (moderatorPassword === 'n3w3naraoz') {
      if (!isModAuthorized) {
        playSuccessSound();
        setIsModAuthorized(true);
        localStorage.setItem('newara_mod_auth', 'true');
      }
    }
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
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isCheckingAccount, setIsCheckingAccount] = useState(false);

  useEffect(() => {
    localStorage.setItem('newara_user_name', userName);
    localStorage.setItem('newara_user_role', userRole);
    localStorage.setItem('newara_user_password', userPassword);
    localStorage.setItem('newara_user_bio', userBio);
    localStorage.setItem('newara_user_avatar', userAvatar);
    localStorage.setItem('newara_disable_animations', disableAnimations.toString());
    localStorage.setItem('newara_logged_in', isLoggedIn.toString());
  }, [userName, userRole, userPassword, userBio, userAvatar, disableAnimations, isLoggedIn]);

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
            localStorage.setItem('newara_user_bio', data.bio || userBio);
            localStorage.setItem('newara_user_role', data.role || userRole);
            localStorage.setItem('newara_user_avatar', data.avatar || '');

            // Ensure stats structure exists for legacy users
            if (!data.stats) {
              await updateDoc(userRef, {
                stats: { totalViews: 0, totalLikes: 0, totalCorrect: 0 }
              });
            }
          } else {
            // Create profile for user if it doesn't exist but they are logged in
            await setDoc(userRef, {
              password: userPassword,
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
    if (!userName.trim() || !userPassword.trim()) {
      setAuthError("Completa todos los campos.");
      return;
    }
    if (MODERATORS.includes(userName.trim()) && !isModAuthorized) {
      setAuthError("Contraseña de moderador requerida.");
      return;
    }
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const userDoc = await getDoc(doc(db, 'users', userName.trim()));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.password === userPassword) {
          playSuccessSound();
          setIsLoggedIn(true);
          setIsRegistering(false);
          // Persist profile
          setUserBio(userData.bio || 'Explorador del conocimiento en NewAra.');
          setUserRole(userData.role || 'Estudiante');
          setUserAvatar(userData.avatar || '');
          localStorage.setItem('newara_user_name', userName.trim());
          localStorage.setItem('newara_user_password', userPassword);
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
    if (!userName.trim() || !userPassword.trim()) {
      setAuthError("Completa todos los campos.");
      return;
    }
    if (MODERATORS.includes(userName.trim()) && !isModAuthorized) {
      setAuthError("Contraseña de moderador requerida.");
      return;
    }
    if (userPassword.length < 4) {
      setAuthError("La contraseña debe tener al menos 4 caracteres.");
      return;
    }
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const userDoc = await getDoc(doc(db, 'users', userName.trim()));
      if (userDoc.exists()) {
        setAuthError("¡Esta cuenta ya existe!");
        playErrorSound();
      } else {
        const safeAvatar = userAvatar.length > 800000 ? '' : userAvatar;
        await setDoc(doc(db, 'users', userName.trim()), {
          name: userName.trim(),
          password: userPassword,
          bio: userBio.slice(0, 300),
          role: userRole,
          avatar: safeAvatar,
          createdAt: serverTimestamp()
        });
        playSuccessSound();
        setIsLoggedIn(true);
        setIsRegistering(false);
        localStorage.setItem('newara_user_name', userName.trim());
        localStorage.setItem('newara_user_password', userPassword);
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
    const path = `users/${userName.trim()}`;
    try {
      const userRef = doc(db, 'users', userName.trim());
      const safeAvatar = userAvatar && userAvatar.length > 800000 ? '' : userAvatar;
      
      // Use setDoc with merge to ensure it works even if the document was somehow missing
      await setDoc(userRef, {
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

  const logout = () => {
    setIsLoggedIn(false);
    setUserName('Estudiante');
    setUserPassword('');
    localStorage.removeItem('newara_user_name');
    localStorage.removeItem('newara_user_password');
    localStorage.removeItem('newara_logged_in');
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
  const [selectedActivityDetail, setSelectedActivityDetail] = useState<any>(null);
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);
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
  const isModerator = MODERATORS.includes(userName.trim()) && isModAuthorized;
  
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

  const handleDeleteActivity = async (id: string, e: React.MouseEvent, creatorName?: string) => {
    e.stopPropagation();
    const canDelete = isModerator || (creatorName === userName);
    if (!canDelete) return;
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta actividad?")) return;
    
    try {
      await deleteDoc(doc(db, 'activities', id));
      setGalleryActivities(prev => prev.filter(a => a.id !== id));
      playSuccessSound();
    } catch (error) {
       handleFirestoreError(error, OperationType.DELETE, `activities/${id}`);
    }
  };

  const handleEditActivity = async (activity: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const canEdit = isModerator || (activity.creatorName === userName);
    if (!canEdit) return;

    setEditingActivityId(activity.id);
    setActivityName(activity.name);
    
    // Map questions back to the creator format
    const mappedQuestions = activity.questions.map((q: any) => {
      let correctIdx = q.correctAnswer;
      if (q.type !== 'writing') {
        correctIdx = q.options.indexOf(q.correctAnswer);
        if (correctIdx === -1) correctIdx = 0;
      }
      return {
        question: q.question,
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
        creatorAvatar: userAvatar || '',
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
        
        // Incrementar vistas de la actividad y del creador
        updateDoc(docRef, { views: increment(1) });
        if (data.creatorName) {
          incrementUserStat(data.creatorName, 'totalViews', 1);
        }

        // Transform back to exercise format
        const unitExtras = {
          name: data.name,
          creator: data.creatorName,
          exercises: data.questions.map((q: any) => ({
            type: q.type || 'multiple-choice',
            question: q.question,
            options: q.options || [],
            correct: (q.type === 'writing') ? q.correctAnswer : q.options.indexOf(q.correctAnswer)
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
      {showWelcome && <WelcomeTutorial onComplete={() => {
        setShowWelcome(false);
        localStorage.setItem('newara_visited', 'true');
      }} />}
      <BubbleBackground theme={theme} />
      {/* Sidebar - Navigation Rail (Desktop) / Bottom Nav (Mobile) */}
      <nav className={`fixed bottom-0 left-0 right-0 h-20 md:relative md:h-auto md:w-64 aero-glass m-2 md:m-4 rounded-2xl md:rounded-3xl flex md:flex-col flex-row items-center justify-around md:justify-start py-2 md:py-8 gap-1 md:gap-6 border shadow-2xl z-40 transition-colors duration-500 ${theme === 'black' ? 'bg-black/40 border-white/10' : 'border-white/20'}`}>
        <div className="glossy-overlay opacity-20 pointer-events-none" />
        
        {/* LOGO NewAra - Replaced broken image with CSS component */}
        <div className="hidden md:flex flex-col items-center gap-2 mb-4 mt-2 px-4">
          <NewAraLogo size="lg" theme={theme} />
          
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
          
          <AnimatePresence>
            {isOffline && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full border border-red-500/30 mt-2"
              >
                <WifiOff size={12} className="text-red-500" />
                <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">Desconectado</span>
              </motion.div>
            )}
          </AnimatePresence>
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
              label="Inicio" 
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
              label="Leaderboard" 
              theme={theme}
              badge="TOP"
            />
            <NavButton 
              id="nav-schedule"
              active={currentView === 'schedule'} 
              onClick={() => {
                navigateTo('schedule');
                setShowMobileSubjects(false);
              }} 
              icon={<CalendarIcon size={22} />} 
              label="Horario" 
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
              label="Examen" 
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
              label="Ajustes" 
              theme={theme}
            />
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden justify-around items-center w-full px-4">
            <NavButton 
              id="nav-home"
              active={currentView === 'home'} 
              onClick={() => {
                navigateTo('home');
                setShowMoreMobileMenu(false);
              }} 
              icon={<Home size={24} />} 
              label="Inicio" 
              theme={theme}
            />
            <NavButton 
              active={showMoreMobileMenu} 
              onClick={() => {
                setShowMoreMobileMenu(!showMoreMobileMenu);
              }} 
              icon={<Menu size={24} />} 
              label="Más" 
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
                <div className="grid grid-cols-2 gap-3">
                  <MobileMenuButton 
                    id="nav-gallery"
                    active={currentView === 'gallery'} 
                    onClick={() => { navigateTo('gallery'); setShowMoreMobileMenu(false); }} 
                    icon={<Globe size={20} />} 
                    label="Galería" 
                    theme={theme}
                    badge="NUEVO"
                  />
                  <MobileMenuButton 
                    id="nav-leaderboard"
                    active={currentView === 'leaderboard'} 
                    onClick={() => { navigateTo('leaderboard'); setShowMoreMobileMenu(false); }} 
                    icon={<Trophy size={20} />} 
                    label="Leaderboard" 
                    theme={theme}
                    badge="TOP"
                  />
                  <MobileMenuButton 
                    id="nav-schedule"
                    active={currentView === 'schedule'} 
                    onClick={() => { navigateTo('schedule'); setShowMoreMobileMenu(false); }} 
                    icon={<CalendarIcon size={20} />} 
                    label="Horario" 
                    theme={theme}
                  />
                  <MobileMenuButton 
                    id="nav-exam"
                    active={currentView === 'exam'} 
                    onClick={() => { navigateTo('exam'); setShowMoreMobileMenu(false); }} 
                    icon={<ClipboardCheck size={20} />} 
                    label="Examen" 
                    theme={theme}
                  />
                  <MobileMenuButton 
                    id="nav-settings"
                    active={currentView === 'settings'} 
                    onClick={() => { navigateTo('settings'); setShowMoreMobileMenu(false); }} 
                    icon={<Settings size={20} />} 
                    label="Ajustes" 
                    theme={theme}
                  />
                  <MobileMenuButton 
                    active={showMobileSubjects} 
                    onClick={() => { setShowMobileSubjects(!showMobileSubjects); setShowMoreMobileMenu(false); }} 
                    icon={<Book size={20} />} 
                    label="Materias" 
                    theme={theme}
                  />
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
                    className={`fixed bottom-24 left-4 right-4 p-6 rounded-[32px] border-4 shadow-2xl backdrop-blur-3xl z-50 overflow-hidden ${
                      theme === 'black' 
                        ? 'bg-black/90 border-white/10' 
                        : 'bg-white/95 border-white/60'
                    }`}
                  >
                    <div className="glossy-overlay opacity-30 rounded-3xl" />
                    <div className="flex items-center justify-between mb-6">
                      <p className={`text-[11px] font-black uppercase tracking-widest ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
                        Explorar Materias
                      </p>
                      <button 
                        onClick={() => setShowMobileSubjects(false)}
                        className={`p-1.5 rounded-full ${theme === 'black' ? 'bg-white/10' : 'bg-slate-100'} hover:scale-110 active:scale-95 transition-transform`}
                      >
                        <ArrowLeft size={14} className="rotate-[-90deg]" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {SUBJECTS.map(s => (
                        <button 
                          key={s.id}
                          onClick={() => {
                            playExternalBubble();
                            setSelectedSubject(s);
                            navigateTo('subject');
                            setShowMobileSubjects(false);
                          }}
                          className={`flex flex-col items-start gap-3 p-4 rounded-3xl transition-all active:scale-95 border-2 ${
                            theme === 'black' 
                              ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                              : 'bg-slate-50 border-transparent hover:border-blue-200 shadow-[0_4px_10px_-4px_rgba(0,0,0,0.1)]'
                          }`}
                        >
                          <div className={`p-3 rounded-2xl text-white shadow-lg bg-gradient-to-b ${getColorClasses(s.color)}`}>
                            {getIcon(s.icon, 20)}
                          </div>
                          <span className={`text-xs font-black transition-colors duration-500 uppercase tracking-tighter text-left ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{s.name}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
          </AnimatePresence>

          <div className="hidden md:flex flex-col gap-2 w-full pb-8">
            <p className="hidden md:block text-[10px] uppercase font-bold text-sky-800/40 tracking-tighter mb-2 px-2">Materias</p>
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
      <div className={`md:hidden flex flex-col items-center justify-center pt-4 pb-1 z-30 sticky top-0 backdrop-blur-xl transition-all duration-500 ${theme === 'black' ? 'bg-black/10' : 'bg-white/5'}`}>
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
           <div 
             className="w-10 h-10 rounded-full p-0.5 bg-white/20 border border-white/40 shadow-lg overflow-hidden cursor-pointer active:scale-90 transition-transform"
             onClick={() => navigateTo('settings')}
           >
             {userAvatar ? (
               <img src={userAvatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
             ) : (
               <div className={`w-full h-full rounded-full flex items-center justify-center ${theme === 'black' ? 'bg-white/10' : 'bg-gradient-to-br from-blue-400 to-sky-600 text-white shadow-inner'}`}>
                 <User size={18} />
               </div>
             )}
           </div>
        </div>
        <NewAraLogo size="md" theme={theme} />

        
        <AnimatePresence>
          {isOffline && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-4 flex items-center gap-2 px-4 py-1.5 bg-red-500/90 backdrop-blur-md rounded-full border border-white/30 shadow-lg"
            >
              <WifiOff size={14} className="text-white" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">SISTEMA OFFLINE</span>
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
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-none">Modo Sin Conexión</p>
                <p className={`text-xs font-bold transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>OFFLINE</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait">
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
          Inicio
        </h1>
        <p className={`text-sm md:text-base font-medium transition-colors duration-500 ${theme === 'black' ? 'text-white/60' : 'text-sky-800/60'}`}>Gestiona tu aprendizaje en <span className={`font-logo font-bold transition-colors duration-500 ${theme === 'black' ? 'text-blue-400' : 'text-sky-900'}`}>NewAra</span>.</p>
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
                         className="w-full py-4 text-sky-500 bg-white/40"
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
                        disabled={isCreatingActivity}
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
              <Leaderboard theme={theme} />
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
                            {(isModerator || activity.creatorName === userName) && (
                              <>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleEditActivity(activity, e); }}
                                  className="p-2 rounded-full bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm active:scale-90"
                                  title="Editar Actividad"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteActivity(activity.id, e, activity.creatorName); }}
                                  className="p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
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
                          <p className={`text-[8px] md:text-[10px] font-bold mt-1 opacity-50 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>
                            Por {activity.creatorName || 'Anónimo'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 relative z-10 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20">
                               {activity.creatorAvatar ? (
                                 <img src={activity.creatorAvatar} alt="" className="w-full h-full object-cover" />
                               ) : (
                                 <div className="w-full h-full bg-blue-500 flex items-center justify-center text-[10px] text-white">
                                   {activity.creatorName?.[0]?.toUpperCase() || 'A'}
                                 </div>
                               )}
                             </div>
                             <div className="flex items-center gap-1.5 opacity-60 text-[9px] font-black">
                               <span className="flex items-center gap-0.5"><Play size={8} /> {activity.views || 0}</span>
                               <span className="flex items-center gap-0.5"><Heart size={8} /> {activity.likes?.length || 0}</span>
                             </div>
                           </div>
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleLikeActivity(activity.id, e); }}
                             className={`p-1.5 rounded-full transition-all active:scale-90 ${
                               activity.likes?.includes(userName) 
                                 ? 'bg-blue-500 text-white shadow-md' 
                                 : 'bg-white/10 text-blue-400 hover:bg-white/20'
                             }`}
                           >
                             <Heart size={12} fill={activity.likes?.includes(userName) ? 'currentColor' : 'none'} />
                           </button>
                        </div>

                        <div className="flex gap-2">
                           <button 
                             onClick={(e) => { e.stopPropagation(); setSelectedActivityDetail(activity); }}
                             className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 ${
                               theme === 'black' ? 'bg-white/5 border-white/10 hover:bg-white/20' : 'bg-white/60 border-blue-200 text-blue-600 hover:bg-blue-50'
                             }`}
                           >
                             Ver más
                           </button>
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleLoadActivity(activity.id); }}
                             className="flex-[1.5] py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                           >
                             Jugar <Play size={10} fill="currentColor" />
                           </button>
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

              {/* Activity Detail Modal */}
              <AnimatePresence>
                {selectedActivityDetail && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                          <button 
                            onClick={() => setSelectedActivityDetail(null)}
                            className={`p-2 rounded-full transition-all active:scale-90 ${theme === 'black' ? 'bg-white/10' : 'bg-slate-100'}`}
                          >
                            <X size={20} />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <h2 className="text-2xl md:text-3xl font-black leading-tight tracking-tight">
                            {selectedActivityDetail.name}
                          </h2>
                          
                          <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/10 border border-white/10">
                              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
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
                                <span className="text-sm font-bold truncate max-w-[120px]">{selectedActivityDetail.creatorName || 'Anónimo'}</span>
                              </div>
                            </div>

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
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
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
                <AeroCard title="Mi Perfil" theme={theme}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="relative group">
                        <div className="w-20 h-20 rounded-full p-1 bg-white/20 backdrop-blur-md border border-white/40 shadow-xl overflow-hidden">
                          {userAvatar ? (
                            <img 
                              src={userAvatar} 
                              alt="New Avatar" 
                              className="w-full h-full object-cover rounded-full"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className={`w-full h-full rounded-full flex items-center justify-center transition-colors duration-500 ${theme === 'black' ? 'bg-white/10 text-white' : 'bg-gradient-to-br from-blue-400 to-sky-600 text-white'}`}>
                              <User size={32} />
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
                          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-blue-500 text-white border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform shadow-lg"
                        >
                          <Sparkles size={14} />
                        </label>
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="space-y-1">
                          <label className={`text-[10px] font-black uppercase tracking-wider opacity-60 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>Nombre Visible</label>
                          <input 
                            type="text" 
                            disabled={true} 
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            onBlur={() => checkUsername(userName)}
                            className={`w-full px-3 py-2 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all opacity-50 cursor-not-allowed ${
                              theme === 'black' ? 'bg-white/5 border-white/10 text-white' : 'bg-white/60 border-white/40 text-sky-950'
                            }`}
                            placeholder="Tu nombre"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className={`text-[10px] font-black uppercase tracking-wider opacity-60 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>Tu Rol</label>
                          <div className={`flex p-1 rounded-2xl border transition-all ${theme === 'black' ? 'bg-white/5 border-white/10' : 'bg-white/40 border-white/20'}`}>
                            <button 
                              onClick={() => { 
                                setUserRole('Estudiante'); 
                                playExternalBubble(); 
                                if (isLoggedIn) {
                                  updateDoc(doc(db, 'users', userName.trim()), { role: 'Estudiante' });
                                }
                              }}
                              className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${userRole === 'Estudiante' ? (theme === 'black' ? 'bg-white/20 text-white shadow-lg' : 'bg-blue-500 text-white shadow-lg') : 'opacity-40 hover:opacity-100'}`}
                            >
                              Estudiante
                            </button>
                            <button 
                              onClick={() => { 
                                setUserRole('Profesor'); 
                                playExternalBubble(); 
                                if (isLoggedIn) {
                                  updateDoc(doc(db, 'users', userName.trim()), { role: 'Profesor' });
                                }
                              }}
                              className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${userRole === 'Profesor' ? (theme === 'black' ? 'bg-white/20 text-white shadow-lg' : 'bg-purple-500 text-white shadow-lg') : 'opacity-40 hover:opacity-100'}`}
                            >
                              Profesor
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
                                 <span className="text-white font-black text-sm md:text-base tracking-tight uppercase italic">
                                   ¡Ingresa a NewAra para hacer 20% más!
                                 </span>
                                 <div className="flex items-center gap-4 text-[10px] font-bold text-white/60 group-hover:text-white/90">
                                   <span className="flex items-center gap-1"><Heart size={10} /> Likes</span>
                                   <span className="flex items-center gap-1"><Play size={10} /> Visitas</span>
                                   <span className="flex items-center gap-1"><Plus size={10} /> Crear</span>
                                 </div>
                               </div>
                             </button>
                          </div>
                        )}

                        {isLoggedIn && (
                          <button 
                            onClick={logout}
                            className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                          >
                            Cerrar Sesión / Cambiar Usuario
                          </button>
                        )}

                        {MODERATORS.includes(userName.trim()) && !isModAuthorized && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-1"
                          >
                            <label className="text-[10px] font-black uppercase tracking-wider text-red-500">Contraseña de Moderador</label>
                            <input 
                              type="password" 
                              value={moderatorPassword}
                              onChange={(e) => setModeratorPassword(e.target.value)}
                              className={`w-full px-3 py-2 rounded-xl border text-sm font-bold border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all ${
                                theme === 'black' ? 'bg-red-500/5 text-white' : 'bg-red-50/50 text-sky-950'
                              }`}
                              placeholder="Introducir contraseña..."
                            />
                          </motion.div>
                        )}
                        <div className="space-y-1">
                          <label className={`text-[10px] font-black uppercase tracking-wider opacity-60 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>Tu Contraseña</label>
                          <input 
                            type="password" 
                            disabled={!isLoggedIn}
                            value={userPassword}
                            onChange={(e) => setUserPassword(e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${
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
                      <label className={`text-[10px] font-black uppercase tracking-wider opacity-60 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>Sobre ti (Bio)</label>
                      <textarea 
                        value={userBio}
                        onChange={(e) => setUserBio(e.target.value.slice(0, 300))}
                        maxLength={300}
                        className={`w-full px-3 py-2 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all resize-none h-20 ${
                          theme === 'black' ? 'bg-white/5 border-white/10 text-white' : 'bg-white/60 border-white/40 text-sky-950'
                        }`}
                        placeholder="Contanos algo de vos..."
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
                          {isUpdatingProfile ? 'Guardando...' : 'Guardar Cambios de Perfil'}
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
                        Eliminar Foto de Perfil
                      </button>
                    )}
                  </div>
                </AeroCard>

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

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/20 border border-white/30">
                      <div>
                        <p className={`font-black uppercase tracking-widest text-[11px] ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>Desactivar Animaciones</p>
                        <p className={`text-[10px] font-bold opacity-60 ${theme === 'black' ? 'text-white' : 'text-sky-800'}`}>Mejora el rendimiento en celulares viejos</p>
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

                <AeroCard title="Acerca de" theme={theme}>
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white/20 border border-white/30">
                      <p className={`text-xs font-black uppercase transition-colors duration-500 ${theme === 'black' ? 'text-white/40' : 'text-sky-900/40'} mb-2`}>Desarrollador</p>
                      <p className={`text-sm font-bold transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>NewAra Team</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/20 border border-white/30">
                      <p className={`text-xs font-black uppercase transition-colors duration-500 ${theme === 'black' ? 'text-white/40' : 'text-sky-900/40'} mb-2`}>Version</p>
                      <p className={`text-sm font-bold transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>RELEASE 2 - Frutiger Edition</p>
                    </div>
                  </div>
                </AeroCard>

                <AeroCard title="Términos de Servicio v2.2" theme={theme} className="md:col-span-2">
                  <div className="space-y-4">
                    <div className={`p-4 rounded-2xl border ${theme === 'black' ? 'bg-white/5 border-white/10' : 'bg-white/40 border-white/60 shadow-inner'}`}>
                      <p className={`text-sm font-bold mb-4 flex items-center gap-2 transition-colors duration-500 ${theme === 'black' ? 'text-white/90' : 'text-sky-950'}`}>
                        Información Legal e Importante (Servidor NewAra Pro)
                      </p>
                      <ul className={`space-y-3 text-xs md:text-sm transition-colors duration-500 ${theme === 'black' ? 'text-white/70' : 'text-sky-900'}`}>
                        <li className="flex gap-3">
                          <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                          <span><b>Uso Académico:</b> NewAra es una herramienta complementaria de estudio. Los resultados en los simulacros no garantizan notas en exámenes reales.</span>
                        </li>
                        <li className="flex gap-3">
                          <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                          <span><b>Privacidad:</b> Tus preferencias (como el tema y la vista actual) se guardan únicamente en el almacenamiento local de tu navegador.</span>
                        </li>
                        <li className="flex gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                          <User size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                          <span>
                            <b>Cuentas de Usuario:</b> En RELEASE 2.1, el registro es obligatorio para publicar. Tu contraseña se cifra localmente. No compartas tus credenciales.
                          </span>
                        </li>
                        <li className="flex gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                          <ShieldCheck size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                          <span>
                            <b className="text-red-500">Integridad Académica:</b> <span className="italic font-bold text-red-600/80 underline decoration-red-300">NewAra no es responsable por haciendo trampa en los examenes.</span>
                          </span>
                        </li>
                      </ul>
                    </div>
                    <p className={`text-[10px] font-black uppercase tracking-widest text-center opacity-30 ${theme === 'black' ? 'text-white' : 'text-sky-900'}`}>
                      Última actualización: 29 de abril de 2026
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
                    <AeroCard title="Ruta de Aprendizaje" theme={theme}>
                      <DuolingoPath 
                        units={selectedSubject.units} 
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
                          <h2 className={`text-3xl font-black transition-colors duration-500 ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>¡Examen Finalizado!</h2>
                          <p className={`font-medium transition-colors duration-500 ${theme === 'black' ? 'text-white/60' : 'text-sky-800'}`}>Has respondido correctamente {examState.score} de {questions.length} preguntas.</p>
                        </div>
                        <div className="flex gap-4">
                           <GlossyButton onClick={resetExam}>Reintentar</GlossyButton>
                           <button 
                             onClick={() => {
                               playExternalBubble();
                               navigateTo('home');
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
                  />
                </div>
              </AeroCard>
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
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
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value);
                        setAuthError(null);
                      }}
                      onBlur={() => checkUsername(userName)}
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

                {MODERATORS.includes(userName.trim()) && !isModAuthorized && (
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
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
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
                    disabled={isAuthLoading}
                    className="w-full py-5 text-sm tracking-widest uppercase font-black"
                  >
                    {isAuthLoading ? 'Cargando...' : (authMode === 'login' ? 'Entrar Ahora' : 'Confirmar Registro')}
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
      case 'amber': return 'from-amber-400 to-amber-600';
      case 'indigo': return 'from-indigo-400 to-indigo-600';
      case 'red': return 'from-red-400 to-red-600';
      case 'purple': return 'from-purple-400 to-purple-600';
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
                    className="w-full py-5 text-sky-500 shadow-xl"
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

            <GlossyButton onClick={onFinish} className="w-full py-4 bg-blue-500 text-white border-2 border-white/20 shadow-xl">
               Finalizar
            </GlossyButton>
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
      className={`flex items-center gap-3 p-4 rounded-2xl transition-all border relative ${
        active 
          ? (theme === 'black' ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600') 
          : (theme === 'black' ? 'bg-white/5 border-white/10 text-white/70' : 'bg-slate-50 border-transparent text-sky-950')
      }`}
    >
      <div className={`${active ? 'opacity-100' : 'opacity-60'}`}>
        {icon}
      </div>
      <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
      {badge && (
        <span className="absolute -top-2 -right-1 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg animate-pulse border border-white/20 z-10">
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
    : 'text-sky-900 border-transparent hover:bg-white/40 hover:border-white/50 hover:shadow-md';

  return (
    <motion.button 
      id={id}
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
      
      {badge && (
        <span className="absolute -top-1 -right-1 md:top-2 md:right-2 bg-red-500 text-white text-[7px] md:text-[9px] font-black px-1.5 md:px-2 py-0.5 rounded-full shadow-lg animate-pulse border border-white/20 z-10">
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

function UnitButton({ number, title, color, onClick, theme = 'white', isCompleted = false }: { number: number, title: string, color: string, onClick: () => void, theme?: 'white' | 'black', isCompleted?: boolean }) {
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
        <div className={`w-20 h-20 rounded-full bg-gradient-to-b ${isCompleted ? 'from-green-400 to-green-600 shadow-green-500/50' : getColorClasses(color)} flex items-center justify-center text-white text-3xl font-black shadow-[0_8px_0_rgb(0,0,0,0.1),0_15px_20px_-5px_rgba(0,0,0,0.3)] border-4 border-white/60 relative overflow-hidden active:translate-y-1 active:shadow-[0_4px_0_rgb(0,0,0,0.1)] transition-all`}>
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent opacity-50" />
           {isCompleted ? <CheckCircle2 size={40} className="relative z-10 drop-shadow-lg" /> : number}
        </div>

        {/* Floating Tooltip */}
        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl shadow-xl border opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-10 translate-y-2 group-hover:translate-y-0 ${theme === 'black' ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-white text-sky-950'}`}>
          <span className="text-xs font-bold uppercase tracking-tighter">{isCompleted ? '¡Completado!' : title}</span>
          <div className={`absolute bottom-[-6px] left-1/2 -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] ${theme === 'black' ? 'border-t-slate-900' : 'border-t-white'}`} />
        </div>
      </div>
    </motion.div>
  );
}

function DuolingoPath({ units, subjectColor, onUnitClick, theme = 'white', subjectId, completedUnits = [] }: { units: any[], subjectColor: string, onUnitClick: (index: number) => void, theme?: 'white' | 'black', subjectId: string, completedUnits?: string[] }) {
  return (
    <div className="flex flex-col items-center py-6 md:py-12 gap-8 md:gap-16 relative">
      {/* Curved Path Svg background could go here, but we'll use a staggered layout for simplicity & feel */}
      {units.map((unit, i) => {
        // Calculate horizontal offset for a zigzag path - reduced for mobile
        const offsetMultiplier = typeof window !== 'undefined' && window.innerWidth < 768 ? 40 : 80;
        const offset = Math.sin(i * 1.2) * offsetMultiplier;
        const isCompleted = completedUnits.includes(`${subjectId}-${i}`);
        
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
              isCompleted={isCompleted}
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

function Leaderboard({ theme }: { theme: 'white' | 'black' }) {
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
                className="flex flex-col items-center gap-4 order-2 md:order-1 scale-90 mb-2"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-slate-400 to-slate-200 shadow-xl overflow-hidden ring-4 ring-slate-400/20">
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
                  <p className={`text-[11px] font-black truncate ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{top3[1].id}</p>
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
                className="flex flex-col items-center gap-6 order-1 md:order-2 scale-110 mb-8"
              >
                <div className="relative">
                  <Trophy className="absolute -top-14 left-1/2 -translate-x-1/2 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,1)]" size={48} />
                  <div className="w-24 h-24 rounded-full p-1.5 bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-200 shadow-[0_20px_50px_-10px_rgba(234,179,8,0.5)] overflow-hidden ring-4 ring-yellow-400/30">
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
                  <p className={`text-sm font-black truncate ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{top3[0].id}</p>
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
                className="flex flex-col items-center gap-4 order-3 scale-[0.85] mb-2"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-orange-400 to-orange-200 shadow-xl overflow-hidden ring-4 ring-orange-400/20">
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
                  <p className={`text-[11px] font-black truncate ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{top3[2].id}</p>
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
                      className="flex items-center justify-between py-4 group hover:bg-sky-500/5 transition-colors px-2 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-6 text-[10px] font-black text-slate-300 group-hover:text-blue-500 transition-colors uppercase tracking-widest leading-none">{i + 4}</span>
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 bg-slate-50 group-hover:border-blue-200 transition-all">
                          {user.avatar ? (
                            <img src={user.avatar} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                               <User size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className={`text-xs font-black ${theme === 'black' ? 'text-white' : 'text-sky-950'}`}>{user.id}</p>
                          <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">{user.role || 'Explorador'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/50 text-[10px] font-black text-blue-600 shadow-sm border border-white/40">
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

