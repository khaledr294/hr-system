import { PrismaClient } from '@prisma/client';

async function checkDatabaseData() {
  const prisma = new PrismaClient();
  
  try {
    // Check workers
    const workersCount = await prisma.worker.count();
    console.log(`👥 عدد العاملين في قاعدة البيانات: ${workersCount}`);
    
    if (workersCount > 0) {
      const workers = await prisma.worker.findMany({
        take: 3,
        select: {
          id: true,
          name: true,
          code: true,
          nationality: true
        }
      });
      console.log('أول 3 عاملين:', workers);
    }
    
    // Check contracts
    const contractsCount = await prisma.contract.count();
    console.log(`📋 عدد العقود في قاعدة البيانات: ${contractsCount}`);
    
    if (contractsCount > 0) {
      const contracts = await prisma.contract.findMany({
        take: 3,
        select: {
          id: true,
          workerId: true,
          startDate: true,
          endDate: true,
          status: true
        }
      });
      console.log('أول 3 عقود:', contracts);
    }
    
    // Check nationality salaries
    const nationalitySalariesCount = await prisma.nationalitySalary.count();
    console.log(`💰 عدد رواتب الجنسيات: ${nationalitySalariesCount}`);
    
  } catch (error) {
    console.error('خطأ في قاعدة البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseData();