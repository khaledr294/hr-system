import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import ClientList from '@/components/clients/ClientList';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export const revalidate = 30; // Cache page for 30 seconds

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
      <section dir="rtl" className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900">قائمة العملاء</h1>
            <Badge className="hidden sm:inline-flex">{clients.length.toLocaleString('ar-SA')}</Badge>
          </div>
          <Link href="/clients/new">
            <Button className="font-extrabold">إضافة عميل جديد</Button>
          </Link>
        </div>
      </section>
      <ClientList clients={clients} />
    </DashboardLayout>
  );
}