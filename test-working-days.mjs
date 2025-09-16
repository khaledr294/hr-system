import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testWorkingDaysCalculation() {
  try {
    console.log('🧮 اختبار حساب أيام العمل...');

    // Get worker with contract
    const worker = await prisma.worker.findFirst({
      where: {
        contracts: {
          some: {}
        }
      },
      include: {
        contracts: {
          select: {
            startDate: true,
            endDate: true,
            status: true
          }
        }
      }
    });

    if (!worker) {
      console.log('❌ لا توجد عاملات مع عقود');
      return;
    }

    console.log(`✅ العاملة: ${worker.name}`);
    console.log(`📋 عدد العقود: ${worker.contracts.length}`);

    // Test calculation for September 2025
    const monthYear = '2025-09';
    const [year, month] = monthYear.split('-').map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    console.log(`\n🗓️ اختبار الشهر: ${monthYear}`);
    console.log(`📅 بداية الشهر: ${monthStart.toLocaleDateString('ar-SA')}`);
    console.log(`📅 نهاية الشهر: ${monthEnd.toLocaleDateString('ar-SA')}`);

    let totalDays = 0;

    worker.contracts.forEach((contract, index) => {
      const contractStart = new Date(contract.startDate);
      const contractEnd = new Date(contract.endDate);

      console.log(`\n📝 العقد ${index + 1}:`);
      console.log(`- بداية: ${contractStart.toLocaleDateString('ar-SA')}`);
      console.log(`- نهاية: ${contractEnd.toLocaleDateString('ar-SA')}`);

      // Check if contract overlaps with month
      if (contractStart <= monthEnd && contractEnd >= monthStart) {
        const periodStart = contractStart > monthStart ? contractStart : monthStart;
        const periodEnd = contractEnd < monthEnd ? contractEnd : monthEnd;

        console.log(`- فترة العمل في الشهر: من ${periodStart.toLocaleDateString('ar-SA')} إلى ${periodEnd.toLocaleDateString('ar-SA')}`);

        const timeDiff = periodEnd.getTime() - periodStart.getTime();
        const days = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;
        console.log(`- أيام العمل: ${days}`);
        totalDays += days;
      } else {
        console.log('- لا يتقاطع مع الشهر المحدد');
      }
    });

    const daysInMonth = monthEnd.getDate();
    const finalDays = Math.min(totalDays, daysInMonth);
    
    console.log(`\n📊 النتيجة النهائية:`);
    console.log(`- إجمالي أيام العمل: ${totalDays}`);
    console.log(`- أيام الشهر: ${daysInMonth}`);
    console.log(`- أيام العمل النهائية: ${finalDays}`);

    // Test API call
    console.log(`\n🌐 اختبار API call...`);
    const response = await fetch(`http://localhost:3000/api/contracts?workerId=${worker.id}&month=${monthYear}`);
    
    if (response.ok) {
      const apiContracts = await response.json();
      console.log(`✅ API نجح! عدد العقود المُرجعة: ${apiContracts.length}`);
    } else {
      console.log(`❌ API فشل: ${response.status}`);
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testWorkingDaysCalculation();