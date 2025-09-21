import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import ContractsWithSearch from '@/components/contracts/ContractsWithSearch';

interface Contract {
  id: string;
  status: string;
  startDate: Date;
  endDate: Date;
  packageType: string;
  packageName?: string | null;
  contractNumber?: string | null;
  client: {
    id: string;
    name: string;
    idNumber: string;
  };
  worker: {
    id: string;
    name: string;
    residencyNumber: string;
  };
}

export default async function ContractsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  const contracts = await prisma.contract.findMany({
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

  return (
    <DashboardLayout>
      <section dir="rtl" className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-slate-900">جميع العقود</h1>
          <Link href="/contracts/templates">
            <Button className="font-extrabold">📄 إدارة قوالب العقود</Button>
          </Link>
        </div>
      </section>
      <ContractsWithSearch contracts={contracts} />
    </DashboardLayout>
  );
}