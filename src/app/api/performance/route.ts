import { NextRequest, NextResponse } from 'next/server';
import { Permission } from '@prisma/client';
import { getCacheInfo, clearAllCache } from '@/lib/cache';
import { checkDatabaseHealth } from '@/lib/query-optimization';
import { withApiAuth } from '@/lib/api-guard';

type EmptyContext = { params: Promise<Record<string, never>> };

/**
 * GET /api/performance
 * معلومات الأداء والكاش
 */
export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.VIEW_PERFORMANCE], auditAction: 'PERFORMANCE_VIEW' },
  async (_request: NextRequest) => {
  try {
    const [cacheInfo, dbHealth] = await Promise.all([
      getCacheInfo(),
      checkDatabaseHealth(),
    ]);

    return NextResponse.json({
      cache: cacheInfo,
      database: dbHealth,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('خطأ في GET /api/performance:', error);
    const message = error instanceof Error ? error.message : 'حدث خطأ';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
);

/**
 * POST /api/performance
 * إجراءات على الكاش
 */
export const POST = withApiAuth<EmptyContext>(
  { permissions: [Permission.MANAGE_SETTINGS], auditAction: 'PERFORMANCE_ACTION' },
  async (request: NextRequest) => {
  try {
  const body = (await request.json()) as { action?: string };
  const { action } = body;

    switch (action) {
      case 'clear-cache': {
        const success = await clearAllCache();
        return NextResponse.json({
          success,
          message: success ? 'تم مسح الكاش بنجاح' : 'فشل مسح الكاش',
        });
      }

      default:
        return NextResponse.json({ error: 'عملية غير معروفة' }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('خطأ في POST /api/performance:', error);
    const message = error instanceof Error ? error.message : 'حدث خطأ';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
);
