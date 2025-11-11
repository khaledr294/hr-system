import { prisma } from '@/lib/prisma';

export async function GET() {
  // إزالة Cache للحصول على تحديثات فورية
  // جلب المسمى الوظيفي "مسوق"
  const marketerJobTitle = await prisma.jobTitle.findFirst({
    where: { nameAr: 'مسوق' }
  });

  // إجمالي الأعداد
  const [workers, clients, contracts, marketers] = await Promise.all([
    prisma.worker.count(),
    prisma.client.count(),
    prisma.contract.count(),
    marketerJobTitle 
      ? prisma.user.count({ where: { jobTitleId: marketerJobTitle.id } })
      : 0,
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

  const data = {
    workers,
    clients,
    contracts,
    marketers,
    contractsToday,
    contractsMonth,
    statusCounts,
  };

  return new Response(JSON.stringify(data), { 
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0' // تعطيل Cache للتحديث الفوري
    } 
  });
}
