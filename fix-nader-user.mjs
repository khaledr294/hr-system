import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createHRManagerJobTitle() {
  console.log('\n🔧 إنشاء مسمى وظيفي HR_MANAGER...\n');

  try {
    // البحث عن المسمى الوظيفي أو إنشاؤه
    let hrManagerJobTitle = await prisma.jobTitle.findFirst({
      where: { name: 'HR_MANAGER' }
    });

    if (!hrManagerJobTitle) {
      // إنشاء المسمى الوظيفي مع جميع الصلاحيات
      hrManagerJobTitle = await prisma.jobTitle.create({
        data: {
          name: 'HR_MANAGER',
          nameAr: 'مدير الموارد البشرية',
          description: 'مدير الموارد البشرية - جميع الصلاحيات',
          permissions: JSON.stringify([
            'VIEW_WORKERS', 'CREATE_WORKERS', 'EDIT_WORKERS', 'DELETE_WORKERS',
            'VIEW_CLIENTS', 'CREATE_CLIENTS', 'EDIT_CLIENTS', 'DELETE_CLIENTS',
            'VIEW_CONTRACTS', 'CREATE_CONTRACTS', 'EDIT_CONTRACTS', 'DELETE_CONTRACTS',
            'VIEW_USERS', 'CREATE_USERS', 'EDIT_USERS', 'DELETE_USERS',
            'VIEW_REPORTS', 'VIEW_PAYROLL', 'MANAGE_PAYROLL',
            'VIEW_SETTINGS', 'EDIT_SETTINGS',
            'VIEW_BACKUPS', 'CREATE_BACKUPS',
            'VIEW_LOGS'
          ]),
          isActive: true
        }
      });
      console.log('✅ تم إنشاء مسمى وظيفي جديد:', hrManagerJobTitle.nameAr);
    } else {
      console.log('✅ المسمى الوظيفي موجود بالفعل:', hrManagerJobTitle.nameAr);
    }

    // البحث عن المستخدم نادر
    const naderUser = await prisma.user.findFirst({
      where: { email: 'nader@saed-hr.com' }
    });

    if (naderUser) {
      // تحديث المستخدم ليكون له المسمى الوظيفي
      await prisma.user.update({
        where: { id: naderUser.id },
        data: {
          jobTitleId: hrManagerJobTitle.id
        }
      });
      console.log('✅ تم تحديث المستخدم:', naderUser.name);
      console.log('   - Email:', naderUser.email);
      console.log('   - Role:', naderUser.role);
      console.log('   - JobTitle:', hrManagerJobTitle.nameAr);
    } else {
      console.log('❌ المستخدم nader@saed-hr.com غير موجود!');
    }

    // عرض النتيجة النهائية
    const updatedUser = await prisma.user.findFirst({
      where: { email: 'nader@saed-hr.com' },
      include: { jobTitle: true }
    });

    console.log('\n📊 النتيجة النهائية:');
    console.log('   - الاسم:', updatedUser?.name);
    console.log('   - الدور (Role):', updatedUser?.role);
    console.log('   - المسمى الوظيفي:', updatedUser?.jobTitle?.nameAr || 'لا يوجد');
    console.log('   - الصلاحيات:', JSON.parse(updatedUser?.jobTitle?.permissions || '[]').length, 'صلاحية');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createHRManagerJobTitle();
