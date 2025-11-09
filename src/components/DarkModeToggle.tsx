'use client';

import { useDarkMode } from './DarkModeProvider';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DarkModeToggle() {
  const { mode, toggleMode, mounted } = useDarkMode();

  if (!mounted) return null;

  const isDark = mode === 'dark';

  return (
    <motion.button
      onClick={toggleMode}
      className={`
        relative flex items-center gap-2 px-4 py-2 rounded-xl
        transition-all duration-300
        ${isDark 
          ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' 
          : 'bg-indigo-500 text-white hover:bg-indigo-600'
        }
        shadow-lg hover:shadow-xl
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={isDark ? 'التبديل للوضع النهاري' : 'التبديل للوضع الليلي'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </motion.div>
      <span className="text-sm font-medium">
        {isDark ? 'وضع ليلي' : 'وضع نهاري'}
      </span>
    </motion.button>
  );
}
