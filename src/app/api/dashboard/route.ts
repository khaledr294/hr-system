import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

type EmptyContext = { params: Promise<Record<string, never>> };

export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.VIEW_REPORTS] },
  async () => {
    const marketerJobTitle = await prisma.jobTitle.findFirst({ where: { nameAr: 'مسوق' } });

    const marketerCountPromise = marketerJobTitle
      ? prisma.user.count({ where: { jobTitleId: marketerJobTitle.id } })
      : Promise.resolve(0);

    const [workers, clients, contracts, marketers] = await Promise.all([
      prisma.worker.count(),
      prisma.client.count(),
      prisma.contract.count(),
      marketerCountPromise,
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const contractsToday = await prisma.contract.count({
      where: { createdAt: { gte: today, lt: tomorrow } },
    });

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const contractsMonth = await prisma.contract.count({
      where: { createdAt: { gte: monthStart, lt: nextMonth } },
    });

    const statusCounts = await prisma.contract.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    return NextResponse.json(
      {
        workers,
        clients,
        contracts,
        marketers,
        contractsToday,
        contractsMonth,
        statusCounts,
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }
);
