import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'HR')) {
    return new Response('Unauthorized - Admin or HR access required', { status: 401 });
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
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
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
    const workersRaw = await prisma.worker.findMany({
      where,
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

    // تحديد الحالة حسب العقود النشطة
    const workers = workersRaw.map(worker => ({
      ...worker,
      status: worker.contracts && worker.contracts.length > 0 ? 'RENTED' : worker.status,
    }));

    return new Response(JSON.stringify(workers), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to fetch workers:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}