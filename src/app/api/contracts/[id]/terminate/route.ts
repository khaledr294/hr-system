import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

type ContractContext = { params: Promise<{ id: string }> };

export const POST = withApiAuth<ContractContext>(
  { permissions: [Permission.EDIT_CONTRACTS], auditAction: 'CONTRACT_TERMINATE' },
  async ({ context }) => {
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
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
      }

    const today = new Date();
    const startDate = new Date(contract.startDate);
    const originalEndDate = new Date(contract.endDate);
    
    // حساب الأيام الفعلية المستهلكة
    const actualDaysUsed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    
    // حساب إجمالي أيام العقد الأصلية
    const originalTotalDays = Math.ceil((originalEndDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    
    // حساب القيمة الجديدة للعقد بناءً على الأيام المستهلكة
    let newTotalAmount = contract.totalAmount;
    
    // إذا تم إنهاء العقد مبكراً (قبل موعده)
    if (today < originalEndDate) {
      // حساب القيمة اليومية من المبلغ الأصلي
      const dailyRate = contract.totalAmount / originalTotalDays;
      // القيمة الجديدة = القيمة اليومية × الأيام المستهلكة
      newTotalAmount = Math.round(dailyRate * actualDaysUsed);
    }
    
    // حساب الغرامة إذا كان هناك تأخير (بعد انتهاء العقد)
    let delayDays = 0;
    let penaltyAmount = 0;
    
    if (today > originalEndDate) {
      delayDays = Math.ceil((today.getTime() - originalEndDate.getTime()) / (1000 * 3600 * 24));
      const penaltyRate = contract.penaltyRate || 120;
      penaltyAmount = delayDays * penaltyRate;
      // إضافة الغرامة للقيمة الأصلية
      newTotalAmount = contract.totalAmount + penaltyAmount;
    }

    // Mark contract as terminated and update worker status in a transaction
      const [updatedContract] = await prisma.$transaction([
      prisma.contract.update({
        where: { id: contract.id },
        data: { 
          status: 'COMPLETED', 
          endDate: today,
          delayDays: delayDays,
          penaltyAmount: penaltyAmount,
          totalAmount: newTotalAmount,
        },
      }),
      prisma.worker.update({
        where: { id: contract.workerId },
        data: { status: 'AVAILABLE' },
      })
    ]);
    
      return NextResponse.json({
        ...updatedContract,
        actualDaysUsed,
        originalTotalDays,
        delayDays,
        penaltyAmount,
        newTotalAmount,
        message:
          today < originalEndDate
            ? `تم إنهاء العقد مبكراً. الأيام المستهلكة: ${actualDaysUsed} من ${originalTotalDays} يوم. القيمة المحدثة: ${newTotalAmount} ريال`
            : delayDays > 0
            ? `تم إنهاء العقد مع غرامة تأخير: ${delayDays} أيام × ${contract.penaltyRate || 120} ريال = ${penaltyAmount} ريال. القيمة النهائية: ${newTotalAmount} ريال`
            : `تم إنهاء العقد في موعده. القيمة: ${newTotalAmount} ريال`,
      });
    } catch (error) {
      console.error('Failed to terminate contract:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);
