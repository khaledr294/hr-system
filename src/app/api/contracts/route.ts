import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createLog } from '@/lib/logger';
import { Permission, Prisma } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;
type EmptyContext = { params: Promise<Record<string, never>> };

export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.VIEW_CONTRACTS] },
  async ({ req, session }) => {
    const { searchParams } = new URL(req.url);
    const workerId = searchParams.get('workerId');
    const month = searchParams.get('month');

    try {
      const whereClause: Prisma.ContractWhereInput = {};
      const archivedWhereClause: Prisma.ArchivedContractWhereInput = {};

      if (workerId) {
        whereClause.workerId = workerId;
        archivedWhereClause.workerId = workerId;
      }

      // تقييد العرض للمسوقين فقط لعقودهم الخاصة
      if (session.user.role === 'MARKETER') {
        whereClause.marketerId = session.user.id;
        archivedWhereClause.marketerId = session.user.id;
      }

      if (month) {
        const [year, monthNum] = month.split('-').map(Number);
        const monthStart = new Date(year, monthNum - 1, 1);
        const monthEnd = new Date(year, monthNum, 0);

        whereClause.AND = [
          { startDate: { lte: monthEnd } },
          { endDate: { gte: monthStart } },
        ];
        archivedWhereClause.AND = [
          { startDate: { lte: monthEnd } },
          { endDate: { gte: monthStart } },
        ];
      }

      const [activeContracts, archivedContracts] = await Promise.all([
        prisma.contract.findMany({
          where: whereClause,
          include: {
            client: true,
            worker: true,
            marketer: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.archivedContract.findMany({
          where: archivedWhereClause,
          orderBy: { archivedAt: 'desc' },
        }),
      ]);

      const transformedArchivedContracts = archivedContracts.map((archived) => ({
        id: archived.id,
        workerId: archived.workerId,
        clientId: archived.clientId,
        startDate: archived.startDate,
        endDate: archived.endDate,
        packageType: archived.packageType,
        packageName: archived.packageName,
        totalAmount: archived.totalAmount,
        status: archived.status,
        contractNumber: archived.contractNumber,
        notes: archived.notes,
        delayDays: archived.delayDays,
        penaltyAmount: archived.penaltyAmount,
        penaltyRate: null,
        marketerId: archived.marketerId,
        createdAt: archived.archivedAt,
        updatedAt: archived.archivedAt,
        client: {
          id: archived.clientId,
          name: archived.clientName,
          idNumber: '',
          phone: '',
          dateOfBirth: null,
          address: null,
          createdAt: archived.archivedAt,
          updatedAt: archived.archivedAt,
        },
        worker: {
          id: archived.workerId,
          name: archived.workerName,
          code: archived.workerCode,
          nationality: '',
          residencyNumber: '',
          dateOfBirth: archived.archivedAt,
          phone: '',
          status: 'AVAILABLE',
          salary: null,
          createdAt: archived.archivedAt,
          updatedAt: archived.archivedAt,
          nationalitySalaryId: null,
          arrivalDate: null,
          borderNumber: null,
          iban: null,
          officeName: null,
          passportNumber: null,
          religion: null,
          reservationNotes: null,
          reservedAt: null,
          reservedBy: null,
          residenceBranch: null,
        },
        marketer: archived.marketerId
          ? {
              id: archived.marketerId,
              name: archived.marketerName || '',
              email: null,
              password: null,
              role: 'STAFF',
              jobTitleId: null,
              nationality: null,
              nationalitySalaryId: null,
              residencyNumber: null,
              dateOfBirth: null,
              phone: null,
              status: 'AVAILABLE',
              salary: null,
              createdAt: archived.archivedAt,
              updatedAt: archived.archivedAt,
              twoFactorBackupCodes: null,
              twoFactorEnabled: false,
              twoFactorSecret: null,
            }
          : null,
        isArchived: true,
      }));

      const contracts = [
        ...activeContracts.map((c) => ({ ...c, isArchived: false })),
        ...transformedArchivedContracts,
      ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return NextResponse.json(contracts, {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' },
      });
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);

export const POST = withApiAuth<EmptyContext>(
  { permissions: [Permission.CREATE_CONTRACTS], auditAction: 'CONTRACT_CREATE' },
  async ({ req, session }) => {
    try {
      const data = await req.json();
      const requiredFields = [
        'workerId',
        'clientId',
        'marketerId',
        'startDate',
        'endDate',
        'packageType',
      ];

      for (const field of requiredFields) {
        if (!data[field]) {
          return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
        }
      }

      // totalAmount يمكن أن يكون 0، لذا نتحقق من وجوده فقط كرقم
      if (typeof data.totalAmount !== 'number') {
        return NextResponse.json({ error: 'Missing required field: totalAmount' }, { status: 400 });
      }

      const worker = await prisma.worker.findUnique({ where: { id: data.workerId } });

      if (!worker) {
        return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
      }

      if (worker.status !== 'AVAILABLE') {
        return NextResponse.json({ error: 'Worker is not available' }, { status: 400 });
      }

      const now = new Date();
      const yymmdd = `${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(
        now.getDate()
      ).padStart(2, '0')}`;

      const lastContract = await prisma.contract.findFirst({
        where: { contractNumber: { startsWith: yymmdd } },
        orderBy: { contractNumber: 'desc' },
      });

      let serial = 1;
      if (lastContract?.contractNumber) {
        const lastSerial = parseInt(lastContract.contractNumber.slice(6), 10);
        serial = lastSerial + 1;
      }

      const contractNumber = `${yymmdd}${String(serial).padStart(4, '0')}`;

      const contract = await prisma.$transaction(async (tx) => {
        const newContract = await tx.contract.create({
          data: {
            workerId: data.workerId,
            clientId: data.clientId,
            marketerId: data.marketerId,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            packageType: data.packageType,
            packageName: data.packageName || data.packageType,
            totalAmount: data.totalAmount,
            status: 'ACTIVE',
            contractNumber,
            notes: data.notes || '',
          },
          include: {
            worker: true,
            client: true,
          },
        });

        await tx.worker.update({
          where: { id: data.workerId },
          data: { status: 'RENTED' },
        });

        return newContract;
      });

      await createLog(
        session.user.id,
        'CONTRACT_CREATE',
        `تم إنشاء عقد للعاملة ${contract.worker.name} مع العميل ${contract.client.name}`
      );

      return NextResponse.json(contract, { status: 201 });
    } catch (error) {
      console.error('Failed to create contract:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);