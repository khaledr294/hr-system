// تشغيل هذا الملف للحصول على معرفات Vercel
// node get-vercel-ids.js

const { execSync } = require('child_process');

try {
  console.log('🔍 جاري البحث عن معرفات Vercel...\n');
  
  // إذا كان لديك Vercel CLI مثبت
  try {
    const orgId = execSync('vercel org list --token YOUR_VERCEL_TOKEN', { encoding: 'utf8' });
    console.log('📋 معرف المؤسسة (ORG_ID):');
    console.log(orgId);
  } catch (e) {
    console.log('⚠️  لم يتم العثور على Vercel CLI');
  }
  
  console.log('\n📝 خطوات الحصول على المعرفات يدوياً:');
  console.log('1. اذهب إلى: https://vercel.com/dashboard');
  console.log('2. اختر مشروعك');
  console.log('3. اذهب إلى Settings');
  console.log('4. في قسم General ستجد:');
  console.log('   - Project ID');
  console.log('   - Team ID (هو نفسه ORG_ID)');
  
} catch (error) {
  console.error('خطأ:', error.message);
}