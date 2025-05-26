
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Auth, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Assuming firebase.ts is in src/lib

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
        // User is signed in, load their specific data from localStorage
        // (Later, this will be from Firestore)
        const storedLevel = localStorage.getItem(`frenchBreezeLevel_${user.uid}`) as FrenchLevel;
        if (storedLevel) setLevelState(storedLevel); else setLevelState(null);
        
        const storedName = user.displayName || localStorage.getItem(`frenchBreezeUserName_${user.uid}`);
        if (storedName) setUserNameState(storedName); else setUserNameState(null);

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
            resetStreakInternal(user.uid); // Reset if missed more than a day
          }
        } else {
          localStorage.setItem(`frenchBreezeLastVisit_${user.uid}`, today);
        }
      } else {
        // User is signed out, clear local user-specific data
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

  const setUserName = async (newName: string | null, updateUserProfile: boolean = true) => {
    setUserNameState(newName);
    if (firebaseUser) {
      if (newName) {
        localStorage.setItem(`frenchBreezeUserName_${firebaseUser.uid}`, newName);
        if (updateUserProfile && auth.currentUser && auth.currentUser.displayName !== newName) {
          try {
            await updateProfile(auth.currentUser, { displayName: newName });
            // Refresh firebaseUser state if needed, or rely on onAuthStateChanged
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
      // setFirebaseUser(userCredential.user) // Handled by onAuthStateChanged
      return userCredential.user;
    } catch (error) {
      console.error("Error signing up:", error);
      // Handle specific error codes (e.g., email-already-in-use) here if needed
      throw error; // Re-throw to be caught by the caller
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // setFirebaseUser(userCredential.user) // Handled by onAuthStateChanged
      return userCredential.user;
    } catch (error) {
      console.error("Error signing in:", error);
      // Handle specific error codes (e.g., user-not-found, wrong-password) here
      throw error; // Re-throw
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // Clearing of states (firebaseUser, level, userName etc.) is handled by onAuthStateChanged
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
      signUpWithEmail, signInWithEmail, signOut
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
