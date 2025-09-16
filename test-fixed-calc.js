import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testCorrectedCalculation() {
  try {
    const selectedMonth = '2025-09';
    
    // محاكاة الدالة المصححة
    const calculateWorkingDays = (contractStart, contractEnd, monthYear) => {
      const [year, month] = monthYear.split('-').map(Number);
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);
      
      const periodStart = contractStart > monthStart ? contractStart : monthStart;
      const periodEnd = contractEnd && contractEnd < monthEnd ? contractEnd : monthEnd;
      
      if (periodStart <= periodEnd) {
        // Reset time to start of day
        const startOfDay = new Date(periodStart.getFullYear(), periodStart.getMonth(), periodStart.getDate());
        const endOfDay = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), periodEnd.getDate());
        
        const timeDifference = endOfDay.getTime() - startOfDay.getTime();
        const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24)) + 1;
        return daysDifference;
      }
      return 0;
    };

    console.log('=== الحساب المصحح لأيام العمل ===\n');

    // فاتيما باتيل: من 1 سبتمبر إلى 15 سبتمبر = 15 يوم
    const fatimaStart = new Date('2025-09-01');
    const fatimaEnd = new Date('2025-09-15');
    const fatimaDays = calculateWorkingDays(fatimaStart, fatimaEnd, selectedMonth);
    console.log(`فاتيما باتيل: ${fatimaDays} يوم (يجب أن يكون 15)`);

    // سوجاتا شارما: من 1 سبتمبر إلى 14 سبتمبر = 14 يوم
    const sujataStart = new Date('2025-09-01');
    const sujataEnd = new Date('2025-09-14');
    const sujataDays = calculateWorkingDays(sujataStart, sujataEnd, selectedMonth);
    console.log(`سوجاتا شارما: ${sujataDays} يوم (يجب أن يكون 14)`);

    // اختبار شهر كامل
    const fullMonthStart = new Date('2025-09-01');
    const fullMonthEnd = new Date('2025-09-30');
    const fullMonthDays = calculateWorkingDays(fullMonthStart, fullMonthEnd, selectedMonth);
    console.log(`شهر كامل: ${fullMonthDays} يوم (يجب أن يكون 30)`);

  } catch (error) {
    console.error('خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCorrectedCalculation();