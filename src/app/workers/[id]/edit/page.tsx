'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

interface NationalitySalary {
  id: string;
  nationality: string;
  salary: number;
}

interface Worker {
  id: string;
  code: string;
  name: string;
  nationality: string;
  residencyNumber: string;
  dateOfBirth: string;
  phone: string;
  status: string;
  nationalitySalaryId: string | null;
  borderNumber?: string | null;
  officeName?: string | null;
  arrivalDate?: string | null;
  passportNumber?: string | null;
  religion?: string | null;
  iban?: string | null;
  residenceBranch?: string | null;
}

export default function EditWorkerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [worker, setWorker] = useState<Worker | null>(null);
  const [nationalities, setNationalities] = useState<NationalitySalary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load worker data and nationalities
    const loadData = async () => {
      try {
        const [workerResponse, nationalitiesResponse] = await Promise.all([
          fetch(`/api/workers/${id}`),
          fetch('/api/nationality-salary')
        ]);

        if (workerResponse.ok) {
          const workerData = await workerResponse.json();
          setWorker(workerData);
        } else {
          setError('تعذر تحميل بيانات العاملة');
        }

        if (nationalitiesResponse.ok) {
          const nationalitiesData = await nationalitiesResponse.json();
          setNationalities(nationalitiesData);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    // Combine birth date fields
    const name = (formData.get('name') as string)?.trim();
    const nationality = (formData.get('nationality') as string)?.trim();
    const residencyNumber = (formData.get('residencyNumber') as string)?.trim();
    const phone = (formData.get('phone') as string)?.trim();
    const birthYear = formData.get('birthYear') as string;
    const birthMonth = formData.get('birthMonth') as string;
    const birthDay = formData.get('birthDay') as string;

    // Additional fields
    const borderNumber = (formData.get('borderNumber') as string)?.trim();
    const officeName = (formData.get('officeName') as string)?.trim();
    const arrivalDate = formData.get('arrivalDate') as string;
    const passportNumber = (formData.get('passportNumber') as string)?.trim();
    const religion = (formData.get('religion') as string)?.trim();
    const iban = (formData.get('iban') as string)?.trim();
    const residenceBranch = (formData.get('residenceBranch') as string)?.trim();

    // Validation
    if (!name || !nationality || !residencyNumber || !phone || !birthYear || !birthMonth || !birthDay) {
      setError('جميع الحقول الأساسية مطلوبة');
      setIsSubmitting(false);
      return;
    }

    // Format date of birth
    const dateOfBirth = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;

    try {
      const payload = {
        name,
        nationality,
        residencyNumber,
        dateOfBirth,
        phone,
        borderNumber: borderNumber || null,
        officeName: officeName || null,
        arrivalDate: arrivalDate || null,
        passportNumber: passportNumber || null,
        religion: religion || null,
        iban: iban || null,
        residenceBranch: residenceBranch || null,
      };

      const response = await fetch(`/api/workers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push(`/workers/${id}`);
        router.refresh();
      } else {
        const errorText = await response.text();
        setError(errorText || 'حدث خطأ في تحديث بيانات العاملة');
      }
    } catch (err) {
      console.error('Error updating worker:', err);
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !worker) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <p className="text-red-600">{error}</p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            className="mt-4"
          >
            رجوع
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!worker) {
    return null;
  }

  // Parse date of birth
  const dateOfBirth = worker.dateOfBirth ? new Date(worker.dateOfBirth) : null;
  const birthYear = dateOfBirth?.getFullYear().toString() || '';
  const birthMonth = dateOfBirth ? (dateOfBirth.getMonth() + 1).toString() : '';
  const birthDay = dateOfBirth?.getDate().toString() || '';

  // Parse arrival date if exists
  const arrivalDate = worker.arrivalDate ? new Date(worker.arrivalDate).toISOString().split('T')[0] : '';

  return (
    <DashboardLayout>
      <div dir="rtl" className="max-w-2xl mx-auto text-right">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">تعديل بيانات العاملة</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* كود العاملة - معطل */}
          <div>
            <label className="block text-base font-bold text-indigo-900 mb-2">كود العاملة</label>
            <input
              type="text"
              value={worker.code}
              disabled
              className="block w-full rounded-md border-2 border-gray-300 bg-gray-100 shadow-sm px-3 py-2 text-lg font-semibold text-gray-500 cursor-not-allowed"
            />
            <p className="mt-1 text-sm text-gray-500">* الكود لا يمكن تعديله</p>
          </div>

          <Input
            label="اسم العاملة"
            name="name"
            type="text"
            required
            placeholder="أدخل اسم العاملة"
            defaultValue={worker.name}
            className="text-right"
          />

          <Select
            label="الجنسية"
            name="nationality"
            required
            defaultValue={worker.nationality}
            className="text-right"
            options={nationalities.map((nat) => ({
              value: nat.nationality,
              label: nat.nationality,
            }))}
          />

          <Input
            label="رقم الإقامة"
            name="residencyNumber"
            type="text"
            required
            placeholder="أدخل رقم الإقامة"
            defaultValue={worker.residencyNumber}
            className="text-right"
            inputMode="numeric"
            pattern="[0-9]*"
          />

          <div>
            <label className="block text-base font-bold text-indigo-900 mb-2">تاريخ الميلاد</label>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="سنة"
                name="birthYear"
                type="number"
                min={1960}
                max={2010}
                required
                placeholder="YYYY"
                defaultValue={birthYear}
                className="text-right"
              />
              <Input
                label="شهر"
                name="birthMonth"
                type="number"
                min={1}
                max={12}
                required
                placeholder="MM"
                defaultValue={birthMonth}
                className="text-right"
              />
              <Input
                label="يوم"
                name="birthDay"
                type="number"
                min={1}
                max={31}
                required
                placeholder="DD"
                defaultValue={birthDay}
                className="text-right"
              />
            </div>
          </div>

          <Input
            label="رقم الجوال"
            name="phone"
            type="tel"
            required
            placeholder="أدخل رقم الجوال"
            defaultValue={worker.phone}
            className="text-right"
            inputMode="numeric"
            pattern="[0-9]*"
          />

          {/* حقول إضافية */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">بيانات إضافية</h3>
            
            <div className="space-y-6">
              <Input
                label="رقم الحدود"
                name="borderNumber"
                type="text"
                placeholder="أدخل رقم الحدود (اختياري)"
                defaultValue={worker.borderNumber || ''}
                className="text-right"
              />

              <Input
                label="اسم المكتب"
                name="officeName"
                type="text"
                placeholder="أدخل اسم المكتب (اختياري)"
                defaultValue={worker.officeName || ''}
                className="text-right"
              />

              <Input
                label="تاريخ الوصول"
                name="arrivalDate"
                type="date"
                placeholder="أدخل تاريخ الوصول (اختياري)"
                defaultValue={arrivalDate}
                className="text-right"
              />

              <Input
                label="رقم الجواز"
                name="passportNumber"
                type="text"
                placeholder="أدخل رقم الجواز (اختياري)"
                defaultValue={worker.passportNumber || ''}
                className="text-right"
              />

              <Input
                label="الديانة"
                name="religion"
                type="text"
                placeholder="أدخل الديانة (اختياري)"
                defaultValue={worker.religion || ''}
                className="text-right"
              />

              <Input
                label="IBAN"
                name="iban"
                type="text"
                placeholder="أدخل رقم الحساب البنكي IBAN (اختياري)"
                defaultValue={worker.iban || ''}
                className="text-right"
              />

              <Input
                label="فرع السكن"
                name="residenceBranch"
                type="text"
                placeholder="أدخل فرع السكن (اختياري)"
                defaultValue={worker.residenceBranch || ''}
                className="text-right"
              />
            </div>
          </div>

          <div className="flex justify-end flex-row-reverse gap-3 pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}