import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixContracts() {
  try {
    // الحصول على عقد سوجاتا شارما
    const sujataWorker = await prisma.worker.findFirst({
      where: { name: { contains: 'سوجاتا' } },
      include: { 
        contracts: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (sujataWorker && sujataWorker.contracts.length > 0) {
      const activeContract = sujataWorker.contracts[0];
      
      console.log(`تحديث عقد سوجاتا شارما (${activeContract.id})`);
      
      // تحديث العقد ليصبح منتهياً
      await prisma.contract.update({
        where: { id: activeContract.id },
        data: { status: 'COMPLETED' }
      });

      // تحديث حالة العاملة لتصبح متاحة
      await prisma.worker.update({
        where: { id: sujataWorker.id },
        data: { status: 'AVAILABLE' }
      });

      console.log('تم تحديث عقد سوجاتا شارما وحالتها بنجاح');
    }

    // التحقق من النتيجة
    const updatedWorkers = await prisma.worker.findMany({
      where: {
        OR: [
          { name: { contains: 'سوجاتا' } },
          { name: { contains: 'فاتيما' } }
        ]
      },
      include: { 
        contracts: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    console.log('\n=== الحالة بعد التحديث ===');
    updatedWorkers.forEach(worker => {
      console.log(`${worker.name}: حالة العاملة = ${worker.status}`);
      worker.contracts.slice(0, 1).forEach(contract => {
        console.log(`  آخر عقد: ${contract.startDate} -> ${contract.endDate}, حالة: ${contract.status}`);
      });
    });

  } catch (error) {
    console.error('خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixContracts();