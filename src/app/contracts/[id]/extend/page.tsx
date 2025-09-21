import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

// Minimal server component form to extend a contract (replaces missing external component)
function ExtendContractForm({
  contract,
}: {
  contract: {
    id: string;
    client: { name: string };
    worker: { name: string };
    startDate: Date | string;
    endDate: Date | string;
    packageName?: string | null;
    packageType?: string | null;
    totalAmount: number;
  };
}) {
  return (
    <form
      action={`/api/contracts/${contract.id}/extend`}
      method="POST"
      className="bg-white shadow-sm rounded-lg p-6 space-y-4"
    >
      <h2 className="text-lg font-semibold text-gray-900">تمديد العقد</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">تاريخ النهاية الجديد</label>
            <input
              type="date"
              name="newEndDate"
              required
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-indigo-500"
            />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">المبلغ الإضافي (اختياري)</label>
          <input
            type="number"
            name="additionalAmount"
            min="0"
            step="0.01"
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-indigo-500"
            placeholder="0"
          />
        </div>
      </div>
      <input type="hidden" name="contractId" value={contract.id} />
      <button
        type="submit"
        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 focus:outline-none"
      >
        حفظ التمديد
      </button>
    </form>
  );
}

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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">تمديد العقد</h1>
          <p className="text-gray-600 mt-2">
            تمديد العقد الحالي للعميل <strong>{contract.client.name}</strong> والعاملة <strong>{contract.worker.name}</strong>
          </p>
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