
"use client";
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export default function EditContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [form, setForm] = useState<{ startDate: string; endDate: string; totalAmount: number | string; notes: string; clientName: string; workerName: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // جلب بيانات العقد عند تحميل الصفحة
  useEffect(() => {
    fetch(`/api/contracts/${id}`)
      .then(res => res.json())
      .then(data => {
        setForm({
          startDate: data.startDate?.slice(0, 10) || '',
          endDate: data.endDate?.slice(0, 10) || '',
          totalAmount: data.totalAmount || '',
          notes: data.notes || '',
          clientName: data.client?.name || '',
          workerName: data.worker?.name || '',
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!form) return;
    setForm({ ...form, [e.target.name]: e.target.value } as typeof form);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form) return;
    try {
  const res = await fetch(`/api/contracts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: form.startDate,
          endDate: form.endDate,
          totalAmount: Number(form.totalAmount),
          notes: form.notes,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
  router.push(`/contracts/${id}`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message || 'حدث خطأ أثناء الحفظ');
    }
  };

  if (loading) return <DashboardLayout><div className="p-8">جاري التحميل...</div></DashboardLayout>;
  if (!form) return <DashboardLayout><div className="p-8 text-red-600">تعذر تحميل بيانات العقد</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">تعديل بيانات العقد</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 text-gray-900 font-semibold">العميل</label>
            <input type="text" value={form.clientName} className="w-full border rounded px-4 py-2 text-gray-900 font-semibold bg-gray-50" disabled />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-900 font-semibold">العاملة</label>
            <input type="text" value={form.workerName} className="w-full border rounded px-4 py-2 text-gray-900 font-semibold bg-gray-50" disabled />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-900 font-semibold">تاريخ البداية</label>
            <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="w-full border rounded px-4 py-2 text-gray-900 font-semibold bg-white" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-900 font-semibold">تاريخ النهاية</label>
            <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="w-full border rounded px-4 py-2 text-gray-900 font-semibold bg-white" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-900 font-semibold">المبلغ الإجمالي</label>
            <input type="number" name="totalAmount" value={form.totalAmount} onChange={handleChange} className="w-full border rounded px-4 py-2 text-gray-900 font-semibold bg-white" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-900 font-semibold">ملاحظات</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full border rounded px-4 py-2 text-gray-900 font-semibold bg-white" rows={3} />
          </div>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          <button type="submit" className="bg-indigo-700 text-white px-6 py-2 rounded font-bold shadow">حفظ التعديلات</button>
        </form>
      </div>
    </DashboardLayout>
  );
}
