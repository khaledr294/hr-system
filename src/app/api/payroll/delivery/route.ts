import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

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

type EmptyContext = { params: Promise<Record<string, never>> };

export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.VIEW_PAYROLL_DELIVERY] },
  async ({ req }) => {
    try {
      const { searchParams } = new URL(req.url);
      const month = searchParams.get('month');

      return NextResponse.json({
        month,
        deliveries: [],
        message: 'Payroll delivery data retrieved successfully',
      });
    } catch (error) {
      console.error('Error fetching payroll delivery:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);

export const POST = withApiAuth<EmptyContext>(
  { permissions: [Permission.VIEW_PAYROLL_DELIVERY], auditAction: 'PAYROLL_DELIVERY_SAVE' },
  async ({ req, session }) => {
    try {
      const body = await req.json();
      const { month, deliveries } = body as { month: string; deliveries: PayrollDeliveryRecord[] };

      if (!month || !deliveries || !Array.isArray(deliveries)) {
        return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
      }

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

      return NextResponse.json({
        success: true,
        message: 'Payroll delivery data saved successfully',
        count: deliveries.length,
      });
    } catch (error) {
      console.error('Error saving payroll delivery:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);
