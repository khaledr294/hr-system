import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createLog } from '@/lib/logger';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

type ContractContext = { params: Promise<{ id: string }> };

export const PATCH = withApiAuth<ContractContext>(
  { permissions: [Permission.EDIT_CONTRACTS], auditAction: 'CONTRACT_UPDATE' },
  async ({ req, context }) => {
    try {
      const { id } = await context.params;
      const data = await req.json();
      const allowedFields = [
        'startDate',
        'endDate',
        'packageType',
        'packageName',
        'totalAmount',
        'status',
        'notes',
      ];

      const updateData: Partial<{ startDate: Date; endDate: Date; packageType: string; packageName: string; totalAmount: number; status: string; notes: string }> = {};

      for (const key of allowedFields) {
        if (key in data) {
          (updateData as Record<string, unknown>)[key] = data[key];
        }
      }

      if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
      if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

      const updated = await prisma.contract.update({ where: { id }, data: updateData });
      return NextResponse.json(updated);
    } catch (error) {
      console.error('Failed to update contract:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);

export const DELETE = withApiAuth<ContractContext>(
  { permissions: [Permission.DELETE_CONTRACTS], auditAction: 'CONTRACT_DELETE' },
  async ({ context, session }) => {
    try {
      const { id } = await context.params;
      const contract = await prisma.contract.findUnique({
        where: { id },
        include: { worker: true },
      });

      if (!contract) {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.contract.delete({ where: { id } });
        await tx.worker.update({
          where: { id: contract.workerId },
          data: { status: 'AVAILABLE' },
        });
      });

      await createLog(session.user.id, 'CONTRACT_DELETED', `تم حذف عقد العاملة: ${contract.worker.name}`);

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Failed to delete contract:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);

export const GET = withApiAuth<ContractContext>(
  { permissions: [Permission.VIEW_CONTRACTS] },
  async ({ context }) => {
    try {
      const { id } = await context.params;
      const contract = await prisma.contract.findUnique({
        where: { id },
        include: { client: true, worker: true },
      });

      if (!contract) {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
      }

      return NextResponse.json(contract);
    } catch (error) {
      console.error('Failed to fetch contract:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);