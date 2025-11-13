import { prisma } from './prisma';
import { v4 as uuidv4 } from 'uuid';
import pako from 'pako';

export interface BackupInfo {
  id: string;
  filename: string;
  size: number;
  createdAt: Date;
  type: 'manual' | 'automatic';
  status: 'completed' | 'failed' | 'in_progress';
}

export interface BackupData {
  metadata: {
    version: string;
    timestamp: string;
    tables: string[];
  };
  data: {
    users: unknown[];
    workers: unknown[];
    clients: unknown[];
    contracts: unknown[];
    packages: unknown[];
    nationalitySalaries: unknown[];
    logs: unknown[];
    backups: unknown[];
  };
}

export async function createDatabaseBackup(type: 'manual' | 'automatic' = 'automatic'): Promise<{
  backup: BackupInfo;
  data: string;
}> {
  try {
    console.log('🔄 بدء عملية النسخ الاحتياطي...');

    const timestamp = new Date().toISOString();

    console.log('📦 جاري تصدير البيانات...');
    
    const [
      users,
      workers,
      clients,
      contracts,
      packages,
      nationalitySalaries,
      logs,
      backups,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.worker.findMany({ include: { nationalitySalary: true } }),
      prisma.client.findMany(),
      prisma.contract.findMany({ include: { worker: true, client: true } }),
      prisma.package.findMany(),
      prisma.nationalitySalary.findMany(),
      prisma.log.findMany({ orderBy: { createdAt: 'desc' }, take: 1000 }),
      prisma.backup.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    ]);

    const backupData: BackupData = {
      metadata: {
        version: '1.0',
        timestamp,
        tables: [
          'users',
          'workers',
          'clients',
          'contracts',
          'packages',
          'nationalitySalaries',
          'logs',
          'backups',
        ],
      },
      data: {
        users,
        workers,
        clients,
        contracts,
        packages,
        nationalitySalaries,
        logs,
        backups,
      },
    };

    const jsonString = JSON.stringify(backupData, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );

    const compressed = pako.gzip(jsonString);
    const base64Data = Buffer.from(compressed).toString('base64');

    const originalSize = Buffer.byteLength(jsonString, 'utf8');
    const compressedSize = compressed.length;
    const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(2);

    console.log(`📊 الحجم الأصلي: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📦 الحجم المضغوط: ${(compressedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`🎯 نسبة الضغط: ${compressionRatio}%`);

    const filename = `backup-${timestamp.replace(/[:.]/g, '-')}.gz`;

    const backup = await prisma.backup.create({
      data: {
        id: uuidv4(),
        filename,
        size: BigInt(compressedSize),
        type,
        status: 'completed',
      },
    });

    console.log(`✅ تم إنشاء النسخة الاحتياطية بنجاح: ${filename}`);

    return {
      backup: {
        id: backup.id,
        filename: backup.filename,
        size: Number(backup.size),
        createdAt: backup.createdAt,
        type: backup.type as 'manual' | 'automatic',
        status: backup.status as 'completed' | 'failed' | 'in_progress',
      },
      data: base64Data,
    };
  } catch (error) {
    console.error('❌ فشل في إنشاء النسخة الاحتياطية:', error);
    
    try {
      await prisma.backup.create({
        data: {
          id: uuidv4(),
          filename: `failed-${new Date().toISOString()}`,
          size: BigInt(0),
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

export async function getBackups(): Promise<BackupInfo[]> {
  try {
    const backups = await prisma.backup.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return backups.map((backup) => ({
      id: backup.id,
      filename: backup.filename,
      size: Number(backup.size ?? 0),
      createdAt: backup.createdAt,
      type: backup.type as 'manual' | 'automatic',
      status: backup.status as 'completed' | 'failed' | 'in_progress',
    }));
  } catch (error) {
    console.error('خطأ في جلب النسخ الاحتياطية:', error);
    return [];
  }
}

export async function deleteBackup(backupId: string): Promise<boolean> {
  try {
    await prisma.backup.delete({
      where: { id: backupId },
    });

    console.log(`✅ تم حذف النسخة الاحتياطية: ${backupId}`);
    return true;
  } catch (error) {
    console.error('خطأ في حذف النسخة الاحتياطية:', error);
    return false;
  }
}

export async function cleanupOldBackups(): Promise<number> {
  try {
    const allBackups = await prisma.backup.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (allBackups.length <= 10) {
      return 0;
    }

    const backupsToDelete = allBackups.slice(10);
    
    for (const backup of backupsToDelete) {
      await prisma.backup.delete({
        where: { id: backup.id },
      });
    }

    console.log(`✅ تم حذف ${backupsToDelete.length} نسخة احتياطية قديمة`);
    return backupsToDelete.length;
  } catch (error) {
    console.error('خطأ في تنظيف النسخ الاحتياطية:', error);
    return 0;
  }
}

export async function getBackupStats() {
  try {
    const backups = await prisma.backup.findMany();

    const totalSize = backups.reduce((sum, b) => sum + Number(b.size ?? 0), 0);
    const completedCount = backups.filter(b => b.status === 'completed').length;
    const failedCount = backups.filter(b => b.status === 'failed').length;

    return {
      totalBackups: backups.length,
      completedBackups: completedCount,
      failedBackups: failedCount,
      totalSize: totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
    };
  } catch (error) {
    console.error('خطأ في جلب إحصائيات النسخ الاحتياطية:', error);
    return {
      totalBackups: 0,
      completedBackups: 0,
      failedBackups: 0,
      totalSize: 0,
      totalSizeMB: '0',
    };
  }
}

export async function getBackupFile(_backupId: string): Promise<Buffer | null> {
  console.log('getBackupFile is deprecated - use direct download from API');
  return null;
}

export async function restoreBackup(_backupId: string): Promise<void> {
  throw new Error('استعادة النسخ الاحتياطية غير مدعومة حالياً');
}
