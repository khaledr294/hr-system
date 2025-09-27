#!/usr/bin/env node

/**
 * فحص صحة النظام
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// تحميل متغيرات البيئة من .env
require('dotenv').config();

async function checkSystemHealth() {
  console.log('🔍 بدء فحص صحة النظام...\n');

  const checks = [];

  // فحص ملفات المشروع الأساسية
  const essentialFiles = [
    'package.json',
    'next.config.ts',
    'tsconfig.json',
    'prisma/schema.prisma',
    'src/lib/prisma.ts',
    'src/lib/auth.ts',
    'src/middleware.ts',
    '.env.example'
  ];

  console.log('📁 فحص الملفات الأساسية:');
  for (const file of essentialFiles) {
    const exists = fs.existsSync(file);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    checks.push({ name: `File: ${file}`, status: exists });
  }

  // فحص متغيرات البيئة
  console.log('\n🌍 فحص متغيرات البيئة:');
  const envVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
  let envFileExists = fs.existsSync('.env');
  
  console.log(`  ${envFileExists ? '✅' : '⚠️'} .env file`);
  checks.push({ name: 'ENV: .env file', status: envFileExists });

  for (const envVar of envVars) {
    const exists = !!process.env[envVar];
    const status = exists ? '✅' : (envFileExists ? '⚠️' : '❌');
    console.log(`  ${status} ${envVar}${!exists && envFileExists ? ' (موجود في .env لكن غير محمّل)' : ''}`);
    checks.push({ name: `ENV: ${envVar}`, status: exists || envFileExists });
  }

  // فحص Dependencies
  console.log('\n📦 فحص Dependencies:');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const criticalDeps = [
      'next',
      'react',
      'react-dom',
      '@prisma/client',
      'next-auth',
      'typescript'
    ];

    for (const dep of criticalDeps) {
      const hasMain = packageJson.dependencies[dep];
      const hasDev = packageJson.devDependencies && packageJson.devDependencies[dep];
      const exists = !!(hasMain || hasDev);
      console.log(`  ${exists ? '✅' : '❌'} ${dep}`);
      checks.push({ name: `DEP: ${dep}`, status: exists });
    }
  } catch (error) {
    console.log('  ❌ خطأ في قراءة package.json');
    checks.push({ name: 'package.json parsing', status: false });
  }

  // فحص TypeScript
  console.log('\n📝 فحص TypeScript:');
  await new Promise((resolve) => {
    exec('npx tsc --noEmit', (error, stdout, stderr) => {
      const hasErrors = !!error;
      console.log(`  ${hasErrors ? '❌' : '✅'} Type checking`);
      if (hasErrors) {
        console.log(`  Details: ${stderr.substring(0, 200)}...`);
      }
      checks.push({ name: 'TypeScript', status: !hasErrors });
      resolve();
    });
  });

  // فحص Prisma Schema
  console.log('\n🗃️ فحص Prisma:');
  await new Promise((resolve) => {
    exec('npx prisma validate', (error, stdout, stderr) => {
      const isValid = !error;
      console.log(`  ${isValid ? '✅' : '❌'} Schema validation`);
      if (!isValid) {
        console.log(`  Details: ${stderr.substring(0, 200)}...`);
      }
      checks.push({ name: 'Prisma Schema', status: isValid });
      resolve();
    });
  });

  // فحص الأمان
  console.log('\n🔒 فحص الأمان:');
  await new Promise((resolve) => {
    exec('npm audit --audit-level=high', (error, stdout, stderr) => {
      const isSafe = !error;
      console.log(`  ${isSafe ? '✅' : '⚠️'} Security audit`);
      if (!isSafe) {
        console.log(`  Details: يوجد ثغرات أمنية عالية المستوى`);
      }
      checks.push({ name: 'Security Audit', status: isSafe });
      resolve();
    });
  });

  // النتيجة النهائية
  console.log('\n📊 ملخص النتائج:');
  const passedChecks = checks.filter(check => check.status);
  const failedChecks = checks.filter(check => !check.status);

  console.log(`✅ نجح: ${passedChecks.length}`);
  console.log(`❌ فشل: ${failedChecks.length}`);

  if (failedChecks.length > 0) {
    console.log('\n🚨 المشاكل المكتشفة:');
    failedChecks.forEach(check => {
      console.log(`  - ${check.name}`);
    });
  }

  const healthScore = (passedChecks.length / checks.length) * 100;
  console.log(`\n🏥 درجة صحة النظام: ${healthScore.toFixed(1)}%`);

  if (healthScore >= 95) {
    console.log('🎉 النظام في حالة ممتازة!');
  } else if (healthScore >= 90) {
    console.log('✅ النظام في حالة جيدة جداً!');
  } else if (healthScore >= 70) {
    console.log('⚠️ النظام في حالة جيدة ولكن يحتاج بعض التحسينات');
  } else {
    console.log('🚨 النظام يحتاج إصلاحات عاجلة');
    process.exit(1);
  }

  // اقتراحات للتحسين
  if (healthScore < 100) {
    console.log('\n💡 اقتراحات للوصول إلى 100%:');
    
    if (!fs.existsSync('.env')) {
      console.log('  1. إنشاء ملف .env من .env.example');
    }
    
    if (failedChecks.some(c => c.name.startsWith('ENV:'))) {
      console.log('  2. إعداد متغيرات البيئة المطلوبة في .env');
    }
    
    if (failedChecks.some(c => c.name === 'TypeScript')) {
      console.log('  3. إصلاح أخطاء TypeScript');
    }
    
    if (failedChecks.some(c => c.name === 'Security Audit')) {
      console.log('  4. تشغيل npm audit fix لإصلاح الثغرات الأمنية');
    }

    console.log('  5. تشغيل: npm run health:fix لإصلاح المشاكل تلقائياً');
  }
}

if (require.main === module) {
  checkSystemHealth().catch(console.error);
}

module.exports = { checkSystemHealth };