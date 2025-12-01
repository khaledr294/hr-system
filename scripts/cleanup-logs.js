#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * تنظيف السجلات القديمة
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupOldLogs() {
  try {
    console.log('🧹 بدء تنظيف السجلات القديمة...');

    // حذف السجلات أقدم من 90 يوم
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const result = await prisma.log.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo
        }
      }
    });

    console.log(`✅ تم حذف ${result.count} سجل قديم`);

    // إحصائيات السجلات المتبقية
    const remainingLogs = await prisma.log.count();
    console.log(`📊 السجلات المتبقية: ${remainingLogs}`);

    // إحصائيات حسب نوع العملية
    const logStats = await prisma.log.groupBy({
      by: ['action'],
      _count: {
        action: true
      },
      orderBy: {
        _count: {
          action: 'desc'
        }
      },
      take: 10
    });

    console.log('\n📈 أكثر العمليات تكراراً:');
    logStats.forEach((stat, index) => {
      console.log(`${index + 1}. ${stat.action}: ${stat._count.action}`);
    });

    await prisma.$disconnect();
    console.log('\n🎉 تم الانتهاء من التنظيف بنجاح');
  } catch (error) {
    console.error('❌ خطأ في تنظيف السجلات:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

if (require.main === module) {
  cleanupOldLogs();
}

module.exports = { cleanupOldLogs };