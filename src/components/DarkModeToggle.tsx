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
      className="glass rounded-xl p-2 shadow-soft hover:shadow-hover hover:bg-white/80 transition-all duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={isDark ? 'التبديل للوضع النهاري' : 'التبديل للوضع الليلي'}
      aria-label={isDark ? 'التبديل للوضع النهاري' : 'التبديل للوضع الليلي'}
      style={{ opacity: mounted ? 1 : 0.5 }}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? (
          <Moon className="w-5 h-5 text-slate-200" />
        ) : (
          <Sun className="w-5 h-5 text-yellow-500" />
        )}
      </motion.div>
    </motion.button>
  );
}
