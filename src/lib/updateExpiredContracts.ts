import { prisma } from '@/lib/prisma';

/**
 * تحديث العقود المنتهية وحالة العاملات المرتبطة بها
 */
export async function updateExpiredContracts() {
  const today = new Date();
  
  try {
    // البحث عن العقود المنتهية التي لم يتم تحديث حالتها
    const expiredContracts = await prisma.contract.findMany({
      where: {
        endDate: {
          lt: today
        },
        status: {
          not: 'EXPIRED'
        }
      },
      select: {
        id: true,
        workerId: true
      }
    });

    if (expiredContracts.length === 0) {
      return {
        success: true,
        updatedCount: 0,
        message: 'No contracts to update'
      };
    }

    // تحديث حالة العقود والعاملات في معاملة واحدة
    const workerIds = expiredContracts.map(c => c.workerId);
    
    await prisma.$transaction([
      // تحديث حالة العقود إلى منتهية
      prisma.contract.updateMany({
        where: {
          id: {
            in: expiredContracts.map(c => c.id)
          }
        },
        data: {
          status: 'EXPIRED'
        }
      }),
      
      // تحديث حالة العاملات إلى متاحة
      // فقط للعاملات التي لا توجد لهن عقود نشطة أخرى
      prisma.worker.updateMany({
        where: {
          id: {
            in: workerIds
          },
          // التأكد من عدم وجود عقود نشطة أخرى
          contracts: {
            none: {
              status: 'ACTIVE'
            }
          }
        },
        data: {
          status: 'AVAILABLE'
        }
      })
    ]);

    console.log(`✅ تم تحديث ${expiredContracts.length} عقد منتهي وحالة العاملات المرتبطة`);

    return {
      success: true,
      updatedCount: expiredContracts.length,
      message: 'Contracts and worker statuses updated successfully'
    };
  } catch (error) {
    console.error('❌ خطأ في تحديث العقود المنتهية:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      updatedCount: 0
    };
  }
}
