import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  createDatabaseBackup,
  getBackups,
  deleteBackup,
  getBackupFile,
  cleanupOldBackups,
  getBackupStats,
} from '@/lib/backup';

/**
 * GET /api/backups
 * جلب قائمة النسخ الاحتياطية أو تنزيل نسخة
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['ADMIN', 'GENERAL_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const backupId = searchParams.get('id');

    // تنزيل نسخة احتياطية
    if (action === 'download' && backupId) {
      const fileBuffer = await getBackupFile(backupId);
      if (!fileBuffer) {
        return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 });
      }

      const backups = await getBackups();
      const backup = backups.find(b => b.id === backupId);
      const filename = backup?.filename || 'backup.sql';

      return new NextResponse(fileBuffer.toString('utf-8'), {
        headers: {
          'Content-Type': 'application/sql',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // جلب الإحصائيات
    if (action === 'stats') {
      const stats = await getBackupStats();
      return NextResponse.json(stats);
    }

    // جلب قائمة النسخ الاحتياطية
    const backups = await getBackups();
    return NextResponse.json({ backups });
  } catch (error) {
    console.error('خطأ في GET /api/backups:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'حدث خطأ' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/backups
 * إنشاء نسخة احتياطية جديدة أو حذف نسخة
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['ADMIN', 'GENERAL_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const { action, backupId } = body;

    switch (action) {
      case 'create': {
        const backup = await createDatabaseBackup('manual');
        return NextResponse.json({
          success: true,
          message: 'تم إنشاء النسخة الاحتياطية بنجاح',
          backup,
        });
      }

      case 'delete': {
        if (!backupId) {
          return NextResponse.json({ error: 'معرف النسخة مطلوب' }, { status: 400 });
        }
        const deleted = await deleteBackup(backupId);
        if (deleted) {
          return NextResponse.json({
            success: true,
            message: 'تم حذف النسخة الاحتياطية بنجاح',
          });
        }
        return NextResponse.json({ error: 'فشل حذف النسخة الاحتياطية' }, { status: 500 });
      }

      case 'cleanup': {
        const daysToKeep = body.daysToKeep || 30;
        const deletedCount = await cleanupOldBackups(daysToKeep);
        return NextResponse.json({
          success: true,
          message: `تم حذف ${deletedCount} نسخة احتياطية قديمة`,
          deletedCount,
        });
      }

      default:
        return NextResponse.json({ error: 'عملية غير معروفة' }, { status: 400 });
    }
  } catch (error) {
    console.error('خطأ في POST /api/backups:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'حدث خطأ' },
      { status: 500 }
    );
  }
}
