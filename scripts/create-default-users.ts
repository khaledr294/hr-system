#!/usr/bin/env ts-node

/**
 * Script لإنشاء مستخدمين افتراضيين في قاعدة البيانات
 * يجب تشغيله بعد نشر قاعدة البيانات على Vercel
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function createDefaultUsers() {
  console.log('🚀 إنشاء مستخدمين افتراضيين...');

  try {
    // Admin User
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@hr-system.com' }
    });

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
      console.log('✅ تم إنشاء مدير النظام');
      console.log('📧 Email: admin@hr-system.com');
      console.log('🔒 Password: 123456');
    } else {
      console.log('ℹ️  مدير النظام موجود بالفعل');
    }

    // HR Manager
    const existingHR = await prisma.user.findFirst({
      where: { email: 'hr@hr-system.com' }
    });

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
      console.log('✅ تم إنشاء مدير الموارد البشرية');
      console.log('📧 Email: hr@hr-system.com');
      console.log('🔒 Password: 123456');
    } else {
      console.log('ℹ️  مدير الموارد البشرية موجود بالفعل');
    }

    console.log('\n🎉 تم إنشاء المستخدمين بنجاح!');
    console.log('\n📋 بيانات تسجيل الدخول:');
    console.log('════════════════════════════════');
    console.log('مدير النظام:');
    console.log('Email: admin@hr-system.com');
    console.log('Password: 123456');
    console.log('');
    console.log('مدير الموارد البشرية:');
    console.log('Email: hr@hr-system.com');
    console.log('Password: 123456');
    console.log('════════════════════════════════');

  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدمين:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الـ script
if (require.main === module) {
  createDefaultUsers();
}

export default createDefaultUsers;