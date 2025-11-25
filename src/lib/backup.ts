import { prisma } from './prisma';
import { v4 as uuidv4 } from 'uuid';
import pako from 'pako';

// Backup and restore utilities for HR System

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

export async function restoreBackup(backupId: string, userId?: string): Promise<{
  success: boolean;
  message: string;
  stats?: {
    users: number;
    workers: number;
    clients: number;
    contracts: number;
    packages: number;
  };
}> {
  try {
    console.log('🔄 بدء عملية الاستعادة...');

    // Get backup
    const backup = await prisma.backup.findUnique({
      where: { id: backupId }
    });

    if (!backup) {
      throw new Error('النسخة الاحتياطية غير موجودة');
    }

    if (backup.status !== 'completed') {
      throw new Error('لا يمكن استعادة نسخة احتياطية غير مكتملة');
    }

    if (!backup.data) {
      throw new Error('بيانات النسخة الاحتياطية مفقودة');
    }

    console.log('📦 جاري فك ضغط البيانات...');
    
    // Decompress data
    const compressedBuffer = Buffer.from(backup.data as string, 'base64');
    const decompressed = pako.ungzip(compressedBuffer, { to: 'string' });
    const backupData: BackupData = JSON.parse(decompressed);

    console.log('✅ تم فك الضغط بنجاح');
    console.log('📊 الجداول المتوفرة:', backupData.metadata.tables);

    // Create a pre-restore backup automatically
    console.log('💾 جاري إنشاء نسخة احتياطية قبل الاستعادة...');
    await createDatabaseBackup('automatic');

    // Start restoration (WITHOUT transaction to avoid timeout)
    console.log('🔄 بدء عملية الاستعادة...');
    
    // Clear existing data (except backups and critical system data)
    console.log('🗑️ جاري حذف البيانات القديمة...');
    
    await prisma.log.deleteMany({});
    await prisma.contract.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.worker.deleteMany({});
    await prisma.nationalitySalary.deleteMany({});
    await prisma.package.deleteMany({});
    await prisma.user.deleteMany({}); // Clear users too

    console.log('📥 جاري استعادة البيانات...');

    // Get existing JobTitles to validate user jobTitleIds
    const existingJobTitles = await prisma.jobTitle.findMany({
      select: { id: true }
    });
    const jobTitleIds = new Set(existingJobTitles.map(jt => jt.id));
    console.log('📋 المسميات الوظيفية الموجودة:', existingJobTitles.length);

    // Get existing Nationalities to validate worker nationalityIds
    const existingNationalities = await prisma.nationality.findMany({
      select: { id: true }
    });
    const nationalityIds = new Set(existingNationalities.map(n => n.id));
    console.log('🌍 الجنسيات الموجودة:', existingNationalities.length);

    // Restore users (needed for contracts with marketerId)
    console.log('👤 استعادة المستخدمين...');
    const usersCreated = [];
    let usersSkipped = 0;
    for (const user of backupData.data.users) {
      try {
        const { logs, Notification, jobTitle, ...userData } = user;
        
        // Check if jobTitleId is valid
        if (userData.jobTitleId && !jobTitleIds.has(userData.jobTitleId)) {
          console.error('Invalid jobTitleId for user:', user.email, '- setting to first available');
          userData.jobTitleId = existingJobTitles[0]?.id || null;
        }
        
        const createdUser = await prisma.user.create({ data: userData });
        usersCreated.push(createdUser);
      } catch (err: any) {
        console.error('Failed to restore user:', user.id, err.message);
        usersSkipped++;
      }
    }
    console.log('✅ تم استعادة', usersCreated.length, 'مستخدم', usersSkipped > 0 ? `(تم تخطي ${usersSkipped})` : '');

    // Restore packages (no dependencies)
    console.log('📦 استعادة الباقات...');
    const packagesCreated = [];
    for (const pkg of backupData.data.packages) {
      try {
        const createdPackage = await prisma.package.create({ data: pkg });
        packagesCreated.push(createdPackage);
      } catch (err: any) {
        console.error('Failed to restore package:', pkg.id, err.message);
      }
    }
    console.log('✅ تم استعادة', packagesCreated.length, 'باقة');

    // Restore nationality salaries
    console.log('💰 استعادة رواتب الجنسيات...');
    const nationalitySalariesCreated = [];
    let salariesSkipped = 0;
    for (const ns of backupData.data.nationalitySalaries) {
      try {
        // Check if nationalityId is valid
        if (ns.nationalityId && !nationalityIds.has(ns.nationalityId)) {
          console.error('Invalid nationalityId for salary:', ns.id, '- skipping');
          salariesSkipped++;
          continue;
        }
        const createdNS = await prisma.nationalitySalary.create({ data: ns });
        nationalitySalariesCreated.push(createdNS);
      } catch (err: any) {
        console.error('Failed to restore nationality salary:', ns.id, err.message);
        salariesSkipped++;
      }
    }
    console.log('✅ تم استعادة', nationalitySalariesCreated.length, 'راتب جنسية', salariesSkipped > 0 ? `(تم تخطي ${salariesSkipped})` : '');

    // Restore workers
    console.log('👷 استعادة العمال...');
    const workersCreated = [];
    let workersSkipped = 0;
    for (const worker of backupData.data.workers) {
      try {
        const { nationalitySalary, nationality, contracts, ...workerData } = worker;
        
        // Check if nationalityId is valid (set to null if invalid)
        if (workerData.nationalityId && !nationalityIds.has(workerData.nationalityId)) {
          console.error('Invalid nationalityId for worker:', worker.name, '- setting to null');
          workerData.nationalityId = null;
        }
        
        const createdWorker = await prisma.worker.create({ data: workerData });
        workersCreated.push(createdWorker);
      } catch (err: any) {
        console.error('Failed to restore worker:', worker.id, err.message);
        workersSkipped++;
      }
    }
    console.log('✅ تم استعادة', workersCreated.length, 'عامل', workersSkipped > 0 ? `(تم تخطي ${workersSkipped})` : '');

    // Restore clients
    console.log('🏢 استعادة العملاء...');
    const clientsCreated = [];
    for (const client of backupData.data.clients) {
      try {
        const { contracts, ...clientData } = client;
        const createdClient = await prisma.client.create({ data: clientData });
        clientsCreated.push(createdClient);
      } catch (err: any) {
        console.error('Failed to restore client:', client.id, err.message);
      }
    }
    console.log('✅ تم استعادة', clientsCreated.length, 'عميل');

    // Restore contracts
    console.log('📄 استعادة العقود...');
    const contractsCreated = [];
    for (const contract of backupData.data.contracts) {
      try {
        const { worker, client, marketer, ...contractData } = contract;
        
        // Check if marketerId exists, if not set to null
        if (contractData.marketerId) {
          const marketerExists = await prisma.user.findUnique({
            where: { id: contractData.marketerId }
          });
          if (!marketerExists) {
            contractData.marketerId = null;
            contractData.marketerName = null;
          }
        }
        
        const createdContract = await prisma.contract.create({ data: contractData });
        contractsCreated.push(createdContract);
      } catch (err: any) {
        console.error('Failed to restore contract:', contract.id, err.message);
      }
    }
    console.log('✅ تم استعادة', contractsCreated.length, 'عقد');

    // Restore logs (last 1000 only)
    console.log('📝 استعادة السجلات...');
    let logsRestored = 0;
    for (const log of backupData.data.logs.slice(0, 1000)) {
      try {
        await prisma.log.create({ data: log });
        logsRestored++;
      } catch {
        // Ignore log restore failures silently
      }
    }
    console.log('✅ تم استعادة', logsRestored, 'سجل');

    const stats = {
      users: usersCreated.length,
      workers: workersCreated.length,
      clients: clientsCreated.length,
      contracts: contractsCreated.length,
      packages: packagesCreated.length,
      nationalitySalaries: nationalitySalariesCreated.length,
      logs: logsRestored,
    };

    console.log('✅ تمت الاستعادة بنجاح');
    console.log('📊 الإحصائيات:', stats);

    // Log restoration action
    await prisma.log.create({
      data: {
        id: uuidv4(),
        userId: userId,
        action: 'BACKUP_RESTORE',
        details: JSON.stringify({
          backupId,
          filename: backup.filename,
          stats,
          timestamp: new Date().toISOString(),
        }),
      },
    }).catch(() => null);

    return {
      success: true,
      message: `تمت استعادة النسخة الاحتياطية بنجاح. تم استعادة ${stats.users} مستخدم، ${stats.workers} عاملة، ${stats.clients} عميل، ${stats.contracts} عقد.`,
      stats,
    };
  } catch (error: any) {
    console.error('خطأ في استعادة النسخة الاحتياطية:', error);
    throw new Error(error.message || 'فشلت عملية الاستعادة');
  }
}
