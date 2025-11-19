import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

type EmptyContext = { params: Promise<Record<string, never>> };

export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.VIEW_USERS, Permission.CREATE_CONTRACTS] },
  async () => {
    try {
      const marketerJobTitle = await prisma.jobTitle.findFirst({
        where: { nameAr: 'مسوق' },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
            orderBy: {
              name: 'asc'
            }
          }
        }
      });

      const marketers = marketerJobTitle?.users || [];

      return NextResponse.json(marketers);
    } catch (error) {
      console.error('Error fetching marketers:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);
