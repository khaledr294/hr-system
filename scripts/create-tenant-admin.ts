/**
 * create-tenant-admin.ts
 * Creates the initial admin user and configures SystemSettings for a new tenant.
 * 
 * Required env vars:
 *   SEED_COMPANY_NAME   — Company display name
 *   SEED_ADMIN_EMAIL    — Admin login email
 *   SEED_ADMIN_PASSWORD — Admin login password
 *   SEED_TRIAL_DAYS     — Trial period in days (0 = active subscription)
 *   DATABASE_URL        — Tenant database connection string
 * 
 * Usage:
 *   SEED_COMPANY_NAME="شركة النخبة" SEED_ADMIN_EMAIL=admin@acme.com \
 *   SEED_ADMIN_PASSWORD=SecurePass123 SEED_TRIAL_DAYS=30 \
 *   npx ts-node scripts/create-tenant-admin.ts
 */

import 'dotenv/config'
import { PrismaClient, Permission } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const companyName = process.env.SEED_COMPANY_NAME
  const adminEmail = process.env.SEED_ADMIN_EMAIL
  const adminPassword = process.env.SEED_ADMIN_PASSWORD
  const trialDays = parseInt(process.env.SEED_TRIAL_DAYS || '30', 10)

  if (!companyName || !adminEmail || !adminPassword) {
    console.error('❌ Missing required env vars: SEED_COMPANY_NAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD')
    process.exit(1)
  }

  console.log(`\n🏢 Setting up tenant: ${companyName}`)
  console.log(`📧 Admin: ${adminEmail}`)
  console.log(`📅 Trial: ${trialDays > 0 ? `${trialDays} days` : 'none (active)'}`)

  // 1. Ensure HR Manager job title exists with all permissions
  const hrManager = await prisma.jobTitle.upsert({
    where: { name: 'HR Manager' },
    update: {
      permissions: { set: Object.values(Permission) },
      isActive: true,
    },
    create: {
      name: 'HR Manager',
      nameAr: 'مدير الموارد البشرية',
      description: 'إدارة العمليات والموارد البشرية وجميع صلاحيات النظام',
      permissions: { set: Object.values(Permission) },
    },
  })
  console.log('✅ HR Manager role ready')

  // 2. Create General Manager and Marketer roles
  await prisma.jobTitle.upsert({
    where: { name: 'General Manager' },
    update: { isActive: true },
    create: {
      name: 'General Manager',
      nameAr: 'المدير العام',
      description: 'متابعة الأداء والتقارير',
      permissions: {
        set: [
          Permission.VIEW_WORKERS, Permission.VIEW_CONTRACTS,
          Permission.VIEW_CLIENTS, Permission.VIEW_REPORTS,
          Permission.MANAGE_REPORTS, Permission.EXPORT_DATA,
          Permission.VIEW_LOGS, Permission.VIEW_PAYROLL,
          Permission.VIEW_PAYROLL_DELIVERY, Permission.VIEW_BACKUPS,
          Permission.MANAGE_BACKUPS, Permission.VIEW_ARCHIVE,
          Permission.MANAGE_ARCHIVE, Permission.VIEW_PERFORMANCE,
          Permission.VIEW_SEARCH, Permission.MANAGE_SETTINGS,
        ],
      },
    },
  })

  await prisma.jobTitle.upsert({
    where: { name: 'Marketer' },
    update: { isActive: true },
    create: {
      name: 'Marketer',
      nameAr: 'مسوق',
      description: 'إدارة العملاء والعقود',
      permissions: {
        set: [
          Permission.VIEW_CLIENTS, Permission.CREATE_CLIENTS,
          Permission.EDIT_CLIENTS, Permission.VIEW_CONTRACTS,
          Permission.CREATE_CONTRACTS, Permission.EDIT_CONTRACTS,
          Permission.VIEW_WORKERS, Permission.RESERVE_WORKERS,
          Permission.VIEW_SEARCH,
        ],
      },
    },
  })
  console.log('✅ All roles ready')

  // 3. Create admin user
  const hashedPassword = await hash(adminPassword, 12)
  
  // Email is not unique in schema, so use findFirst + create/update pattern
  const existingAdmin = await prisma.user.findFirst({
    where: { email: adminEmail },
  })

  let adminUser
  if (existingAdmin) {
    adminUser = await prisma.user.update({
      where: { id: existingAdmin.id },
      data: { password: hashedPassword, jobTitleId: hrManager.id },
    })
  } else {
    adminUser = await prisma.user.create({
      data: {
        name: 'مدير النظام',
        email: adminEmail,
        password: hashedPassword,
        jobTitleId: hrManager.id,
      },
    })
  }
  console.log(`✅ Admin user created: ${adminUser.email} (ID: ${adminUser.id})`)

  // 4. Configure SystemSettings with trial info
  const trialData = trialDays > 0
    ? {
        trialStartDate: new Date(),
        trialEndDate: new Date(Date.now() + trialDays * 86_400_000),
        isTrialActive: true,
        subscriptionStatus: 'trial',
      }
    : {
        subscriptionStatus: 'active',
        isTrialActive: false,
      }

  await prisma.systemSettings.upsert({
    where: { id: 'system' },
    update: { companyName, ...trialData },
    create: { id: 'system', companyName, ...trialData },
  })
  console.log(`✅ SystemSettings configured`)

  // 5. Seed default nationality salaries
  const nationalities = [
    { nationality: 'الفلبين', salary: 1500 },
    { nationality: 'إندونيسيا', salary: 1400 },
    { nationality: 'بنغلاديش', salary: 1300 },
    { nationality: 'سريلانكا', salary: 1350 },
    { nationality: 'أثيوبيا', salary: 1200 },
    { nationality: 'أوغندا', salary: 1250 },
    { nationality: 'كينيا', salary: 1300 },
  ]

  for (const nat of nationalities) {
    await prisma.nationalitySalary.upsert({
      where: { nationality: nat.nationality },
      update: { salary: nat.salary },
      create: nat,
    })
  }
  console.log('✅ Nationality salaries seeded')

  console.log('\n══════════════════════════════════════════')
  console.log('  🎉 Tenant setup complete!')
  console.log(`  🏢 ${companyName}`)
  console.log(`  📧 Login: ${adminEmail}`)
  console.log(`  📅 Trial expires: ${trialDays > 0 ? new Date(Date.now() + trialDays * 86_400_000).toLocaleDateString('ar-SA') : 'N/A — active'}`)
  console.log('══════════════════════════════════════════\n')
}

main()
  .catch((e) => {
    console.error('❌ Setup failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
