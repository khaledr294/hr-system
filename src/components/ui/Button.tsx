"use client";

import { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

// Always use Premium theme styles
const variants = {
  primary: 'gradient-brand text-white hover-scale shadow-soft',
  secondary: 'glass text-slate-900 hover-scale ring-soft font-bold',
  danger: 'bg-red-600 text-white hover:bg-red-700 font-bold shadow-soft',
} as const;

const sizes = {
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={twMerge(
        'inline-flex justify-center items-center font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-xl',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}