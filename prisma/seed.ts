import 'dotenv/config'
import { PrismaClient, Permission } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const jobTitleSeeds = [
  {
    name: 'HR Manager',
    nameAr: 'مدير الموارد البشرية',
    description: 'إدارة العمليات والموارد البشرية وجميع صلاحيات النظام',
    requiresTwoFactor: false,
    permissions: Object.values(Permission),
  },
  {
    name: 'General Manager',
    nameAr: 'المدير العام',
    description: 'متابعة الأداء والتقارير والنسخ الاحتياطية بدون تعديل بيانات حساسة',
    requiresTwoFactor: false,
    permissions: [
      Permission.VIEW_WORKERS,
      Permission.VIEW_CONTRACTS,
      Permission.VIEW_CLIENTS,
      Permission.VIEW_REPORTS,
      Permission.MANAGE_REPORTS,
      Permission.EXPORT_DATA,
      Permission.VIEW_LOGS,
      Permission.VIEW_PAYROLL,
      Permission.VIEW_PAYROLL_DELIVERY,
      Permission.VIEW_BACKUPS,
      Permission.MANAGE_BACKUPS,
      Permission.VIEW_ARCHIVE,
      Permission.MANAGE_ARCHIVE,
      Permission.VIEW_PERFORMANCE,
      Permission.VIEW_SEARCH,
      Permission.MANAGE_SETTINGS,
    ],
  },
  {
    name: 'Marketer',
    nameAr: 'مسوق',
    description: 'إدارة العملاء والعقود دون الوصول للبيانات الحساسة',
    requiresTwoFactor: false,
    permissions: [
      Permission.VIEW_CLIENTS,
      Permission.CREATE_CLIENTS,
      Permission.EDIT_CLIENTS,
      Permission.VIEW_CONTRACTS,
      Permission.CREATE_CONTRACTS,
      Permission.EDIT_CONTRACTS,
      Permission.VIEW_WORKERS,
      Permission.RESERVE_WORKERS,
      Permission.VIEW_SEARCH,
    ],
  },
]

const DEFAULT_SIMPLE_PASSWORD = '123456'

function getSeedPassword(envKey: string, label: string): string {
  const fromEnv = process.env[envKey]
  if (fromEnv) {
    return fromEnv
  }

  console.warn(`⚠️  Env ${envKey} not set. Using default password ${DEFAULT_SIMPLE_PASSWORD} for ${label}`)
  return DEFAULT_SIMPLE_PASSWORD
}

async function ensureJobTitles() {
  console.log('🛠️  Syncing job titles & permissions...')
  const results = new Map<string, string>()

  for (const jt of jobTitleSeeds) {
    const record = await prisma.jobTitle.upsert({
      where: { name: jt.name },
      update: {
        nameAr: jt.nameAr,
        description: jt.description,
        permissions: { set: jt.permissions },
        requiresTwoFactor: jt.requiresTwoFactor,
        isActive: true,
      },
      create: {
        name: jt.name,
        nameAr: jt.nameAr,
        description: jt.description,
        permissions: { set: jt.permissions },
        requiresTwoFactor: jt.requiresTwoFactor,
      },
    })

    results.set(jt.name, record.id)
  }

  return results
}

async function ensurePrivilegedUser({
  email,
  name,
  envKey,
  jobTitleName,
  residencyNumber,
  phone,
}: {
  email: string
  name: string
  envKey: string
  jobTitleName: string
  residencyNumber: string
  phone: string
}) {
  const existing = await prisma.user.findFirst({ where: { email } })
  const password = getSeedPassword(envKey, email)
  const hashedPassword = await hash(password, 12)

  const jobTitle = await prisma.jobTitle.findUnique({ where: { name: jobTitleName } })
  if (!jobTitle) {
    throw new Error(`Job title ${jobTitleName} not found while creating ${email}`)
  }

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        password: hashedPassword,
        jobTitleId: jobTitle.id,
        status: 'AVAILABLE',
      },
    })

    console.log(`🔁 Rotated credentials for ${email}`)
    console.log(`   Temporary password: ${password}`)
    return
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      jobTitleId: jobTitle.id,
      status: 'AVAILABLE',
      nationality: 'سعودي',
      phone,
      dateOfBirth: new Date('1985-01-01'),
      residencyNumber,
    },
  })

  console.log(`✅ Created privileged user ${email} with job title ${jobTitleName}`)
  console.log(`   Temporary password: ${password}`)

  return user
}

async function main() {
  console.log('🌱 Starting seed process...\n')
  
  await ensureJobTitles()
  console.log('✅ Job titles created/updated\n')

  // Note: User accounts should be created through the admin panel
  // No default test accounts are created in seed

  // Add nationalities and default salaries
  const nationalities = [
    { nationality: 'الفلبين', salary: 1500.00 },
    { nationality: 'إندونيسيا', salary: 1400.00 },
    { nationality: 'بنغلاديش', salary: 1300.00 },
    { nationality: 'سريلانكا', salary: 1350.00 },
    { nationality: 'أثيوبيا', salary: 1200.00 },
    { nationality: 'أوغندا', salary: 1250.00 },
    { nationality: 'كينيا', salary: 1300.00 },
  ]

  for (const nat of nationalities) {
    try {
      await prisma.nationalitySalary.create({
        data: nat
      })
      console.log(`Created nationality: ${nat.nationality}`)
    } catch {
      console.log(`Nationality ${nat.nationality} already exists`)
    }
  }

  // Create sample client and marketer first
  let sampleClient, sampleMarketer;
  
  try {
    sampleClient = await prisma.client.create({
      data: {
        name: 'عميل تجريبي',
        phone: '0501111111',
        address: 'الرياض',
        idNumber: '1111111111'
      }
    });
    console.log('Created sample client:', sampleClient.name);
  } catch {
    sampleClient = await prisma.client.findFirst();
    console.log('Using existing client');
  }

  try {
    sampleMarketer = await prisma.marketer.create({
      data: {
        name: 'مسوق تجريبي',
        phone: '0502222222'
      }
    });
    console.log('Created sample marketer:', sampleMarketer.name);
  } catch {
    sampleMarketer = await prisma.marketer.findFirst();
    console.log('Using existing marketer');
  }

  // Add sample workers with contracts
  const workers = [
    {
      name: 'سوجاتا شارما',
      code: '1001',
      nationality: 'الفلبين',
      residencyNumber: '1234567890',
      dateOfBirth: new Date('1990-01-15'),
      phone: '0501234567',
      address: 'الرياض',
      status: 'AVAILABLE'
    },
    {
      name: 'فاطمة باتل',
      code: '1002',
      nationality: 'إندونيسيا', 
      residencyNumber: '0987654321',
      dateOfBirth: new Date('1988-05-20'),
      phone: '0509876543',
      address: 'الرياض',
      status: 'AVAILABLE'
    },
    {
      name: 'ماريا سانتوس',
      code: '1003',
      nationality: 'الفلبين',
      residencyNumber: '1122334455',
      dateOfBirth: new Date('1992-03-10'),
      phone: '0555667788',
      address: 'جدة',
      status: 'AVAILABLE'
    }
  ];

  if (sampleClient && sampleMarketer) {
    for (const workerData of workers) {
      try {
        // Get nationality salary
        const nationalitySalary = await prisma.nationalitySalary.findFirst({
          where: { nationality: workerData.nationality }
        });

        const worker = await prisma.worker.create({
          data: {
            ...workerData,
            nationalitySalaryId: nationalitySalary?.id ?? null,
          }
        });
        console.log(`Created worker: ${worker.name}`)

        // Create a sample contract for each worker
        await prisma.contract.create({
          data: {
            workerId: worker.id,
            clientId: sampleClient.id,
            marketerId: sampleMarketer.id,
            startDate: new Date('2024-08-01'),
            endDate: new Date('2025-12-31'),
            packageType: 'شهري',
            totalAmount: nationalitySalary?.salary || 1500,
            status: 'ACTIVE'
          }
        });
        console.log(`Created contract for: ${worker.name}`)

      } catch {
        console.log(`Worker ${workerData.name} already exists or error occurred`);
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })