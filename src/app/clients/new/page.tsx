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
  birthYear: z.string().min(4, 'سنة الميلاد مطلوبة'),
  birthMonth: z.string().min(1, 'شهر الميلاد مطلوب'),
  birthDay: z.string().min(1, 'يوم الميلاد مطلوب'),
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
      const mm = data.birthMonth.padStart(2, '0');
      const dd = data.birthDay.padStart(2, '0');
      const dateOfBirth = `${data.birthYear}-${mm}-${dd}`;
      const payload = {
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        idNumber: data.idNumber,
        dateOfBirth,
      };
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      router.push('/clients');
      router.refresh();
    } catch (error) {
      console.error('Error creating client:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div dir="rtl" className="max-w-2xl mx-auto text-right">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">إضافة عميل جديد</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Input
              label="الاسم"
              placeholder="أدخل اسم العميل"
              className="text-right"
              {...register('name')}
              error={errors.name?.message}
            />
          </div>

          <div>
            <Input
              label="رقم الهوية"
              placeholder="أدخل رقم الهوية"
              className="text-right"
              inputMode="numeric"
              pattern="[0-9]*"
              {...register('idNumber')}
              error={errors.idNumber?.message}
            />
          </div>

          <div>
            <Input
              label="رقم الجوال"
              placeholder="05xxxxxxxx"
              className="text-right"
              inputMode="numeric"
              pattern="[0-9]*"
              {...register('phone')}
              error={errors.phone?.message}
            />
          </div>

          <div>
            <Input
              label="البريد الإلكتروني (اختياري)"
              placeholder="email@example.com"
              type="email"
              className="text-right"
              {...register('email')}
              error={errors.email?.message}
            />
          </div>

          <div>
            <Input
              label="العنوان"
              placeholder="أدخل العنوان"
              className="text-right"
              {...register('address')}
              error={errors.address?.message}
            />
          </div>

          <div>
            <label className="block text-base font-bold text-indigo-900 mb-2">تاريخ الميلاد</label>
            <div className="flex gap-2">
              <Input
                label="سنة"
                type="number"
                min={1900}
                max={new Date().getFullYear()}
                required
                placeholder="YYYY"
                maxLength={4}
                className="text-right"
                inputMode="numeric"
                pattern="[0-9]*"
                {...register('birthYear')}
                error={errors.birthYear?.message}
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  if (input.value.length === 4) {
                    const next = document.querySelector<HTMLInputElement>('[name="birthMonth"]');
                    next?.focus();
                  }
                }}
              />
              <Input
                label="شهر"
                type="number"
                min={1}
                max={12}
                required
                placeholder="MM"
                maxLength={2}
                className="text-right"
                inputMode="numeric"
                pattern="[0-9]*"
                {...register('birthMonth')}
                error={errors.birthMonth?.message}
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  if (input.value.length === 2) {
                    const next = document.querySelector<HTMLInputElement>('[name="birthDay"]');
                    next?.focus();
                  }
                }}
              />
              <Input
                label="يوم"
                type="number"
                min={1}
                max={31}
                required
                placeholder="DD"
                maxLength={2}
                className="text-right"
                inputMode="numeric"
                pattern="[0-9]*"
                {...register('birthDay')}
                error={errors.birthDay?.message}
              />
            </div>
          </div>

          <div className="flex justify-end flex-row-reverse gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}