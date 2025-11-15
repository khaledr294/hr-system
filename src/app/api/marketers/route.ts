import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type EmptyContext = { params: Promise<Record<string, never>> };

export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.VIEW_USERS] },
  async () => {
    const marketerJobTitle = await prisma.jobTitle.findFirst({
      where: { nameAr: 'مسوق' },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const marketers = marketerJobTitle?.users ?? [];
    return NextResponse.json(marketers);
  }
);

export const POST = withApiAuth<EmptyContext>(
  { permissions: [Permission.MANAGE_SETTINGS] },
  async () =>
    NextResponse.json(
      { error: 'هذا الـ endpoint لم يعد مدعوماً. يرجى استخدام /api/users لإدارة المستخدمين' },
      { status: 410 }
    )
);
