import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import DeleteMarketerButton from '@/components/marketers/DeleteMarketerButton';

export default async function MarketersPage() {
  const session = await getSession();
  if (!session) {
    redirect('/auth/login');
  }

  const marketers = await prisma.marketer.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">المسوقين</h1>
        <Link
          href="/marketers/new"
          className="inline-flex items-center px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 border-2 border-slate-900 transition-colors duration-200"
        >
          إضافة مسوق جديد
        </Link>
      </div>
      <div className="bg-white border-2 border-slate-900 overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-200">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-900">الاسم</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-900">رقم الجوال</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-900">البريد الإلكتروني</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-900">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {marketers.map((marketer) => (
              <tr key={marketer.id} className="border-b border-slate-300">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{marketer.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{marketer.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{marketer.email || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                  <div className="flex gap-2">
                    <Link href={`/marketers/${marketer.id}`} className="inline-block text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 border-2 border-slate-900 transition-colors duration-200">عرض التفاصيل</Link>
                    <DeleteMarketerButton marketerId={marketer.id} />
                  </div>
                </td>
              </tr>
            ))}
            {marketers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm font-bold text-slate-700">لا يوجد مسوقين حالياً</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
