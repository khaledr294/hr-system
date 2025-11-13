'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Archive } from 'lucide-react';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface ArchiveContractButtonProps {
  contractId: string;
  contractStatus: string;
  workerName: string;
  clientName: string;
  contractNumber?: string | null;
}

export default function ArchiveContractButton({ 
  contractId, 
  contractStatus,
  workerName,
  clientName,
  contractNumber
}: ArchiveContractButtonProps) {
  const router = useRouter();
  const [isArchiving, setIsArchiving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // إظهار الزر فقط للعقود المكتملة أو الملغاة (وليس المنتهية)
  if (contractStatus !== 'COMPLETED' && contractStatus !== 'CANCELLED') {
    return null;
  }

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      const response = await fetch('/api/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'archive',
          contractId,
          reason: contractStatus === 'CANCELLED' ? 'CANCELLED' : 'COMPLETED'
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ تم أرشفة العقد بنجاح!\n\nالعقد: ${contractNumber || contractId}\nالعاملة: ${workerName}\nالعميل: ${clientName}`);
        router.push('/archive');
        router.refresh();
      } else {
        alert(`❌ فشل أرشفة العقد:\n${data.error}\n\nيرجى التأكد من:\n- إنهاء العقد أولاً\n- حالة العاملة متاحة\n- عدم وجود عقود نشطة أخرى`);
      }
    } catch (error) {
      console.error('خطأ في أرشفة العقد:', error);
      alert('حدث خطأ أثناء أرشفة العقد');
    } finally {
      setIsArchiving(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowConfirm(true)}
        variant="secondary"
        className="bg-amber-50 border-2 border-amber-600 text-amber-700 hover:bg-amber-100 font-bold px-6 py-3 rounded-lg shadow-md transition-all"
        disabled={isArchiving}
      >
        {isArchiving ? (
          <LoadingSpinner size="sm" />
        ) : (
          <>
            <Archive className="w-5 h-5 ml-2" />
            أرشفة العقد
          </>
        )}
      </Button>

      {/* مربع التأكيد */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" dir="rtl">
            <div className="flex items-center gap-3 mb-4">
              <Archive className="w-8 h-8 text-amber-600" />
              <h3 className="text-xl font-bold text-gray-900">تأكيد أرشفة العقد</h3>
            </div>
            
            <div className="mb-6 space-y-3">
              <p className="text-gray-700">
                هل أنت متأكد من أرشفة هذا العقد؟
              </p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2 text-sm">
                <p><strong>رقم العقد:</strong> {contractNumber || 'غير محدد'}</p>
                <p><strong>العاملة:</strong> {workerName}</p>
                <p><strong>العميل:</strong> {clientName}</p>
                <p><strong>الحالة:</strong> {contractStatus === 'COMPLETED' ? 'مكتمل' : 'منتهي'}</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                <p className="font-semibold text-amber-900 mb-1">⚠️ ملاحظة مهمة:</p>
                <ul className="list-disc list-inside text-amber-800 space-y-1">
                  <li>سيتم نقل العقد إلى الأرشيف</li>
                  <li>يمكنك استعادة العقد لاحقاً إذا لزم الأمر</li>
                  <li>لن يؤثر على احتساب راتب العاملة</li>
                  <li>سيتم حذف العقد من القائمة النشطة</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowConfirm(false)}
                variant="secondary"
                disabled={isArchiving}
                className="px-6 py-2"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleArchive}
                variant="primary"
                disabled={isArchiving}
                className="bg-amber-600 hover:bg-amber-700 px-6 py-2"
              >
                {isArchiving ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Archive className="w-4 h-4 ml-2" />
                    تأكيد الأرشفة
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
