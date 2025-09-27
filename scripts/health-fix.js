#!/usr/bin/env node

/**
 * إصلاح مشاكل صحة النظام تلقائياً
 */

const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function fixSystemHealth() {
  console.log('🔧 بدء إصلاح مشاكل النظام تلقائياً...\n');

  let fixes = [];

  // إصلاح 1: إنشاء ملف .env إذا لم يكن موجوداً
  if (!fs.existsSync('.env')) {
    console.log('📝 إنشاء ملف .env من .env.example...');
    try {
      if (fs.existsSync('.env.example')) {
        fs.copyFileSync('.env.example', '.env');
        console.log('✅ تم إنشاء ملف .env');
        fixes.push('إنشاء ملف .env');
      } else {
        // إنشاء .env بالقيم الافتراضية
        const defaultEnv = `# قاعدة البيانات
DATABASE_URL="postgresql://username:password@localhost:5432/hr_system"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-key-at-least-32-characters-long-${Math.random().toString(36).substring(2, 15)}"
NEXTAUTH_URL="http://localhost:3000"

# بيئة التطبيق
NODE_ENV="development"
`;
        fs.writeFileSync('.env', defaultEnv);
        console.log('✅ تم إنشاء ملف .env بالقيم الافتراضية');
        fixes.push('إنشاء ملف .env بالقيم الافتراضية');
      }
    } catch (error) {
      console.log('❌ فشل في إنشاء ملف .env:', error.message);
    }
  }

  // إصلاح 2: توليد NEXTAUTH_SECRET عشوائي إذا كان مفقوداً
  if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    if (!envContent.includes('NEXTAUTH_SECRET=') || envContent.includes('your-nextauth-secret-here') || envContent.includes('your-super-secret-key')) {
      console.log('🔐 توليد NEXTAUTH_SECRET عشوائي...');
      try {
        const randomSecret = require('crypto').randomBytes(32).toString('hex');
        let newEnvContent = envContent;
        
        if (envContent.includes('NEXTAUTH_SECRET=')) {
          newEnvContent = envContent.replace(/NEXTAUTH_SECRET=.*/, `NEXTAUTH_SECRET="${randomSecret}"`);
        } else {
          newEnvContent += `\nNEXTAUTH_SECRET="${randomSecret}"\n`;
        }
        
        fs.writeFileSync('.env', newEnvContent);
        console.log('✅ تم توليد NEXTAUTH_SECRET عشوائي');
        fixes.push('توليد NEXTAUTH_SECRET آمن');
      } catch (error) {
        console.log('❌ فشل في توليد NEXTAUTH_SECRET:', error.message);
      }
    }
  }

  // إصلاح 3: تحديث dependencies
  console.log('📦 تحديث dependencies...');
  try {
    await execAsync('npm update');
    console.log('✅ تم تحديث dependencies');
    fixes.push('تحديث dependencies');
  } catch (error) {
    console.log('⚠️ تحذير في تحديث dependencies:', error.message);
  }

  // إصلاح 4: إصلاح مشاكل الأمان
  console.log('🔒 إصلاح مشاكل الأمان...');
  try {
    await execAsync('npm audit fix');
    console.log('✅ تم إصلاح مشاكل الأمان');
    fixes.push('إصلاح مشاكل الأمان');
  } catch (error) {
    console.log('⚠️ لا توجد مشاكل أمان لإصلاحها');
  }

  // إصلاح 5: تنظيف cache
  console.log('🧹 تنظيف cache...');
  try {
    await execAsync('npm run clean');
    console.log('✅ تم تنظيف cache');
    fixes.push('تنظيف cache');
  } catch (error) {
    console.log('⚠️ تحذير في تنظيف cache:', error.message);
  }

  // إصلاح 6: إعادة توليد Prisma client
  console.log('🗃️ إعادة توليد Prisma client...');
  try {
    await execAsync('npx prisma generate');
    console.log('✅ تم إعادة توليد Prisma client');
    fixes.push('إعادة توليد Prisma client');
  } catch (error) {
    console.log('⚠️ تحذير في Prisma generate:', error.message);
  }

  // إصلاح 7: إنشاء ملفات التكوين المفقودة
  const configFiles = [
    {
      name: '.gitignore',
      content: `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Database
prisma/dev.db
prisma/migrations/dev.db*
*.db
*.sqlite

# Backup files
*.backup
backup-*.sql
`
    },
    {
      name: '.nvmrc',
      content: '20\n'
    }
  ];

  for (const file of configFiles) {
    if (!fs.existsSync(file.name)) {
      console.log(`📄 إنشاء ملف ${file.name}...`);
      try {
        fs.writeFileSync(file.name, file.content);
        console.log(`✅ تم إنشاء ملف ${file.name}`);
        fixes.push(`إنشاء ملف ${file.name}`);
      } catch (error) {
        console.log(`❌ فشل في إنشاء ملف ${file.name}:`, error.message);
      }
    }
  }

  // النتيجة النهائية
  console.log('\n📊 ملخص الإصلاحات:');
  if (fixes.length > 0) {
    console.log(`✅ تم إجراء ${fixes.length} إصلاح:`);
    fixes.forEach((fix, index) => {
      console.log(`  ${index + 1}. ${fix}`);
    });
  } else {
    console.log('✅ لا توجد إصلاحات مطلوبة - النظام في حالة جيدة!');
  }

  console.log('\n💡 خطوات إضافية يدوية:');
  console.log('  1. تحديث DATABASE_URL في ملف .env بتفاصيل قاعدة البيانات الفعلية');
  console.log('  2. تحديث NEXTAUTH_URL للإنتاج إذا لزم الأمر');
  console.log('  3. تشغيل npm run health:check للتحقق من النتيجة');

  console.log('\n🎉 تم الانتهاء من الإصلاحات التلقائية!');
}

if (require.main === module) {
  fixSystemHealth().catch(console.error);
}

module.exports = { fixSystemHealth };