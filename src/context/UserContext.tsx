
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Auth, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { auth } from '@/lib/firebase'; 

export type FrenchLevel = "Beginner" | "Intermediate" | "Advanced" | null;

interface UserContextType {
  firebaseUser: User | null;
  loadingAuth: boolean;
  level: FrenchLevel;
  setLevel: (level: FrenchLevel) => void;
  userName: string | null;
  setUserName: (name: string | null, updateUserProfile?: boolean) => Promise<void>;
  progress: { [lessonId: string]: boolean };
  updateProgress: (lessonId: string, completed: boolean) => void;
  dailyStreak: number;
  incrementStreak: () => void;
  resetStreak: () => void;
  signUpWithEmail: (email: string, password: string) => Promise<User | null>;
  signInWithEmail: (email: string, password: string) => Promise<User | null>;
  signInWithGoogle: () => Promise<User | null>; 
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const [level, setLevelState] = useState<FrenchLevel>(null);
  const [userName, setUserNameState] = useState<string | null>(null);
  const [progress, setProgressState] = useState<{ [lessonId: string]: boolean }>({});
  const [dailyStreak, setDailyStreakState] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setLoadingAuth(false);
      if (user) {
        const storedLevel = localStorage.getItem(`frenchBreezeLevel_${user.uid}`) as FrenchLevel;
        if (storedLevel) setLevelState(storedLevel); else setLevelState(null);
        
        let currentName = user.displayName; 
        if (!currentName) { 
            currentName = localStorage.getItem(`frenchBreezeUserName_${user.uid}`);
        }
        if (currentName) {
            setUserNameState(currentName);
            if (user.displayName && localStorage.getItem(`frenchBreezeUserName_${user.uid}`) !== user.displayName) {
                 localStorage.setItem(`frenchBreezeUserName_${user.uid}`, user.displayName);
            }
        } else {
            setUserNameState(null);
        }


        const storedProgress = localStorage.getItem(`frenchBreezeProgress_${user.uid}`);
        if (storedProgress) setProgressState(JSON.parse(storedProgress)); else setProgressState({});

        const storedStreak = localStorage.getItem(`frenchBreezeStreak_${user.uid}`);
        if (storedStreak) setDailyStreakState(parseInt(storedStreak, 10)); else setDailyStreakState(0);
        
        const lastVisit = localStorage.getItem(`frenchBreezeLastVisit_${user.uid}`);
        const today = new Date().toDateString();
        if (lastVisit) {
          const lastVisitDate = new Date(lastVisit).toDateString();
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          if (lastVisitDate !== today && lastVisitDate !== yesterday) {
            resetStreakInternal(user.uid); 
          }
        } else {
          localStorage.setItem(`frenchBreezeLastVisit_${user.uid}`, today);
        }
      } else {
        setLevelState(null);
        setUserNameState(null);
        setProgressState({});
        setDailyStreakState(0);
      }
    });
    return () => unsubscribe();
  }, []);

  const setLevel = (newLevel: FrenchLevel) => {
    setLevelState(newLevel);
    if (firebaseUser && newLevel) {
      localStorage.setItem(`frenchBreezeLevel_${firebaseUser.uid}`, newLevel);
    } else if (firebaseUser) {
      localStorage.removeItem(`frenchBreezeLevel_${firebaseUser.uid}`);
    }
  };

  const setUserName = async (newName: string | null, updateUserProfileFlag: boolean = true) => {
    setUserNameState(newName);
    if (firebaseUser) {
      if (newName) {
        localStorage.setItem(`frenchBreezeUserName_${firebaseUser.uid}`, newName);
        if (updateUserProfileFlag && auth.currentUser && auth.currentUser.displayName !== newName) {
          try {
            await updateProfile(auth.currentUser, { displayName: newName });
            setFirebaseUser(auth.currentUser); 
          } catch (error) {
            console.error("Error updating Firebase profile name:", error);
          }
        }
      } else {
        localStorage.removeItem(`frenchBreezeUserName_${firebaseUser.uid}`);
      }
    }
  };

  const updateProgress = (lessonId: string, completed: boolean) => {
    if (!firebaseUser) return;
    const newProgress = { ...progress, [lessonId]: completed };
    setProgressState(newProgress);
    localStorage.setItem(`frenchBreezeProgress_${firebaseUser.uid}`, JSON.stringify(newProgress));
  };

  const incrementStreak = () => {
    if (!firebaseUser) return;
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem(`frenchBreezeLastVisit_${firebaseUser.uid}`);
    
    if (lastVisit !== today) {
      setDailyStreakState(prevStreak => {
        const newStreak = prevStreak + 1;
        localStorage.setItem(`frenchBreezeStreak_${firebaseUser.uid}`, newStreak.toString());
        localStorage.setItem(`frenchBreezeLastVisit_${firebaseUser.uid}`, today);
        return newStreak;
      });
    } else if (!lastVisit) {
      setDailyStreakState(1);
      localStorage.setItem(`frenchBreezeStreak_${firebaseUser.uid}`, "1");
      localStorage.setItem(`frenchBreezeLastVisit_${firebaseUser.uid}`, today);
    }
  };
  
  const resetStreakInternal = (uid: string) => {
    setDailyStreakState(0);
    localStorage.setItem(`frenchBreezeStreak_${uid}`, "0");
  };

  const resetStreak = () => {
    if (!firebaseUser) return;
    resetStreakInternal(firebaseUser.uid);
  };

  const signUpWithEmail = async (email: string, password: string): Promise<User | null> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error; 
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error; 
    }
  };

  const signInWithGoogle = async (): Promise<User | null> => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error; 
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <UserContext.Provider value={{ 
      firebaseUser, loadingAuth, 
      level, setLevel, 
      userName, setUserName, 
      progress, updateProgress, 
      dailyStreak, incrementStreak, resetStreak,
      signUpWithEmail, signInWithEmail, 
      signInWithGoogle, 
      signOut
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

