import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createLog } from '@/lib/logger';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

type WorkerStatusContext = { params: Promise<{ id: string }> };

export const PATCH = withApiAuth<WorkerStatusContext>(
  { permissions: [Permission.EDIT_WORKERS], auditAction: 'UPDATE_WORKER_STATUS' },
  async ({ req, context, session }) => {
    const { id } = await context.params;
    const { status } = await req.json();

    const allowedStatuses = ['AVAILABLE', 'CONTRACTED', 'RESERVED', 'SICK', 'RUNAWAY'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if ((status === 'SICK' || status === 'RUNAWAY') && session.user.role !== 'HR_MANAGER') {
      return NextResponse.json(
        { error: 'Only HR Manager can set worker status to SICK or RUNAWAY' },
        { status: 403 }
      );
    }

    if (status === 'CONTRACTED' || status === 'RESERVED') {
      return NextResponse.json(
        { error: 'This status is managed automatically by the system' },
        { status: 400 }
      );
    }

    try {
      const workerRecord = await prisma.worker.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
        },
      });

      if (!workerRecord) {
        return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
      }

      if (status === 'AVAILABLE') {
        const blockingContract = await prisma.contract.findFirst({
          where: {
            workerId: id,
            status: {
              notIn: ['COMPLETED', 'CANCELLED'],
            },
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            status: true,
            contractNumber: true,
          },
        });

        if (blockingContract) {
          const contractLabel = blockingContract.contractNumber || blockingContract.id;
          return NextResponse.json(
            {
              error: `لا يمكن تحويل حالة العاملة إلى متاحة لوجود عقد (${contractLabel}) حالته ${blockingContract.status}. قم بإنهاء أو إلغاء العقد أولاً.`,
            },
            { status: 400 }
          );
        }
      }

      const worker = await prisma.worker.update({
        where: { id },
        data: { status },
      });

      await createLog(
        session.user.id,
        'WORKER_STATUS_CHANGED',
        `تم تغيير حالة العاملة ${worker.name} إلى ${status}`
      );

      return NextResponse.json(worker);
    } catch (error) {
      console.error('Failed to update worker status:', error);
      return NextResponse.json({ error: 'Failed to update worker status' }, { status: 500 });
    }
  }
);
