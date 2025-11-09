'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

interface NationalitySalary {
  id: string;
  nationality: string;
  salary: number;
}

export default function NewWorkerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [nationalities, setNationalities] = useState<NationalitySalary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load nationalities from NationalitySalary table
    const loadNationalities = async () => {
      try {
        const response = await fetch('/api/nationality-salary');
        if (response.ok) {
          const data = await response.json();
          setNationalities(data);
        }
      } catch (err) {
        console.error('Failed to load nationalities:', err);
      } finally {
        setLoading(false);
      }
    };
    loadNationalities();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    

    // Combine birth date fields
    const name = (formData.get('name') as string)?.trim();
    const codeStr = (formData.get('code') as string)?.trim();
    const nationality = (formData.get('nationality') as string)?.trim();
    const residencyNumber = (formData.get('residencyNumber') as string)?.trim();
    const birthYear = (formData.get('birthYear') as string)?.trim();
    const birthMonth = (formData.get('birthMonth') as string)?.trim();
    const birthDay = (formData.get('birthDay') as string)?.trim();
    const phone = (formData.get('phone') as string)?.trim();

    let dateOfBirthStr = '';
    if (birthYear && birthMonth && birthDay) {
      // Pad month and day to 2 digits
      const mm = birthMonth.padStart(2, '0');
      const dd = birthDay.padStart(2, '0');
      dateOfBirthStr = `${birthYear}-${mm}-${dd}`;
    }

    if (!name || !codeStr || !nationality || !residencyNumber || !birthYear || !birthMonth || !birthDay) {
      setError('جميع الحقول المطلوبة يجب ملؤها');
      setIsSubmitting(false);
      return;
    }

    // Validate and convert code
    const code = parseInt(codeStr);
    if (isNaN(code) || code <= 0) {
      setError('رقم العاملة يجب أن يكون رقماً صحيحاً أكبر من صفر');
      setIsSubmitting(false);
      return;
    }

    // Validate and convert date
    const dateOfBirth = new Date(dateOfBirthStr);
    if (isNaN(dateOfBirth.getTime())) {
      setError('تاريخ الميلاد غير صحيح');
      setIsSubmitting(false);
      return;
    }

    // حقول إضافية جديدة
    const borderNumber = (formData.get('borderNumber') as string)?.trim();
    const officeName = (formData.get('officeName') as string)?.trim();
    const arrivalDateStr = (formData.get('arrivalDate') as string)?.trim();
    const passportNumber = (formData.get('passportNumber') as string)?.trim();
    const religion = (formData.get('religion') as string)?.trim();
    const iban = (formData.get('iban') as string)?.trim();
    const residenceBranch = (formData.get('residenceBranch') as string)?.trim();

    // تحويل تاريخ الوصول إلى Date إذا كان موجوداً
    let arrivalDate = null;
    if (arrivalDateStr) {
      arrivalDate = new Date(arrivalDateStr);
      if (isNaN(arrivalDate.getTime())) {
        setError('تاريخ الوصول غير صحيح');
        setIsSubmitting(false);
        return;
      }
    }

    const data = {
      name,
      code,
      nationality,
      residencyNumber,
      dateOfBirth,
      phone: phone || null,
      borderNumber: borderNumber || null,
      officeName: officeName || null,
      arrivalDate: arrivalDate,
      passportNumber: passportNumber || null,
      religion: religion || null,
      iban: iban || null,
      residenceBranch: residenceBranch || null,
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
        const errorText = await response.text();
        console.error('API Error:', errorText);
        
        if (errorText.includes('residency number already exists')) {
          setError('رقم الإقامة مستخدم بالفعل. يرجى إدخال رقم إقامة آخر.');
        } else if (errorText.includes('code already exists')) {
          setError('رقم العاملة مستخدم بالفعل. يرجى إدخال رقم آخر.');
        } else if (errorText.includes('Missing required field')) {
          setError('جميع الحقول مطلوبة. يرجى التأكد من ملء جميع البيانات.');
        } else if (errorText.includes('Invalid worker code')) {
          setError('رقم العاملة غير صحيح. يرجى إدخال رقم صحيح.');
        } else if (errorText.includes('Invalid date of birth')) {
          setError('تاريخ الميلاد غير صحيح. يرجى إدخال تاريخ صحيح.');
        } else if (errorText.includes('Unauthorized')) {
          setError('ليس لديك صلاحية لإضافة عاملة جديدة.');
        } else {
          setError(`حدث خطأ: ${errorText}`);
        }
        return;
      }

      router.push('/workers');
      router.refresh();
    } catch (err) {
      console.error('Error creating worker:', err);
      setError('حدث خطأ أثناء إضافة العاملة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">جاري التحميل...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div dir="rtl" className="bg-white shadow rounded-lg p-6 text-right">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          إضافة عاملة جديدة
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mr-auto">
          <Input
            label="الاسم"
            name="name"
            type="text"
            required
            placeholder="أدخل اسم العاملة"
            className="text-right"
          />

          <Input
            label="رقم العاملة"
            name="code"
            type="number"
            required
            placeholder="أدخل رقم العاملة (مثال: 1001)"
            className="text-right"
            inputMode="numeric"
            pattern="[0-9]*"
          />

          <Select
            label="الجنسية"
            name="nationality"
            options={nationalities.map(nat => ({
              value: nat.nationality,
              label: nat.nationality
            }))}
            required
            className="text-right"
          />

          <Input
            label="رقم الإقامة"
            name="residencyNumber"
            type="text"
            required
            placeholder="أدخل رقم الإقامة"
            className="text-right"
          />

          <div className="flex gap-2">
            <Input
              label="تاريخ الميلاد (سنة)"
              name="birthYear"
              type="number"
              min={1900}
              max={new Date().getFullYear()}
              required
              placeholder="YYYY"
              maxLength={4}
              className="text-right"
              inputMode="numeric"
              pattern="[0-9]*"
              onInput={e => {
                const input = e.target as HTMLInputElement;
                if (input.value.length === 4) {
                  const next = document.querySelector<HTMLInputElement>('[name="birthMonth"]');
                  next?.focus();
                }
              }}
            />
            <Input
              label="شهر"
              name="birthMonth"
              type="number"
              min={1}
              max={12}
              required
              placeholder="MM"
              maxLength={2}
              className="text-right"
              inputMode="numeric"
              pattern="[0-9]*"
              onInput={e => {
                const input = e.target as HTMLInputElement;
                if (input.value.length === 2) {
                  const next = document.querySelector<HTMLInputElement>('[name="birthDay"]');
                  next?.focus();
                }
              }}
            />
            <Input
              label="يوم"
              name="birthDay"
              type="number"
              min={1}
              max={31}
              required
              placeholder="DD"
              maxLength={2}
              className="text-right"
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>

          <Input
            label="رقم الجوال"
            name="phone"
            type="tel"
            required
            placeholder="أدخل رقم الجوال"
            className="text-right"
            inputMode="numeric"
            pattern="[0-9]*"
          />

          {/* حقول إضافية جديدة */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">بيانات إضافية</h3>
            
            <div className="space-y-6">
              <Input
                label="رقم الحدود"
                name="borderNumber"
                type="text"
                placeholder="أدخل رقم الحدود (اختياري)"
                className="text-right"
              />

              <Input
                label="اسم المكتب"
                name="officeName"
                type="text"
                placeholder="أدخل اسم المكتب (اختياري)"
                className="text-right"
              />

              <Input
                label="تاريخ الوصول"
                name="arrivalDate"
                type="date"
                placeholder="أدخل تاريخ الوصول (اختياري)"
                className="text-right"
              />

              <Input
                label="رقم الجواز"
                name="passportNumber"
                type="text"
                placeholder="أدخل رقم الجواز (اختياري)"
                className="text-right"
              />

              <Input
                label="الديانة"
                name="religion"
                type="text"
                placeholder="أدخل الديانة (اختياري)"
                className="text-right"
              />

              <Input
                label="IBAN"
                name="iban"
                type="text"
                placeholder="أدخل رقم الحساب البنكي IBAN (اختياري)"
                className="text-right"
              />

              <Input
                label="فرع السكن"
                name="residenceBranch"
                type="text"
                placeholder="أدخل فرع السكن (اختياري)"
                className="text-right"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex justify-end flex-row-reverse gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'جاري الإضافة...' : 'إضافة العاملة'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
