import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import ClientList from '@/components/clients/ClientList';

export default async function ClientsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  const clients = await prisma.client.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">قائمة العملاء</h1>
        <Link
          href="/clients/new"
          className="inline-flex items-center px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border-2 border-slate-900"
        >
          إضافة عميل جديد
        </Link>
      </div>
      <ClientList clients={clients} />
    </DashboardLayout>
  );
}