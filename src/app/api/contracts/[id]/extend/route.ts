import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { 
      newEndDate, 
      packageType, 
      packageName, 
      totalAmount, 
      notes, 
      additionalAmount 
    } = body;

    // التحقق من وجود العقد والتأكد من أنه نشط
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        client: true,
        worker: true,
      }
    });

    if (!contract) {
      return NextResponse.json({ error: 'العقد غير موجود' }, { status: 404 });
    }

    if (contract.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'لا يمكن تمديد عقد غير نشط' }, { status: 400 });
    }

    // التحقق من صحة التاريخ الجديد
    const newEndDateObj = new Date(newEndDate);
    if (newEndDateObj <= contract.endDate) {
      return NextResponse.json({ 
        error: 'تاريخ النهاية الجديد يجب أن يكون بعد تاريخ النهاية الحالي' 
      }, { status: 400 });
    }

    // تحديث العقد
    const updatedContract = await prisma.contract.update({
      where: { id },
      data: {
        endDate: newEndDateObj,
        packageType: packageType || contract.packageType,
        packageName: packageName || contract.packageName,
        totalAmount: totalAmount,
        notes: notes || contract.notes,
      },
      include: {
        client: true,
        worker: true,
      }
    });

    // تسجيل عملية التمديد في السجل
    await prisma.log.create({
      data: {
        action: 'تمديد العقد',
        message: `تم تمديد العقد للعميل ${contract.client.name} والعاملة ${contract.worker.name} من ${contract.endDate.toLocaleDateString('ar')} إلى ${newEndDateObj.toLocaleDateString('ar')}${additionalAmount > 0 ? ` بمبلغ إضافي ${additionalAmount.toLocaleString('ar-SA')} ريال` : ''}`,
        entity: 'Contract',
        entityId: contract.id,
        userId: session.user.id,
      }
    });

    return NextResponse.json({
      message: 'تم تمديد العقد بنجاح',
      contract: updatedContract
    });

  } catch (error) {
    console.error('خطأ في تمديد العقد:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}