import { prisma } from '@/lib/prisma';
import { createLog } from '@/lib/logger';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';
import {
  buildWorkerMeta,
  parseWorkerMeta,
  type MedicalStatus,
} from '@/lib/medicalStatus';

type EmptyContext = { params: Promise<Record<string, never>> };

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const POST = withApiAuth<EmptyContext>(
  { permissions: [Permission.CREATE_WORKERS], auditAction: 'WORKER_CREATE' },
  async ({ req, session }) => {
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

    // Validate code is a non-empty string (can be alphanumeric)
    if (typeof data.code !== 'string' || data.code.trim().length === 0) {
      return new Response('Invalid worker code - code must be a non-empty string', { status: 400 });
    }

    // Validate residency number (10 digits max, numbers only)
    if (!/^\d{1,10}$/.test(data.residencyNumber)) {
      return new Response('Invalid residency number - must be 1-10 digits', { status: 400 });
    }

    // Validate border number if provided (10 digits max, numbers only)
    if (data.borderNumber && !/^\d{1,10}$/.test(data.borderNumber)) {
      return new Response('Invalid border number - must be 1-10 digits', { status: 400 });
    }

    // Validate IBAN if provided (SA + 22 digits)
    if (data.iban && !/^SA\d{22}$/.test(data.iban)) {
      return new Response('Invalid IBAN format - must be SA followed by 22 digits', { status: 400 });
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

    const medicalStatus = (data.medicalStatus || 'PENDING_REPORT') as MedicalStatus;
    const reservationNoteInput = data.reservationNote ?? data.reservationNotes;
    const reservationNote =
      typeof reservationNoteInput === 'string'
        ? reservationNoteInput.trim() === ''
          ? null
          : reservationNoteInput.trim()
        : null;

    const reservationNotes = buildWorkerMeta({
      medicalStatus,
      reservationNote,
    });

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
        status: 'AVAILABLE',
        // حقول جديدة
        borderNumber: data.borderNumber,
        officeName: data.officeName,
        arrivalDate: data.arrivalDate ? new Date(data.arrivalDate) : null,
        passportNumber: data.passportNumber,
        religion: data.religion,
        iban: data.iban,
        residenceBranch: data.residenceBranch,
        reservationNotes,
      },
    });

    // Log the worker creation
    await createLog(session.user.id, 'WORKER_CREATED', `Worker created: ${data.name} (Code: ${data.code})`);

    const meta = parseWorkerMeta(worker.reservationNotes);
    const responseBody = {
      ...worker,
      reservationNotes: meta.reservationNote,
      reservationNotesRaw: meta.raw,
      medicalStatus: meta.medicalStatus,
    };

    return new Response(JSON.stringify(responseBody), {
      status: 201,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      },
    });
  } catch (error) {
    console.error('Failed to create worker:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
);

export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.VIEW_WORKERS] },
  async ({ req }) => {
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
      const meta = parseWorkerMeta(worker.reservationNotes);
      
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
        reservedByUserName,
        reservationNotes: meta.reservationNote,
        reservationNotesRaw: meta.raw,
        medicalStatus: meta.medicalStatus,
      };
    }));

    return new Response(JSON.stringify(workers), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      },
    });
  } catch (error) {
    console.error('Failed to fetch workers:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
);