import { prisma } from '@/lib/prisma';
import { cacheAside, CacheKeys, CacheTTL } from '@/lib/cache';

export async function GET() {
  // استخدام Cache-aside pattern للأداء العالي
  const data = await cacheAside(
    CacheKeys.DASHBOARD_STATS,
    async () => {
      // إجمالي الأعداد
      const [workers, clients, contracts, marketers] = await Promise.all([
        prisma.worker.count(),
        prisma.client.count(),
        prisma.contract.count(),
        prisma.marketer.count(),
      ]);

      // عقود اليوم
      const today = new Date();
      today.setHours(0,0,0,0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const contractsToday = await prisma.contract.count({
        where: {
          createdAt: { gte: today, lt: tomorrow },
        },
      });

      // عقود الشهر
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const contractsMonth = await prisma.contract.count({
        where: {
          createdAt: { gte: monthStart, lt: nextMonth },
        },
      });

      // توزيع العقود حسب الحالة
      const statusCounts = await prisma.contract.groupBy({
        by: ['status'],
        _count: { status: true },
      });

      return {
        workers,
        clients,
        contracts,
        marketers,
        contractsToday,
        contractsMonth,
        statusCounts,
      };
    },
    CacheTTL.SHORT // 60 ثانية - البيانات تتغير بشكل متكرر
  );

  return new Response(JSON.stringify(data), { 
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
    } 
  });
}
