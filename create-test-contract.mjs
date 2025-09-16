import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestContract() {
  try {
    console.log('🔧 إنشاء عقد تجريبي...');

    // Get worker, client, and marketer
    const worker = await prisma.worker.findFirst();
    const client = await prisma.client.findFirst();
    const marketer = await prisma.marketer.findFirst();

    if (!worker || !client || !marketer) {
      console.log('❌ بعض البيانات مفقودة');
      return;
    }

    // Create a contract for September 2025
    const contract = await prisma.contract.create({
      data: {
        workerId: worker.id,
        clientId: client.id,
        marketerId: marketer.id,
        startDate: new Date('2025-09-01'), // بداية سبتمبر 2025
        endDate: new Date('2025-12-31'),   // نهاية ديسمبر 2025
        packageType: 'شهري',
        totalAmount: 1500,
        status: 'ACTIVE'
      }
    });

    console.log(`✅ تم إنشاء العقد: ${contract.id}`);
    console.log(`📅 للعاملة: ${worker.name}`);
    console.log(`📅 من ${contract.startDate} إلى ${contract.endDate}`);

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestContract();