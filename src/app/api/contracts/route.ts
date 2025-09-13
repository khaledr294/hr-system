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
          totalAmount: data.totalAmount,
          status: 'ACTIVE',
        },
      });

      // Update worker status
      await tx.worker.update({
        where: { id: data.workerId },
        data: { status: 'RENTED' },
      });

      return newContract;
    });

    return new Response(JSON.stringify(contract), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to create contract:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}