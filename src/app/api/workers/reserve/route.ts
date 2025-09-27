import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createLog } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { workerId, reservationNotes } = await request.json();

    if (!workerId) {
      return NextResponse.json({ error: 'معرف العاملة مطلوب' }, { status: 400 });
    }

    // التحقق من وجود العاملة وحالتها
    const worker = await prisma.worker.findUnique({
      where: { id: workerId }
    });

    if (!worker) {
      return NextResponse.json({ error: 'العاملة غير موجودة' }, { status: 404 });
    }

    if (worker.status !== 'AVAILABLE') {
      return NextResponse.json({ error: 'العاملة غير متاحة للحجز' }, { status: 400 });
    }

    // حجز العاملة
    const updatedWorker = await prisma.worker.update({
      where: { id: workerId },
      data: {
        status: 'RESERVED',
        reservationNotes: reservationNotes || null,
        reservedAt: new Date(),
        reservedBy: session.user.id || session.user.email || 'Unknown',
      }
    });

    // تسجيل العملية في السجل
    await createLog(
      'حجز عاملة',
      `تم حجز العاملة ${worker.name} (كود: ${worker.code})`,
      'Worker',
      workerId
    );

    return NextResponse.json({ 
      message: 'تم حجز العاملة بنجاح',
      worker: updatedWorker 
    });

  } catch (error) {
    console.error('خطأ في حجز العاملة:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حجز العاملة' },
      { status: 500 }
    );
  }
}

// إلغاء الحجز
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get('workerId');

    if (!workerId) {
      return NextResponse.json({ error: 'معرف العاملة مطلوب' }, { status: 400 });
    }

    // التحقق من وجود العاملة
    const worker = await prisma.worker.findUnique({
      where: { id: workerId }
    });

    if (!worker) {
      return NextResponse.json({ error: 'العاملة غير موجودة' }, { status: 404 });
    }

    if (worker.status !== 'RESERVED') {
      return NextResponse.json({ error: 'العاملة غير محجوزة' }, { status: 400 });
    }

    // إلغاء حجز العاملة
    const updatedWorker = await prisma.worker.update({
      where: { id: workerId },
      data: {
        status: 'AVAILABLE',
        reservationNotes: null,
        reservedAt: null,
        reservedBy: null,
      }
    });

    // تسجيل العملية في السجل
    await createLog(
      'إلغاء حجز عاملة',
      `تم إلغاء حجز العاملة ${worker.name} (كود: ${worker.code})`,
      'Worker',
      workerId
    );

    return NextResponse.json({ 
      message: 'تم إلغاء حجز العاملة بنجاح',
      worker: updatedWorker 
    });

  } catch (error) {
    console.error('خطأ في إلغاء حجز العاملة:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إلغاء حجز العاملة' },
      { status: 500 }
    );
  }
}