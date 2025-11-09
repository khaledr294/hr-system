'use client';

import { useDarkMode } from './DarkModeProvider';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DarkModeToggle() {
  const { mode, toggleMode, mounted } = useDarkMode();

  const isDark = mode === 'dark';

  return (
    <motion.button
      onClick={toggleMode}
      className="glass rounded-xl p-2 shadow-soft hover:shadow-hover dark:hover:bg-slate-700/50 hover:bg-white/80 transition-all duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={isDark ? 'التبديل للوضع النهاري' : 'التبديل للوضع الليلي'}
      aria-label={isDark ? 'التبديل للوضع النهاري' : 'التبديل للوضع الليلي'}
      style={{ opacity: mounted ? 1 : 0.3, transition: 'opacity 0.2s' }}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {isDark ? (
          <Moon className="w-5 h-5 text-blue-300 drop-shadow-glow" />
        ) : (
          <Sun className="w-5 h-5 text-amber-500 drop-shadow-glow" />
        )}
      </motion.div>
    </motion.button>
  );
}
