import { NextRequest, NextResponse } from 'next/server';
import { autoArchiveExpiredContracts } from '@/lib/archive';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type EmptyContext = { params: Promise<Record<string, never>> };

const runAutoArchive = async () => {
  try {
    console.log('🗄️ بدء الأرشفة التلقائية للعقود المنتهية...');

    // أرشفة العقود المنتهية منذ أكثر من 90 يوم
    const result = await autoArchiveExpiredContracts(90);

    console.log(`✅ تمت أرشفة ${result.archivedCount} عقد من ${result.totalFound}`);
    
    if (result.errors.length > 0) {
      console.warn('⚠️ أخطاء أثناء الأرشفة:', result.errors);
    }

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ خطأ في Cron الأرشفة:', error);
    return NextResponse.json(
      { error: 'فشل في الأرشفة التلقائية' },
      { status: 500 }
    );
  }
};

const guardedGet = withApiAuth<EmptyContext>(
  { permissions: [Permission.MANAGE_ARCHIVE], auditAction: 'CONTRACT_AUTO_ARCHIVE' },
  async () => runAutoArchive()
);

const isCronRequest = (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  return authHeader !== null && authHeader === `Bearer ${process.env.CRON_SECRET}`;
};

export async function GET(request: NextRequest, context: EmptyContext) {
  if (isCronRequest(request)) {
    return runAutoArchive();
  }

  return guardedGet(request, context);
}
