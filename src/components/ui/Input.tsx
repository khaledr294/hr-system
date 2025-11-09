"use client";

import { InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-bold text-slate-900 mb-1">
          {label}
        </label>
      )}
      <input
        className={twMerge(
          'block w-full glass ring-soft focus:ring-2 focus:ring-indigo-400 sm:text-sm text-slate-900 font-bold placeholder:text-slate-500 px-3 py-2 rounded-xl',
          error && 'border-red-600 focus:border-red-600 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-800 font-bold">{error}</p>}
    </div>
  );
}
