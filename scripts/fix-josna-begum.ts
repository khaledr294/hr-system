import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * سكريبت لتصحيح حالة العاملة JOSNA BEGUM
 * وحذف العقد المؤرشف المكرر إذا وجد
 */
async function fixJosnaBegum() {
  try {
    console.log('🔍 البحث عن العاملة JOSNA BEGUM...');
    
    // البحث عن العاملة
    const worker = await prisma.worker.findFirst({
      where: {
        OR: [
          { name: { contains: 'JOSNA', mode: 'insensitive' } },
          { code: 'S0729' }
        ]
      },
      include: {
        contracts: {
          where: { status: 'ACTIVE' }
        }
      }
    });

    if (!worker) {
      console.log('❌ لم يتم العثور على العاملة JOSNA BEGUM');
      return;
    }

    console.log(`✅ تم العثور على العاملة: ${worker.name} (${worker.code})`);
    console.log(`   الحالة الحالية: ${worker.status}`);
    console.log(`   عدد العقود النشطة: ${worker.contracts.length}`);

    // إذا لم يكن لديها عقود نشطة، تحديث حالتها
    if (worker.contracts.length === 0 && worker.status !== 'AVAILABLE') {
      console.log('\n🔧 تحديث حالة العاملة...');
      
      await prisma.worker.update({
        where: { id: worker.id },
        data: { status: 'AVAILABLE' }
      });

      console.log(`✅ تم تحديث حالة العاملة من "${worker.status}" إلى "AVAILABLE"`);
    } else if (worker.status === 'AVAILABLE') {
      console.log('✅ العاملة في الحالة الصحيحة بالفعل (AVAILABLE)');
    } else {
      console.log(`⚠️  العاملة لديها ${worker.contracts.length} عقد نشط - لا يمكن تحديث الحالة`);
    }

    // البحث عن عقود مؤرشفة للعاملة
    console.log('\n🔍 البحث عن عقود مؤرشفة...');
    const archivedContracts = await prisma.archivedContract.findMany({
      where: {
        workerId: worker.id
      }
    });

    console.log(`   تم العثور على ${archivedContracts.length} عقد مؤرشف`);

    // التحقق من وجود عقود مكررة
    for (const archived of archivedContracts) {
      const activeExists = await prisma.contract.findUnique({
        where: { id: archived.originalId }
      });

      if (activeExists) {
        console.log(`\n⚠️  عقد مكرر وجد!`);
        console.log(`   رقم العقد: ${archived.contractNumber}`);
        console.log(`   ID المؤرشف: ${archived.id}`);
        console.log(`   موجود في النظام النشط أيضاً!`);
        
        // حذف النسخة المؤرشفة
        await prisma.archivedContract.delete({
          where: { id: archived.id }
        });
        
        console.log(`   ✅ تم حذف النسخة المؤرشفة المكررة`);
      } else {
        console.log(`\n✅ عقد مؤرشف صحيح:`);
        console.log(`   رقم العقد: ${archived.contractNumber}`);
        console.log(`   الحالة: ${archived.status}`);
        console.log(`   يمكن استعادته من صفحة الأرشيف`);
      }
    }

    console.log('\n✅ تم الانتهاء من التصحيح بنجاح!');
    console.log('\n📝 الخطوات التالية:');
    console.log('   1. اذهب إلى صفحة الأرشيف');
    console.log('   2. ابحث عن عقد JOSNA BEGUM');
    console.log('   3. انقر على "استعادة"');
    console.log('   4. يجب أن يعمل بدون مشاكل الآن!');

  } catch (error) {
    console.error('❌ حدث خطأ:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
fixJosnaBegum()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
