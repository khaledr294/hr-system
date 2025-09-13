"use client";

export default function SalariesPage() {
  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700 text-center">الرواتب</h1>
      <div className="bg-indigo-50 p-4 rounded mb-6 text-center">
        <p className="text-indigo-800">صفحة إدارة الرواتب للعمالة. سيتم إضافة المميزات قريباً.</p>
      </div>
      <div className="flex flex-col gap-4 items-center">
        <div className="w-full text-center text-gray-500">لا توجد بيانات للعرض حالياً.</div>
      </div>
    </div>
  );
}
