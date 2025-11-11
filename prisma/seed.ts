import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user if not exists
  const existingAdmin = await prisma.user.findFirst({
    where: { email: 'admin@hr-system.com' }
  })

  if (!existingAdmin) {
    const hashedPassword = await hash('123456', 12)
    const admin = await prisma.user.create({
      data: {
        name: 'مدير النظام',
        email: 'admin@hr-system.com',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'AVAILABLE',
        nationality: 'سعودي',
        phone: '0500000000',
        dateOfBirth: new Date('1980-01-01'),
        residencyNumber: '9999999999'
      }
    })
    console.log('Created admin user:', admin)
    console.log('Email: admin@hr-system.com')
    console.log('Password: 123456')
  } else {
    console.log('Admin user already exists')
  }

  // Create HR manager user if not exists
  const existingHR = await prisma.user.findFirst({
    where: { email: 'hr@hr-system.com' }
  })

  if (!existingHR) {
    const hashedPassword = await hash('123456', 12)
    const hrManager = await prisma.user.create({
      data: {
        name: 'مدير الموارد البشرية',
        email: 'hr@hr-system.com',
        password: hashedPassword,
        role: 'HR_MANAGER',
        status: 'AVAILABLE',
        nationality: 'سعودي',
        phone: '0500000001',
        dateOfBirth: new Date('1985-01-01'),
        residencyNumber: '8888888888'
      }
    })
    console.log('Created HR manager user:', hrManager)
    console.log('Email: hr@hr-system.com')
    console.log('Password: 123456')
  } else {
    console.log('HR manager user already exists')
  }

  // Add some sample nationalities and salaries
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