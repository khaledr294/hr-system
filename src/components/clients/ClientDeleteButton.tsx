'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ClientDeleteButtonProps {
  clientId: string;
  clientName: string;
  hasActiveContracts: boolean;
}

export default function ClientDeleteButton({ 
  clientId, 
  clientName,
  hasActiveContracts 
}: ClientDeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (hasActiveContracts) {
      alert('لا يمكن حذف العميل لأن لديه عقود نشطة. يرجى إنهاء العقود أولاً.');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('تم حذف العميل بنجاح');
        router.push('/clients');
        router.refresh();
      } else {
        const error = await response.text();
        alert(`فشل في حذف العميل: ${error}`);
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('حدث خطأ أثناء حذف العميل');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className={`inline-flex items-center px-4 py-2 border-2 border-slate-900 shadow-sm text-sm font-bold ${
          hasActiveContracts 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-red-500 text-white hover:bg-red-600'
        } transition-colors duration-200`}
        title={hasActiveContracts ? 'لا يمكن حذف العميل لأن لديه عقود نشطة' : 'حذف العميل'}
      >
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        حذف العميل
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowConfirm(false)}>
          <div className="bg-white border-4 border-slate-900 p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">تأكيد الحذف</h3>
            <p className="text-gray-700 mb-6">
              هل أنت متأكد من رغبتك في حذف العميل <span className="font-bold">{clientName}</span>؟
            </p>
            {hasActiveContracts && (
              <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 text-red-800 text-sm">
                <strong>تحذير:</strong> لا يمكن حذف هذا العميل لأن لديه عقود نشطة.
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border-2 border-slate-900 bg-white text-slate-900 font-bold hover:bg-gray-100 transition-colors duration-200"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting || hasActiveContracts}
                className={`px-4 py-2 border-2 border-slate-900 font-bold transition-colors duration-200 ${
                  hasActiveContracts || isDeleting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {isDeleting ? 'جاري الحذف...' : 'حذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
