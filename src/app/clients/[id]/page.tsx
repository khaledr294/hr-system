import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';

export default async function ClientDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      contracts: {
        include: {
          worker: true,
        },
        orderBy: {
          startDate: 'desc',
        },
      },
    },
  });

  if (!client) {
    redirect('/clients');
  }

  return (
    <DashboardLayout>
      <div className="bg-white shadow-sm rounded-lg p-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {client.name}
            </h1>
            <p className="text-sm text-gray-500">رقم الهوية: {client.idNumber}</p>
          </div>
          <Link
            href={`/clients/${client.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            تعديل البيانات
          </Link>
        </div>

        {/* Client Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات الاتصال</h2>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">رقم الجوال</dt>
                <dd className="mt-1 text-sm text-gray-900">{client.phone}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">البريد الإلكتروني</dt>
                <dd className="mt-1 text-sm text-gray-900">{client.email || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">العنوان</dt>
                <dd className="mt-1 text-sm text-gray-900">{client.address}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Contracts */}
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">العقود</h2>
            <Link
              href={`/contracts/new?clientId=${client.id}`}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              إضافة عقد جديد
            </Link>
          </div>

          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    العاملة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ البداية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ النهاية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نوع الباقة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {client.contracts.map((contract) => (
                  <tr key={contract.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contract.worker.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(contract.startDate).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(contract.endDate).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contract.packageName || contract.packageType}
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
                {client.contracts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      لا يوجد عقود حالياً
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}