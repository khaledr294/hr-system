import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ExtendContractForm from '@/components/contracts/ExtendContractForm';
import Link from 'next/link';

export default async function ExtendContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  const { id } = await params;
  
  // التحقق من وجود العقد والتأكد من أنه نشط
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      client: true,
      worker: true,
    }
  });

  if (!contract) {
    redirect('/contracts');
  }

  if (contract.status !== 'ACTIVE') {
    redirect(`/contracts/${id}?error=contract_not_active`);
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تمديد العقد</h1>
            <p className="text-gray-600 mt-2">
              تمديد العقد الحالي للعميل <strong>{contract.client.name}</strong> والعاملة <strong>{contract.worker.name}</strong>
            </p>
          </div>
          <Link
            href={`/contracts/${id}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            إلغاء
          </Link>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات العقد الحالي</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">العميل:</span> {contract.client.name}
            </div>
            <div>
              <span className="font-medium text-gray-700">العاملة:</span> {contract.worker.name}
            </div>
            <div>
              <span className="font-medium text-gray-700">تاريخ البداية:</span> {new Date(contract.startDate).toLocaleDateString('ar')}
            </div>
            <div>
              <span className="font-medium text-gray-700">تاريخ النهاية الحالي:</span> {new Date(contract.endDate).toLocaleDateString('ar')}
            </div>
            <div>
              <span className="font-medium text-gray-700">نوع الباقة:</span> {contract.packageName || contract.packageType}
            </div>
            <div>
              <span className="font-medium text-gray-700">المبلغ الحالي:</span> {contract.totalAmount.toLocaleString('ar-SA')} ريال
            </div>
          </div>
        </div>

        <ExtendContractForm contract={contract} />
      </div>
    </DashboardLayout>
  );
}