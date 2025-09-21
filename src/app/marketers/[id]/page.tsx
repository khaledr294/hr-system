import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export default async function MarketerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    redirect('/auth/login');
  }

  const { id } = await params;
  const marketer = await prisma.marketer.findUnique({
    where: { id },
    include: {
      contracts: true,
    },
  }).catch(async () => {
    // Fallback for missing columns
    return await prisma.marketer.findUnique({
      where: { id },
      include: {
        contracts: {
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
            packageType: true,
            totalAmount: true,
            contractNumber: true,
          }
        },
      },
    });
  });

  if (!marketer) {
    redirect('/marketers');
  }

  return (
    <DashboardLayout>
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{marketer.name}</h1>
        <p className="text-sm text-gray-500 mb-4">رقم الجوال: {marketer.phone}</p>
        <p className="text-sm text-gray-500 mb-4">البريد الإلكتروني: {marketer.email || '-'}</p>


        <div className="flex items-center gap-4 mb-6">
          <div className="bg-white border-2 border-indigo-700 rounded-lg px-8 py-4 text-center shadow-lg">
            <div className="text-4xl font-extrabold text-indigo-800 drop-shadow-sm tracking-widest" style={{letterSpacing:'0.1em'}}>{marketer.contracts.length}</div>
            <div className="text-base font-bold text-indigo-900 mt-2" style={{textShadow:'0 1px 2px #fff,0 0 2px #333'}}>
              عدد العقود
            </div>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-4">العقود التي أنشأها هذا المسوق</h2>
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم العقد</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ البداية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ النهاية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {marketer.contracts.map(contract => (
                <tr key={contract.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contract.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(contract.startDate).toLocaleDateString('ar-SA-u-ca-gregory')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(contract.endDate).toLocaleDateString('ar-SA-u-ca-gregory')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contract.totalAmount.toLocaleString('ar-SA')} ريال</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contract.status === 'ACTIVE' ? 'نشط' : contract.status === 'COMPLETED' ? 'منتهي' : 'ملغي'}</td>
                </tr>
              ))}
              {marketer.contracts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">لا يوجد عقود لهذا المسوق</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
