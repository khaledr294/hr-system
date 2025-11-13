import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🔄 بدء إضافة حقل medicalStatus...');
  
  try {
    // Execute raw SQL to add the column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Worker" 
      ADD COLUMN IF NOT EXISTS "medicalStatus" TEXT DEFAULT 'PENDING_REPORT';
    `);
    
    console.log('✅ تمت إضافة حقل medicalStatus بنجاح');
    
    // Update existing workers
    const updatedCount = await prisma.$executeRawUnsafe(`
      UPDATE "Worker" 
      SET "medicalStatus" = 'PENDING_REPORT' 
      WHERE "medicalStatus" IS NULL;
    `);
    
    console.log(`✅ تم تحديث ${updatedCount} عاملة`);
    
  } catch (error) {
    console.error('❌ خطأ:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
