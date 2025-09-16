import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkWorkers() {
  try {
    // البحث عن العاملات بالاسماء المذكورة
    const workers = await prisma.worker.findMany({
      where: {
        OR: [
          { name: { contains: 'سوجاتا' } },
          { name: { contains: 'فاتيما' } },
          { name: { contains: 'Sujata' } },
          { name: { contains: 'Fatima' } }
        ]
      },
      include: {
        contracts: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    console.log('العاملات الموجودات:')
    workers.forEach(worker => {
      console.log(`\n--- ${worker.name} ---`)
      console.log(`الكود: ${worker.code}`)
      console.log(`الحالة: ${worker.status}`)
      console.log('العقود:')
      worker.contracts.forEach(contract => {
        console.log(`  - من ${contract.startDate} إلى ${contract.endDate}`)
        console.log(`    الحالة: ${contract.status}`)
        console.log(`    المبلغ: ${contract.totalAmount}`)
      })
    })

    // البحث عن العقود التي تنتهي في سبتمبر 2025
    const contractsEndingInSeptember = await prisma.contract.findMany({
      where: {
        endDate: {
          gte: new Date('2025-09-01'),
          lte: new Date('2025-09-30')
        }
      },
      include: {
        worker: true
      },
      orderBy: { endDate: 'asc' }
    })

    console.log('\n\nالعقود التي تنتهي في سبتمبر 2025:')
    contractsEndingInSeptember.forEach(contract => {
      console.log(`- ${contract.worker.name}: من ${contract.startDate} إلى ${contract.endDate} (حالة: ${contract.status})`)
    })

  } catch (error) {
    console.error('خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkWorkers()