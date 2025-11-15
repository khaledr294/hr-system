import { NextResponse } from 'next/server';
import { updateExpiredContracts } from '@/lib/updateExpiredContracts';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

type EmptyContext = { params: Promise<Record<string, never>> };

export const POST = withApiAuth<EmptyContext>(
  { permissions: [Permission.EDIT_CONTRACTS], auditAction: 'CONTRACT_UPDATE_EXPIRED' },
  async () => {
    try {
      const result = await updateExpiredContracts();

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: `تم تحديث ${result.updatedCount} عقد منتهي بنجاح`,
          updatedContracts: result.updatedCount,
        });
      }

      return NextResponse.json({ error: result.error }, { status: 500 });
    } catch (error) {
      console.error('Error in update contracts API:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);