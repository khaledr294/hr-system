const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  حذف المستخدمين التجريبيين من قاعدة البيانات...\n');
  
  try {
    const result = await prisma.user.deleteMany({
      where: {
        email: {
          in: ['admin@hr-system.com', 'hr@hr-system.com']
        }
      }
    });
    
    console.log(`✅ تم حذف ${result.count} مستخدم تجريبي\n`);
    
    // عرض المستخدمين المتبقين
    const users = await prisma.user.findMany({
      select: {
        name: true,
        email: true
      }
    });
    
    console.log('=== المستخدمون الحاليون ===');
    users.forEach(u => {
      console.log(`  • ${u.name} (${u.email})`);
    });
    console.log(`\nالعدد الكلي: ${users.length} مستخدم\n`);
    
  } catch (e) {
    console.error('❌ خطأ:', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
