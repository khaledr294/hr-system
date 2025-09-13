'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

// specialization removed

const nationalities = [
  { value: 'PHILIPPINES', label: 'الفلبين' },
  { value: 'INDONESIA', label: 'إندونيسيا' },
  { value: 'BANGLADESH', label: 'بنغلاديش' },
  { value: 'SRI_LANKA', label: 'سريلانكا' },
];

export default function NewWorkerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      code: formData.get('code'),
      name: formData.get('name'),
      nationality: formData.get('nationality'),
      passportNumber: formData.get('passportNumber'),
      dateOfBirth: formData.get('dateOfBirth'),
  // specialization removed
      salary: parseFloat(formData.get('salary') as string),
    };

    try {
      const response = await fetch('/api/workers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create worker');
      }

      router.push('/workers');
      router.refresh();
    } catch (error) {
      setError('حدث خطأ أثناء إضافة العامل. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          إضافة عامل جديد
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <Input
            label="الكود"
            name="code"
            type="text"
            required
            placeholder="أدخل كود العامل"
          />

          <Input
            label="الاسم"
            name="name"
            type="text"
            required
            placeholder="أدخل اسم العامل"
          />

          <Select
            label="الجنسية"
            name="nationality"
            options={nationalities}
            required
          />

          <Input
            label="رقم جواز السفر"
            name="passportNumber"
            type="text"
            required
            placeholder="أدخل رقم جواز السفر"
          />

          <Input
            label="تاريخ الميلاد"
            name="dateOfBirth"
            type="date"
            required
          />

          {/* specialization removed */}

          <Input
            label="الراتب الشهري"
            name="salary"
            type="number"
            required
            min="0"
            step="0.01"
            placeholder="أدخل الراتب الشهري"
          />

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex items-center space-x-4 space-x-reverse">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'جاري الإضافة...' : 'إضافة العامل'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}