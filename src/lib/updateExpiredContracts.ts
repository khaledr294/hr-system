import { prisma } from '@/lib/prisma';

/**
 * تحديث العقود المنتهية فقط (بدون تغيير حالة العاملات)
 * العاملة تبقى CONTRACTED حتى يتم إنهاء العقد رسمياً عبر زر "إنهاء العقد"
 */
export async function updateExpiredContracts() {
  const today = new Date();
  
  try {
    // البحث عن العقود النشطة التي تجاوزت تاريخ الانتهاء
    const result = await prisma.contract.updateMany({
      where: {
        endDate: { lt: today },
        status: 'ACTIVE'  // فقط العقود النشطة
      },
      data: {
        status: 'EXPIRED'  // تحديث الحالة إلى منتهي
        // ⚠️ لا نغير حالة العاملة - تبقى CONTRACTED
        // سيتم تغييرها عند إنهاء العقد رسمياً (terminate)
      }
    });

    console.log(`✅ تم تحديث ${result.count} عقد من ACTIVE إلى EXPIRED`);
    console.log(`⚠️  ملاحظة: العاملات تبقى بحالة CONTRACTED حتى يتم إنهاء العقود رسمياً`);

    return {
      success: true,
      updatedCount: result.count,
      message: `Updated ${result.count} contracts to EXPIRED status`
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
