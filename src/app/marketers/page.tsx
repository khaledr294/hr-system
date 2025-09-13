import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';

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
        <h1 className="text-2xl font-semibold text-gray-900">المسوقين</h1>
        <Link
          href="/marketers/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          إضافة مسوق جديد
        </Link>
      </div>
      <div className="bg-white shadow-sm rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الجوال</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">البريد الإلكتروني</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {marketers.map((marketer) => (
              <tr key={marketer.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{marketer.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{marketer.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{marketer.email || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <Link href={`/marketers/${marketer.id}`} className="text-blue-600 hover:text-blue-800">عرض التفاصيل</Link>
                </td>
              </tr>
            ))}
            {marketers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">لا يوجد مسوقين حالياً</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}