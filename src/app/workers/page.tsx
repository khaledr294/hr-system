import { prisma } from '@/lib/prisma';
import DashboardLayout from '@/components/DashboardLayout';
import { ClientWorkerList } from '@/components/workers/ClientWorkerList';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { requireSession } from '@/lib/require';
import { getSession } from '@/lib/session';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getWorkers() {
  // جلب العمالة مع العقود - مع معالجة الحقول المفقودة
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
  }).catch(async () => {
    // Fallback for missing columns
    return await prisma.worker.findMany({
        select: {
          id: true,
          code: true,
          name: true,
          nationality: true,
          residencyNumber: true,
          dateOfBirth: true,
          phone: true,
          status: true,
          createdAt: true,
          contracts: {
            select: {
              status: true,
              startDate: true,
              endDate: true,
            },
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
  });

  // تحديد الحالة حسب العقود النشطة
  return workersRaw.map(worker => ({
    id: worker.id,
    code: worker.code,
    name: worker.name,
    nationality: worker.nationality,
    residencyNumber: worker.residencyNumber,
    dateOfBirth: worker.dateOfBirth,
    phone: worker.phone ?? '',
    status: worker.contracts && worker.contracts.length > 0 ? 'RENTED' : worker.status,
  }));
}

export default async function WorkersPage() {
  await requireSession(); // This will redirect if not authenticated
  
  // التحقق من صلاحية عرض العمال
  const session = await getSession();
  if (!session?.user) {
    redirect('/login');
  }
  
  const canViewWorkers = await hasPermission(session.user.id, 'VIEW_WORKERS');
  if (!canViewWorkers) {
    redirect('/403');
  }

  const workers = await getWorkers();

  return (
    <DashboardLayout>
      <section dir="rtl" className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900">قائمة العمالة المنزلية</h1>
            <Badge className="hidden sm:inline-flex">{workers.length.toLocaleString('ar-SA')}</Badge>
          </div>
          <Link href="/workers/new">
            <Button className="font-extrabold">إضافة عاملة جديدة</Button>
          </Link>
        </div>
      </section>
      <ClientWorkerList workers={workers} />
    </DashboardLayout>
  );
}
