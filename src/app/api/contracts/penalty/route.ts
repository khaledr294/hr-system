import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { contractId, returnDate } = await request.json();

    if (!contractId || !returnDate) {
      return NextResponse.json({ error: 'معرف العقد وتاريخ الإرجاع مطلوبان' }, { status: 400 });
    }

    // جلب العقد
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        client: true,
        worker: true,
      }
    });

    if (!contract) {
      return NextResponse.json({ error: 'العقد غير موجود' }, { status: 404 });
    }

    // حساب أيام التأخير
    const endDate = new Date(contract.endDate);
    const actualReturnDate = new Date(returnDate);
    
    let delayDays = 0;
    let penaltyAmount = 0;

    if (actualReturnDate > endDate) {
      // حساب الفرق بالأيام
      const timeDiff = actualReturnDate.getTime() - endDate.getTime();
      delayDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      // حساب الغرامة (120 ريال لكل يوم)
      const penaltyRate = contract.penaltyRate || 120;
      penaltyAmount = delayDays * penaltyRate;
    }

    // تحديث العقد بحساب الغرامة وإضافتها للمبلغ الإجمالي
    const updatedContract = await prisma.contract.update({
      where: { id: contractId },
      data: {
        delayDays,
        penaltyAmount,
        totalAmount: contract.totalAmount + penaltyAmount, // إضافة الغرامة للمبلغ الإجمالي
        status: 'COMPLETED', // تحديث حالة العقد إلى منتهي
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({
      contract: updatedContract,
      delayDays,
      penaltyAmount,
      totalAmount: updatedContract.totalAmount,
      message: delayDays > 0 
        ? `تم حساب غرامة التأخير: ${delayDays} أيام × ${contract.penaltyRate || 120} ريال = ${penaltyAmount} ريال. المبلغ الإجمالي الجديد: ${updatedContract.totalAmount.toLocaleString()} ريال`
        : 'تم إنهاء العقد دون غرامة تأخير'
    });

  } catch (error) {
    console.error('خطأ في حساب غرامة التأخير:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حساب غرامة التأخير' },
      { status: 500 }
    );
  }
}

// جلب تفاصيل غرامة العقد
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contractId');

    if (!contractId) {
      return NextResponse.json({ error: 'معرف العقد مطلوب' }, { status: 400 });
    }

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        client: true,
        worker: true,
      }
    });

    if (!contract) {
      return NextResponse.json({ error: 'العقد غير موجود' }, { status: 404 });
    }

    // حساب الغرامة المحتملة إذا تم الإرجاع اليوم
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
      penaltyRate: contract.penaltyRate || 120
    });

  } catch (error) {
    console.error('خطأ في جلب تفاصيل الغرامة:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب تفاصيل الغرامة' },
      { status: 500 }
    );
  }
}