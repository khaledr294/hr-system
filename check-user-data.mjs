import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  console.log('\n🔍 التحقق من بيانات المستخدمين...\n');

  // البحث عن nader@saed-hr.com
  const naderUser = await prisma.user.findFirst({
    where: { email: 'nader@saed-hr.com' },
    include: { jobTitle: true }
  });

  console.log('📧 المستخدم nader@saed-hr.com:');
  if (naderUser) {
    console.log('  - الاسم:', naderUser.name);
    console.log('  - الدور (role):', naderUser.role);
    console.log('  - المسمى الوظيفي:', naderUser.jobTitle?.nameAr || 'لا يوجد');
    console.log('  - jobTitleId:', naderUser.jobTitleId || 'null');
  } else {
    console.log('  ❌ المستخدم غير موجود!');
  }

  console.log('\n📋 جميع المسميات الوظيفية:');
  const jobTitles = await prisma.jobTitle.findMany();
  for (const jt of jobTitles) {
    console.log(`  - ${jt.nameAr} (${jt.name})`);
  }

  console.log('\n👥 المستخدمون حسب المسمى الوظيفي "مسوق":');
  const marketerJobTitle = await prisma.jobTitle.findFirst({
    where: { nameAr: 'مسوق' },
    include: { users: true }
  });

  if (marketerJobTitle) {
    console.log(`  - المسمى الوظيفي: ${marketerJobTitle.nameAr}`);
    console.log(`  - عدد المستخدمين: ${marketerJobTitle.users.length}`);
    for (const user of marketerJobTitle.users) {
      console.log(`    * ${user.name} (${user.email}) - Role: ${user.role}`);
    }
  } else {
    console.log('  ❌ لا يوجد مسمى وظيفي "مسوق"');
  }

  console.log('\n📊 جدول Marketer (القديم):');
  const marketers = await prisma.marketer.findMany();
  console.log(`  - عدد المسوقين: ${marketers.length}`);
  for (const m of marketers) {
    console.log(`    * ${m.name} (${m.phone})`);
  }

  await prisma.$disconnect();
}

checkData().catch(console.error);
