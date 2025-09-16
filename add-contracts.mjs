import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addContracts() {
  try {
    console.log('🔍 جاري البحث عن العاملين والعملاء...');

    // Find the worker
    const worker = await prisma.worker.findFirst({
      where: { name: 'سوجاتا شارما' }
    });

    if (!worker) {
      console.log('❌ العاملة غير موجودة');
      return;
    }

    console.log('✅ تم العثور على العاملة:', worker.name);

    // Check if client exists, if not create one
    let client = await prisma.client.findFirst();
    if (!client) {
      client = await prisma.client.create({
        data: {
          name: 'عميل تجريبي',
          phone: '0501111111',
          address: 'الرياض',
          idNumber: '1111111111'
        }
      });
      console.log('✅ تم إنشاء عميل:', client.name);
    }

    // Check if marketer exists, if not create one
    let marketer = await prisma.marketer.findFirst();
    if (!marketer) {
      marketer = await prisma.marketer.create({
        data: {
          name: 'مسوق تجريبي',
          phone: '0502222222'
        }
      });
      console.log('✅ تم إنشاء مسوق:', marketer.name);
    }

    // Check if contract already exists
    const existingContract = await prisma.contract.findFirst({
      where: { workerId: worker.id }
    });

    if (existingContract) {
      console.log('📋 العقد موجود بالفعل:', existingContract.id);
      console.log('📅 فترة العقد:', existingContract.startDate, 'إلى', existingContract.endDate);
    } else {
      // Create contract
      const contract = await prisma.contract.create({
        data: {
          workerId: worker.id,
          clientId: client.id,
          marketerId: marketer.id,
          startDate: new Date('2024-09-01'), // بداية سبتمبر
          endDate: new Date('2025-12-31'),   // نهاية العام القادم
          packageType: 'شهري',
          totalAmount: 1500,
          status: 'ACTIVE'
        }
      });
      console.log('✅ تم إنشاء العقد:', contract.id);
    }

    console.log('🎯 فحص العقود للشهر الحالي...');
    const currentContracts = await prisma.contract.findMany({
      where: {
        workerId: worker.id,
        AND: [
          {
            startDate: {
              lte: new Date('2024-09-30')
            }
          },
          {
            OR: [
              { endDate: { equals: null } },
              {
                endDate: {
                  gte: new Date('2024-09-01')
                }
              }
            ]
          }
        ]
      }
    });

    console.log(`📊 عدد العقود النشطة في سبتمبر 2024: ${currentContracts.length}`);

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addContracts();