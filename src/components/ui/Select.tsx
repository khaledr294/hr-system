import { SelectHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
}

export default function Select({
  label,
  error,
  options,
  className,
  ...props
}: SelectProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-bold text-slate-900 mb-1">
          {label}
        </label>
      )}
      <select
        className={twMerge(
          'block w-full border-2 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500 sm:text-sm text-slate-900 font-bold bg-white px-3 py-2',
          error && 'border-red-600 focus:border-red-600 focus:ring-red-500',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-slate-900 font-bold">
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-800 font-bold">{error}</p>}
    </div>
  );
}