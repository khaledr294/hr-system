import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

type ContractContext = { params: Promise<{ id: string }> };

export const POST = withApiAuth<ContractContext>(
  { permissions: [Permission.EDIT_CONTRACTS], auditAction: 'CONTRACT_EXTEND' },
  async ({ req, context, session }) => {
    console.log('=== CONTRACT EXTEND HANDLER STARTED ===');
    console.log('User:', session.user.email, session.user.id);
    
    try {
      const { id } = await context.params;
      console.log('Contract ID:', id);
      
      let body;
      try {
        body = await req.json();
        console.log('Successfully parsed JSON body:', JSON.stringify(body, null, 2));
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError);
        console.error('Error message:', jsonError instanceof Error ? jsonError.message : String(jsonError));
        return NextResponse.json({ 
          error: 'حدث خطأ في الخادم',
          details: 'فشل في قراءة البيانات المرسلة. يرجى المحاولة مرة أخرى'
        }, { status: 400 });
      }
      
      const { newEndDate, packageType, packageName, totalAmount, notes, additionalAmount = 0 } = body;
      console.log('Extracted fields:', { newEndDate, packageType, packageName, totalAmount, notes, additionalAmount });

      const contract = await prisma.contract.findUnique({
        where: { id },
        include: { client: true, worker: true },
      });

      if (!contract) {
        console.log('Contract not found');
        return NextResponse.json({ error: 'العقد غير موجود' }, { status: 404 });
      }

      console.log('Contract found:', contract.id, 'Status:', contract.status);

      if (contract.status !== 'ACTIVE') {
        console.log('Contract is not active');
        return NextResponse.json({ error: 'لا يمكن تمديد عقد غير نشط' }, { status: 400 });
      }

      const newEndDateObj = new Date(newEndDate);
      console.log('New end date:', newEndDateObj, 'Current end date:', contract.endDate);
      
      if (newEndDateObj <= contract.endDate) {
        console.log('New end date is not after current end date');
        return NextResponse.json(
          { error: 'تاريخ النهاية الجديد يجب أن يكون بعد تاريخ النهاية الحالي' },
          { status: 400 }
        );
      }

      console.log('Updating contract...');
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

      console.log('Contract updated successfully');

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

      console.log('Log created, returning success');
      return NextResponse.json({
        message: 'تم تمديد العقد بنجاح',
        contract: updatedContract,
      });
    } catch (error) {
      console.error('=== MAIN ERROR IN CONTRACT EXTENSION ===');
      console.error('Error type:', typeof error);
      console.error('Error:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return NextResponse.json({ 
        error: 'حدث خطأ في الخادم',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  }
);