import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('🚀 Creating default users...');

    // Admin User
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@hr-system.com' }
    });

    let adminCreated = false;
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
      adminCreated = true;
    }

    // HR Manager
    const existingHR = await prisma.user.findFirst({
      where: { email: 'hr@hr-system.com' }
    });

    let hrCreated = false;
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
      hrCreated = true;
    }

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء المستخدمين بنجاح',
      users: {
        admin: {
          email: 'admin@hr-system.com',
          password: '123456',
          created: adminCreated,
          exists: !adminCreated
        },
        hr: {
          email: 'hr@hr-system.com',
          password: '123456',
          created: hrCreated,
          exists: !hrCreated
        }
      }
    });

  } catch (error) {
    console.error('Error creating users:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'فشل في إنشاء المستخدمين'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}