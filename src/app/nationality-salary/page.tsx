"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

type NationalitySalary = {
  id: string;
  nationality: string;
  salary: number;
};

export default function NationalitySalaryPage() {
  const [nationalities, setNationalities] = useState<NationalitySalary[]>([]);
  const [nationality, setNationality] = useState("");
  const [salary, setSalary] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load nationalities on component mount
  useEffect(() => {
    loadNationalities();
  }, []);

  const loadNationalities = async () => {
    try {
      const response = await fetch('/api/nationality-salary');
      if (response.ok) {
        const data = await response.json();
        setNationalities(data);
      }
    } catch (error) {
      console.error('Failed to load nationalities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nationality || !salary) return;
    
    setSubmitting(true);
    try {
      const response = await fetch('/api/nationality-salary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nationality,
          salary: parseFloat(salary),
        }),
      });

      if (response.ok) {
        setNationality("");
        setSalary("");
        loadNationalities(); // Reload data
      } else {
        const errorText = await response.text();
        alert('فشل في إضافة الجنسية: ' + errorText);
      }
    } catch (error) {
      console.error('Error adding nationality:', error);
      alert('حدث خطأ أثناء إضافة الجنسية');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الجنسية؟')) return;

    try {
      const response = await fetch(`/api/nationality-salary/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadNationalities(); // Reload data
      } else {
        const errorText = await response.text();
        alert('فشل في حذف الجنسية: ' + errorText);
      }
    } catch (error) {
      console.error('Error deleting nationality:', error);
      alert('حدث خطأ أثناء حذف الجنسية');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-md text-center">
          جاري التحميل...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-indigo-700 text-center">إدارة الجنسيات والرواتب</h1>
        <div className="bg-indigo-50 p-4 rounded mb-6 text-center">
          <p className="text-indigo-800">هنا يمكنك إضافة وتحديد الجنسيات والرواتب المرتبطة بكل جنسية.</p>
        </div>

        {/* Add new nationality form */}
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-center mb-8">
          <input
            type="text"
            placeholder="اسم الجنسية"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            required
            className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-semibold focus:text-indigo-900 focus:bg-indigo-50 focus:border-indigo-500"
          />
          <input
            type="number"
            placeholder="الراتب (ريال)"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            required
            min="0"
            step="0.01"
            className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-semibold focus:text-indigo-900 focus:bg-indigo-50 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {submitting ? 'جاري الإضافة...' : 'إضافة'}
          </button>
        </form>

        {/* Nationalities table */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="py-3 px-4 text-right font-bold">الجنسية</th>
                <th className="py-3 px-4 text-right font-bold">الراتب (ريال)</th>
                <th className="py-3 px-4 text-center font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {nationalities.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-500">لا توجد بيانات للعرض حالياً.</td>
                </tr>
              ) : (
                nationalities.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900 font-semibold">{item.nationality}</td>
                    <td className="py-3 px-4 text-gray-900 font-semibold">{item.salary.toLocaleString()} ريال</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        className="text-red-600 hover:text-red-900 font-bold px-4 py-2 rounded hover:bg-red-50"
                        onClick={() => handleDelete(item.id)}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}