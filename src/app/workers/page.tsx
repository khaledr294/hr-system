import { prisma } from '@/lib/prisma';
import DashboardLayout from '@/components/DashboardLayout';
import { ClientWorkerList } from '@/components/workers/ClientWorkerList';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { requireSession } from '@/lib/require';

export default async function WorkersPage() {
  await requireSession(); // This will redirect if not authenticated


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