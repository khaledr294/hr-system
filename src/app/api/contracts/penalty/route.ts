import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

type EmptyContext = { params: Promise<Record<string, never>> };

export const POST = withApiAuth<EmptyContext>(
  { permissions: [Permission.EDIT_CONTRACTS], auditAction: 'CONTRACT_PENALTY_APPLY' },
  async ({ req }) => {
    try {
      const { contractId, returnDate } = await req.json();

      if (!contractId || !returnDate) {
        return NextResponse.json({ error: 'معرف العقد وتاريخ الإرجاع مطلوبان' }, { status: 400 });
      }

      const contract = await prisma.contract.findUnique({
        where: { id: contractId },
        include: { client: true, worker: true },
      });

      if (!contract) {
        return NextResponse.json({ error: 'العقد غير موجود' }, { status: 404 });
      }

      const endDate = new Date(contract.endDate);
      const actualReturnDate = new Date(returnDate);

      let delayDays = 0;
      let penaltyAmount = 0;

      if (actualReturnDate > endDate) {
        const timeDiff = actualReturnDate.getTime() - endDate.getTime();
        delayDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const penaltyRate = contract.penaltyRate || 120;
        penaltyAmount = delayDays * penaltyRate;
      }

      const updatedContract = await prisma.contract.update({
        where: { id: contractId },
        data: {
          delayDays,
          penaltyAmount,
          totalAmount: contract.totalAmount + penaltyAmount,
          status: 'COMPLETED',
          endDate: actualReturnDate,
          updatedAt: new Date(),
        },
      });

      await prisma.worker.update({
        where: { id: contract.workerId },
        data: { status: 'AVAILABLE', reservedAt: null, reservedBy: null },
      });

      return NextResponse.json({
        contract: updatedContract,
        delayDays,
        penaltyAmount,
        totalAmount: updatedContract.totalAmount,
        message:
          delayDays > 0
            ? `تم حساب غرامة التأخير: ${delayDays} أيام × ${contract.penaltyRate || 120} ريال = ${penaltyAmount} ريال. المبلغ الإجمالي الجديد: ${updatedContract.totalAmount.toLocaleString()} ريال. تم تحديث حالة العاملة إلى "متاحة".`
            : 'تم إنهاء العقد دون غرامة تأخير. تم تحديث حالة العاملة إلى "متاحة".',
      });
    } catch (error) {
      console.error('خطأ في حساب غرامة التأخير:', error);
      return NextResponse.json({ error: 'حدث خطأ في حساب غرامة التأخير' }, { status: 500 });
    }
  }
);

export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.VIEW_CONTRACTS] },
  async ({ req }) => {
    try {
      const { searchParams } = new URL(req.url);
      const contractId = searchParams.get('contractId');

      if (!contractId) {
        return NextResponse.json({ error: 'معرف العقد مطلوب' }, { status: 400 });
      }

      const contract = await prisma.contract.findUnique({
        where: { id: contractId },
        include: { client: true, worker: true },
      });

      if (!contract) {
        return NextResponse.json({ error: 'العقد غير موجود' }, { status: 404 });
      }

      const today = new Date();
      const endDate = new Date(contract.endDate);
      let potentialDelayDays = 0;
      let potentialPenalty = 0;

      if (today > endDate) {
        const timeDiff = today.getTime() - endDate.getTime();
        potentialDelayDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        potentialPenalty = potentialDelayDays * (contract.penaltyRate || 120);
      }

      return NextResponse.json({
        contract,
        currentDelayDays: contract.delayDays || 0,
        currentPenalty: contract.penaltyAmount || 0,
        potentialDelayDays,
        potentialPenalty,
        penaltyRate: contract.penaltyRate || 120,
      });
    } catch (error) {
      console.error('خطأ في جلب تفاصيل الغرامة:', error);
      return NextResponse.json({ error: 'حدث خطأ في جلب تفاصيل الغرامة' }, { status: 500 });
    }
  }
);
