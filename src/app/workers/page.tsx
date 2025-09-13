import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ClientWorkerList from '@/components/workers/ClientWorkerList';

export default async function WorkersPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  const workers = await prisma.worker.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      nationality: true,
      residencyNumber: true,
      dateOfBirth: true,
      phone: true,
      status: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">قائمة العمالة المنزلية</h1>
        <a 
          href="/workers/new" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          إضافة عاملة جديدة
        </a>
      </div>
      <ClientWorkerList workers={workers} />
    </DashboardLayout>
  );
}