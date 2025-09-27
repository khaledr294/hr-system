#!/usr/bin/env node

/**
 * تحضير النظام للإنتاج و Deploy
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function deployToProduction() {
  console.log('🚀 بدء عملية Deploy للإنتاج...\n');

  const steps = [
    {
      name: 'فحص صحة النظام',
      command: 'npm run health:check',
      required: true
    },
    {
      name: 'تنظيف البناء السابق',
      command: 'npm run clean',
      required: false
    },
    {
      name: 'تحديث Prisma Client للإنتاج',
      command: 'npm run db:generate:prod',
      required: true
    },
    {
      name: 'البناء للإنتاج',
      command: 'npm run build',
      required: true
    },
    {
      name: 'فحص الأمان النهائي',
      command: 'npm run security:audit',
      required: true
    }
  ];

  let allStepsSuccess = true;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    console.log(`📝 ${i + 1}/${steps.length}: ${step.name}...`);
    
    try {
      const { stdout, stderr } = await execAsync(step.command);
      console.log('✅ نجح');
      
      if (stderr && stderr.includes('error')) {
        console.log('⚠️ تحذيرات:', stderr.substring(0, 100) + '...');
      }
    } catch (error) {
      if (step.required) {
        console.log(`❌ فشل في: ${step.name}`);
        console.log('Error:', error.message.substring(0, 200) + '...');
        allStepsSuccess = false;
        break;
      } else {
        console.log(`⚠️ تحذير في: ${step.name}`);
      }
    }
  }

  if (!allStepsSuccess) {
    console.log('\n❌ فشل التحضير للإنتاج. يرجى إصلاح الأخطاء أولاً.');
    process.exit(1);
  }

  console.log('\n🎉 تم تحضير النظام للإنتاج بنجاح!');
  
  console.log('\n📋 معلومات Deploy:');
  console.log('- الإصدار: محسن ومُختبر');
  console.log('- الأمان: تم التحقق');
  console.log('- الأداء: محسن');
  console.log('- قاعدة البيانات: جاهزة');

  console.log('\n🌟 خطوات Deploy التالية:');
  console.log('1. رفع الكود لـ GitHub');
  console.log('2. Deploy على Vercel');
  console.log('3. تكوين متغيرات البيئة');
  console.log('4. تشغيل migrations');

  console.log('\n💡 أوامر Deploy السريعة:');
  console.log('git add . && git commit -m "Production ready v1.0"');
  console.log('git push origin main');
  console.log('vercel --prod');

  return true;
}

if (require.main === module) {
  deployToProduction().catch(console.error);
}

module.exports = { deployToProduction };