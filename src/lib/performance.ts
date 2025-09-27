import { prisma } from '@/lib/prisma';

/**
 * تنظيف السجلات القديمة (أكبر من 90 يوم)
 */
export async function cleanupOldLogs(): Promise<number> {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const result = await prisma.log.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo
        }
      }
    });

    console.log(`تم حذف ${result.count} سجل قديم`);
    return result.count;
  } catch (error) {
    console.error('Error cleaning up old logs:', error);
    return 0;
  }
}

/**
 * تحسين قاعدة البيانات
 */
export async function optimizeDatabase(): Promise<void> {
  try {
    // تنظيف السجلات القديمة
    await cleanupOldLogs();
    
    // يمكن إضافة عمليات تحسين أخرى هنا
    console.log('تم تحسين قاعدة البيانات');
  } catch (error) {
    console.error('Error optimizing database:', error);
  }
}

/**
 * فحص صحة قاعدة البيانات
 */
export async function healthCheck(): Promise<{
  database: boolean;
  workersCount: number;
  contractsCount: number;
  usersCount: number;
  logsCount: number;
}> {
  try {
    const [workersCount, contractsCount, usersCount, logsCount] = await Promise.all([
      prisma.worker.count(),
      prisma.contract.count(),
      prisma.user.count(),
      prisma.log.count()
    ]);

    return {
      database: true,
      workersCount,
      contractsCount,
      usersCount,
      logsCount
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      database: false,
      workersCount: 0,
      contractsCount: 0,
      usersCount: 0,
      logsCount: 0
    };
  }
}