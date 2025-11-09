import { requireSession } from '@/lib/require';
import HomeClient from '../home-client';
import { prisma } from '@/lib/prisma';

export const revalidate = 30; // Cache for 30 seconds

async function getDashboardData() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [workers, clients, contracts, contractsToday, contractsMonth, statusCounts] = await Promise.all([
    prisma.worker.count(),
    prisma.client.count(),
    prisma.contract.count(),
    prisma.contract.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.contract.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.contract.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
  ]);

  return {
    workers,
    clients,
    contracts,
    marketers: 0,
    contractsToday,
    contractsMonth,
    statusCounts,
  };
}

export default async function DashboardPage() {
  await requireSession(); // This will redirect if not authenticated
  const data = await getDashboardData();
  return <HomeClient data={data} />;
}
