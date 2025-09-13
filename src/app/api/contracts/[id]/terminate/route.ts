import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Get contract to find workerId
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      select: { id: true, workerId: true }
    });
    if (!contract) {
      return new Response('Contract not found', { status: 404 });
    }
    // Mark contract as terminated and update worker status in a transaction
    const [updatedContract] = await prisma.$transaction([
      prisma.contract.update({
        where: { id: contract.id },
        data: { status: 'COMPLETED', endDate: new Date() },
      }),
      prisma.worker.update({
        where: { id: contract.workerId },
        data: { status: 'AVAILABLE' },
      })
    ]);
    return new Response(JSON.stringify(updatedContract), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to terminate contract:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
