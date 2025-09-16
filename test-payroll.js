import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testPayrollCalculation() {
  try {
    const selectedMonth = '2025-09'; // سبتمبر 2025
    
    // الحصول على العاملتين
    const workers = await prisma.worker.findMany({
      where: {
        OR: [
          { name: { contains: 'سوجاتا' } },
          { name: { contains: 'فاتيما' } }
        ]
      }
    });

    console.log('=== اختبار حساب أيام العمل لشهر سبتمبر 2025 ===\n');

    for (const worker of workers) {
      console.log(`--- ${worker.name} (كود: ${worker.code}) ---`);
      
      // الحصول على العقود للعاملة في الشهر المحدد
      const contracts = await prisma.contract.findMany({
        where: { workerId: worker.id }
      });

      if (contracts.length === 0) {
        console.log('لا توجد عقود');
        continue;
      }

      // حساب أيام العمل (نسخة من الكود في صفحة الرواتب)
      const [year, month] = selectedMonth.split('-').map(Number);
      const monthStart = new Date(year, month - 1, 1); // 1 سبتمبر 2025
      const monthEnd = new Date(year, month, 0); // 30 سبتمبر 2025
      
      console.log(`فترة الشهر: ${monthStart.toDateString()} إلى ${monthEnd.toDateString()}`);
      
      let totalWorkingDays = 0;
      
      contracts.forEach(contract => {
        const contractStart = new Date(contract.startDate);
        const contractEnd = contract.endDate ? new Date(contract.endDate) : null;
        
        console.log(`عقد: ${contractStart.toDateString()} إلى ${contractEnd ? contractEnd.toDateString() : 'مفتوح'}`);
        
        // العثور على التداخل بين فترة العقد والشهر المحدد
        const periodStart = contractStart > monthStart ? contractStart : monthStart;
        const periodEnd = contractEnd && contractEnd < monthEnd ? contractEnd : monthEnd;
        
        console.log(`فترة التداخل: ${periodStart.toDateString()} إلى ${periodEnd.toDateString()}`);
        
        if (periodStart <= periodEnd) {
          // حساب الأيام في هذه الفترة
          const timeDifference = periodEnd.getTime() - periodStart.getTime();
          const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;
          
          console.log(`عدد الأيام المحسوبة: ${daysDifference}`);
          totalWorkingDays += daysDifference;
        } else {
          console.log('لا يوجد تداخل مع الشهر');
        }
      });
      
      // الحد الأقصى لأيام الشهر
      const daysInMonth = monthEnd.getDate();
      const finalWorkingDays = Math.min(totalWorkingDays, daysInMonth);
      
      console.log(`إجمالي أيام العمل: ${finalWorkingDays} يوم`);
      console.log(`النسبة من الراتب الشهري: ${(finalWorkingDays/30*100).toFixed(1)}%\n`);
    }

  } catch (error) {
    console.error('خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPayrollCalculation();