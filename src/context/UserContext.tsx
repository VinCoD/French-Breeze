
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  Auth, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  updateProfile as updateAuthProfile, // Renamed to avoid conflict
  GoogleAuthProvider, 
  signInWithPopup,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase'; 
import { doc, setDoc, getDoc, onSnapshot, Timestamp, type DocumentData } from 'firebase/firestore';

export type FrenchLevel = "Beginner" | "Intermediate" | "Advanced" | null;

interface UserContextType {
  firebaseUser: User | null;
  loadingAuth: boolean;
  loadingUserData: boolean; // New state to indicate if user-specific data is being loaded from Firestore
  level: FrenchLevel;
  setLevel: (level: FrenchLevel) => Promise<void>; 
  userName: string | null;
  setUserName: (name: string | null, updateUserProfile?: boolean) => Promise<void>; 
  progress: { [lessonId: string]: boolean };
  updateProgress: (lessonId: string, completed: boolean) => Promise<void>; 
  dailyStreak: number;
  incrementStreak: () => Promise<void>; 
  resetStreak: () => Promise<void>; 
  signUpWithEmail: (email: string, password: string) => Promise<User | null>;
  signInWithEmail: (email: string, password: string) => Promise<User | null>;
  signInWithGoogle: () => Promise<User | null>; 
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingUserData, setLoadingUserData] = useState(true); // Initialize as true
  
  const [level, setLevelState] = useState<FrenchLevel>(null);
  const [userName, setUserNameState] = useState<string | null>(null);
  const [progress, setProgressState] = useState<{ [lessonId: string]: boolean }>({});
  const [dailyStreak, setDailyStreakState] = useState<number>(0);

  // Firestore document update helper
  const updateUserDocument = useCallback(async (uid: string, data: Partial<DocumentData>) => {
    if (!uid) return;
    try {
      const userDocRef = doc(db, "users", uid);
      await setDoc(userDocRef, data, { merge: true });
    } catch (error) {
      console.error("Error updating user document in Firestore:", error);
    }
  }, []);

  // Effect for Firebase Auth state changes
  useEffect(() => {
    setLoadingAuth(true);
    setLoadingUserData(true); // Reset loading user data when auth state might change
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) {
        // Clear all user-specific state if user logs out
        setLevelState(null);
        setUserNameState(null);
        setProgressState({});
        setDailyStreakState(0);
        setLoadingAuth(false);
        setLoadingUserData(false); // No user data to load
      }
      // Firestore listener setup will be in another effect dependent on firebaseUser
    });
    return () => unsubscribeAuth();
  }, []);

  // Effect for Firestore data synchronization
  useEffect(() => {
    let unsubscribeFirestore: (() => void) | undefined;

    if (firebaseUser) {
      setLoadingUserData(true);
      const userDocRef = doc(db, "users", firebaseUser.uid);

      unsubscribeFirestore = onSnapshot(userDocRef, async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserNameState(data.name || firebaseUser.displayName || null);
          setLevelState(data.level || null);
          setProgressState(data.progress || {});
          
          // Streak Logic
          const today = new Date();
          today.setHours(0,0,0,0); // Normalize to start of day
          const lastLoginFirestore = data.lastLoginDate?.toDate(); // Convert Firestore Timestamp to JS Date
          
          let currentStreak = data.dailyStreak || 0;

          if (lastLoginFirestore) {
            const lastLoginDay = new Date(lastLoginFirestore);
            lastLoginDay.setHours(0,0,0,0);

            const diffTime = today.getTime() - lastLoginDay.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            if (diffDays === 1) {
              // Consecutive day
              // Streak increment handled by incrementStreak function if called
            } else if (diffDays > 1) {
              // Missed one or more days
              currentStreak = 0; 
            }
            // If diffDays is 0, it's the same day, streak doesn't change here
          } else {
            // No lastLoginDate, very first login or data migration case
             currentStreak = 0;
          }
          setDailyStreakState(currentStreak);

          // Update local storage as a cache
          localStorage.setItem(`frenchBreezeUserName_${firebaseUser.uid}`, data.name || firebaseUser.displayName || "");
          if(data.level) localStorage.setItem(`frenchBreezeLevel_${firebaseUser.uid}`, data.level); else localStorage.removeItem(`frenchBreezeLevel_${firebaseUser.uid}`);
          localStorage.setItem(`frenchBreezeProgress_${firebaseUser.uid}`, JSON.stringify(data.progress || {}));
          localStorage.setItem(`frenchBreezeStreak_${firebaseUser.uid}`, currentStreak.toString());
          if (data.lastLoginDate) localStorage.setItem(`frenchBreezeLastVisit_${firebaseUser.uid}`, data.lastLoginDate.toDate().toDateString());


        } else {
          // Document doesn't exist, create it (e.g., first-time login for this user with Firestore)
          const initialName = firebaseUser.displayName || localStorage.getItem(`frenchBreezeUserName_${firebaseUser.uid}`) || null;
          const initialLevel = (localStorage.getItem(`frenchBreezeLevel_${firebaseUser.uid}`) as FrenchLevel) || null;
          const initialProgress = JSON.parse(localStorage.getItem(`frenchBreezeProgress_${firebaseUser.uid}`) || '{}');
          // For a new document, streak is 0, lastLogin will be set by first incrementStreak
          const initialData = {
            name: initialName,
            level: initialLevel,
            progress: initialProgress,
            dailyStreak: 0,
            lastLoginDate: Timestamp.fromDate(new Date()), // Set current date as last login
            createdAt: Timestamp.now(),
          };
          await updateUserDocument(firebaseUser.uid, initialData);
          // State will be updated by the onSnapshot listener triggering again after creation
          setUserNameState(initialName);
          setLevelState(initialLevel);
          setProgressState(initialProgress);
          setDailyStreakState(0); // Start with 0
        }
        setLoadingAuth(false); // Auth is confirmed by now
        setLoadingUserData(false);
      }, (error) => {
        console.error("Error listening to user document:", error);
        setLoadingAuth(false);
        setLoadingUserData(false);
      });
    } else {
      // No user, ensure loading states are false and cleanup listener
      setLoadingAuth(false);
      setLoadingUserData(false);
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    }
    return () => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [firebaseUser, updateUserDocument]);


  const setLevel = async (newLevel: FrenchLevel) => { 
    setLevelState(newLevel);
    if (firebaseUser) {
      if (newLevel) localStorage.setItem(`frenchBreezeLevel_${firebaseUser.uid}`, newLevel);
      else localStorage.removeItem(`frenchBreezeLevel_${firebaseUser.uid}`);
      await updateUserDocument(firebaseUser.uid, { level: newLevel });
    }
  };

  const setUserName = async (newName: string | null, updateUserProfileFlag: boolean = true) => {
    setUserNameState(newName);
    if (firebaseUser) {
      if (newName) localStorage.setItem(`frenchBreezeUserName_${firebaseUser.uid}`, newName);
      else localStorage.removeItem(`frenchBreezeUserName_${firebaseUser.uid}`);
      
      await updateUserDocument(firebaseUser.uid, { name: newName });

      if (updateUserProfileFlag && auth.currentUser && auth.currentUser.displayName !== newName) {
        try {
          await updateAuthProfile(auth.currentUser, { displayName: newName });
          // No need to setFirebaseUser, onAuthStateChanged should handle it if displayName changes trigger it.
        } catch (error) {
          console.error("Error updating Firebase Auth profile name:", error);
          // Potentially re-throw or handle more gracefully
        }
      }
    }
  };

  const updateProgress = async (lessonId: string, completed: boolean) => { 
    if (!firebaseUser) return;
    const newProgress = { ...progress, [lessonId]: completed };
    setProgressState(newProgress);
    localStorage.setItem(`frenchBreezeProgress_${firebaseUser.uid}`, JSON.stringify(newProgress));
    await updateUserDocument(firebaseUser.uid, { progress: newProgress });
  };

  const incrementStreak = async () => { 
    if (!firebaseUser || loadingUserData) return; // Don't run if still loading initial data

    const userDocRef = doc(db, "users", firebaseUser.uid);
    try {
        const docSnap = await getDoc(userDocRef);
        let currentStreak = 0;
        let lastLoginDateFirestore: Date | null = null;

        if (docSnap.exists()) {
            const data = docSnap.data();
            currentStreak = data.dailyStreak || 0;
            if (data.lastLoginDate) {
                lastLoginDateFirestore = data.lastLoginDate.toDate();
            }
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let newStreak = currentStreak;
        
        if (lastLoginDateFirestore) {
            const lastLoginDay = new Date(lastLoginDateFirestore);
            lastLoginDay.setHours(0, 0, 0, 0);
            
            const diffTime = today.getTime() - lastLoginDay.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) { // Logged in yesterday
                newStreak = currentStreak + 1;
            } else if (diffDays > 1) { // Missed a day or more
                newStreak = 1; // Reset to 1 for today's login
            } else if (diffDays === 0) {
                // Already logged in today, streak doesn't change here
                // If it's the very first login and lastLoginDate was just set to today, newStreak remains currentStreak (which could be 0, then set to 1 if it was 0)
                 if (currentStreak === 0) newStreak = 1; // First login of the day for a new streak or continued streak
            }
        } else { // No last login date (very first login)
            newStreak = 1;
        }
        
        setDailyStreakState(newStreak);
        localStorage.setItem(`frenchBreezeStreak_${firebaseUser.uid}`, newStreak.toString());
        localStorage.setItem(`frenchBreezeLastVisit_${firebaseUser.uid}`, new Date().toDateString());
        await updateUserDocument(firebaseUser.uid, { dailyStreak: newStreak, lastLoginDate: Timestamp.fromDate(new Date()) });

    } catch (error) {
        console.error("Error in incrementStreak:", error);
    }
  };
  
  const resetStreak = async () => { 
    if (!firebaseUser) return;
    setDailyStreakState(0);
    localStorage.setItem(`frenchBreezeStreak_${firebaseUser.uid}`, "0");
    // Also update lastLoginDate to prevent immediate re-increment if app reloads today
    await updateUserDocument(firebaseUser.uid, { dailyStreak: 0, lastLoginDate: Timestamp.fromDate(new Date()) });
  };

  const signUpWithEmail = async (email: string, password: string): Promise<User | null> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Firestore document creation will be handled by the onSnapshot effect when firebaseUser updates
      return userCredential.user;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error; 
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Firestore data loading will be handled by the onSnapshot effect
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
      // Firestore document creation/loading handled by onSnapshot effect
      return result.user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error; 
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // User state will be cleared by onAuthStateChanged
      // Local storage for a specific UID is harder to clear here as UID is gone
      // Consider a more generic local storage clear or rely on onAuthStateChanged to nullify context
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ 
      firebaseUser, loadingAuth, loadingUserData,
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
