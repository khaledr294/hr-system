'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  idNumber?: string | null;
  dateOfBirth?: string | null;
}

export default function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadClient = async () => {
      try {
        const response = await fetch(`/api/clients/${id}`);
        if (response.ok) {
          const data = await response.json();
          setClient(data);
        } else {
          setError('تعذر تحميل بيانات العميل');
        }
      } catch (err) {
        console.error('Failed to load client:', err);
        setError('حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    loadClient();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    const name = (formData.get('name') as string)?.trim();
    const idNumber = (formData.get('idNumber') as string)?.trim();
    const phone = (formData.get('phone') as string)?.trim();
    const email = (formData.get('email') as string)?.trim();
    const address = (formData.get('address') as string)?.trim();
    const birthYear = formData.get('birthYear') as string;
    const birthMonth = formData.get('birthMonth') as string;
    const birthDay = formData.get('birthDay') as string;

    // Validation
    if (!name || !phone) {
      setError('الاسم ورقم الجوال مطلوبان');
      setIsSubmitting(false);
      return;
    }

    // Format date of birth if provided
    let dateOfBirth = null;
    if (birthYear && birthMonth && birthDay) {
      dateOfBirth = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
    }

    try {
      const payload = {
        name,
        idNumber: idNumber || null,
        phone,
        email: email || null,
        address: address || null,
        dateOfBirth,
      };

      const response = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push(`/clients/${id}`);
        router.refresh();
      } else {
        const errorText = await response.text();
        setError(errorText || 'حدث خطأ في تحديث بيانات العميل');
      }
    } catch (err) {
      console.error('Error updating client:', err);
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

  if (error && !client) {
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

  if (!client) {
    return null;
  }

  // Parse date of birth if exists
  const dateOfBirth = client.dateOfBirth ? new Date(client.dateOfBirth) : null;
  const birthYear = dateOfBirth?.getFullYear().toString() || '';
  const birthMonth = dateOfBirth ? (dateOfBirth.getMonth() + 1).toString() : '';
  const birthDay = dateOfBirth?.getDate().toString() || '';

  return (
    <DashboardLayout>
      <div dir="rtl" className="max-w-2xl mx-auto text-right">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">تعديل بيانات العميل</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="اسم العميل"
            name="name"
            type="text"
            required
            placeholder="أدخل اسم العميل"
            defaultValue={client.name}
            className="text-right"
          />

          <Input
            label="رقم الهوية"
            name="idNumber"
            type="text"
            placeholder="أدخل رقم الهوية"
            defaultValue={client.idNumber || ''}
            className="text-right"
            inputMode="numeric"
            pattern="[0-9]*"
          />

          <Input
            label="رقم الجوال"
            name="phone"
            type="tel"
            required
            placeholder="أدخل رقم الجوال"
            defaultValue={client.phone}
            className="text-right"
            inputMode="numeric"
            pattern="[0-9]*"
          />

          <div>
            <label className="block text-base font-bold text-indigo-900 mb-2">تاريخ الميلاد (هجري)</label>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="سنة هجرية"
                name="birthYear"
                type="number"
                min={1300}
                max={1500}
                placeholder="مثال: 1420"
                defaultValue={birthYear}
                className="text-right"
              />
              <Input
                label="شهر"
                name="birthMonth"
                type="number"
                min={1}
                max={12}
                placeholder="MM"
                defaultValue={birthMonth}
                className="text-right"
              />
              <Input
                label="يوم"
                name="birthDay"
                type="number"
                min={1}
                max={30}
                placeholder="DD"
                defaultValue={birthDay}
                className="text-right"
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">* التاريخ بالهجري (مثال: 01/05/1420)</p>
          </div>

          <Input
            label="البريد الإلكتروني"
            name="email"
            type="email"
            placeholder="أدخل البريد الإلكتروني"
            defaultValue={client.email || ''}
            className="text-right"
          />

          <Input
            label="العنوان"
            name="address"
            type="text"
            placeholder="أدخل العنوان"
            defaultValue={client.address || ''}
            className="text-right"
          />

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
