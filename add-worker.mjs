import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addSampleWorkers() {
  try {
    console.log('🔍 جاري إضافة عاملة تجريبية...');

    // Get a nationality salary
    const philippinesSalary = await prisma.nationalitySalary.findFirst({
      where: { nationality: 'الفلبين' }
    });

    if (!philippinesSalary) {
      console.log('❌ لا يوجد راتب للفلبين');
      return;
    }

    // Check if worker already exists
    const existingWorker = await prisma.worker.findFirst({
      where: { name: 'سوجاتا شارما' }
    });

    if (existingWorker) {
      console.log('👤 العاملة موجودة بالفعل:', existingWorker.name);
    } else {
      // Create worker
      const worker = await prisma.worker.create({
        data: {
          name: 'سوجاتا شارما',
          nationality: 'الفلبين',
          residencyNumber: '1234567890',
          dateOfBirth: new Date('1990-01-15'),
          phone: '0501234567',
          address: 'الرياض',
          status: 'AVAILABLE',
          nationalitySalaryId: philippinesSalary.id
        }
      });
      console.log('✅ تم إنشاء العاملة:', worker.name);
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleWorkers();