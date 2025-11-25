'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (date: string) => void;
  className?: string;
  min?: string;
  max?: string;
}

export default function DatePicker({
  label,
  value,
  onChange,
  className = '',
  min,
  max
}: DatePickerProps) {
  const [showQuickActions, setShowQuickActions] = useState(false);

  const getToday = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getNextWeek = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  };

  const handleQuickSelect = (date: string) => {
    onChange(date);
    setShowQuickActions(false);
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
          onFocus={() => setShowQuickActions(true)}
          onBlur={() => setTimeout(() => setShowQuickActions(false), 200)}
        />
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
      </div>

      {showQuickActions && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-2 space-y-1">
            <button
              type="button"
              onClick={() => handleQuickSelect(getToday())}
              className="w-full text-right px-3 py-2 hover:bg-gray-100 rounded text-sm"
            >
              اليوم ({new Date().toLocaleDateString('ar-SA-u-ca-gregory')})
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(getTomorrow())}
              className="w-full text-right px-3 py-2 hover:bg-gray-100 rounded text-sm"
            >
              غداً ({new Date(getTomorrow()).toLocaleDateString('ar-SA-u-ca-gregory')})
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(getNextWeek())}
              className="w-full text-right px-3 py-2 hover:bg-gray-100 rounded text-sm"
            >
              بعد أسبوع ({new Date(getNextWeek()).toLocaleDateString('ar-SA-u-ca-gregory')})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
