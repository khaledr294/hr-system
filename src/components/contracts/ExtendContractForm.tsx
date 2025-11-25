"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Contract {
  id: string;
  clientId: string;
  workerId: string;
  startDate: Date;
  endDate: Date;
  packageType: string;
  packageName?: string | null;
  totalAmount: number;
  notes?: string | null;
  client: {
    id: string;
    name: string;
  };
  worker: {
    id: string;
    name: string;
  };
}

interface ExtendContractFormProps {
  contract: Contract;
}

export default function ExtendContractForm({ contract }: ExtendContractFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    newEndDate: '',
    extensionPeriod: '30', // بالأيام (شهر)
    packageType: contract.packageType,
    packageName: contract.packageName || '',
    totalAmount: contract.totalAmount,
    notes: contract.notes || '',
    additionalAmount: 0,
  });

  // حساب التاريخ الجديد عند تغيير فترة التمديد
  const handleExtensionPeriodChange = (days: string) => {
    const currentEndDate = new Date(contract.endDate);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() + parseInt(days));
    
    // Format as YYYY-MM-DD for date input
    const year = newEndDate.getFullYear();
    const month = (newEndDate.getMonth() + 1).toString().padStart(2, '0');
    const day = newEndDate.getDate().toString().padStart(2, '0');
    
    setFormData(prev => ({
      ...prev,
      extensionPeriod: days,
      newEndDate: `${year}-${month}-${day}`
    }));
  };

  const handleDateChange = (value: string) => {
    setFormData(prev => ({ ...prev, newEndDate: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // التحقق من صحة التاريخ
      if (!formData.newEndDate) {
        alert('يرجى إدخال تاريخ النهاية الجديد');
        setIsLoading(false);
        return;
      }

      const newEndDate = new Date(formData.newEndDate);
      
      if (newEndDate <= contract.endDate) {
        alert('تاريخ النهاية الجديد يجب أن يكون بعد تاريخ النهاية الحالي');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/contracts/${contract.id}/extend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newEndDate: newEndDate.toISOString(),
          packageType: formData.packageType,
          packageName: formData.packageName,
          totalAmount: formData.totalAmount + formData.additionalAmount,
          notes: formData.notes,
          additionalAmount: formData.additionalAmount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل في تمديد العقد');
      }

      router.push(`/contracts/${contract.id}?success=contract_extended`);
    } catch (error) {
      console.error('خطأ في تمديد العقد:', error);
      alert(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">تفاصيل التمديد</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            فترة التمديد
          </label>
          <select
            value={formData.extensionPeriod}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleExtensionPeriodChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="3">3 أيام</option>
            <option value="7">أسبوع (7 أيام)</option>
            <option value="15">15 يوم</option>
            <option value="30">شهر (30 يوم)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تاريخ النهاية الجديد
          </label>
          <input
            type="date"
            value={formData.newEndDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDateChange(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">اختر التاريخ من التقويم</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع الباقة (يمكن التعديل)
          </label>
          <Input
            type="text"
            value={formData.packageName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, packageName: e.target.value }))}
            placeholder="اسم الباقة الجديدة"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            مبلغ إضافي للتمديد
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={formData.additionalAmount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, additionalAmount: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            إجمالي المبلغ الجديد: {(formData.totalAmount + formData.additionalAmount).toLocaleString('ar-SA')} ريال
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ملاحظات التمديد
          </label>
          <textarea
            rows={4}
            value={formData.notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="أضف ملاحظات حول التمديد..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          إلغاء
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'جاري التمديد...' : 'تأكيد التمديد'}
        </Button>
      </div>
    </form>
  );
}
