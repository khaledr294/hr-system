import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testContractsAPI() {
  try {
    console.log('🧪 اختبار API العقود...');

    // Get a worker ID first
    const worker = await prisma.worker.findFirst({
      select: { id: true, name: true }
    });

    if (!worker) {
      console.log('❌ لا توجد عاملات في قاعدة البيانات');
      return;
    }

    console.log(`✅ تم العثور على العاملة: ${worker.name} (ID: ${worker.id})`);

    // Test the fixed query directly with Prisma
    console.log('\n🔍 اختبار query الجديد مع Prisma...');
    
    const monthStart = new Date(2024, 8, 1); // September 1, 2024
    const monthEnd = new Date(2024, 8, 30);  // September 30, 2024
    
    const contracts = await prisma.contract.findMany({
      where: {
        workerId: worker.id,
        AND: [
          {
            startDate: {
              lte: monthEnd, // Contract starts before or during the month
            },
          },
          {
            endDate: {
              gte: monthStart, // Contract ends after or during the month
            },
          },
        ],
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
        totalAmount: true
      }
    });

    console.log(`📋 عدد العقود الموجودة: ${contracts.length}`);
    contracts.forEach(contract => {
      console.log(`- ${contract.id}: من ${contract.startDate.toLocaleDateString('ar-SA')} إلى ${contract.endDate.toLocaleDateString('ar-SA')}`);
    });

    // Now test the actual API endpoint
    console.log('\n🌐 اختبار API endpoint...');
    const response = await fetch(`http://localhost:3001/api/contracts?workerId=${worker.id}&month=2024-09`);
    
    if (response.ok) {
      const apiResult = await response.json();
      console.log(`✅ API نجح! عدد العقود: ${apiResult.length}`);
    } else {
      const errorText = await response.text();
      console.log(`❌ API فشل: ${response.status} - ${errorText}`);
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testContractsAPI();