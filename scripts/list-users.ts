import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listUsers() {
  try {
    console.log('🔍 جاري البحث عن المستخدمين في قاعدة البيانات...\n')

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        jobTitle: {
          select: {
            name: true,
            permissions: true
          }
        },
        createdAt: true,
        status: true
      }
    })

    if (users.length === 0) {
      console.log('⚠️  لا يوجد مستخدمين في قاعدة البيانات!')
      console.log('💡 يمكنك إنشاء مستخدم باستخدام: npx ts-node scripts/create-admin-user.ts')
    } else {
      console.log(`✅ تم العثور على ${users.length} مستخدم:\n`)
      users.forEach((user, index) => {
        console.log(`${index + 1}. 👤 الاسم: ${user.name}`)
        console.log(`   📧 البريد: ${user.email}`)
        console.log(`   🛡️  الوظيفة: ${user.jobTitle?.name || 'غير محدد'}`)
        console.log(`   📅 تاريخ الإنشاء: ${user.createdAt}`)
        console.log(`   🔑 المعرف: ${user.id}`)
        console.log(`   📊 الحالة: ${user.status}`)
        console.log('')
      })
    }

  } catch (error) {
    console.error('❌ خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listUsers()
