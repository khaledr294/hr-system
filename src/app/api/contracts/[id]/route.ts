import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { createLog } from '@/lib/logger';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  try {
    const { id } = await params;
    const data = await req.json();
    // فقط الحقول المسموح بتعديلها
    const allowedFields = [
      'startDate', 'endDate', 'packageType', 'packageName', 'totalAmount', 'status', 'notes'
    ];
  const updateData: Partial<{ startDate: Date; endDate: Date; packageType: string; packageName: string; totalAmount: number; status: string; notes: string }> = {};
    for (const key of allowedFields) {
      if (key in data) (updateData as Partial<typeof updateData>)[key as keyof typeof updateData] = data[key];
    }
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
    const updated = await prisma.contract.update({
      where: { id },
      data: updateData,
    });
    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to update contract:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  // التحقق من أن المستخدم مدير موارد بشرية
  if (session.user.role !== 'HR_MANAGER') {
    return new Response('Forbidden: Only HR managers can delete contracts', { status: 403 });
  }

  try {
    const { id } = await params;

    // التحقق من وجود العقد
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        worker: true,
      }
    });

    if (!contract) {
      return new Response('Contract not found', { status: 404 });
    }

    // حذف العقد وتحديث حالة العاملة
    await prisma.$transaction(async (tx) => {
      // حذف العقد
      await tx.contract.delete({
        where: { id }
      });

      // تحديث حالة العاملة إلى متاحة
      await tx.worker.update({
        where: { id: contract.workerId },
        data: { status: 'AVAILABLE' }
      });
    });

    // Log the contract deletion
    await createLog(session.user.id, 'CONTRACT_DELETED', `Contract deleted for worker ID: ${contract.workerId}`);

    return new Response('Contract deleted successfully', { status: 200 });
  } catch (error) {
    console.error('Failed to delete contract:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        client: true,
        worker: true,
      },
    });
    if (!contract) {
      return new Response('Contract not found', { status: 404 });
    }
    return new Response(JSON.stringify(contract), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to fetch contract:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}