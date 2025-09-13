import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const session = await getSession();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const data = await req.json();

    // Validate required fields
    const requiredFields = [
      'code',
      'name',
      'nationality',
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return new Response(`Missing required field: ${field}`, { status: 400 });
      }
    }

    // Validate unique code
    const existingWorker = await prisma.worker.findUnique({
      where: { code: data.code },
    });

    if (existingWorker) {
      return new Response('Worker code already exists', { status: 400 });
    }

    // Create worker
    const nationalitySalary = await prisma.nationalitySalary.findFirst({ where: { nationality: data.nationality } });
    const worker = await prisma.worker.create({
      data: {
        ...data,
        nationalitySalaryId: nationalitySalary?.id,
        status: 'AVAILABLE', // Set default status for new workers
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
  const session = await getSession();

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
          { code: { contains: query } },
          { name: { contains: query } },
        ],
      }),
      ...(status && { status }),
    };

    const workers = await prisma.worker.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return new Response(JSON.stringify(workers), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to fetch workers:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}