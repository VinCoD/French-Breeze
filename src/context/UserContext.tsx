
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
  // FacebookAuthProvider // Removed Facebook
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase'; 
import { doc, setDoc, getDoc, onSnapshot, Timestamp, type DocumentData } from 'firebase/firestore';

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
  // signInWithFacebook: () => Promise<User | null>; // Removed Facebook
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USERS_COLLECTION = 'users';

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const [level, setLevelState] = useState<FrenchLevel>(null);
  const [userName, setUserNameState] = useState<string | null>(null);
  const [progress, setProgressState] = useState<{ [lessonId: string]: boolean }>({});
  const [dailyStreak, setDailyStreakState] = useState<number>(0);
  
  const [firestoreUnsubscribe, setFirestoreUnsubscribe] = useState<(() => void) | null>(null);

  const clearLocalUserData = useCallback(() => {
    setLevelState(null);
    setUserNameState(null);
    setProgressState({});
    setDailyStreakState(0);
    if (firebaseUser?.uid) { // Clear specific user's local storage
        localStorage.removeItem(`frenchBreezeLevel_${firebaseUser.uid}`);
        localStorage.removeItem(`frenchBreezeUserName_${firebaseUser.uid}`);
        localStorage.removeItem(`frenchBreezeProgress_${firebaseUser.uid}`);
        localStorage.removeItem(`frenchBreezeStreak_${firebaseUser.uid}`);
        localStorage.removeItem(`frenchBreezeLastVisit_${firebaseUser.uid}`);
    }
  }, [firebaseUser?.uid]);


  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe(); // Unsubscribe from previous user's listener
        setFirestoreUnsubscribe(null);
      }

      if (user) {
        const userDocRef = doc(db, USERS_COLLECTION, user.uid);

        const unsub = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as DocumentData;
            setUserNameState(data.name || user.displayName || null);
            setLevelState(data.level || null);
            setProgressState(data.progress || {});
            setDailyStreakState(data.dailyStreak || 0);

            // Update local storage as a cache
            localStorage.setItem(`frenchBreezeUserName_${user.uid}`, data.name || user.displayName || "");
            if(data.level) localStorage.setItem(`frenchBreezeLevel_${user.uid}`, data.level); else localStorage.removeItem(`frenchBreezeLevel_${user.uid}`);
            localStorage.setItem(`frenchBreezeProgress_${user.uid}`, JSON.stringify(data.progress || {}));
            localStorage.setItem(`frenchBreezeStreak_${user.uid}`, (data.dailyStreak || 0).toString());
            
            // Streak Logic with Firestore's lastLoginDate
            const today = new Date().toDateString();
            const lastLoginFirestore = data.lastLoginDate instanceof Timestamp 
                ? data.lastLoginDate.toDate().toDateString() 
                : (typeof data.lastLoginDate === 'string' ? new Date(data.lastLoginDate).toDateString() : null);

            if (lastLoginFirestore) {
              const yesterday = new Date(Date.now() - 86400000).toDateString();
              if (lastLoginFirestore !== today && lastLoginFirestore !== yesterday) {
                // Reset streak if last login wasn't today or yesterday
                 setDoc(userDocRef, { dailyStreak: 0, lastLoginDate: Timestamp.fromDate(new Date()) }, { merge: true });
              } else if (lastLoginFirestore !== today) {
                // If last login was yesterday, incrementStreak would handle it if called by dashboard
              }
            } else {
              // First login, or no lastLoginDate set. Set it now.
              setDoc(userDocRef, { lastLoginDate: Timestamp.fromDate(new Date()) }, { merge: true });
            }
            localStorage.setItem(`frenchBreezeLastVisit_${user.uid}`, today); // Keep this for UI check before Firestore write

          } else {
            // Document doesn't exist, create it (e.g., new user or migrating from local storage)
            const localName = localStorage.getItem(`frenchBreezeUserName_${user.uid}`) || user.displayName;
            const localLevel = localStorage.getItem(`frenchBreezeLevel_${user.uid}`) as FrenchLevel;
            const localProgressString = localStorage.getItem(`frenchBreezeProgress_${user.uid}`);
            const localProgress = localProgressString ? JSON.parse(localProgressString) : {};
            const localStreakString = localStorage.getItem(`frenchBreezeStreak_${user.uid}`);
            const localStreak = localStreakString ? parseInt(localStreakString, 10) : 0;
            const localLastVisit = localStorage.getItem(`frenchBreezeLastVisit_${user.uid}`);
            
            const initialData = {
              name: localName || null,
              level: localLevel || null,
              progress: localProgress || {},
              dailyStreak: localStreak || 0,
              lastLoginDate: localLastVisit ? Timestamp.fromDate(new Date(localLastVisit)) : Timestamp.fromDate(new Date()),
              createdAt: Timestamp.fromDate(new Date()),
            };
            await setDoc(userDocRef, initialData);
            // State will be updated by the onSnapshot listener picking up the new doc
          }
        });
        setFirestoreUnsubscribe(() => unsub);

      } else { // User is null (logged out)
        clearLocalUserData();
      }
      setLoadingAuth(false);
    });

    return () => {
      unsubscribeAuth();
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
      }
    };
  }, [clearLocalUserData, firestoreUnsubscribe]); // Added dependencies

  const setLevel = async (newLevel: FrenchLevel) => {
    setLevelState(newLevel);
    if (firebaseUser) {
      if (newLevel) localStorage.setItem(`frenchBreezeLevel_${firebaseUser.uid}`, newLevel);
      else localStorage.removeItem(`frenchBreezeLevel_${firebaseUser.uid}`);
      try {
        const userDocRef = doc(db, USERS_COLLECTION, firebaseUser.uid);
        await setDoc(userDocRef, { level: newLevel }, { merge: true });
      } catch (error) {
        console.error("Error saving level to Firestore:", error);
      }
    }
  };

  const setUserName = async (newName: string | null, updateUserProfileFlag: boolean = true) => {
    setUserNameState(newName);
    if (firebaseUser) {
      if (newName) localStorage.setItem(`frenchBreezeUserName_${firebaseUser.uid}`, newName);
      else localStorage.removeItem(`frenchBreezeUserName_${firebaseUser.uid}`);
      
      const tasks = [];
      if (updateUserProfileFlag && auth.currentUser && auth.currentUser.displayName !== newName) {
        tasks.push(updateProfile(auth.currentUser, { displayName: newName }));
      }
      const userDocRef = doc(db, USERS_COLLECTION, firebaseUser.uid);
      tasks.push(setDoc(userDocRef, { name: newName }, { merge: true }));

      try {
        await Promise.all(tasks);
        if (updateUserProfileFlag && auth.currentUser) setFirebaseUser(auth.currentUser); // Refresh user with updated profile
      } catch (error) {
        console.error("Error saving name:", error);
      }
    }
  };

  const updateProgress = async (lessonId: string, completed: boolean) => {
    if (!firebaseUser) return;
    const newProgress = { ...progress, [lessonId]: completed };
    setProgressState(newProgress);
    localStorage.setItem(`frenchBreezeProgress_${firebaseUser.uid}`, JSON.stringify(newProgress));
    try {
      const userDocRef = doc(db, USERS_COLLECTION, firebaseUser.uid);
      await setDoc(userDocRef, { progress: newProgress }, { merge: true });
    } catch (error) {
      console.error("Error saving progress to Firestore:", error);
    }
  };

  const incrementStreak = async () => {
    if (!firebaseUser) return;
    const todayString = new Date().toDateString();
    const lastVisitLocal = localStorage.getItem(`frenchBreezeLastVisit_${firebaseUser.uid}`);

    // Primarily rely on Firestore data if available, but use local for immediate check
    const userDocRef = doc(db, USERS_COLLECTION, firebaseUser.uid);
    const docSnap = await getDoc(userDocRef);
    let currentStreak = dailyStreak; // from context state
    let lastLoginDateString = lastVisitLocal;

    if(docSnap.exists()){
        const data = docSnap.data();
        currentStreak = data.dailyStreak || 0;
        if(data.lastLoginDate instanceof Timestamp){
            lastLoginDateString = data.lastLoginDate.toDate().toDateString();
        } else if (typeof data.lastLoginDate === 'string') {
            lastLoginDateString = new Date(data.lastLoginDate).toDateString();
        }
    }
    
    if (lastLoginDateString !== todayString) {
      const newStreak = currentStreak + 1;
      setDailyStreakState(newStreak); // Update local state immediately
      localStorage.setItem(`frenchBreezeStreak_${firebaseUser.uid}`, newStreak.toString());
      localStorage.setItem(`frenchBreezeLastVisit_${firebaseUser.uid}`, todayString);
      try {
        await setDoc(userDocRef, { 
          dailyStreak: newStreak, 
          lastLoginDate: Timestamp.fromDate(new Date()) 
        }, { merge: true });
      } catch (error) {
        console.error("Error incrementing streak in Firestore:", error);
      }
    }
  };
  
  const resetStreak = async () => {
    if (!firebaseUser) return;
    setDailyStreakState(0); // Update local state
    localStorage.setItem(`frenchBreezeStreak_${firebaseUser.uid}`, "0");
    // lastLoginDate will be updated on next login/incrementStreak
    try {
      const userDocRef = doc(db, USERS_COLLECTION, firebaseUser.uid);
      await setDoc(userDocRef, { dailyStreak: 0 }, { merge: true });
    } catch (error) {
      console.error("Error resetting streak in Firestore:", error);
    }
  };

  const signUpWithEmail = async (email: string, password: string): Promise<User | null> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Firestore document creation will be handled by onSnapshot in useEffect
      return userCredential.user;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error; 
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Firestore data loading/creation handled by onSnapshot in useEffect
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
      // Firestore data loading/creation handled by onSnapshot in useEffect
      // If user has displayName, set it immediately if not already set by Firestore listener
      if (result.user && result.user.displayName && !userName) {
        await setUserName(result.user.displayName, false); // Don't update Firebase Auth profile if it's already from Google
      }
      return result.user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error; 
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // clearLocalUserData() and firestoreUnsubscribe() handled by onAuthStateChanged effect
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
