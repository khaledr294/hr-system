import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { ClientWorkerList } from '@/components/workers/ClientWorkerList';
import Link from 'next/link';

export default async function WorkersPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }


  // جلب العمالة مع العقود
  const workersRaw = await prisma.worker.findMany({
    include: {
      contracts: {
        where: {
          status: 'ACTIVE',
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // تحديد الحالة حسب العقود النشطة
  const workers = workersRaw.map(worker => ({
    id: worker.id,
    code: worker.code,
    name: worker.name,
    nationality: worker.nationality,
    residencyNumber: worker.residencyNumber,
    dateOfBirth: worker.dateOfBirth,
    phone: worker.phone,
    status: worker.contracts && worker.contracts.length > 0 ? 'RENTED' : worker.status,
  }));

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">قائمة العمالة المنزلية</h1>
        <Link 
          href="/workers/new" 
          className="inline-flex items-center px-4 py-2 border-2 border-slate-900 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
        >
          إضافة عاملة جديدة
        </Link>
      </div>
      <ClientWorkerList workers={workers} />
    </DashboardLayout>
  );
}