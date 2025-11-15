import { NextResponse } from 'next/server';
import { checkExpiringContracts } from '@/lib/notifications';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

type EmptyContext = { params: Promise<Record<string, never>> };

export const POST = withApiAuth<EmptyContext>(
  { permissions: [Permission.VIEW_CONTRACTS], auditAction: 'NOTIFICATION_CHECK' },
  async () => {
    try {
      await checkExpiringContracts();
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Failed to check notifications:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);