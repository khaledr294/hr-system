import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';

/**
 * API لتصحيح بيانات العاملات والعقود المؤرشفة
 * يستخدم لحل المشاكل الموجودة من الأرشفة القديمة
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // التحقق من صلاحية المدير العام فقط
    if (session.user.role !== 'ADMIN' && session.user.role !== 'GENERAL_MANAGER') {
      return NextResponse.json({ 
        error: 'هذه العملية متاحة فقط للمدير العام' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { action, workerId, archivedContractId } = body;

    // تصحيح حالة عاملة لها عقد مؤرشف
    if (action === 'fix-worker-status') {
      if (!workerId) {
        return NextResponse.json({ error: 'معرف العاملة مطلوب' }, { status: 400 });
      }

      const worker = await prisma.worker.findUnique({
        where: { id: workerId },
        include: {
          contracts: {
            where: { status: 'ACTIVE' }
          }
        }
      });

      if (!worker) {
        return NextResponse.json({ error: 'العاملة غير موجودة' }, { status: 404 });
      }

      // إذا لم يكن لديها عقود نشطة، تحديث حالتها إلى متاحة
      if (worker.contracts.length === 0 && worker.status !== 'AVAILABLE') {
        await prisma.worker.update({
          where: { id: workerId },
          data: { status: 'AVAILABLE' }
        });

        return NextResponse.json({
          success: true,
          message: `تم تحديث حالة العاملة ${worker.name} إلى "متاحة"`,
          previousStatus: worker.status,
          newStatus: 'AVAILABLE'
        });
      }

      return NextResponse.json({
        success: true,
        message: 'العاملة في الحالة الصحيحة بالفعل',
        status: worker.status,
        activeContracts: worker.contracts.length
      });
    }

    // حذف عقد مؤرشف مكرر (إذا تم أرشفته بالخطأ)
    if (action === 'delete-archived-duplicate') {
      if (!archivedContractId) {
        return NextResponse.json({ 
          error: 'معرف العقد المؤرشف مطلوب' 
        }, { status: 400 });
      }

      const archivedContract = await prisma.archivedContract.findUnique({
        where: { id: archivedContractId }
      });

      if (!archivedContract) {
        return NextResponse.json({ 
          error: 'العقد المؤرشف غير موجود' 
        }, { status: 404 });
      }

      // التحقق من وجود نفس العقد في النظام النشط
      const activeContract = await prisma.contract.findUnique({
        where: { id: archivedContract.originalId }
      });

      if (activeContract) {
        // إذا كان العقد موجود في النظام النشط، حذف النسخة المؤرشفة
        await prisma.archivedContract.delete({
          where: { id: archivedContractId }
        });

        return NextResponse.json({
          success: true,
          message: 'تم حذف العقد المؤرشف المكرر بنجاح',
          archivedContract: archivedContract.contractNumber,
          reason: 'العقد موجود في النظام النشط'
        });
      }

      return NextResponse.json({
        success: false,
        message: 'العقد غير مكرر - لا يوجد في النظام النشط',
        canRestore: true
      });
    }

    // مسح كل العقود المكررة في الأرشيف
    if (action === 'cleanup-duplicate-archives') {
      const archivedContracts = await prisma.archivedContract.findMany({
        select: {
          id: true,
          originalId: true,
          contractNumber: true,
          workerName: true
        }
      });

      const duplicates: string[] = [];

      for (const archived of archivedContracts) {
        const activeExists = await prisma.contract.findUnique({
          where: { id: archived.originalId }
        });

        if (activeExists) {
          duplicates.push(archived.id);
        }
      }

      if (duplicates.length > 0) {
        await prisma.archivedContract.deleteMany({
          where: {
            id: { in: duplicates }
          }
        });
      }

      return NextResponse.json({
        success: true,
        message: `تم تنظيف ${duplicates.length} عقد مؤرشف مكرر`,
        cleanedCount: duplicates.length
      });
    }

    return NextResponse.json({ 
      error: 'إجراء غير معروف' 
    }, { status: 400 });

  } catch (error) {
    console.error('خطأ في تصحيح البيانات:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'فشل في تنفيذ العملية' },
      { status: 500 }
    );
  }
}
