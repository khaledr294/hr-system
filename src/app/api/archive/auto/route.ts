import { NextRequest, NextResponse } from 'next/server';
import { autoArchiveExpiredContracts } from '@/lib/archive';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    // التحقق من authorization header (Vercel Cron)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
}
