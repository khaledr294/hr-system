'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const clientSchema = z.object({
  name: z.string().min(1, 'يجب إدخال اسم العميل'),
  phone: z
    .string()
    .min(1, 'يجب إدخال رقم الجوال')
    .regex(/^05\d{8}$/, 'يجب أن يبدأ رقم الجوال بـ 05 ويتكون من 10 أرقام'),
  email: z
    .string()
    .email('البريد الإلكتروني غير صحيح')
    .optional()
    .or(z.literal('')),
  address: z.string().min(1, 'يجب إدخال العنوان'),
  idNumber: z
    .string()
    .min(1, 'يجب إدخال رقم الهوية')
    .regex(/^[12]\d{9}$/, 'رقم الهوية يجب أن يتكون من 10 أرقام ويبدأ بـ 1 أو 2'),
});

type ClientFormData = z.infer<typeof clientSchema>;

export default function NewClientPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  const onSubmit = async (data: ClientFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      router.push('/clients');
      router.refresh();
    } catch (error) {
      console.error('Error creating client:', error);
      // Handle error (show error message to user)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">إضافة عميل جديد</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Input
              label="الاسم"
              placeholder="أدخل اسم العميل"
              {...register('name')}
              error={errors.name?.message}
            />
          </div>

          <div>
            <Input
              label="رقم الهوية"
              placeholder="أدخل رقم الهوية"
              {...register('idNumber')}
              error={errors.idNumber?.message}
            />
          </div>

          <div>
            <Input
              label="رقم الجوال"
              placeholder="05xxxxxxxx"
              {...register('phone')}
              error={errors.phone?.message}
            />
          </div>

          <div>
            <Input
              label="البريد الإلكتروني (اختياري)"
              placeholder="email@example.com"
              type="email"
              {...register('email')}
              error={errors.email?.message}
            />
          </div>

          <div>
            <Input
              label="العنوان"
              placeholder="أدخل العنوان"
              {...register('address')}
              error={errors.address?.message}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}