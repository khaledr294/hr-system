"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteMarketerButtonProps {
  marketerId: string;
}

export default function DeleteMarketerButton({ marketerId }: DeleteMarketerButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا المسوق؟\n\nتحذير: لا يمكن التراجع عن هذه العملية.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/marketers/${marketerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // إعادة تحميل الصفحة لتحديث القائمة
        router.refresh();
      } else {
        let errorMessage = 'حدث خطأ غير متوقع';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = await response.text() || errorMessage;
        }
        alert(`خطأ في حذف المسوق: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error deleting marketer:', error);
      alert('حدث خطأ أثناء حذف المسوق');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center px-3 py-1 border-2 border-slate-900 text-white bg-red-600 hover:bg-red-700 text-sm font-bold transition-colors duration-200 disabled:opacity-50"
    >
      {isDeleting ? 'جارٍ الحذف...' : 'حذف'}
    </button>
  );
}
