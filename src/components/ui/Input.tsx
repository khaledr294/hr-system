"use client";

import { InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '@/components/ThemeProvider';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className, ...props }: InputProps) {
  const { theme } = useTheme();
  const isPremium = theme === 'premium';
  return (
    <div>
      {label && (
        <label className="block text-sm font-bold text-slate-900 mb-1">
          {label}
        </label>
      )}
      <input
        className={twMerge(
          isPremium
            ? 'block w-full glass ring-soft focus:ring-2 focus:ring-indigo-400 sm:text-sm text-slate-900 font-bold placeholder:text-slate-500 px-3 py-2 rounded-xl'
            : 'block w-full border-2 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500 sm:text-sm text-slate-900 font-bold bg-white placeholder:text-slate-500 focus:text-blue-900 px-3 py-2',
          error && 'border-red-600 focus:border-red-600 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-800 font-bold">{error}</p>}
    </div>
  );
}