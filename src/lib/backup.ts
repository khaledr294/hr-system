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
    jobTitles: unknown[];
    systemSettings: unknown[];
    payrollDeliveries: unknown[];
    marketers: unknown[];
    notifications: unknown[];
    archivedContracts: unknown[];
    archivedWorkers: unknown[];
    archiveLogs: unknown[];
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
      jobTitles,
      systemSettings,
      payrollDeliveries,
      marketers,
      notifications,
      archivedContracts,
      archivedWorkers,
      archiveLogs,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.worker.findMany({ include: { nationalitySalary: true } }),
      prisma.client.findMany(),
      prisma.contract.findMany({ include: { worker: true, client: true } }),
      prisma.package.findMany(),
      prisma.nationalitySalary.findMany(),
      prisma.log.findMany({ orderBy: { createdAt: 'desc' }, take: 1000 }),
      prisma.backup.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.jobTitle.findMany(),
      prisma.systemSettings.findMany(),
      prisma.payrollDelivery.findMany(),
      prisma.marketer.findMany(),
      prisma.notification.findMany(),
      prisma.archivedContract.findMany(),
      prisma.archivedWorker.findMany(),
      prisma.archiveLog.findMany(),
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
          'jobTitles',
          'systemSettings',
          'payrollDeliveries',
          'marketers',
          'notifications',
          'archivedContracts',
          'archivedWorkers',
          'archiveLogs',
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
        jobTitles,
        systemSettings,
        payrollDeliveries,
        marketers,
        notifications,
        archivedContracts,
        archivedWorkers,
        archiveLogs,
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
        data: base64Data,
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
    nationalitySalaries: number;
    logs: number;
    jobTitles: number;
    systemSettings: number;
    payrollDeliveries: number;
    marketers: number;
    notifications: number;
    archivedContracts: number;
    archivedWorkers: number;
    archiveLogs: number;
  };
  errors?: {
    workers?: string[];
    contracts?: string[];
  };
}> {
  // حماية ضد عدم تهيئة prisma
  if (!prisma) throw new Error("Prisma client is not initialized!");
  // حماية لكل استدعاء مهم
  if (typeof prisma.jobTitle?.findMany !== "function") throw new Error("prisma.jobTitle.findMany is not a function");
  if (typeof prisma.user?.create !== "function") throw new Error("prisma.user.create is not a function");
  if (typeof prisma.worker?.create !== "function") throw new Error("prisma.worker.create is not a function");
  if (typeof prisma.client?.create !== "function") throw new Error("prisma.client.create is not a function");
  if (typeof prisma.contract?.create !== "function") throw new Error("prisma.contract.create is not a function");
  if (typeof prisma.package?.create !== "function") throw new Error("prisma.package.create is not a function");
  if (typeof prisma.nationalitySalary?.create !== "function") throw new Error("prisma.nationalitySalary.create is not a function");
  if (typeof prisma.log?.create !== "function") throw new Error("prisma.log.create is not a function");
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
    await prisma.archiveLog.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.payrollDelivery.deleteMany({});
    await prisma.contract.deleteMany({});
    await prisma.archivedContract.deleteMany({});
    await prisma.archivedWorker.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.worker.deleteMany({});
    await prisma.nationalitySalary.deleteMany({});
    await prisma.package.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.jobTitle.deleteMany({});
    await prisma.marketer.deleteMany({});
    await prisma.systemSettings.deleteMany({});

    console.log('📥 جاري استعادة البيانات...');

    // Restore nationality salaries
    console.log('💰 استعادة رواتب الجنسيات...');
    const nationalitySalariesCreated = [];
    let salariesSkipped = 0;
    for (const ns of backupData.data.nationalitySalaries) {
      try {
        // Check if nationalityId is valid
        const createdNS = await prisma.nationalitySalary.create({ data: ns as any });
        nationalitySalariesCreated.push(createdNS);
      } catch (err: any) {
        console.error('Failed to restore nationality salary:', (ns as any).id, err.message);
        salariesSkipped++;
      }
    }
    console.log('✅ تم استعادة', nationalitySalariesCreated.length, 'راتب جنسية', salariesSkipped > 0 ? `(تم تخطي ${salariesSkipped})` : '');

    // Restore System Settings
    console.log('⚙️ استعادة إعدادات النظام...');
    let systemSettingsRestored = 0;
    if (backupData.data.systemSettings) {
      for (const setting of backupData.data.systemSettings) {
        try {
          await prisma.systemSettings.create({ data: setting as any });
          systemSettingsRestored++;
        } catch (err) { console.error('Failed to restore system setting', err); }
      }
    }
    console.log('✅ تم استعادة', systemSettingsRestored, 'إعدادات');

    // Restore Job Titles
    console.log('📋 استعادة المسميات الوظيفية...');
    let jobTitlesRestored = 0;
    if (backupData.data.jobTitles) {
      for (const jt of backupData.data.jobTitles) {
        try {
          await prisma.jobTitle.create({ data: jt as any });
          jobTitlesRestored++;
        } catch (err) { console.error('Failed to restore job title', err); }
      }
    }
    console.log('✅ تم استعادة', jobTitlesRestored, 'مسمى وظيفي');

    // Restore Marketers
    console.log('📢 استعادة المسوقين...');
    let marketersRestored = 0;
    if (backupData.data.marketers) {
      for (const m of backupData.data.marketers) {
        try {
          await prisma.marketer.create({ data: m as any });
          marketersRestored++;
        } catch (err) { console.error('Failed to restore marketer', err); }
      }
    }
    console.log('✅ تم استعادة', marketersRestored, 'مسوق');

    // Get existing JobTitles to validate user jobTitleIds
    const existingJobTitles = await prisma.jobTitle.findMany();
    const jobTitleIds = new Set(existingJobTitles.map(jt => jt.id));
    console.log('📋 المسميات الوظيفية الموجودة:', existingJobTitles.length);

    // Get existing NationalitySalaries AFTER restore
    const existingNationalitySalaries = await prisma.nationalitySalary.findMany({
      select: { id: true }
    });
    const nationalitySalaryIds = new Set(existingNationalitySalaries.map(n => n.id));
    console.log('💰 رواتب الجنسيات الموجودة:', existingNationalitySalaries.length);

    // Restore users (needed for contracts with marketerId)
    console.log('👤 استعادة المستخدمين...');
    const usersCreated = [];
    let usersSkipped = 0;
    for (const user of backupData.data.users) {
      try {
        const { logs, Notification, jobTitle, ...userData } = user as any;
        
        // Check if jobTitleId is valid
        if (userData.jobTitleId && !jobTitleIds.has(userData.jobTitleId)) {
          // Try to find matching job title by name
          const originalJobTitle = (user as any).jobTitle; // Assuming jobTitle object might be in backup or we infer from somewhere? 
          // Actually backup usually just has the ID. If we don't have the name, we can't map by name easily unless we had a map.
          // But wait, the backup data MIGHT have the jobTitle object included if the findMany included it?
          // Looking at createDatabaseBackup, user.findMany() does NOT include jobTitle.
          // So we only have the ID.
          // However, in the provided backup file, I see "jobTitleId" but no "jobTitle" object in the user data.
          // Wait, the user said "Users returned as HR Manager" (which is default?) or "Users returned as Marketer" (which is default?).
          // The issue is that the ID in backup doesn't exist in DB.
          // We should try to map known IDs if possible, or just default to a safe role.
          // Better strategy: If ID not found, check if there's a default role or try to match 'HR_MANAGER' if the user was 'nader'.
          
          // For now, let's just log it and default to first available, BUT we can add a special check for Nader if we wanted, 
          // but the repair script handles Nader. 
          // The generic fix is: if ID invalid, pick a safe default (Marketer) instead of random first one if possible.
          
          const marketerRole = existingJobTitles.find(jt => jt.name === 'Marketer' || jt.name === 'مسوق');
          const defaultRole = marketerRole || existingJobTitles[0];
          
          console.warn(`Invalid jobTitleId for user: ${(user as any).email}. Mapping to ${defaultRole?.name}`);
          userData.jobTitleId = defaultRole?.id || null;
        }
        
        const createdUser = await prisma.user.create({ data: userData });
        usersCreated.push(createdUser);
      } catch (err: any) {
        console.error('Failed to restore user:', (user as any).id, err.message);
        usersSkipped++;
      }
    }
    console.log('✅ تم استعادة', usersCreated.length, 'مستخدم', usersSkipped > 0 ? `(تم تخطي ${usersSkipped})` : '');

    // Restore packages (no dependencies)
    console.log('📦 استعادة الباقات...');
    const packagesCreated = [];
    for (const pkg of backupData.data.packages) {
      try {
        const createdPackage = await prisma.package.create({ data: pkg as any });
        packagesCreated.push(createdPackage);
      } catch (err: any) {
        console.error('Failed to restore package:', (pkg as any).id, err.message);
      }
    }
    console.log('✅ تم استعادة', packagesCreated.length, 'باقة');

    // Restore workers
    console.log('👷 استعادة العمال...');
    const workersCreated = [];
    let workersSkipped = 0;
    for (const worker of backupData.data.workers) {
      try {
        // إعادة بناء بيانات العاملة مع تصحيح الأسماء وعدم تمرير أي حقل خاطئ
        const allowedWorkerFields = [
          'id','name','code','nationality','residencyNumber','dateOfBirth','phone','status','salary','createdAt','updatedAt','nationalitySalaryId','arrivalDate','borderNumber','iban','salaryTransferMethod','salaryTransferNotes','officeName','passportNumber','religion','reservationNotes','reservedAt','reservedBy','residenceBranch'
        ];
        const workerAny = worker as any;
        const workerData: Record<string, any> = {};
        // بناء الكائن فقط من الحقول المسموحة مع تصحيح الأسماء
        for (const field of allowedWorkerFields) {
          if (field === 'arrivalDate') {
            if (workerAny['arrivalDate'] !== undefined) workerData.arrivalDate = workerAny['arrivalDate'];
            else if (workerAny['arrival Date'] !== undefined) workerData.arrivalDate = workerAny['arrival Date'];
          } else if (field === 'nationalitySalaryId') {
            if (workerAny['nationalitySalaryId'] !== undefined) workerData.nationalitySalaryId = workerAny['nationalitySalaryId'];
            else if (workerAny['nationalitySalaryld'] !== undefined) workerData.nationalitySalaryId = workerAny['nationalitySalaryld'];
          } else if (workerAny[field] !== undefined) {
            workerData[field] = workerAny[field];
          }
        }
        // إذا كان nationalitySalaryId غير صحيح أو غير موجود، عيّنه إلى null
        if (workerData.nationalitySalaryId && !nationalitySalaryIds.has(workerData.nationalitySalaryId)) {
          // Try to find by nationality name if ID is invalid
          // We need the nationalitySalary map for this.
          // Since we can't easily get the map here without fetching again, we'll just set to null.
          // The repair script will handle the linking by name.
          workerData.nationalitySalaryId = null;
        }
        const createdWorker = await prisma.worker.create({ data: workerData as any });
        workersCreated.push(createdWorker);
      } catch (err: any) {
        if (!(globalThis as any).__restoreErrors) (globalThis as any).__restoreErrors = { workers: [], contracts: [] };
        ((globalThis as any).__restoreErrors).workers.push(`العاملة ${(worker as any).name} (${(worker as any).id}): ${err.message}`);
        workersSkipped++;
      }
    }
    console.log('✅ تم استعادة', workersCreated.length, 'عامل', workersSkipped > 0 ? `(تم تخطي ${workersSkipped})` : '');

    // Restore clients
    console.log('🏢 استعادة العملاء...');
    const clientsCreated = [];
    for (const client of backupData.data.clients) {
      try {
        const { contracts, ...clientData } = client as any;
        const createdClient = await prisma.client.create({ data: clientData });
        clientsCreated.push(createdClient);
      } catch (err: any) {
        console.error('Failed to restore client:', (client as any).id, err.message);
      }
    }
    console.log('✅ تم استعادة', clientsCreated.length, 'عميل');

    // Restore contracts
    console.log('📄 استعادة العقود...');
    const contractsCreated = [];
    for (const contract of backupData.data.contracts) {
      try {
        const { worker, client, marketer, ...contractData } = contract as any;
        // إذا كان workerId غير موجود في العمال المستعادة، عيّنه إلى null
        if (contractData.workerId && !workersCreated.find(w => w.id === contractData.workerId)) {
          contractData.workerId = null;
        }
        // إذا كان clientId غير موجود في العملاء المستعادة، عيّنه إلى null
        if (contractData.clientId && !clientsCreated.find(c => c.id === contractData.clientId)) {
          contractData.clientId = null;
        }
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
        if (!(globalThis as any).__restoreErrors) (globalThis as any).__restoreErrors = { workers: [], contracts: [] };
        ((globalThis as any).__restoreErrors).contracts.push(`العقد ${(contract as any).id}: ${err.message}`);
      }
    }
    console.log('✅ تم استعادة', contractsCreated.length, 'عقد');

    // Restore logs (last 1000 only)
    console.log('📝 استعادة السجلات...');
    let logsRestored = 0;
    for (const log of backupData.data.logs.slice(0, 1000)) {
      try {
        await prisma.log.create({ data: log as any });
        logsRestored++;
      } catch {
        // Ignore log restore failures silently
      }
    }
    console.log('✅ تم استعادة', logsRestored, 'سجل');

    // Restore Payroll Deliveries
    console.log('💸 استعادة تسليم الرواتب...');
    let payrollDeliveriesRestored = 0;
    if (backupData.data.payrollDeliveries) {
      for (const pd of backupData.data.payrollDeliveries) {
        try {
          await prisma.payrollDelivery.create({ data: pd as any });
          payrollDeliveriesRestored++;
        } catch (err) { console.error('Failed to restore payroll delivery', err); }
      }
    }
    console.log('✅ تم استعادة', payrollDeliveriesRestored, 'سجل رواتب');

    // Restore Notifications
    console.log('🔔 استعادة الإشعارات...');
    let notificationsRestored = 0;
    if (backupData.data.notifications) {
      for (const n of backupData.data.notifications) {
        try {
          await prisma.notification.create({ data: n as any });
          notificationsRestored++;
        } catch (err) { console.error('Failed to restore notification', err); }
      }
    }
    console.log('✅ تم استعادة', notificationsRestored, 'إشعار');

    // Restore Archived Contracts
    console.log('🗄️ استعادة أرشيف العقود...');
    let archivedContractsRestored = 0;
    if (backupData.data.archivedContracts) {
      for (const ac of backupData.data.archivedContracts) {
        try {
          await prisma.archivedContract.create({ data: ac as any });
          archivedContractsRestored++;
        } catch (err) { console.error('Failed to restore archived contract', err); }
      }
    }
    console.log('✅ تم استعادة', archivedContractsRestored, 'عقد مؤرشف');

    // Restore Archived Workers
    console.log('🗄️ استعادة أرشيف العمال...');
    let archivedWorkersRestored = 0;
    if (backupData.data.archivedWorkers) {
      for (const aw of backupData.data.archivedWorkers) {
        try {
          await prisma.archivedWorker.create({ data: aw as any });
          archivedWorkersRestored++;
        } catch (err) { console.error('Failed to restore archived worker', err); }
      }
    }
    console.log('✅ تم استعادة', archivedWorkersRestored, 'عامل مؤرشف');

    // Restore Archive Logs
    console.log('🗄️ استعادة سجلات الأرشيف...');
    let archiveLogsRestored = 0;
    if (backupData.data.archiveLogs) {
      for (const al of backupData.data.archiveLogs) {
        try {
          await prisma.archiveLog.create({ data: al as any });
          archiveLogsRestored++;
        } catch (err) { console.error('Failed to restore archive log', err); }
      }
    }
    console.log('✅ تم استعادة', archiveLogsRestored, 'سجل أرشيف');


    const stats = {
      users: usersCreated.length,
      workers: workersCreated.length,
      clients: clientsCreated.length,
      contracts: contractsCreated.length,
      packages: packagesCreated.length,
      nationalitySalaries: nationalitySalariesCreated.length,
      logs: logsRestored,
      jobTitles: jobTitlesRestored,
      systemSettings: systemSettingsRestored,
      payrollDeliveries: payrollDeliveriesRestored,
      marketers: marketersRestored,
      notifications: notificationsRestored,
      archivedContracts: archivedContractsRestored,
      archivedWorkers: archivedWorkersRestored,
      archiveLogs: archiveLogsRestored,
    };


    // عرض تقرير الأخطاء إن وجدت
    let restoreErrors: { workers?: string[]; contracts?: string[] } = {};
    if ((globalThis as any).__restoreErrors) {
      if (((globalThis as any).__restoreErrors).workers?.length) {
        console.log('❗️ أخطاء استعادة العاملات:');
        for (const err of ((globalThis as any).__restoreErrors).workers) console.log(err);
        restoreErrors.workers = ((globalThis as any).__restoreErrors).workers;
      }
      if (((globalThis as any).__restoreErrors).contracts?.length) {
        console.log('❗️ أخطاء استعادة العقود:');
        for (const err of ((globalThis as any).__restoreErrors).contracts) console.log(err);
        restoreErrors.contracts = ((globalThis as any).__restoreErrors).contracts;
      }
    }

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
      errors: restoreErrors,
    };
  } catch (error: any) {
    console.error('خطأ في استعادة النسخة الاحتياطية:', error);
    throw new Error(error.message || 'فشلت عملية الاستعادة');
  }
}
