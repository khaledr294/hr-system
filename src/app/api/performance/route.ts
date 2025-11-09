import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getCacheInfo, clearAllCache } from '@/lib/cache';
import { checkDatabaseHealth } from '@/lib/query-optimization';

/**
 * GET /api/performance
 * معلومات الأداء والكاش
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const [cacheInfo, dbHealth] = await Promise.all([
      getCacheInfo(),
      checkDatabaseHealth(),
    ]);

    return NextResponse.json({
      cache: cacheInfo,
      database: dbHealth,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('خطأ في GET /api/performance:', error);
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/performance
 * إجراءات على الكاش
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
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
  } catch (error) {
    console.error('خطأ في POST /api/performance:', error);
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500 }
    );
  }
}
