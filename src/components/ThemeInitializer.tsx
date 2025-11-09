'use client';

import { useEffect } from 'react';

export default function ThemeInitializer() {
  useEffect(() => {
    // Initialize theme on client side only
    const initTheme = () => {
      try {
  const savedTheme = localStorage.getItem('selectedTheme') || 'sharp';
  const validTheme = ['premium'].includes(savedTheme) ? savedTheme : 'sharp';
        document.documentElement.className = `theme-${validTheme}`;
        
        // Save valid theme back to localStorage
        if (savedTheme !== validTheme) {
          localStorage.setItem('selectedTheme', validTheme);
        }
      } catch {
        // Fallback to sharp theme
        document.documentElement.className = 'theme-sharp';
      }
    };

    // Run immediately
    initTheme();
  }, []);

  return null; // This component doesn't render anything
}
