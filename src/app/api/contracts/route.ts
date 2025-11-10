import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { createLog } from '@/lib/logger';
import { hasPermission } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // التحقق من صلاحية عرض العقود
  const canView = await hasPermission(session.user.id, 'VIEW_CONTRACTS');
  if (!canView) {
    return new Response('Forbidden - ليس لديك صلاحية عرض العقود', { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const workerId = searchParams.get('workerId');
  const month = searchParams.get('month');

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    // If workerId is provided, filter by worker
    if (workerId) {
      whereClause.workerId = workerId;
    }

    // If month is provided, filter by month (YYYY-MM format)
    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const monthStart = new Date(year, monthNum - 1, 1);
      const monthEnd = new Date(year, monthNum, 0);

      // Find contracts that overlap with the given month
      // A contract overlaps if it starts before month ends AND ends after month starts
      whereClause.AND = [
        {
          startDate: {
            lte: monthEnd, // Contract starts before or during the month
          },
        },
        {
          endDate: {
            gte: monthStart, // Contract ends after or during the month
          },
        },
      ];
    }

    const contracts = await prisma.contract.findMany({
      where: whereClause,
      include: {
        client: true,
        worker: true,
        marketer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return new Response(JSON.stringify(contracts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to fetch contracts:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();

  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // التحقق من صلاحية إنشاء عقود
  const canCreate = await hasPermission(session.user.id, 'CREATE_CONTRACTS');
  if (!canCreate) {
    return new Response('Forbidden - ليس لديك صلاحية إنشاء عقود', { status: 403 });
  }

  try {
    const data = await req.json();

    // Validate required fields
    const requiredFields = [
      'workerId',
      'clientId',
      'marketerId',
      'startDate',
      'endDate',
      'packageType',
      'totalAmount',
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return new Response(`Missing required field: ${field}`, { status: 400 });
      }
    }

    // Validate worker is available
    const worker = await prisma.worker.findUnique({
      where: { id: data.workerId },
    });

    if (!worker) {
      return new Response('Worker not found', { status: 404 });
    }

    if (worker.status !== 'AVAILABLE') {
      return new Response('Worker is not available', { status: 400 });
    }


    // توليد رقم عقد متسلسل بصيغة yymmdd####
    const now = new Date();
    const yymmdd = now.getFullYear().toString().slice(2,4) + ('0'+(now.getMonth()+1)).slice(-2) + ('0'+now.getDate()).slice(-2);
    // احصل على آخر رقم تسلسلي لهذا اليوم
    const lastContract = await prisma.contract.findFirst({
      where: {
        contractNumber: {
          startsWith: yymmdd
        }
      },
      orderBy: {
        contractNumber: 'desc'
      }
    });
    let serial = 1;
    if (lastContract && lastContract.contractNumber) {
      const lastSerial = parseInt(lastContract.contractNumber.slice(6));
      serial = lastSerial + 1;
    }
    const contractNumber = `${yymmdd}${('0000'+serial).slice(-4)}`;

    // Start a transaction to create contract and update worker status
    const contract = await prisma.$transaction(async (tx) => {
      // Create the contract
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
      });

      // Update worker status
      await tx.worker.update({
        where: { id: data.workerId },
        data: { status: 'RENTED' },
      });

      return newContract;
    });

    // Log the contract creation
    await createLog(session.user.id, 'CONTRACT_CREATED', `Contract created for worker ID: ${data.workerId}, Client: ${data.clientName}`);

    return new Response(JSON.stringify(contract), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to create contract:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}