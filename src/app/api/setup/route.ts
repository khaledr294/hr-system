import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('🚀 Setting up HR System users...');

    // تحقق من الاتصال بقاعدة البيانات أولاً
    const userCount = await prisma.user.count();
    console.log(`Current users in database: ${userCount}`);

    // Admin User
    const existingAdmin = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: 'admin@hr-system.com' },
          { name: 'مدير النظام' }
        ]
      }
    });

    let adminResult = { created: false, exists: true };
    if (!existingAdmin) {
      const hashedPassword = await hash('123456', 12);
      await prisma.user.create({
        data: {
          name: 'مدير النظام',
          email: 'admin@hr-system.com',
          password: hashedPassword,
          role: 'ADMIN',
          status: 'AVAILABLE',
          nationality: 'سعودي',
          phone: '0500000000',
          dateOfBirth: new Date('1980-01-01'),
          residencyNumber: '9999999999'
        }
      });
      adminResult = { created: true, exists: false };
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // HR Manager
    const existingHR = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: 'hr@hr-system.com' },
          { name: 'مدير الموارد البشرية' }
        ]
      }
    });

    let hrResult = { created: false, exists: true };
    if (!existingHR) {
      const hashedPassword = await hash('123456', 12);
      await prisma.user.create({
        data: {
          name: 'مدير الموارد البشرية',
          email: 'hr@hr-system.com',
          password: hashedPassword,
          role: 'HR_MANAGER',
          status: 'AVAILABLE',
          nationality: 'سعودي',
          phone: '0500000001',
          dateOfBirth: new Date('1985-01-01'),
          residencyNumber: '8888888888'
        }
      });
      hrResult = { created: true, exists: false };
      console.log('✅ HR Manager user created');
    } else {
      console.log('ℹ️ HR Manager user already exists');
    }

    const finalUserCount = await prisma.user.count();

    return NextResponse.json({
      success: true,
      message: '🎉 نظام إدارة الموارد البشرية جاهز للاستخدام',
      database: {
        connection: 'متصل',
        initialUsers: userCount,
        finalUsers: finalUserCount,
        usersCreated: finalUserCount - userCount
      },
      credentials: {
        admin: {
          email: 'admin@hr-system.com',
          password: '123456',
          role: 'مدير النظام',
          status: adminResult.created ? 'تم الإنشاء' : 'موجود مسبقاً'
        },
        hrManager: {
          email: 'hr@hr-system.com',
          password: '123456',
          role: 'مدير الموارد البشرية',
          status: hrResult.created ? 'تم الإنشاء' : 'موجود مسبقاً'
        }
      },
      instructions: {
        ar: [
          '1. انسخ أحد بيانات تسجيل الدخول أعلاه',
          '2. اذهب إلى صفحة تسجيل الدخول',
          '3. أدخل البريد الإلكتروني وكلمة المرور',
          '4. اضغط تسجيل الدخول'
        ],
        en: [
          '1. Copy one of the login credentials above',
          '2. Go to the login page',
          '3. Enter email and password',
          '4. Click Login'
        ]
      }
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });

  } catch (error) {
    console.error('❌ Database setup error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'فشل في إعداد قاعدة البيانات',
      troubleshooting: {
        possibleCauses: [
          'DATABASE_URL غير صحيح في Environment Variables',
          'قاعدة البيانات غير متاحة',
          'مشكلة في شبكة الاتصال',
          'Prisma schema غير محدث'
        ],
        solutions: [
          'تحقق من DATABASE_URL في Vercel Settings',
          'تأكد من أن قاعدة البيانات تقبل الاتصالات',
          'جرب إعادة النشر (Redeploy) في Vercel',
          'تشغيل prisma db push لتحديث Schema'
        ]
      }
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } finally {
    await prisma.$disconnect();
  }
}