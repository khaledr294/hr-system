"use client";
import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect, useMemo } from 'react';


interface Marketer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  contractCount: number;
}

export default function MarketersReportsPage() {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [marketers, setMarketers] = useState<Marketer[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/marketers/reports?month=${month}`)
      .then(res => res.json())
      .then(setMarketers)
      .finally(() => setLoading(false));
  }, [month]);

  const filtered = useMemo(() => {
    const t = q.trim();
    if (!t) return marketers;
    const s = t.toLowerCase();
    return marketers.filter(m =>
      m.name.toLowerCase().includes(s) ||
      (m.phone || '').toLowerCase().includes(s) ||
      (m.email || '').toLowerCase().includes(s)
    );
  }, [marketers, q]);

  const totals = useMemo(() => {
    return {
      marketers: filtered.length,
      contracts: filtered.reduce((sum, m) => sum + (m.contractCount || 0), 0),
    };
  }, [filtered]);

    const exportCSV = () => {
      const headers = ['اسم المسوق','الجوال','البريد الإلكتروني','عدد العقود','الشهر'];
      // صيغة الشهر مثل Sep-25
      const [yy, mm] = month.split('-').map(Number);
      const d = new Date(yy, (mm || 1) - 1, 1);
      const monthLabel = `${d.toLocaleString('en-US', { month: 'short' })}-${String(yy).slice(-2)}`;

      // إجبار Excel على اعتبار الجوال نصًا لمنع 5.56E+08
      const rows = filtered.map(m => [
        m.name,
        m.phone ? `="${m.phone}"` : '',
        m.email || '-',
        String(m.contractCount),
        monthLabel,
      ]);

      const csv = [headers, ...rows]
        .map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))
        .join('\n');

      // إضافة BOM ليدعم العربية في Excel
      const bom = '\uFEFF';
      const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `تقارير-المسوقين-${month}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-8">
        <h1 className="text-3xl font-extrabold mb-8 text-gray-900">تقارير المسوقين</h1>
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <label className="font-bold text-indigo-900">الشهر:</label>
            <input
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
              className="border-2 border-indigo-700 rounded px-3 py-2 text-lg font-semibold text-gray-900 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-700 bg-white"
              style={{maxWidth:'180px'}}
            />
          </div>
          <input
            type="text"
            placeholder="بحث بالاسم/الجوال/الإيميل"
            value={q}
            onChange={e => setQ(e.target.value)}
            className="flex-1 min-w-[220px] border-2 border-indigo-200 rounded px-3 py-2 text-base font-semibold text-gray-900 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300"
          />
          <button
            type="button"
            onClick={exportCSV}
            className="ml-auto inline-flex items-center px-4 py-2 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow"
          >
            تصدير CSV
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded p-3">
            <div className="text-sm text-indigo-700 font-semibold">عدد المسوقين</div>
            <div className="text-2xl font-extrabold text-indigo-900">{totals.marketers}</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded p-3">
            <div className="text-sm text-amber-700 font-semibold">إجمالي العقود</div>
            <div className="text-2xl font-extrabold text-amber-900">{totals.contracts}</div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-indigo-200">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-6 py-3 text-right text-base font-bold text-indigo-900">اسم المسوق</th>
                <th className="px-6 py-3 text-right text-base font-bold text-indigo-900">رقم الجوال</th>
                <th className="px-6 py-3 text-right text-base font-bold text-indigo-900">البريد الإلكتروني</th>
                <th className="px-6 py-3 text-right text-base font-bold text-indigo-900">عدد العقود</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-indigo-100">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-6 text-indigo-700 font-bold">جاري التحميل...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-6 text-gray-500">لا توجد بيانات لهذا الشهر</td></tr>
              ) : filtered.map(m => (
                <tr key={m.id}>
                  <td className="px-6 py-4 text-lg font-semibold text-indigo-900">{m.name}</td>
                  <td className="px-6 py-4 text-lg font-semibold text-gray-900">{m.phone}</td>
                  <td className="px-6 py-4 text-lg font-semibold text-gray-900">{m.email || '-'}</td>
                  <td className="px-6 py-4 text-2xl font-extrabold text-indigo-800 bg-indigo-50 rounded-lg text-center" style={{letterSpacing:'0.1em'}}>{m.contractCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
