import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import ContractsWithSearch from '@/components/contracts/ContractsWithSearch';
import ArchiveExpiredButton from '@/components/contracts/ArchiveExpiredButton';

export default async function ContractsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  // بناء الشرط الأساسي للاستعلام
  const whereClause: { marketerId?: string } = {};
  
  // تقييد العرض للمسوقين فقط لعقودهم الخاصة
  if (session.user.role === 'MARKETER' || session.user.roleLabel === 'مسوق') {
    whereClause.marketerId = session.user.id;
  }

  const contracts = await prisma.contract.findMany({
    where: whereClause,
    include: {
      client: {
        select: {
          id: true,
          name: true,
          idNumber: true,
        }
      },
      worker: {
        select: {
          id: true,
          name: true,
          residencyNumber: true,
        }
      },
    },
    orderBy: {
      startDate: 'desc',
    },
  }).catch(async () => {
    // Fallback for missing columns
    return await prisma.contract.findMany({
      where: whereClause,
      select: {
        id: true,
        status: true,
        startDate: true,
        endDate: true,
        packageType: true,
        packageName: true,
        contractNumber: true,
        totalAmount: true,
        client: {
          select: {
            id: true,
            name: true,
            idNumber: true,
          }
        },
        worker: {
          select: {
            id: true,
            name: true,
            residencyNumber: true,
          }
        }
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  });

  // حساب عدد العقود المنتهية
  const now = new Date();
  const expiredCount = contracts.filter(c => new Date(c.endDate) < now).length;

  return (
    <DashboardLayout>
      <section dir="rtl" className="mb-6">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <h1 className="text-2xl font-extrabold text-slate-900">جميع العقود</h1>
          <div className="flex gap-2">
            {expiredCount > 0 && <ArchiveExpiredButton count={expiredCount} />}
            <Link href="/contracts/templates">
              <Button className="font-extrabold">📄 إدارة قوالب العقود</Button>
            </Link>
          </div>
        </div>
      </section>
      <ContractsWithSearch contracts={contracts} />
    </DashboardLayout>
  );
}
