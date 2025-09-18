'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type ThemeType = 'sharp' | 'premium';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  isLoading: boolean;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>('sharp');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load theme from localStorage after mounting
    try {
      const savedTheme = localStorage.getItem('selectedTheme') as ThemeType;
      if (savedTheme && (savedTheme === 'sharp' || savedTheme === 'premium')) {
        setThemeState(savedTheme);
        document.documentElement.className = `theme-${savedTheme}`;
      } else {
        // Default to sharp theme
        localStorage.setItem('selectedTheme', 'sharp');
        document.documentElement.className = 'theme-sharp';
      }
    } catch {
      // Fallback to sharp theme if localStorage is not available
      document.documentElement.className = 'theme-sharp';
    }
  }, []);

  const setTheme = (newTheme: ThemeType) => {
    setIsLoading(true);
    setThemeState(newTheme);
    try {
      localStorage.setItem('selectedTheme', newTheme);
    } catch {
      console.warn('Unable to save theme to localStorage');
    }
  document.documentElement.className = `theme-${newTheme}`;
    
    // Reset loading state
    setTimeout(() => setIsLoading(false), 300);
  };

  // Always provide context; add a default theme wrapper before mount to avoid flash
  return (
    <ThemeContext.Provider value={{ theme, setTheme, isLoading, mounted }}>
      <div className={!mounted ? 'theme-sharp' : undefined}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}