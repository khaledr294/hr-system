import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { createLog } from '@/lib/logger';
import { hasPermission } from '@/lib/permissions';

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // التحقق من صلاحية إنشاء عامل
  const canCreate = await hasPermission(session.user.id, 'CREATE_WORKERS');
  if (!canCreate) {
    return new Response('Forbidden - ليس لديك صلاحية إضافة عمال', { status: 403 });
  }

  try {
    const data = await req.json();

    // Validate required fields
    const requiredFields = [
      'name',
      'code',
      'nationality',
      'residencyNumber',
      'dateOfBirth',
      'phone',
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return new Response(`Missing required field: ${field}`, { status: 400 });
      }
    }

    // Validate code is a number
    if (isNaN(data.code) || data.code <= 0) {
      return new Response('Invalid worker code', { status: 400 });
    }

    // Validate date of birth
    if (isNaN(new Date(data.dateOfBirth).getTime())) {
      return new Response('Invalid date of birth', { status: 400 });
    }

    // Validate unique residency number
    const existingWorkerByResidency = await prisma.worker.findUnique({
      where: { residencyNumber: data.residencyNumber },
    });

    if (existingWorkerByResidency) {
      return new Response('Worker with this residency number already exists', { status: 400 });
    }

    // Validate unique worker code
    const existingWorkerByCode = await prisma.worker.findUnique({
      where: { code: data.code },
    });

    if (existingWorkerByCode) {
      return new Response('Worker with this code already exists', { status: 400 });
    }

    // Create worker
    const nationalitySalary = await prisma.nationalitySalary.findFirst({ where: { nationality: data.nationality } });
    const worker = await prisma.worker.create({
      data: {
        name: data.name,
        code: data.code,
        nationality: data.nationality,
        residencyNumber: data.residencyNumber,
        dateOfBirth: new Date(data.dateOfBirth),
        phone: data.phone,
        nationalitySalaryId: nationalitySalary?.id,
        status: 'AVAILABLE', // Set default status for new workers
        // حقول جديدة
        borderNumber: data.borderNumber,
        officeName: data.officeName,
        arrivalDate: data.arrivalDate ? new Date(data.arrivalDate) : null,
        passportNumber: data.passportNumber,
        religion: data.religion,
        iban: data.iban,
        residenceBranch: data.residenceBranch,
      },
    });

    // Log the worker creation
    await createLog(session.user.id, 'WORKER_CREATED', `Worker created: ${data.name} (Code: ${data.code})`);

    return new Response(JSON.stringify(worker), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to create worker:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // التحقق من صلاحية عرض العمال
  const canView = await hasPermission(session.user.id, 'VIEW_WORKERS');
  if (!canView) {
    return new Response('Forbidden - ليس لديك صلاحية عرض العمال', { status: 403 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('query');
    const status = searchParams.get('status');

    const where = {
      ...(query && {
        OR: [
          { name: { contains: query } },
          { nationality: { contains: query } },
          { residencyNumber: { contains: query } },
          { phone: { contains: query } },
        ],
      }),
      ...(status && { status }),
    };

    // جلب العاملات مع العقود النشطة
    let workersRaw;
    try {
      workersRaw = await prisma.worker.findMany({
        where,
        include: {
          nationalitySalary: true,
          contracts: {
            where: {
              status: 'ACTIVE',
              startDate: { lte: new Date() },
              endDate: { gte: new Date() },
            },
          }
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error: unknown) {
      // للتعامل مع الحقول المفقودة مؤقتاً
      const prismaError = error as { code?: string };
      if (prismaError.code === 'P2022') {
        workersRaw = await prisma.worker.findMany({
          where: {
            ...(query && {
              OR: [
                { name: { contains: query } },
                { nationality: { contains: query } },
                { residencyNumber: { contains: query } },
                { phone: { contains: query } },
              ],
            }),
            ...(status && { status }),
          },
          include: {
            nationalitySalary: true,
            contracts: {
              where: {
                status: 'ACTIVE',
                startDate: { lte: new Date() },
                endDate: { gte: new Date() },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
      } else {
        throw error;
      }
    }

    // تحديد الحالة حسب العقود النشطة وإضافة اسم المستخدم للحجوزات
    const workers = await Promise.all(workersRaw.map(async worker => {
      let reservedByUserName = worker.reservedBy;
      
      // إذا كان هناك حجز، جلب اسم المستخدم
      if (worker.status === 'RESERVED' && worker.reservedBy) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: worker.reservedBy },
            select: { name: true, email: true }
          });
          if (user) {
            reservedByUserName = user.name || user.email || worker.reservedBy;
          }
        } catch (error) {
          // في حالة حدوث خطأ، سنستخدم ID كما هو
          console.error('Error fetching user name for reservation:', error);
        }
      }
      
      return {
        ...worker,
        status: worker.contracts && worker.contracts.length > 0 ? 'RENTED' : worker.status,
        reservedByUserName
      };
    }));

    return new Response(JSON.stringify(workers), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to fetch workers:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}