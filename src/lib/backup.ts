import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from './prisma';

const execAsync = promisify(exec);

export interface BackupInfo {
  id: string;
  filename: string;
  size: number;
  createdAt: Date;
  type: 'manual' | 'automatic';
  status: 'completed' | 'failed' | 'in_progress';
}

/**
 * إنشاء نسخة احتياطية من قاعدة البيانات
 */
export async function createDatabaseBackup(type: 'manual' | 'automatic' = 'automatic'): Promise<BackupInfo> {
  try {
    console.log('🔄 بدء عملية النسخ الاحتياطي...');

    // إنشاء مجلد backups إذا لم يكن موجوداً
    const backupDir = path.join(process.cwd(), 'backups');
    try {
      await fs.mkdir(backupDir, { recursive: true });
    } catch (error) {
      console.log('مجلد النسخ الاحتياطي موجود بالفعل');
    }

    // اسم الملف مع التاريخ والوقت
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    const filePath = path.join(backupDir, filename);

    // الحصول على DATABASE_URL من متغيرات البيئة
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL غير موجود في متغيرات البيئة');
    }

    // استخراج معلومات الاتصال من URL
    const dbInfo = parseDatabaseUrl(databaseUrl);

    // تنفيذ pg_dump لإنشاء النسخة الاحتياطية
    const pgDumpCommand = `pg_dump "${databaseUrl}" > "${filePath}"`;
    
    console.log('📦 جاري تصدير قاعدة البيانات...');
    await execAsync(pgDumpCommand);

    // الحصول على حجم الملف
    const stats = await fs.stat(filePath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`✅ تم إنشاء النسخة الاحتياطية بنجاح: ${filename} (${sizeInMB} MB)`);

    // حفظ معلومات النسخة الاحتياطية في قاعدة البيانات
    const backup = await prisma.backup.create({
      data: {
        filename,
        size: stats.size,
        type,
        status: 'completed',
      },
    });

    return {
      id: backup.id,
      filename: backup.filename,
      size: Number(backup.size),
      createdAt: backup.createdAt,
      type: backup.type as 'manual' | 'automatic',
      status: backup.status as 'completed' | 'failed' | 'in_progress',
    };
  } catch (error) {
    console.error('❌ فشل في إنشاء النسخة الاحتياطية:', error);
    
    // حفظ حالة الفشل
    try {
      await prisma.backup.create({
        data: {
          filename: `failed-${new Date().toISOString()}`,
          size: 0,
          type,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } catch (dbError) {
      console.error('فشل في حفظ معلومات الخطأ:', dbError);
    }

    throw error;
  }
}

/**
 * استخراج معلومات الاتصال من DATABASE_URL
 */
function parseDatabaseUrl(url: string) {
  try {
    // إزالة البروتوكول
    const withoutProtocol = url.replace(/^(postgres|postgresql):\/\//, '');
    
    // فصل المعلومات
    const parts = withoutProtocol.split('@');
    const credentials = parts[0].split(':');
    const hostAndDb = parts[1].split('/');
    const hostInfo = hostAndDb[0].split(':');

    return {
      user: credentials[0],
      password: credentials[1],
      host: hostInfo[0],
      port: hostInfo[1] || '5432',
      database: hostAndDb[1].split('?')[0],
    };
  } catch (error) {
    console.error('خطأ في تحليل DATABASE_URL:', error);
    throw new Error('تنسيق DATABASE_URL غير صحيح');
  }
}

/**
 * الحصول على قائمة النسخ الاحتياطية
 */
export async function getBackups(): Promise<BackupInfo[]> {
  try {
    const backups = await prisma.backup.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return backups.map((backup: any) => ({
      id: backup.id,
      filename: backup.filename,
      size: Number(backup.size),
      createdAt: backup.createdAt,
      type: backup.type as 'manual' | 'automatic',
      status: backup.status as 'completed' | 'failed' | 'in_progress',
    }));
  } catch (error) {
    console.error('خطأ في جلب النسخ الاحتياطية:', error);
    return [];
  }
}

/**
 * حذف نسخة احتياطية قديمة
 */
export async function deleteBackup(backupId: string): Promise<boolean> {
  try {
    const backup = await prisma.backup.findUnique({
      where: { id: backupId },
    });

    if (!backup) {
      throw new Error('النسخة الاحتياطية غير موجودة');
    }

    // حذف الملف من نظام الملفات
    const filePath = path.join(process.cwd(), 'backups', backup.filename);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.log('الملف غير موجود أو تم حذفه مسبقاً');
    }

    // حذف من قاعدة البيانات
    await prisma.backup.delete({
      where: { id: backupId },
    });

    console.log(`✅ تم حذف النسخة الاحتياطية: ${backup.filename}`);
    return true;
  } catch (error) {
    console.error('خطأ في حذف النسخة الاحتياطية:', error);
    return false;
  }
}

/**
 * حذف النسخ الاحتياطية القديمة (أقدم من X أيام)
 */
export async function cleanupOldBackups(daysToKeep: number = 30): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const oldBackups = await prisma.backup.findMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        type: 'automatic', // حذف النسخ التلقائية فقط
      },
    });

    let deletedCount = 0;
    for (const backup of oldBackups) {
      const deleted = await deleteBackup(backup.id);
      if (deleted) deletedCount++;
    }

    console.log(`🗑️ تم حذف ${deletedCount} نسخة احتياطية قديمة`);
    return deletedCount;
  } catch (error) {
    console.error('خطأ في تنظيف النسخ الاحتياطية القديمة:', error);
    return 0;
  }
}

/**
 * تنزيل نسخة احتياطية
 */
export async function getBackupFile(backupId: string): Promise<Buffer | null> {
  try {
    const backup = await prisma.backup.findUnique({
      where: { id: backupId },
    });

    if (!backup) {
      throw new Error('النسخة الاحتياطية غير موجودة');
    }

    const filePath = path.join(process.cwd(), 'backups', backup.filename);
    const fileBuffer = await fs.readFile(filePath);

    return fileBuffer;
  } catch (error) {
    console.error('خطأ في قراءة ملف النسخة الاحتياطية:', error);
    return null;
  }
}

/**
 * استعادة قاعدة البيانات من نسخة احتياطية
 * ⚠️ خطير: هذا سيمسح البيانات الحالية!
 */
export async function restoreBackup(backupId: string): Promise<boolean> {
  try {
    console.log('⚠️ بدء عملية الاستعادة...');

    const backup = await prisma.backup.findUnique({
      where: { id: backupId },
    });

    if (!backup) {
      throw new Error('النسخة الاحتياطية غير موجودة');
    }

    const filePath = path.join(process.cwd(), 'backups', backup.filename);
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL غير موجود');
    }

    // تنفيذ psql لاستعادة البيانات
    const restoreCommand = `psql "${databaseUrl}" < "${filePath}"`;
    
    console.log('♻️ جاري استعادة قاعدة البيانات...');
    await execAsync(restoreCommand);

    console.log('✅ تم استعادة قاعدة البيانات بنجاح');
    return true;
  } catch (error) {
    console.error('❌ فشل في استعادة قاعدة البيانات:', error);
    return false;
  }
}

/**
 * الحصول على إحصائيات النسخ الاحتياطية
 */
export async function getBackupStats() {
  try {
    const total = await prisma.backup.count();
    const successful = await prisma.backup.count({
      where: { status: 'completed' },
    });
    const failed = await prisma.backup.count({
      where: { status: 'failed' },
    });
    
    const totalSize = await prisma.backup.aggregate({
      _sum: { size: true },
      where: { status: 'completed' },
    });

    const lastBackup = await prisma.backup.findFirst({
      orderBy: { createdAt: 'desc' },
      where: { status: 'completed' },
    });

    return {
      total,
      successful,
      failed,
      totalSizeBytes: Number(totalSize._sum.size || 0),
      totalSizeMB: ((Number(totalSize._sum.size) || 0) / (1024 * 1024)).toFixed(2),
      lastBackup: lastBackup ? {
        date: lastBackup.createdAt,
        filename: lastBackup.filename,
      } : null,
    };
  } catch (error) {
    console.error('خطأ في جلب إحصائيات النسخ الاحتياطية:', error);
    return null;
  }
}
