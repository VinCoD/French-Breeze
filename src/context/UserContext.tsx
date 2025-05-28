
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  Auth, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider, 
  signInWithPopup,
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
  
  const clearLocalUserData = useCallback(() => {
    setLevelState(null);
    setUserNameState(null);
    setProgressState({});
    setDailyStreakState(0);
    if (firebaseUser?.uid) { 
        localStorage.removeItem(`frenchBreezeLevel_${firebaseUser.uid}`);
        localStorage.removeItem(`frenchBreezeUserName_${firebaseUser.uid}`);
        localStorage.removeItem(`frenchBreezeProgress_${firebaseUser.uid}`);
        localStorage.removeItem(`frenchBreezeStreak_${firebaseUser.uid}`);
        localStorage.removeItem(`frenchBreezeLastVisit_${firebaseUser.uid}`);
    } else { 
        localStorage.removeItem('frenchBreezeLevel');
        localStorage.removeItem('frenchBreezeUserName');
        localStorage.removeItem('frenchBreezeProgress');
        localStorage.removeItem('frenchBreezeStreak');
        localStorage.removeItem('frenchBreezeLastVisit');
    }
  }, [firebaseUser?.uid]);


  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      
      if (user) {
        const storedName = localStorage.getItem(`frenchBreezeUserName_${user.uid}`);
        const storedLevel = localStorage.getItem(`frenchBreezeLevel_${user.uid}`) as FrenchLevel;
        const storedProgress = JSON.parse(localStorage.getItem(`frenchBreezeProgress_${user.uid}`) || '{}');
        const storedStreak = parseInt(localStorage.getItem(`frenchBreezeStreak_${user.uid}`) || '0', 10);
        const storedLastVisit = localStorage.getItem(`frenchBreezeLastVisit_${user.uid}`);

        setUserNameState(storedName || user.displayName || null);
        setLevelState(storedLevel || null);
        setProgressState(storedProgress);
        
        const today = new Date().toDateString();
        if (storedLastVisit) {
            if (storedLastVisit !== today) {
                const yesterday = new Date(Date.now() - 86400000).toDateString();
                if (storedLastVisit === yesterday) {
                    setDailyStreakState(storedStreak); 
                } else {
                    setDailyStreakState(0);
                    localStorage.setItem(`frenchBreezeStreak_${user.uid}`, '0');
                }
            } else {
                 setDailyStreakState(storedStreak); 
            }
        } else {
            setDailyStreakState(0);
            localStorage.setItem(`frenchBreezeStreak_${user.uid}`, '0');
        }

      } else { 
        clearLocalUserData();
      }
      setLoadingAuth(false);
    });

    return () => {
      unsubscribeAuth();
    };
  }, [clearLocalUserData]); 

  const setLevel = (newLevel: FrenchLevel) => { 
    setLevelState(newLevel);
    if (firebaseUser) {
      if (newLevel) localStorage.setItem(`frenchBreezeLevel_${firebaseUser.uid}`, newLevel);
      else localStorage.removeItem(`frenchBreezeLevel_${firebaseUser.uid}`);
    }
  };

  const setUserName = async (newName: string | null, updateUserProfileFlag: boolean = true) => {
    setUserNameState(newName);
    if (firebaseUser) {
      if (newName) localStorage.setItem(`frenchBreezeUserName_${firebaseUser.uid}`, newName);
      else localStorage.removeItem(`frenchBreezeUserName_${firebaseUser.uid}`);
      
      if (updateUserProfileFlag && auth.currentUser && auth.currentUser.displayName !== newName) {
        try {
          await updateProfile(auth.currentUser, { displayName: newName });
          const refreshedUser = {...auth.currentUser}; 
          setFirebaseUser(refreshedUser);
        } catch (error) {
          console.error("Error updating Firebase profile name:", error);
          throw error;
        }
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
    const todayString = new Date().toDateString();
    const lastVisit = localStorage.getItem(`frenchBreezeLastVisit_${firebaseUser.uid}`);

    if (lastVisit !== todayString) {
        const newStreak = dailyStreak + 1;
        setDailyStreakState(newStreak);
        localStorage.setItem(`frenchBreezeStreak_${firebaseUser.uid}`, newStreak.toString());
        localStorage.setItem(`frenchBreezeLastVisit_${firebaseUser.uid}`, todayString);
    }
  };
  
  const resetStreak = () => { 
    if (!firebaseUser) return;
    setDailyStreakState(0);
    localStorage.setItem(`frenchBreezeStreak_${firebaseUser.uid}`, "0");
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

    