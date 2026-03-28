import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function forceCreateAdmin() {
  try {
    console.log('🔄 إنشاء مستخدم إداري جديد...\n')

    // التحقق من اتصال قاعدة البيانات
    await prisma.$connect()
    console.log('✅ متصل بقاعدة البيانات\n')

    // حذف المستخدم القديم إن وجد
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: 'admin@hrcompany.com' },
          { email: 'admin@saed.com' },
          { name: 'admin' }
        ]
      }
    })
    console.log('🗑️  تم حذف المستخدمين القدامى\n')

    // البحث عن وظيفة HR Manager
    let hrManagerJobTitle = await prisma.jobTitle.findFirst({
      where: { name: 'HR Manager' }
    })

    // إنشاء الوظيفة إذا لم تكن موجودة
    if (!hrManagerJobTitle) {
      console.log('📋 إنشاء وظيفة HR Manager...')
      hrManagerJobTitle = await prisma.jobTitle.create({
        data: {
          name: 'HR Manager',
          nameAr: 'مدير الموارد البشرية',
          description: 'مدير الموارد البشرية - جميع الصلاحيات',
          permissions: [
            'VIEW_WORKERS', 'CREATE_WORKERS', 'EDIT_WORKERS', 'DELETE_WORKERS', 'RESERVE_WORKERS',
            'VIEW_CLIENTS', 'CREATE_CLIENTS', 'EDIT_CLIENTS', 'DELETE_CLIENTS',
            'VIEW_CONTRACTS', 'CREATE_CONTRACTS', 'EDIT_CONTRACTS', 'DELETE_CONTRACTS',
            'VIEW_USERS', 'CREATE_USERS', 'EDIT_USERS', 'DELETE_USERS',
            'VIEW_REPORTS', 'MANAGE_REPORTS', 'EXPORT_DATA',
            'VIEW_LOGS', 'MANAGE_SETTINGS', 'MANAGE_JOB_TITLES',
            'VIEW_PAYROLL', 'MANAGE_PAYROLL',
            'VIEW_PAYROLL_DELIVERY', 'MANAGE_PAYROLL_DELIVERY',
            'VIEW_BACKUPS', 'MANAGE_BACKUPS',
            'VIEW_ARCHIVE', 'MANAGE_ARCHIVE',
            'MANAGE_TEMPLATES', 'VIEW_PERFORMANCE', 'VIEW_SEARCH', 'MANAGE_PACKAGES'
          ],
          isActive: true
        }
      })
      console.log('✅ تم إنشاء وظيفة HR Manager\n')
    }

    // إنشاء كلمة مرور مشفرة
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // إنشاء المستخدم الإداري
    const admin = await prisma.user.create({
      data: {
        name: 'admin',
        email: 'admin@hrcompany.com',
        password: hashedPassword,
        jobTitleId: hrManagerJobTitle.id,
        nationality: 'السعودية',
        residencyNumber: '1000000000',
        dateOfBirth: new Date('1990-01-01'),
        phone: '0500000000',
        status: 'AVAILABLE',
      },
      include: {
        jobTitle: true
      }
    })

    console.log('✅ تم إنشاء المستخدم الإداري بنجاح!\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 بيانات تسجيل الدخول:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('👤 اسم المستخدم: admin@hrcompany.com')
    console.log('🔑 كلمة المرور: admin123')
    console.log('🛡️  الوظيفة:', admin.jobTitle?.nameAr || 'مدير الموارد البشرية')
    console.log('🆔 المعرف:', admin.id)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('⚠️  تنبيه: غيّر كلمة المرور بعد أول تسجيل دخول!\n')

    // التحقق من إنشاء المستخدم
    const verification = await prisma.user.count()
    console.log(`📊 عدد المستخدمين في قاعدة البيانات: ${verification}`)

  } catch (error) {
    console.error('❌ خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

forceCreateAdmin()
