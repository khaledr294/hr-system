import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { hasPermission } from '@/lib/permissions';

// Schema لبيانات التسليم
export interface PayrollDeliveryRecord {
  workerId: string;
  workerCode: number;
  workerName: string;
  nationality: string;
  totalSalary: number;
  deliveredAmount: number;
  advanceAmount: number;
  remainingAmount: number;
  deliveryStatus: 'pending' | 'partial' | 'completed';
  deliveryDate?: string;
  notes?: string;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // التحقق من الصلاحيات
    const canView = await hasPermission(session.user.id, 'VIEW_REPORTS');
    if (!canView) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');

    // هنا يمكن جلب البيانات المحفوظة من قاعدة البيانات
    // حالياً سنرجع بيانات فارغة
    
    return NextResponse.json({
      month,
      deliveries: [],
      message: 'Payroll delivery data retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching payroll delivery:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // التحقق من الصلاحيات
    const canCreate = await hasPermission(session.user.id, 'CREATE_WORKERS');
    if (!canCreate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { month, deliveries } = body as {
      month: string;
      deliveries: PayrollDeliveryRecord[];
    };

    // التحقق من صحة البيانات
    if (!month || !deliveries || !Array.isArray(deliveries)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // حفظ البيانات في Log للمراجعة
    for (const delivery of deliveries) {
      await prisma.log.create({
        data: {
          userId: session.user.id,
          action: 'PAYROLL_DELIVERY',
          entity: 'WORKER',
          entityId: delivery.workerId,
          message: JSON.stringify({
            month,
            workerCode: delivery.workerCode,
            workerName: delivery.workerName,
            totalSalary: delivery.totalSalary,
            deliveredAmount: delivery.deliveredAmount,
            advanceAmount: delivery.advanceAmount,
            remainingAmount: delivery.remainingAmount,
            deliveryStatus: delivery.deliveryStatus,
            deliveryDate: delivery.deliveryDate,
            notes: delivery.notes,
          }),
        },
      });
    }

    // يمكن إضافة جدول منفصل لتخزين بيانات التسليم
    // مثل: PayrollDelivery model في schema.prisma

    return NextResponse.json({
      success: true,
      message: 'Payroll delivery data saved successfully',
      count: deliveries.length,
    });
  } catch (error) {
    console.error('Error saving payroll delivery:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
