'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

interface DeleteContractButtonProps {
  contractId: string;
  isHRManager: boolean;
}

export default function DeleteContractButton({ contractId, isHRManager }: DeleteContractButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  if (!isHRManager) {
    return null; // لا يظهر الزر إذا لم يكن مدير موارد بشرية
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/contracts');
        router.refresh();
      } else {
        const error = await response.text();
        alert(`خطأ في حذف العقد: ${error}`);
      }
    } catch (error) {
      console.error('Error deleting contract:', error);
      alert('حدث خطأ أثناء حذف العقد');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
        <h3 className="text-red-800 font-semibold mb-2">تأكيد حذف العقد</h3>
        <p className="text-red-700 mb-4">
          هل أنت متأكد من حذف هذا العقد؟ هذا الإجراء لا يمكن التراجع عنه.
        </p>
        <div className="flex gap-2">
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? 'جاري الحذف...' : 'نعم، احذف العقد'}
          </Button>
          <Button
            onClick={() => setShowConfirm(false)}
            variant="secondary"
            disabled={isDeleting}
          >
            إلغاء
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setShowConfirm(true)}
      className="bg-red-600 hover:bg-red-700 text-white"
    >
      حذف العقد
    </Button>
  );
}