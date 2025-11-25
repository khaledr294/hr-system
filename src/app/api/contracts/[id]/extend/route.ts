import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

type ContractContext = { params: Promise<{ id: string }> };

export const POST = withApiAuth<ContractContext>(
  { permissions: [Permission.EDIT_CONTRACTS], auditAction: 'CONTRACT_EXTEND' },
  async ({ req, context, session }) => {
    try {
      const { id } = await context.params;
      const body = await req.json();
      const { newEndDate, packageType, packageName, totalAmount, notes, additionalAmount = 0 } = body;

      const contract = await prisma.contract.findUnique({
        where: { id },
        include: { client: true, worker: true },
      });

      if (!contract) {
        return NextResponse.json({ error: 'العقد غير موجود' }, { status: 404 });
      }

      if (contract.status !== 'ACTIVE') {
        return NextResponse.json({ error: 'لا يمكن تمديد عقد غير نشط' }, { status: 400 });
      }

      const newEndDateObj = new Date(newEndDate);
      if (newEndDateObj <= contract.endDate) {
        return NextResponse.json(
          { error: 'تاريخ النهاية الجديد يجب أن يكون بعد تاريخ النهاية الحالي' },
          { status: 400 }
        );
      }

      const updatedContract = await prisma.contract.update({
        where: { id },
        data: {
          endDate: newEndDateObj,
          packageType: packageType || contract.packageType,
          packageName: packageName || contract.packageName,
          totalAmount: totalAmount !== undefined ? totalAmount : contract.totalAmount,
          notes: notes || contract.notes,
        },
        include: { client: true, worker: true },
      });

      await prisma.log.create({
        data: {
          action: 'CONTRACT_EXTEND',
          message: `تم تمديد العقد للعميل ${contract.client.name} والعاملة ${contract.worker.name} من ${contract.endDate.toLocaleDateString('ar')} إلى ${newEndDateObj.toLocaleDateString('ar')}${
            additionalAmount > 0 ? ` بمبلغ إضافي ${additionalAmount.toLocaleString('ar-SA')} ريال` : ''
          }`,
          entity: 'Contract',
          entityId: contract.id,
          userId: session.user.id,
        },
      });

      return NextResponse.json({
        message: 'تم تمديد العقد بنجاح',
        contract: updatedContract,
      });
    } catch (error) {
      console.error('خطأ في تمديد العقد:', error);
      return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
    }
  }
);