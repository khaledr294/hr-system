'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Always use Premium theme only
type ThemeType = 'premium';

interface ThemeContextType {
  theme: ThemeType;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Always set premium theme
    document.documentElement.className = 'theme-premium';
  }, []);

  // Always provide premium theme
  return (
    <ThemeContext.Provider value={{ theme: 'premium', mounted }}>
      <div className={!mounted ? 'theme-premium' : undefined}>
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