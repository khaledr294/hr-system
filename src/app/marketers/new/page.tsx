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

  const onSubmit = async (data: any) => {
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
    } catch (error) {
      // handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">إضافة مسوق جديد</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input label="الاسم" {...register('name', { required: 'الاسم مطلوب' })} error={errors.name?.message} />
          <Input label="رقم الجوال" {...register('phone', { required: 'رقم الجوال مطلوب' })} error={errors.phone?.message} />
          <Input label="البريد الإلكتروني (اختياري)" type="email" {...register('email')} error={errors.email?.message} />
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="secondary" onClick={() => router.back()}>إلغاء</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'جاري الحفظ...' : 'حفظ'}</Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}