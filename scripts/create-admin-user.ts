import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createDefaultUser() {
  try {
    console.log('🔄 Creating default admin user...\n')

    // Get HR Manager job title
    const hrManagerJobTitle = await prisma.jobTitle.findFirst({
      where: { name: 'HR Manager' }
    })

    if (!hrManagerJobTitle) {
      console.error('❌ HR Manager job title not found! Please run seed first.')
      return
    }

    // Check if admin user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'admin@hrcompany.com' },
          { name: 'admin' }
        ]
      }
    })

    if (existingUser) {
      console.log('⚠️  Admin user already exists!')
      console.log('👤 Name:', existingUser.name)
      console.log('📧 Email:', existingUser.email)
      console.log('🆔 ID:', existingUser.id)
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Create admin user
    const user = await prisma.user.create({
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
    })

    console.log('✅ Default admin user created successfully!\n')
    console.log('📋 Login credentials:')
    console.log('👤 Username: admin@hrcompany.com')
    console.log('🔑 Password: admin123')
    console.log('🛡️  Job Title: HR Manager (All Permissions)')
    console.log('🆔 User ID:', user.id)
    console.log('\n⚠️  IMPORTANT: Please change this password after first login!\n')

  } catch (error) {
    console.error('❌ Error creating user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDefaultUser()
