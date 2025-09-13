
"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";


import React from "react";
import { use } from "react";

export default function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [client, setClient] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    fetch(`/api/clients/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setClient(data);
        setLoading(false);
      })
      .catch(() => {
        setError("تعذر تحميل بيانات العميل");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <DashboardLayout><div className="max-w-xl mx-auto bg-white p-8 rounded shadow text-center">جاري التحميل...</div></DashboardLayout>;
  if (error || !client) return <DashboardLayout><div className="max-w-xl mx-auto bg-white p-8 rounded shadow text-center text-red-600">{error || "العميل غير موجود"}</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto bg-white p-8 rounded shadow">
        <h1 className="text-3xl font-extrabold mb-8 text-indigo-700 text-center">تعديل بيانات العميل</h1>
        <form
          action="#"
          method="POST"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);
            const data = {
              name: formData.get('name'),
              idNumber: formData.get('idNumber'),
              phone: formData.get('phone'),
              email: formData.get('email'),
              address: formData.get('address'),
            };
            const res = await fetch(`/api/clients/${client.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            if (res.ok) {
              window.location.href = `/clients/${client.id}`;
            } else {
              alert('تعذر حفظ التعديلات. تحقق من صحة البيانات.');
            }
          }}
        >
          <div className="mb-4">
            <label className="block mb-1 text-indigo-700 font-bold">اسم العميل</label>
            <input name="name" type="text" defaultValue={client.name} className="w-full border rounded px-4 py-2 text-gray-900 font-semibold bg-indigo-50 focus:bg-white focus:border-indigo-500" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-indigo-700 font-bold">رقم الهوية</label>
            <input name="idNumber" type="text" defaultValue={client.idNumber} className="w-full border rounded px-4 py-2 text-gray-900 font-semibold bg-indigo-50 focus:bg-white focus:border-indigo-500" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-indigo-700 font-bold">رقم الجوال</label>
            <input name="phone" type="text" defaultValue={client.phone} className="w-full border rounded px-4 py-2 text-gray-900 font-semibold bg-indigo-50 focus:bg-white focus:border-indigo-500" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-indigo-700 font-bold">البريد الإلكتروني</label>
            <input name="email" type="email" defaultValue={client.email ?? ''} className="w-full border rounded px-4 py-2 text-gray-900 font-semibold bg-indigo-50 focus:bg-white focus:border-indigo-500" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-indigo-700 font-bold">العنوان</label>
            <input name="address" type="text" defaultValue={client.address} className="w-full border rounded px-4 py-2 text-gray-900 font-semibold bg-indigo-50 focus:bg-white focus:border-indigo-500" />
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded font-bold text-lg shadow hover:bg-indigo-700">حفظ التعديلات</button>
        </form>
      </div>
    </DashboardLayout>
  );
}
