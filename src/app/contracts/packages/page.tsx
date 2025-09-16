"use client";
import DashboardLayout from '@/components/DashboardLayout';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Package {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [name, setName] = useState<string>('');
  const [duration, setDuration] = useState<number>(30);
  const [price, setPrice] = useState<number>(1000);
  const [loading, setLoading] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editDuration, setEditDuration] = useState<number>(30);
  const [editPrice, setEditPrice] = useState<number>(1000);

  useEffect(() => {
    fetch('/api/packages')
      .then(res => res.json())
      .then((data: Package[]) => setPackages(data));
  }, []);

  const handleAdd = async () => {
    if (!name) return;
    setLoading(true);
    const res = await fetch('/api/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, duration, price }),
    });
    if (res.ok) {
      const pkg: Package = await res.json();
      setPackages((pkgs: Package[]) => [pkg, ...pkgs]);
      setName('');
      setDuration(30);
      setPrice(1000);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف الباقة؟')) return;
    setLoading(true);
    const res = await fetch(`/api/packages/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setPackages((pkgs: Package[]) => pkgs.filter((p: Package) => p.id !== id));
    }
    setLoading(false);
  };

  const startEdit = (pkg: Package) => {
    setEditId(pkg.id);
    setEditName(pkg.name);
    setEditDuration(pkg.duration);
    setEditPrice(pkg.price);
  };

  const handleEdit = async () => {
    if (!editId) return;
    setLoading(true);
    const res = await fetch(`/api/packages/${editId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, duration: editDuration, price: editPrice }),
    });
    if (res.ok) {
      const updated: Package = await res.json();
      setPackages((pkgs: Package[]) => pkgs.map((p: Package) => (p.id === updated.id ? updated : p)));
      setEditId(null);
    }
    setLoading(false);
  };

  const cancelEdit = () => setEditId(null);

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto py-8">
        <h1 className="text-3xl font-extrabold mb-8 text-gray-900">الباقات و الخدمات</h1>
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="font-bold text-lg mb-3 text-gray-800">إضافة باقة أو خدمة جديدة</h2>
          <div className="flex flex-col gap-3">
            <Input
              label="اسم الباقة أو الخدمة"
              placeholder="اسم الباقة أو الخدمة"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading}
            />
            <Input
              label="المدة (بالأيام)"
              type="number"
              placeholder="المدة (بالأيام)"
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              disabled={loading}
            />
            <Input
              label="السعر الافتراضي"
              type="number"
              placeholder="السعر الافتراضي"
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              disabled={loading}
            />
            <Button onClick={handleAdd} disabled={loading || !name} className="mt-2">إضافة</Button>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold text-lg mb-3 text-gray-800">جميع الباقات و الخدمات</h2>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-3 text-lg font-bold text-gray-900">الاسم</th>
                <th className="px-4 py-3 text-lg font-bold text-gray-900">المدة (يوم)</th>
                <th className="px-4 py-3 text-lg font-bold text-gray-900">السعر الافتراضي</th>
                <th className="px-4 py-3 text-lg font-bold text-gray-900">تعديل</th>
                <th className="px-4 py-3 text-lg font-bold text-gray-900">حذف</th>
              </tr>
            </thead>
            <tbody>
              {packages.map(pkg => (
                editId === pkg.id ? (
                  <tr key={pkg.id} className="bg-yellow-50">
                    <td className="px-4 py-3"><Input value={editName} onChange={e => setEditName(e.target.value)} /></td>
                    <td className="px-4 py-3"><Input type="number" value={editDuration} onChange={e => setEditDuration(Number(e.target.value))} /></td>
                    <td className="px-4 py-3"><Input type="number" value={editPrice} onChange={e => setEditPrice(Number(e.target.value))} /></td>
                    <td className="px-4 py-3">
                      <Button size="sm" onClick={handleEdit} disabled={loading}>حفظ</Button>
                      <Button size="sm" variant="secondary" onClick={cancelEdit} disabled={loading} className="ml-2">إلغاء</Button>
                    </td>
                    <td></td>
                  </tr>
                ) : (
                  <tr key={pkg.id}>
                    <td className="px-4 py-3 text-lg font-semibold text-gray-900">{pkg.name}</td>
                    <td className="px-4 py-3 text-lg font-semibold text-gray-900">{pkg.duration}</td>
                    <td className="px-4 py-3 text-lg font-semibold text-gray-900">{pkg.price}</td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(pkg)} disabled={loading}>تعديل</Button>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="danger" onClick={() => handleDelete(pkg.id)} disabled={loading}>حذف</Button>
                    </td>
                  </tr>
                )
              ))}
              {packages.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">لا توجد باقات أو خدمات بعد</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
