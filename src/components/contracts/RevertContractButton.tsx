"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RevertContractButtonProps {
  contractId: string;
  contractStatus: string;
  isHRManager: boolean;
  workerName: string;
  clientName: string;
}

export default function RevertContractButton({
  contractId,
  contractStatus,
  isHRManager,
  workerName,
  clientName,
}: RevertContractButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Only show for HR managers and completed contracts
  if (!isHRManager || contractStatus !== 'COMPLETED') {
    return null;
  }

  const handleRevert = async () => {
    if (!confirm(`هل أنت متأكد من التراجع عن إكمال هذا العقد؟\n\nالعميل: ${clientName}\nالعاملة: ${workerName}\n\nسيتم إرجاع العقد إلى حالة "نشط" والعاملة إلى حالة "مؤجرة".`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/contracts/${contractId}/revert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ ' + data.message);
        router.refresh();
      } else {
        alert('❌ ' + (data.error || 'حدث خطأ في التراجع عن إكمال العقد'));
      }
    } catch (error) {
      console.error('Error reverting contract:', error);
      alert('❌ حدث خطأ في التراجع عن إكمال العقد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRevert}
      disabled={loading}
      className="inline-flex items-center px-4 py-2 border border-orange-300 rounded-md shadow-sm text-sm font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-orange-700" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          جاري التراجع...
        </>
      ) : (
        <>
          ↩️ التراجع عن إكمال العقد
        </>
      )}
    </button>
  );
}
