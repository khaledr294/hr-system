
"use client";

import { useState } from "react";

type NationalitySalary = {
  id: number;
  nationality: string;
  salary: number;
};

export default function NationalitySalaryTab() {
  const [nationalities, setNationalities] = useState<NationalitySalary[]>([]);
  const [nationality, setNationality] = useState("");
  const [salary, setSalary] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nationality || !salary) return;
    setNationalities([
      ...nationalities,
      {
        id: Date.now(),
        nationality,
        salary: Number(salary),
      },
    ]);
    setNationality("");
    setSalary("");
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700 text-center">إدارة الجنسيات والرواتب</h1>
      <div className="bg-indigo-50 p-4 rounded mb-6 text-center">
        <p className="text-indigo-800">هنا يمكنك إضافة وتحديد الجنسيات والرواتب المرتبطة بكل جنسية.</p>
      </div>
      <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-center mb-8">
        <input
          style={{ color: '#1e293b' }}
          type="text"
          placeholder="الجنسية"
          value={nationality}
          onChange={e => setNationality(e.target.value)}
          className="border rounded px-4 py-2 w-full md:w-1/2"
          required
        />
        <input
          style={{ color: '#1e293b' }}
          type="number"
          placeholder="الراتب"
          value={salary}
          onChange={e => setSalary(e.target.value)}
          className="border rounded px-4 py-2 w-full md:w-1/2"
          required
        />
        <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">إضافة</button>
      </form>
      <table className="w-full border rounded">
        <thead className="bg-indigo-100">
          <tr>
            <th className="py-2 px-4 border">الجنسية</th>
            <th className="py-2 px-4 border">الراتب</th>
            <th className="py-2 px-4 border">خيارات</th>
          </tr>
        </thead>
        <tbody>
          {nationalities.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-4 text-gray-500">لا توجد بيانات للعرض حالياً.</td>
            </tr>
          ) : (
            nationalities.map((item) => (
              <tr key={item.id}>
                <td className="py-2 px-4 border text-gray-900 font-semibold">{item.nationality}</td>
                <td className="py-2 px-4 border text-gray-900 font-semibold">{item.salary.toLocaleString()}</td>
                <td className="py-2 px-4 border text-center">
                  <button
                    className="text-indigo-600 hover:text-indigo-900 font-bold mx-2"
                    onClick={() => {
                      const newNationality = prompt('تعديل الجنسية', item.nationality);
                      const newSalary = prompt('تعديل الراتب', item.salary.toString());
                      if (newNationality && newSalary) {
                        setNationalities(nationalities.map(n => n.id === item.id ? { ...n, nationality: newNationality, salary: Number(newSalary) } : n));
                      }
                    }}
                  >تعديل</button>
                  <button
                    className="text-red-600 hover:text-red-900 font-bold mx-2"
                    onClick={() => setNationalities(nationalities.filter(n => n.id !== item.id))}
                  >حذف</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
