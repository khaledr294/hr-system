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
    extensionPeriod: '6', // بالأشهر
    packageType: contract.packageType,
    packageName: contract.packageName || '',
    totalAmount: contract.totalAmount,
    notes: contract.notes || '',
    additionalAmount: 0,
  });

  // حساب التاريخ الجديد عند تغيير فترة التمديد
  const handleExtensionPeriodChange = (months: string) => {
    const currentEndDate = new Date(contract.endDate);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setMonth(newEndDate.getMonth() + parseInt(months));
    
    const day = newEndDate.getDate().toString().padStart(2, '0');
    const month = (newEndDate.getMonth() + 1).toString().padStart(2, '0');
    const year = newEndDate.getFullYear();
    
    setFormData(prev => ({
      ...prev,
      extensionPeriod: months,
      newEndDate: `${day}/${month}/${year}`
    }));
  };

  // تنسيق تاريخ الإدخال
  const formatDateInput = (value: string) => {
    const numbersOnly = value.replace(/\D/g, '');
    if (numbersOnly.length >= 2) {
      let formatted = numbersOnly.substring(0, 2);
      if (numbersOnly.length >= 4) {
        formatted += '/' + numbersOnly.substring(2, 4);
        if (numbersOnly.length >= 6) {
          formatted += '/' + numbersOnly.substring(4, 8);
        }
      }
      return formatted;
    }
    return numbersOnly;
  };

  const handleDateChange = (value: string) => {
    const formatted = formatDateInput(value);
    setFormData(prev => ({ ...prev, newEndDate: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // التحقق من صحة التاريخ
      const dateParts = formData.newEndDate.split('/');
      if (dateParts.length !== 3) {
        alert('يرجى إدخال تاريخ صحيح بصيغة يوم/شهر/سنة');
        return;
      }

      const [day, month, year] = dateParts;
      const newEndDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      if (newEndDate <= contract.endDate) {
        alert('تاريخ النهاية الجديد يجب أن يكون بعد تاريخ النهاية الحالي');
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
            فترة التمديد (بالأشهر)
          </label>
          <select
            value={formData.extensionPeriod}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleExtensionPeriodChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="3">3 أشهر</option>
            <option value="6">6 أشهر</option>
            <option value="12">سنة كاملة</option>
            <option value="24">سنتان</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تاريخ النهاية الجديد
          </label>
          <Input
            type="text"
            placeholder="يوم/شهر/سنة (مثال: 15/12/2025)"
            value={formData.newEndDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDateChange(e.target.value)}
            maxLength={10}
            required
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">تنسيق: يوم/شهر/سنة</p>
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