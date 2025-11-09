import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseBackup, cleanupOldBackups } from '@/lib/backup';

/**
 * POST /api/backups/scheduled
 * نسخة احتياطية تلقائية يومية
 * يتم استدعاؤها من Vercel Cron
 */
export async function POST(request: NextRequest) {
  try {
    // التحقق من Authorization header
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    console.log('🕐 بدء النسخ الاحتياطي المجدول...');

    // إنشاء نسخة احتياطية تلقائية
    const backup = await createDatabaseBackup('automatic');

    // تنظيف النسخ القديمة (أقدم من 30 يوماً)
    const deletedCount = await cleanupOldBackups(30);

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء النسخة الاحتياطية بنجاح',
      backup: {
        id: backup.id,
        filename: backup.filename,
        size: `${(backup.size / (1024 * 1024)).toFixed(2)} MB`,
        createdAt: backup.createdAt,
      },
      cleanup: {
        deletedCount,
      },
    });
  } catch (error) {
    console.error('❌ خطأ في النسخ الاحتياطي المجدول:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'فشل في إنشاء النسخة الاحتياطية',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/backups/scheduled
 * للسماح بـ Vercel Cron استدعاء الـ endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // استدعاء نفس منطق POST
    return POST(request);
  } catch (error) {
    console.error('خطأ في GET /api/backups/scheduled:', error);
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500 }
    );
  }
}
