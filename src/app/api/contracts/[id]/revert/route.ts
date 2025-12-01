import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

type ContractContext = { params: Promise<{ id: string }> };

export const POST = withApiAuth<ContractContext>(
  { permissions: [Permission.EDIT_CONTRACTS], auditAction: 'CONTRACT_REVERT' },
  async ({ context, session }) => {
    try {
      const { id } = await context.params;
      
      // Only HR managers can revert
      if (session.user.role !== 'HR_MANAGER') {
        return NextResponse.json(
          { error: 'غير مصرح لك بالتراجع عن إكمال العقود' },
          { status: 403 }
        );
      }

      const contract = await prisma.contract.findUnique({
        where: { id },
        include: { client: true, worker: true },
      });

      if (!contract) {
        return NextResponse.json({ error: 'العقد غير موجود' }, { status: 404 });
      }

      if (contract.status !== 'COMPLETED') {
        return NextResponse.json(
          { error: 'يمكن التراجع فقط عن العقود المكتملة' },
          { status: 400 }
        );
      }

      // Revert contract to ACTIVE status and update worker
      const [updatedContract] = await prisma.$transaction([
        prisma.contract.update({
          where: { id },
          data: {
            status: 'ACTIVE',
            delayDays: 0,
            penaltyAmount: 0,
          },
        }),
        prisma.worker.update({
          where: { id: contract.workerId },
          data: { status: 'RENTED' },
        }),
      ]);

      await prisma.log.create({
        data: {
          action: 'CONTRACT_REVERT',
          message: `تم التراجع عن إكمال العقد للعميل ${contract.client.name} والعاملة ${contract.worker.name}`,
          entity: 'Contract',
          entityId: contract.id,
          userId: session.user.id,
        },
      });

      return NextResponse.json({
        message: 'تم التراجع عن إكمال العقد بنجاح',
        contract: updatedContract,
      });
    } catch (error) {
      console.error('خطأ في التراجع عن إكمال العقد:', error);
      return NextResponse.json(
        { error: 'حدث خطأ في الخادم' },
        { status: 500 }
      );
    }
  }
);
