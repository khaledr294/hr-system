import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  try {
    const params = await context.params;
    
    // Get contract with full details
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        worker: true,
      }
    });
    if (!contract) {
      return new Response('Contract not found', { status: 404 });
    }

    // حساب الغرامة إذا كان هناك تأخير
    const today = new Date();
    const endDate = new Date(contract.endDate);
    
    let delayDays = 0;
    let penaltyAmount = 0;
    
    if (today > endDate) {
      const timeDiff = today.getTime() - endDate.getTime();
      delayDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      const penaltyRate = contract.penaltyRate || 120;
      penaltyAmount = delayDays * penaltyRate;
    }

    // حساب المبلغ الإجمالي الجديد (المبلغ الأصلي + الغرامة)
    const totalAmountWithPenalty = contract.totalAmount + penaltyAmount;

    // Mark contract as terminated and update worker status in a transaction
    const [updatedContract] = await prisma.$transaction([
      prisma.contract.update({
        where: { id: contract.id },
        data: { 
          status: 'COMPLETED', 
          endDate: today,
          delayDays: delayDays,
          penaltyAmount: penaltyAmount,
          totalAmount: totalAmountWithPenalty, // تحديث المبلغ الإجمالي ليشمل الغرامة
        },
      }),
      prisma.worker.update({
        where: { id: contract.workerId },
        data: { status: 'AVAILABLE' },
      })
    ]);
    
    return new Response(JSON.stringify({
      ...updatedContract,
      delayDays,
      penaltyAmount,
      totalAmountWithPenalty,
      message: delayDays > 0 
        ? `تم إنهاء العقد مع غرامة تأخير: ${delayDays} أيام × ${contract.penaltyRate || 120} ريال = ${penaltyAmount} ريال`
        : 'تم إنهاء العقد دون غرامة تأخير'
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to terminate contract:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
