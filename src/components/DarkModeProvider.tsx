'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type DarkModeType = 'light' | 'dark';

interface DarkModeContextType {
  mode: DarkModeType;
  setMode: (mode: DarkModeType) => void;
  toggleMode: () => void;
  mounted: boolean;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<DarkModeType>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load dark mode preference from localStorage after mounting
    try {
      const savedMode = localStorage.getItem('darkMode') as DarkModeType;
      if (savedMode === 'dark' || savedMode === 'light') {
        setModeState(savedMode);
        applyMode(savedMode);
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const defaultMode = prefersDark ? 'dark' : 'light';
        setModeState(defaultMode);
        applyMode(defaultMode);
        localStorage.setItem('darkMode', defaultMode);
      }
    } catch {
      // Fallback to light mode if localStorage is not available
      applyMode('light');
    }
  }, []);

  const applyMode = (newMode: DarkModeType) => {
    if (newMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setMode = (newMode: DarkModeType) => {
    setModeState(newMode);
    applyMode(newMode);
    try {
      localStorage.setItem('darkMode', newMode);
    } catch {
      console.warn('Unable to save dark mode preference to localStorage');
    }
  };

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
  };

  return (
    <DarkModeContext.Provider value={{ mode, setMode, toggleMode, mounted }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
}
