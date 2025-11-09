'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function NewMarketerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/marketers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(await response.text());
      router.push('/marketers');
      router.refresh();
    } catch {
      // handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div dir="rtl" className="max-w-xl mx-auto text-right">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">إضافة مسوق جديد</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="الاسم"
            className="text-right"
            {...register('name', { required: 'الاسم مطلوب' })}
            error={errors.name?.message as string}
          />
          <Input
            label="رقم الجوال"
            className="text-right"
            inputMode="numeric"
            pattern="[0-9]*"
            {...register('phone', { required: 'رقم الجوال مطلوب' })}
            error={errors.phone?.message as string}
          />
          <Input
            label="البريد الإلكتروني (اختياري)"
            type="email"
            className="text-right"
            {...register('email')}
            error={errors.email?.message as string}
          />
          <div className="flex justify-end flex-row-reverse gap-3">
            <Button type="button" variant="secondary" onClick={() => router.back()}>إلغاء</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'جاري الحفظ...' : 'حفظ'}</Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
