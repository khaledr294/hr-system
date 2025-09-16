import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testQuery() {
  try {
    console.log('🔍 اختبار query بسيط...');

    // Simple query first
    const allContracts = await prisma.contract.findMany({
      take: 5,
      select: {
        id: true,
        workerId: true,
        startDate: true,
        endDate: true,
        status: true
      }
    });

    console.log('📋 العقود الموجودة:');
    allContracts.forEach(contract => {
      console.log(`- ${contract.id}: من ${contract.startDate} إلى ${contract.endDate || 'مفتوح'}`);
    });

    // Test the problematic query
    console.log('\n🧪 اختبار query المشكل...');
    const testContracts = await prisma.contract.findMany({
      where: {
        OR: [
          { endDate: null },
          { endDate: { not: null } }
        ]
      },
      take: 3
    });

    console.log(`✅ تم العثور على ${testContracts.length} عقود`);

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testQuery();