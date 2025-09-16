
"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface NationalitySalary {
  id: string;
  nationality: string;
  salary: number;
}

interface WorkerData {
  id: string;
  code: number;
  name: string;
  nationality: string;
  residencyNumber: string;
  dateOfBirth: string;
  phone: string;
  status: string;
  nationalitySalaryId: string;
}

export default function EditWorkerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [worker, setWorker] = React.useState<WorkerData | null>(null);
  const [nationalities, setNationalities] = React.useState<NationalitySalary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    // Load worker data
    fetch(`/api/workers/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setWorker(data);
        setLoading(false);
      })
      .catch(() => {
        setError("تعذر تحميل بيانات العاملة");
        setLoading(false);
      });

    // Load nationalities
    fetch('/api/nationality-salary')
      .then((res) => res.json())
      .then((data) => {
        setNationalities(data);
      })
      .catch(() => {
        console.error('Failed to load nationalities');
      });
  }, [id]);

  if (loading) return <DashboardLayout><div className="max-w-xl mx-auto bg-white p-8 rounded shadow text-center">جاري التحميل...</div></DashboardLayout>;
  if (error || !worker) return <DashboardLayout><div className="max-w-xl mx-auto bg-white p-8 rounded shadow text-center text-red-600">{error || "العاملة غير موجودة"}</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto bg-white p-8 rounded shadow">
        <h1 className="text-3xl font-extrabold mb-8 text-indigo-700 text-center">تعديل بيانات العاملة</h1>
        <form
          action="#"
          method="POST"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            
            const form = e.currentTarget;
            const formData = new FormData(form);
            const data = {
              name: formData.get('name'),
              nationality: formData.get('nationality'),
              residencyNumber: formData.get('residencyNumber'),
              dateOfBirth: formData.get('dateOfBirth'),
              phone: formData.get('phone'),
            };
            
            try {
              const res = await fetch(`/api/workers/${worker.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });
              
              if (res.ok) {
                // Show success message and redirect to worker details
                const successDiv = document.createElement('div');
                successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                successDiv.innerHTML = '✅ تم حفظ التعديلات بنجاح! جاري التوجه لصفحة تفاصيل العاملة...';
                document.body.appendChild(successDiv);
                
                // Redirect after a short delay
                setTimeout(() => {
                  window.location.href = `/workers/${worker.id}`;
                }, 1500);
              } else {
                const errorData = await res.text();
                const errorDiv = document.createElement('div');
                errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                errorDiv.innerHTML = `❌ ${errorData || 'تعذر حفظ التعديلات'}`;
                document.body.appendChild(errorDiv);
                
                setTimeout(() => {
                  document.body.removeChild(errorDiv);
                }, 5000);
                
                setSaving(false);
              }
            } catch (error) {
              console.error('Error updating worker:', error);
              const errorDiv = document.createElement('div');
              errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
              errorDiv.innerHTML = '❌ حدث خطأ أثناء حفظ التعديلات. تحقق من الاتصال بالإنترنت.';
              document.body.appendChild(errorDiv);
              
              setTimeout(() => {
                document.body.removeChild(errorDiv);
              }, 5000);
              
              setSaving(false);
            }
          }}
        >
          <div className="mb-4">
            <label className="block mb-1 text-indigo-700 font-bold">كود العاملة</label>
            <input type="text" value={worker.code.toString().padStart(4, '0')} disabled className="w-full border rounded px-4 py-2 text-gray-900 font-semibold bg-gray-100" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-indigo-700 font-bold">اسم العاملة</label>
            <input name="name" type="text" defaultValue={worker.name} className="w-full border rounded px-4 py-2 text-gray-900 font-semibold bg-indigo-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:text-indigo-900 focus:outline-none" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-indigo-700 font-bold">الجنسية</label>
            <select name="nationality" defaultValue={worker.nationality} className="w-full border rounded px-4 py-2 text-gray-900 font-semibold bg-indigo-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:text-indigo-900 focus:outline-none">
              <option value="">اختر الجنسية</option>
              {nationalities.map(nat => (
                <option key={nat.id} value={nat.nationality}>
                  {nat.nationality}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-indigo-700 font-bold">رقم الإقامة</label>
            <input name="residencyNumber" type="text" defaultValue={worker.residencyNumber} className="w-full border rounded px-4 py-2 text-gray-900 font-semibold bg-indigo-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:text-indigo-900 focus:outline-none" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-indigo-700 font-bold">تاريخ الميلاد</label>
            <input name="dateOfBirth" type="date" defaultValue={worker.dateOfBirth ? new Date(worker.dateOfBirth).toISOString().split('T')[0] : ''} className="w-full border rounded px-4 py-2 text-gray-900 font-semibold bg-indigo-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:text-indigo-900 focus:outline-none" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-indigo-700 font-bold">رقم الجوال</label>
            <input name="phone" type="tel" defaultValue={worker.phone} className="w-full border rounded px-4 py-2 text-gray-900 font-semibold bg-indigo-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:text-indigo-900 focus:outline-none" />
          </div>
          <div className="flex gap-4 justify-center">
            <button 
              type="button"
              onClick={() => {
                const confirmed = confirm('هل أنت متأكد من الإلغاء؟ سيتم فقدان أي تعديلات غير محفوظة.');
                if (confirmed) {
                  window.location.href = `/workers/${worker.id}`;
                }
              }}
              className="bg-gray-500 text-white px-6 py-2 rounded font-bold text-lg shadow hover:bg-gray-600 transition-colors"
              disabled={saving}
            >
              إلغاء
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className={`${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-6 py-2 rounded font-bold text-lg shadow transition-colors`}
            >
              {saving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الحفظ...
                </span>
              ) : (
                'حفظ التعديلات'
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
