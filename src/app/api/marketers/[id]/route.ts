import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

type MarketerContext = { params: Promise<{ id: string }> };

export const GET = withApiAuth<MarketerContext>(
  { permissions: [Permission.VIEW_USERS] },
  async ({ context }) => {
    const params = await context.params;
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        jobTitle: { select: { nameAr: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  }
);

export const PUT = withApiAuth<MarketerContext>(
  { permissions: [Permission.MANAGE_SETTINGS] },
  async () =>
    NextResponse.json(
      { error: 'هذا الـ endpoint لم يعد مدعوماً. يرجى استخدام /api/users/[id]' },
      { status: 410 }
    )
);

export const DELETE = withApiAuth<MarketerContext>(
  { permissions: [Permission.MANAGE_SETTINGS] },
  async ({ context }) => {
    try {
      const params = await context.params;
      const contractsCount = await prisma.contract.count({ where: { marketerId: params.id } });

      if (contractsCount > 0) {
        return NextResponse.json(
          { error: `لا يمكن حذف المسوق لوجود ${contractsCount} عقد مرتبط به. يجب حذف العقود أولاً.` },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'هذا الـ endpoint لم يعد مدعوماً. المسوقون الآن جزء من Users' },
        { status: 410 }
      );
    } catch (error) {
      console.error('Error deleting marketer:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);
