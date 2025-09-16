import { prisma } from './src/lib/prisma.js';

async function main() {
  try {
    console.log('🔍 فحص قاعدة البيانات...');
    
    const workersCount = await prisma.worker.count();
    console.log(`👥 عدد العاملين: ${workersCount}`);
    
    const contractsCount = await prisma.contract.count();
    console.log(`📋 عدد العقود: ${contractsCount}`);
    
    const nationalitySalariesCount = await prisma.nationalitySalary.count();
    console.log(`💰 عدد رواتب الجنسيات: ${nationalitySalariesCount}`);
    
    if (workersCount > 0) {
      const sample = await prisma.worker.findFirst({
        include: {
          nationalitySalary: true
        }
      });
      console.log('عينة عامل:', sample);
    }
    
  } catch (error) {
    console.error('خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();