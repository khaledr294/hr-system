import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseBackup, cleanupOldBackups } from '@/lib/backup';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

/**
 * POST /api/backups/scheduled
 * نسخة احتياطية تلقائية يومية
 * يتم استدعاؤها من Vercel Cron
 */
type EmptyContext = { params: Promise<Record<string, never>> };

const runScheduledBackup = async () => {
  try {
    console.log('🕐 بدء النسخ الاحتياطي المجدول...');

    const result = await createDatabaseBackup('automatic');
    const deletedCount = await cleanupOldBackups();

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء النسخة الاحتياطية بنجاح',
      backup: {
        id: result.backup.id,
        filename: result.backup.filename,
        size: `${(result.backup.size / (1024 * 1024)).toFixed(2)} MB`,
        createdAt: result.backup.createdAt,
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
};

const guardedHandler = withApiAuth<EmptyContext>(
  { permissions: [Permission.MANAGE_SETTINGS], auditAction: 'BACKUP_RUN' },
  async () => runScheduledBackup()
);

const isCronRequest = (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  return Boolean(cronSecret) && authHeader === `Bearer ${cronSecret}`;
};

export async function POST(request: NextRequest, context: EmptyContext) {
  if (isCronRequest(request)) {
    return runScheduledBackup();
  }

  return guardedHandler(request, context);
}

/**
 * GET /api/backups/scheduled
 * للسماح بـ Vercel Cron استدعاء الـ endpoint
 */
export async function GET(request: NextRequest, context: EmptyContext) {
  if (isCronRequest(request)) {
    return runScheduledBackup();
  }

  return guardedHandler(request, context);
}
