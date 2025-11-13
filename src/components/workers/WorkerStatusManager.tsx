"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface WorkerStatusManagerProps {
  workerId: string;
  currentStatus: string;
  isHRManager: boolean;
}

export default function WorkerStatusManager({ workerId, currentStatus, isHRManager }: WorkerStatusManagerProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const statusOptions = [
    { value: 'AVAILABLE', label: 'متاحة', color: 'bg-green-100 text-green-800', allowedFor: 'all' },
    { value: 'CONTRACTED', label: 'مؤجرة', color: 'bg-blue-100 text-blue-800', allowedFor: 'system' },
    { value: 'RESERVED', label: 'محجوزة', color: 'bg-yellow-100 text-yellow-800', allowedFor: 'system' },
    { value: 'SICK', label: 'مريضة', color: 'bg-orange-100 text-orange-800', allowedFor: 'hr' },
    { value: 'RUNAWAY', label: 'هاربة', color: 'bg-red-100 text-red-800', allowedFor: 'hr' },
  ];

  const currentStatusInfo = statusOptions.find(opt => opt.value === status);

  const handleStatusChange = async (newStatus: string) => {
    if (loading) return;
    
    // Check permissions
    const statusOption = statusOptions.find(opt => opt.value === newStatus);
    if (statusOption?.allowedFor === 'hr' && !isHRManager) {
      setError('فقط مدير الموارد البشرية يمكنه تغيير الحالة إلى ' + statusOption.label);
      return;
    }

    if (statusOption?.allowedFor === 'system') {
      setError('هذه الحالة يتم تغييرها تلقائياً من النظام');
      return;
    }

    if (!confirm(`هل أنت متأكد من تغيير حالة العاملة إلى "${statusOption?.label}"؟`)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/workers/${workerId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'فشل تحديث الحالة');
      }

      setStatus(newStatus);
      router.refresh();
      alert('✅ تم تحديث حالة العاملة بنجاح');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">إدارة حالة العاملة</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-lg text-red-800">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">الحالة الحالية</label>
        <span className={`inline-flex px-4 py-2 rounded-full text-sm font-bold ${currentStatusInfo?.color}`}>
          {currentStatusInfo?.label || status}
        </span>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">تغيير الحالة إلى:</label>
        
        <div className="grid grid-cols-1 gap-3">
          {statusOptions.map((option) => {
            const isDisabled = option.allowedFor === 'system' || 
                             (option.allowedFor === 'hr' && !isHRManager) ||
                             option.value === status;
            
            return (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                disabled={isDisabled || loading}
                className={`
                  px-4 py-3 rounded-lg text-right font-bold border-2 transition-all
                  ${isDisabled 
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                    : `${option.color} border-transparent hover:shadow-md hover:scale-105 cursor-pointer`
                  }
                  ${option.value === status ? 'ring-2 ring-blue-500' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <span>{option.label}</span>
                  {option.value === status && <span className="text-xs">✓ حالي</span>}
                  {option.allowedFor === 'hr' && !isHRManager && (
                    <span className="text-xs">🔒 HR فقط</span>
                  )}
                  {option.allowedFor === 'system' && (
                    <span className="text-xs">⚙️ تلقائي</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800">
          <strong>ملاحظة:</strong><br/>
          • <strong>متاحة:</strong> يمكن إضافتها لعقد جديد<br/>
          • <strong>مؤجرة:</strong> لديها عقد نشط/منتهي<br/>
          • <strong>محجوزة:</strong> محجوزة لمدة 3 ساعات<br/>
          • <strong>مريضة/هاربة:</strong> لا تظهر في القائمة المتاحة
        </p>
      </div>
    </div>
  );
}
