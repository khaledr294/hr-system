import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export default async function EditContractPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  const contract = await prisma.contract.findUnique({ where: { id: params.id }, include: { client: true, worker: true } });
  if (!contract) redirect('/contracts');

  // TODO: Replace with actual form and update logic
  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">تعديل بيانات العقد</h1>
        <form>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700">العميل</label>
            <input type="text" defaultValue={contract.client?.name} className="w-full border rounded px-4 py-2" disabled />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700">العاملة</label>
            <input type="text" defaultValue={contract.worker?.name} className="w-full border rounded px-4 py-2" disabled />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700">تاريخ البداية</label>
            <input type="date" defaultValue={contract.startDate?.toISOString().slice(0,10)} className="w-full border rounded px-4 py-2" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700">تاريخ النهاية</label>
            <input type="date" defaultValue={contract.endDate?.toISOString().slice(0,10)} className="w-full border rounded px-4 py-2" />
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded">حفظ التعديلات</button>
        </form>
      </div>
    </DashboardLayout>
  );
}
