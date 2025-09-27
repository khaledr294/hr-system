const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // حذف المستخدم إذا كان موجوداً
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: 'admin@test.com' },
          { name: 'admin' }
        ]
      }
    });

    // إنشاء كلمة مرور مشفرة
    const hashedPassword = await bcrypt.hash('123456', 12);

    // إنشاء مستخدم جديد
    const user = await prisma.user.create({
      data: {
        name: 'admin',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('✅ تم إنشاء مستخدم التجربة بنجاح:');
    console.log('👤 اسم المستخدم: admin');
    console.log('📧 البريد الإلكتروني: admin@test.com');
    console.log('🔑 كلمة المرور: 123456');
    console.log('🛡️ الصلاحية: ADMIN');
    console.log('🆔 معرف المستخدم:', user.id);

  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدم:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();