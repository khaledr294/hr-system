import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDataIntegrity() {
  console.log('🔧 بدء عملية إصلاح البيانات...');

  try {
    // 1. Fix Nader's Role
    console.log('\n👤 جاري إصلاح صلاحيات المدير (نادر)...');
    const hrManagerRole = await prisma.jobTitle.findFirst({
      where: { 
        OR: [
          { name: 'HR_MANAGER' },
          { name: 'HR Manager' }
        ]
      }
    });

    if (hrManagerRole) {
      const nader = await prisma.user.findFirst({
        where: { email: 'nader@saed-hr.com' }
      });

      if (nader) {
        await prisma.user.update({
          where: { id: nader.id },
          data: { jobTitleId: hrManagerRole.id }
        });
        console.log('✅ تم تحديث صلاحيات نادر إلى:', hrManagerRole.nameAr);
      } else {
        console.log('⚠️ المستخدم نادر غير موجود');
      }
    } else {
      console.log('❌ لم يتم العثور على مسمى مدير الموارد البشرية');
    }

    // 2. Fix Worker Salary Links
    console.log('\n💰 جاري إصلاح روابط رواتب العاملات...');
    
    // Get all nationality salaries map
    const nationalitySalaries = await prisma.nationalitySalary.findMany();
    const salaryMap = new Map(
      nationalitySalaries.map(ns => [ns.nationality.trim(), ns.id])
    );

    // Find workers with missing salary link
    const workers = await prisma.worker.findMany({
      where: { nationalitySalaryId: null }
    });

    console.log(`وجد ${workers.length} عاملة تحتاج إلى ربط الراتب`);

    let updatedCount = 0;
    for (const worker of workers) {
      const salaryId = salaryMap.get(worker.nationality.trim());
      
      if (salaryId) {
        await prisma.worker.update({
          where: { id: worker.id },
          data: { nationalitySalaryId: salaryId }
        });
        updatedCount++;
        process.stdout.write('.');
      } else {
        console.log(`\n⚠️ لا يوجد راتب معرف للجنسية: ${worker.nationality} (العاملة: ${worker.name})`);
      }
    }

    console.log(`\n✅ تم تحديث ${updatedCount} عاملة بنجاح`);

  } catch (error) {
    console.error('❌ حدث خطأ أثناء الإصلاح:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDataIntegrity();
