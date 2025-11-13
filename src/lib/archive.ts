import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import type { Prisma } from '@prisma/client';

/**
 * أرشفة عقد منتهي
 */
export async function archiveContract(contractId: string, userId?: string, reason?: string) {
  try {
    // الحصول على بيانات العقد
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        worker: true,
        client: true,
        marketer: true
      }
    });

    if (!contract) {
      throw new Error('العقد غير موجود');
    }

    // التحقق من أن العقد مكتمل فقط (وليس منتهي)
    if (contract.status !== 'COMPLETED' && contract.status !== 'CANCELLED') {
      throw new Error('لا يمكن أرشفة هذا العقد. يمكن أرشفة العقود المكتملة أو الملغاة فقط.\n\nإذا كان العقد منتهياً (EXPIRED)، يرجى:\n1. إنهاء العقد رسمياً من خلال زر "إنهاء العقد"\n2. سيتم احتساب غرامة التأخير إن وجدت\n3. بعدها يمكن أرشفته');
    }

    // تحديث حالة العاملة تلقائياً عند أرشفة العقد
    // إذا كان العقد مكتمل أو ملغى، نعيد العاملة لحالة "متاحة"
    await prisma.worker.update({
      where: { id: contract.workerId },
      data: { 
        status: 'AVAILABLE',
        reservedAt: null,
        reservedBy: null
      }
    });

    // نسخ العقد إلى الأرشيف
    const archivedContract = await prisma.archivedContract.create({
      data: {
        id: contract.id, // استخدام نفس ID
        originalId: contract.id,
        workerId: contract.workerId,
        workerName: contract.worker.name,
        workerCode: contract.worker.code,
        clientId: contract.clientId,
        clientName: contract.client.name,
        startDate: contract.startDate,
        endDate: contract.endDate,
        packageType: contract.packageType,
        packageName: contract.packageName,
        totalAmount: contract.totalAmount,
        status: contract.status,
        contractNumber: contract.contractNumber,
        notes: contract.notes,
        delayDays: contract.delayDays,
        penaltyAmount: contract.penaltyAmount,
        marketerId: contract.marketerId,
        marketerName: contract.marketer?.name,
        archivedBy: userId,
        archiveReason: reason || contract.status,
        metadata: JSON.stringify({
          createdAt: contract.createdAt,
          updatedAt: contract.updatedAt
        })
      }
    });

    // حذف العقد الأصلي
    await prisma.contract.delete({
      where: { id: contractId }
    });

    // تسجيل في سجل الأرشفة
    await prisma.archiveLog.create({
      data: {
        id: uuidv4(),
        entityType: 'CONTRACT',
        entityId: contractId,
        action: 'ARCHIVE',
        performedBy: userId,
        reason: reason || contract.status,
        metadata: JSON.stringify({
          contractNumber: contract.contractNumber,
          workerName: contract.worker.name,
          clientName: contract.client.name
        })
      }
    });

    return archivedContract;
  } catch (error) {
    console.error('خطأ في أرشفة العقد:', error);
    throw error;
  }
}

/**
 * أرشفة تلقائية للعقود المنتهية (Cron Job)
 */
export async function autoArchiveExpiredContracts(daysAfterExpiry: number = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAfterExpiry);

    // البحث عن العقود المنتهية منذ أكثر من X يوم
    const expiredContracts = await prisma.contract.findMany({
      where: {
        status: 'EXPIRED',
        endDate: {
          lte: cutoffDate
        }
      },
      include: {
        worker: true,
        client: true,
        marketer: true
      },
      take: 100 // أرشفة 100 عقد في كل مرة
    });

    let archivedCount = 0;
    const errors: string[] = [];

    for (const contract of expiredContracts) {
      try {
        await archiveContract(contract.id, 'SYSTEM', 'AUTO_ARCHIVE');
        archivedCount++;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'سبب غير معروف';
        errors.push(`فشل أرشفة العقد ${contract.id}: ${message}`);
      }
    }

    return {
      success: true,
      archivedCount,
      totalFound: expiredContracts.length,
      errors
    };
  } catch (error) {
    console.error('خطأ في الأرشفة التلقائية:', error);
    throw error;
  }
}

/**
 * استرجاع عقد من الأرشيف
 */
export async function restoreContract(archivedContractId: string, userId?: string) {
  try {
    const archived = await prisma.archivedContract.findUnique({
      where: { id: archivedContractId }
    });

    if (!archived) {
      throw new Error('العقد المؤرشف غير موجود');
    }

    // التحقق من أن العقد الأصلي غير موجود في جدول العقود النشطة
    const existingContract = await prisma.contract.findUnique({
      where: { id: archived.originalId }
    });

    if (existingContract) {
      throw new Error('العقد موجود بالفعل في النظام النشط. لا يمكن استعادته.');
    }

    // التحقق من وجود عقد آخر بنفس رقم العقد (إذا كان موجوداً)
    if (archived.contractNumber) {
      const duplicateContract = await prisma.contract.findFirst({
        where: {
          contractNumber: archived.contractNumber,
          id: { not: archived.originalId }
        }
      });

      if (duplicateContract) {
        throw new Error(`يوجد عقد آخر برقم ${archived.contractNumber}. يرجى تعديل رقم العقد قبل الاستعادة.`);
      }
    }

    // التحقق من حالة العاملة - يجب أن تكون متاحة للاستعادة
    const worker = await prisma.worker.findUnique({
      where: { id: archived.workerId },
      select: { status: true, name: true }
    });

    if (!worker) {
      throw new Error('العاملة غير موجودة في النظام');
    }

    if (worker.status !== 'AVAILABLE') {
      throw new Error(`لا يمكن استعادة العقد. العاملة ${worker.name} في حالة "${worker.status}". يجب أن تكون متاحة للاستعادة.`);
    }

    // استعادة العقد وتحديث حالة العاملة في معاملة واحدة
    const [restoredContract] = await prisma.$transaction([
      prisma.contract.create({
        data: {
          id: archived.originalId,
          workerId: archived.workerId,
          clientId: archived.clientId,
          startDate: archived.startDate,
          endDate: archived.endDate,
          packageType: archived.packageType,
          packageName: archived.packageName,
          totalAmount: archived.totalAmount,
          status: archived.status,
          contractNumber: archived.contractNumber,
          notes: archived.notes,
          delayDays: archived.delayDays,
          penaltyAmount: archived.penaltyAmount,
          marketerId: archived.marketerId
        }
      }),
      // تحديث حالة العاملة بناءً على حالة العقد المستعاد
      prisma.worker.update({
        where: { id: archived.workerId },
        data: {
          status: archived.status === 'ACTIVE' ? 'CONTRACTED' : 'AVAILABLE'
        }
      })
    ]);

    // حذف من الأرشيف
    await prisma.archivedContract.delete({
      where: { id: archivedContractId }
    });

    // تسجيل في سجل الأرشفة
    await prisma.archiveLog.create({
      data: {
        id: uuidv4(),
        entityType: 'CONTRACT',
        entityId: archived.originalId,
        action: 'RESTORE',
        performedBy: userId,
        metadata: JSON.stringify({
          contractNumber: archived.contractNumber,
          workerName: archived.workerName,
          clientName: archived.clientName
        })
      }
    });

    return restoredContract;
  } catch (error) {
    console.error('خطأ في استرجاع العقد:', error);
    throw error;
  }
}

/**
 * البحث في العقود المؤرشفة
 */
export async function searchArchivedContracts(query: {
  workerName?: string;
  clientName?: string;
  startDate?: Date;
  endDate?: Date;
  archiveReason?: string;
  limit?: number;
}) {
  try {
  const where: Prisma.ArchivedContractWhereInput = {};

    if (query.workerName) {
      where.workerName = {
        contains: query.workerName,
        mode: 'insensitive'
      };
    }

    if (query.clientName) {
      where.clientName = {
        contains: query.clientName,
        mode: 'insensitive'
      };
    }

    if (query.startDate) {
  where.startDate = { gte: query.startDate };
    }

    if (query.endDate) {
  where.endDate = { lte: query.endDate };
    }

    if (query.archiveReason) {
      where.archiveReason = query.archiveReason;
    }

    const contracts = await prisma.archivedContract.findMany({
      where,
      take: query.limit || 50,
      orderBy: { archivedAt: 'desc' }
    });

    return contracts;
  } catch (error) {
    console.error('خطأ في البحث في الأرشيف:', error);
    throw error;
  }
}

/**
 * إحصائيات الأرشيف
 */
export async function getArchiveStats() {
  try {
    const [
      totalArchived,
      archivedThisMonth,
      byReason,
      recentLogs
    ] = await Promise.all([
      // إجمالي المؤرشف
      prisma.archivedContract.count(),
      
      // المؤرشف هذا الشهر
      prisma.archivedContract.count({
        where: {
          archivedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      
      // حسب السبب
      prisma.archivedContract.groupBy({
        by: ['archiveReason'],
        _count: true
      }),
      
      // آخر العمليات
      prisma.archiveLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      totalArchived,
      archivedThisMonth,
      byReason: byReason.reduce<Record<string, number>>((acc, item) => {
        const key = item.archiveReason ?? 'UNKNOWN';
        acc[key] = item._count;
        return acc;
      }, {}),
      recentLogs,
    };
  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات الأرشيف:', error);
    throw error;
  }
}

/**
 * تنظيف الأرشيف القديم (حذف نهائي بعد مدة معينة)
 */
export async function cleanupOldArchives(yearsToKeep: number = 5) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - yearsToKeep);

    const result = await prisma.archivedContract.deleteMany({
      where: {
        archivedAt: {
          lte: cutoffDate
        }
      }
    });

    await prisma.archiveLog.create({
      data: {
        id: uuidv4(),
        entityType: 'CONTRACT',
        entityId: 'BATCH_CLEANUP',
        action: 'DELETE',
        performedBy: 'SYSTEM',
        reason: `تنظيف الأرشيف الأقدم من ${yearsToKeep} سنوات`,
        metadata: JSON.stringify({ deletedCount: result.count })
      }
    });

    return {
      success: true,
      deletedCount: result.count
    };
  } catch (error) {
    console.error('خطأ في تنظيف الأرشيف:', error);
    throw error;
  }
}
