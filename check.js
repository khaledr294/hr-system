import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  try {
    // البحث عن العاملات
    const workers = await prisma.worker.findMany({
      where: {
        OR: [
          { name: { contains: 'سوجاتا' } },
          { name: { contains: 'فاتيما' } },
          { name: { contains: 'Sujata' } },
          { name: { contains: 'Fatima' } }
        ]
      },
      include: { 
        contracts: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    console.log('=== العاملات الموجودات ===');
    workers.forEach(worker => {
      console.log(`الاسم: ${worker.name}, الكود: ${worker.code}, الحالة: ${worker.status}`);
      worker.contracts.forEach(contract => {
        console.log(`  عقد: ${contract.startDate} -> ${contract.endDate}, حالة: ${contract.status}`);
      });
      console.log('');
    });

    // البحث عن العقود المنتهية في سبتمبر
    const expiredContracts = await prisma.contract.findMany({
      where: {
        endDate: {
          gte: new Date('2025-09-01'),
          lte: new Date('2025-09-30')
        },
        status: 'ACTIVE'
      },
      include: { worker: true }
    });

    console.log('=== العقود المنتهية في سبتمبر (ما زالت نشطة) ===');
    expiredContracts.forEach(contract => {
      console.log(`${contract.worker.name}: ${contract.startDate} -> ${contract.endDate}`);
    });

  } catch (error) {
    console.error('خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();