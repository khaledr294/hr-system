import { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 font-bold border-2 border-slate-900',
  secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 focus:ring-slate-500 font-bold border-2 border-slate-900',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 font-bold border-2 border-slate-900',
};

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
        'inline-flex justify-center items-center font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}