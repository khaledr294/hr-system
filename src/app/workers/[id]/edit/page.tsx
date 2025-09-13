
"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function EditWorkerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [worker, setWorker] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
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
            const form = e.currentTarget;
            const formData = new FormData(form);
            const data = {
              name: formData.get('name'),
              nationality: formData.get('nationality'),
            };
            const res = await fetch(`/api/workers/${worker.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            if (res.ok) {
              window.location.href = `/workers/${worker.id}`;
            } else {
              alert('تعذر حفظ التعديلات. تحقق من صحة البيانات.');
            }
          }}
        >
          <div className="mb-4">
            <label className="block mb-1 text-indigo-700 font-bold">اسم العاملة</label>
            <input name="name" type="text" defaultValue={worker.name} className="w-full border rounded px-4 py-2 text-gray-900 font-semibold bg-indigo-50 focus:bg-white focus:border-indigo-500" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-indigo-700 font-bold">الجنسية</label>
            <input name="nationality" type="text" defaultValue={worker.nationality} className="w-full border rounded px-4 py-2 text-gray-900 font-semibold bg-indigo-50 focus:bg-white focus:border-indigo-500" />
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded font-bold text-lg shadow hover:bg-indigo-700">حفظ التعديلات</button>
        </form>
      </div>
    </DashboardLayout>
  );
}
