
"use client";
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

interface ContractForm {
  contractNumber: string;
  startDate: string;
  endDate: string;
  packageType: string;
  packageName: string;
  totalAmount: number | string;
  notes: string;
  delayDays: number | string;
  penaltyAmount: number | string;
  penaltyRate: number | string;
  clientName: string;
  workerName: string;
  status: string;
}

export default function EditContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [form, setForm] = useState<ContractForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // جلب بيانات العقد عند تحميل الصفحة
  useEffect(() => {
    fetch(`/api/contracts/${id}`)
      .then(res => res.json())
      .then(data => {
        setForm({
          contractNumber: data.contractNumber || '',
          startDate: data.startDate?.slice(0, 10) || '',
          endDate: data.endDate?.slice(0, 10) || '',
          packageType: data.packageType || '',
          packageName: data.packageName || '',
          totalAmount: data.totalAmount || '',
          notes: data.notes || '',
          delayDays: data.delayDays || 0,
          penaltyAmount: data.penaltyAmount || 0,
          penaltyRate: data.penaltyRate || 120,
          clientName: data.client?.name || '',
          workerName: data.worker?.name || '',
          status: data.status || 'ACTIVE',
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!form) return;
    setForm({ ...form, [e.target.name]: e.target.value } as typeof form);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form) return;
    
    // التحقق من أن العقد ليس مكتملاً (لا يمكن تعديل عقد مكتمل)
    if (form.status === 'COMPLETED') {
      setError('لا يمكن تعديل عقد مكتمل. يرجى استعادته من الأرشيف أولاً إذا لزم الأمر.');
      return;
    }
    
    try {
      const res = await fetch(`/api/contracts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractNumber: form.contractNumber,
          startDate: form.startDate,
          endDate: form.endDate,
          packageType: form.packageType,
          packageName: form.packageName,
          totalAmount: Number(form.totalAmount),
          notes: form.notes,
          delayDays: Number(form.delayDays),
          penaltyAmount: Number(form.penaltyAmount),
          penaltyRate: Number(form.penaltyRate),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.push(`/contracts/${id}`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message || 'حدث خطأ أثناء الحفظ');
    }
  };

  if (loading) return <DashboardLayout><div className="p-8 text-center"><div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div><p className="mt-4 text-gray-700">جاري التحميل...</p></div></DashboardLayout>;
  if (!form) return <DashboardLayout><div className="p-8 text-red-600 text-center font-semibold">❌ تعذر تحميل بيانات العقد</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">تعديل بيانات العقد</h1>
        
        {form.status === 'COMPLETED' && (
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
            <p className="text-yellow-800 font-semibold">
              ⚠️ تنبيه: هذا عقد مكتمل. لا يمكن تعديله إلا بعد استعادته من الأرشيف.
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* معلومات الأطراف */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
            <div>
              <label className="block mb-1 text-gray-900 font-semibold">العميل</label>
              <input 
                type="text" 
                value={form.clientName} 
                className="w-full border rounded px-4 py-2 text-gray-900 font-semibold bg-gray-100" 
                disabled 
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-900 font-semibold">العاملة</label>
              <input 
                type="text" 
                value={form.workerName} 
                className="w-full border rounded px-4 py-2 text-gray-900 font-semibold bg-gray-100" 
                disabled 
              />
            </div>
          </div>

          {/* تفاصيل العقد */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block mb-1 text-gray-900 font-semibold">رقم العقد الرسمي</label>
              <input 
                type="text" 
                name="contractNumber" 
                value={form.contractNumber} 
                onChange={handleChange} 
                className="w-full border-2 rounded px-4 py-2 text-gray-900 font-semibold bg-white focus:border-blue-500"
                disabled={form.status === 'COMPLETED'}
                placeholder="اختياري"
              />
            </div>
            
            <div>
              <label className="block mb-1 text-gray-900 font-semibold">نوع الباقة</label>
              <input 
                type="text" 
                name="packageType" 
                value={form.packageType} 
                onChange={handleChange} 
                className="w-full border-2 rounded px-4 py-2 text-gray-900 font-semibold bg-white focus:border-blue-500"
                disabled={form.status === 'COMPLETED'}
              />
            </div>
            
            <div>
              <label className="block mb-1 text-gray-900 font-semibold">اسم الباقة</label>
              <input 
                type="text" 
                name="packageName" 
                value={form.packageName} 
                onChange={handleChange} 
                className="w-full border-2 rounded px-4 py-2 text-gray-900 font-semibold bg-white focus:border-blue-500"
                disabled={form.status === 'COMPLETED'}
              />
            </div>
            
            <div>
              <label className="block mb-1 text-gray-900 font-semibold">المبلغ الإجمالي (ريال)</label>
              <input 
                type="number" 
                name="totalAmount" 
                value={form.totalAmount} 
                onChange={handleChange} 
                className="w-full border-2 rounded px-4 py-2 text-gray-900 font-semibold bg-white focus:border-blue-500"
                min="0"
                disabled={form.status === 'COMPLETED'}
              />
            </div>
          </div>

          {/* التواريخ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block mb-1 text-gray-900 font-semibold">تاريخ البداية</label>
              <input 
                type="date" 
                name="startDate" 
                value={form.startDate} 
                onChange={handleChange} 
                className="w-full border-2 rounded px-4 py-2 text-gray-900 font-semibold bg-white focus:border-blue-500"
                required
                disabled={form.status === 'COMPLETED'}
              />
            </div>
            
            <div>
              <label className="block mb-1 text-gray-900 font-semibold">تاريخ النهاية</label>
              <input 
                type="date" 
                name="endDate" 
                value={form.endDate} 
                onChange={handleChange} 
                className="w-full border-2 rounded px-4 py-2 text-gray-900 font-semibold bg-white focus:border-blue-500"
                required
                disabled={form.status === 'COMPLETED'}
              />
            </div>
          </div>

          {/* معلومات الغرامة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-6 bg-red-50 rounded-lg border-2 border-red-200">
            <div>
              <label className="block mb-1 text-gray-900 font-semibold">معدل الغرامة اليومية (ريال)</label>
              <input 
                type="number" 
                name="penaltyRate" 
                value={form.penaltyRate} 
                onChange={handleChange} 
                className="w-full border-2 rounded px-4 py-2 text-gray-900 font-semibold bg-white focus:border-red-500"
                disabled={form.status === 'COMPLETED'}
              />
              <p className="text-xs text-gray-600 mt-1">الافتراضي: 120 ريال/يوم</p>
            </div>
            
            <div>
              <label className="block mb-1 text-gray-900 font-semibold">عدد أيام التأخير</label>
              <input 
                type="number" 
                name="delayDays" 
                value={form.delayDays} 
                onChange={handleChange} 
                className="w-full border-2 rounded px-4 py-2 text-gray-900 font-semibold bg-white focus:border-red-500"
                disabled={form.status === 'COMPLETED'}
              />
            </div>
            
            <div>
              <label className="block mb-1 text-gray-900 font-semibold">إجمالي الغرامة (ريال)</label>
              <input 
                type="number" 
                name="penaltyAmount" 
                value={form.penaltyAmount} 
                onChange={handleChange} 
                className="w-full border-2 rounded px-4 py-2 text-gray-900 font-semibold bg-white focus:border-red-500"
                disabled={form.status === 'COMPLETED'}
              />
            </div>
          </div>

          {/* الملاحظات */}
          <div className="mb-6">
            <label className="block mb-1 text-gray-900 font-semibold">ملاحظات</label>
            <textarea 
              name="notes" 
              value={form.notes} 
              onChange={handleChange} 
              className="w-full border-2 rounded px-4 py-2 text-gray-900 font-semibold bg-white focus:border-blue-500"
              rows={4}
              disabled={form.status === 'COMPLETED'}
              placeholder="أي ملاحظات إضافية على العقد..."
            />
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-400 rounded-lg">
              <p className="text-red-800 font-semibold">{error}</p>
            </div>
          )}
          
          <div className="flex gap-4">
            <button 
              type="submit" 
              className="bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-indigo-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={form.status === 'COMPLETED'}
            >
              💾 حفظ التعديلات
            </button>
            
            <button 
              type="button"
              onClick={() => router.push(`/contracts/${id}`)}
              className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-bold shadow hover:bg-gray-300 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
