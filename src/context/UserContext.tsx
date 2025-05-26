"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type FrenchLevel = "Beginner" | "Intermediate" | "Advanced" | null;

interface UserContextType {
  level: FrenchLevel;
  setLevel: (level: FrenchLevel) => void;
  userName: string | null;
  setUserName: (name: string | null) => void;
  progress: { [lessonId: string]: boolean }; // lessonId: completed
  updateProgress: (lessonId: string, completed: boolean) => void;
  dailyStreak: number;
  incrementStreak: () => void;
  resetStreak: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [level, setLevelState] = useState<FrenchLevel>(null);
  const [userName, setUserNameState] = useState<string | null>(null);
  const [progress, setProgressState] = useState<{ [lessonId: string]: boolean }>({});
  const [dailyStreak, setDailyStreakState] = useState<number>(0);

  useEffect(() => {
    const storedLevel = localStorage.getItem("frenchBreezeLevel") as FrenchLevel;
    if (storedLevel) setLevelState(storedLevel);
    
    const storedName = localStorage.getItem("frenchBreezeUserName");
    if (storedName) setUserNameState(storedName);

    const storedProgress = localStorage.getItem("frenchBreezeProgress");
    if (storedProgress) setProgressState(JSON.parse(storedProgress));

    const storedStreak = localStorage.getItem("frenchBreezeStreak");
    if (storedStreak) setDailyStreakState(parseInt(storedStreak, 10));
    
    // Basic daily streak logic based on last visit date
    const lastVisit = localStorage.getItem("frenchBreezeLastVisit");
    const today = new Date().toDateString();
    if (lastVisit) {
      const lastVisitDate = new Date(lastVisit).toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString(); // 24 * 60 * 60 * 1000 ms
      if (lastVisitDate === today) {
        // already visited today, do nothing
      } else if (lastVisitDate === yesterday) {
        // visited yesterday, continue streak
        // handled by incrementStreak on action
      } else {
        // missed a day or more
        resetStreak();
      }
    } else {
      // first visit
      localStorage.setItem("frenchBreezeLastVisit", today);
    }

  }, []);

  const setLevel = (newLevel: FrenchLevel) => {
    setLevelState(newLevel);
    if (newLevel) {
      localStorage.setItem("frenchBreezeLevel", newLevel);
    } else {
      localStorage.removeItem("frenchBreezeLevel");
    }
  };

  const setUserName = (newName: string | null) => {
    setUserNameState(newName);
    if (newName) {
      localStorage.setItem("frenchBreezeUserName", newName);
    } else {
      localStorage.removeItem("frenchBreezeUserName");
    }
  };

  const updateProgress = (lessonId: string, completed: boolean) => {
    const newProgress = { ...progress, [lessonId]: completed };
    setProgressState(newProgress);
    localStorage.setItem("frenchBreezeProgress", JSON.stringify(newProgress));
  };

  const incrementStreak = () => {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem("frenchBreezeLastVisit");
    
    if (lastVisit !== today) { // only increment if not already incremented today
        setDailyStreakState(prevStreak => {
            const newStreak = prevStreak + 1;
            localStorage.setItem("frenchBreezeStreak", newStreak.toString());
            localStorage.setItem("frenchBreezeLastVisit", today);
            return newStreak;
        });
    } else if (!lastVisit) { // first ever interaction
        setDailyStreakState(1);
        localStorage.setItem("frenchBreezeStreak", "1");
        localStorage.setItem("frenchBreezeLastVisit", today);
    }
  };

  const resetStreak = () => {
    setDailyStreakState(0);
    localStorage.setItem("frenchBreezeStreak", "0");
    // Don't reset lastVisit here, let the normal flow handle it
  };


  return (
    <UserContext.Provider value={{ level, setLevel, userName, setUserName, progress, updateProgress, dailyStreak, incrementStreak, resetStreak }}>
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
