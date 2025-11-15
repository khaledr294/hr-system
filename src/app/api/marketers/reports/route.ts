import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

type EmptyContext = { params: Promise<Record<string, never>> };

export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.VIEW_REPORTS] },
  async ({ req }) => {
    const { searchParams } = new URL(req.url);
  const month = searchParams.get('month'); // YYYY-MM
  let start: Date | undefined, end: Date | undefined;
  if (month) {
    const [year, m] = month.split('-').map(Number);
    start = new Date(year, m - 1, 1);
    end = new Date(year, m, 1);
  }

  // جلب المسمى الوظيفي "مسوق"
  const marketerJobTitle = await prisma.jobTitle.findFirst({
    where: { nameAr: 'مسوق' }
  });

  if (!marketerJobTitle) {
      return NextResponse.json([]);
  }

  // جلب المستخدمين المسوقين مع عقودهم
  const marketers = await prisma.user.findMany({
    where: {
      jobTitleId: marketerJobTitle.id
    },
    include: {
      marketedContracts: month && start && end ? {
        where: {
          startDate: { gte: start, lt: end },
        },
      } : true,
    },
    orderBy: { name: 'asc' },
  });

  const result = marketers.map(m => ({
    id: m.id,
    name: m.name,
    phone: m.phone,
    email: m.email,
    contractCount: m.marketedContracts.length,
  }));

    return NextResponse.json(result);
  }
);
