import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';

export default async function ContractsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  const contracts = await prisma.contract.findMany({
    include: {
      client: true,
      worker: true,
    },
    orderBy: {
      startDate: 'desc',
    },
  });

  // تقسيم العقود
  const now = new Date();
  const expiringSoon = contracts.filter(contract => {
    const end = new Date(contract.endDate);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return contract.status === 'ACTIVE' && diff <= 3 && diff >= 0;
  });
  const active = contracts.filter(contract => {
    const end = new Date(contract.endDate);
    return contract.status === 'ACTIVE' && (end > now) && !expiringSoon.includes(contract);
  });
  const completed = contracts.filter(contract => contract.status === 'COMPLETED' || new Date(contract.endDate) < now);

  function renderTable(list, title) {
    return (
      <div className="mb-8">
        <h2 className="font-semibold text-lg mb-2">{title}</h2>
        <div className="bg-white shadow-sm rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العميل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العاملة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ البداية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ النهاية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نوع الباقة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {list.map((contract) => (
                <tr key={contract.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.client?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.worker?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(contract.startDate).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(contract.endDate).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.packageType === 'MONTHLY' ? 'شهري'
                      : contract.packageType === 'QUARTERLY' ? 'ربع سنوي'
                      : 'سنوي'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs rounded ${
                        contract.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : contract.status === 'COMPLETED'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {contract.status === 'ACTIVE' ? 'نشط'
                        : contract.status === 'COMPLETED' ? 'منتهي'
                        : 'ملغي'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Link
                      href={`/contracts/${contract.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      عرض التفاصيل
                    </Link>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    لا يوجد عقود في هذا القسم
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">جميع العقود</h1>
      </div>
      {renderTable(expiringSoon, 'عقود على وشك الانتهاء (متبقي 3 أيام أو أقل)')}
      {renderTable(active, 'العقود النشطة')}
      {renderTable(completed, 'العقود المنتهية')}
    </DashboardLayout>
  );
}