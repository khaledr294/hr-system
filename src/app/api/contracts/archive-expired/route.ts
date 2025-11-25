import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Permission } from "@prisma/client";
import { withApiAuth } from "@/lib/api-guard";
import type { Session } from "next-auth";

type EmptyContext = { params: Promise<Record<string, never>> };

async function archiveExpiredContracts(session: Session) {
  try {

    const now = new Date();

    // البحث عن العقود المكتملة
    const expiredContracts = await prisma.contract.findMany({
      where: {
        status: 'COMPLETED'
      },
      include: {
        worker: true,
        client: true
      }
    });

    if (expiredContracts.length === 0) {
      return NextResponse.json({
        success: true,
        archivedCount: 0,
        message: "لا توجد عقود مكتملة لنقلها"
      });
    }

    // التحقق من العقود التي لم تُأرشف بعد
    const existingArchived = await prisma.archivedContract.findMany({
      where: {
        originalId: {
          in: expiredContracts.map(c => c.id)
        }
      },
      select: {
        originalId: true
      }
    });

    const existingIds = new Set(existingArchived.map(a => a.originalId));
    const contractsToArchive = expiredContracts.filter(c => !existingIds.has(c.id));

    if (contractsToArchive.length === 0) {
      return NextResponse.json({
        success: true,
        archivedCount: 0,
        message: "جميع العقود المكتملة موجودة بالأرشيف بالفعل"
      });
    }

    // نقل العقود للأرشيف مع تحديث حالة العاملات
    let archivedCount = 0;
    for (const contract of contractsToArchive) {
      try {
        // التحقق من حالة العاملة - يجب أن تكون متاحة للأرشفة
        if (contract.worker.status === 'RESERVED' || contract.worker.status === 'CONTRACTED') {
          console.warn(`⚠️ تخطي أرشفة العقد ${contract.id} - العاملة ${contract.worker.name} في حالة نشطة: ${contract.worker.status}`);
          continue;
        }

        // إنشاء نسخة في الأرشيف وحذف العقد الأصلي في معاملة واحدة
        await prisma.$transaction([
          prisma.archivedContract.create({
            data: {
              id: contract.id,
              originalId: contract.id,
              workerId: contract.workerId,
              workerName: contract.worker.name,
              workerCode: contract.worker.code,
              clientId: contract.clientId,
              clientName: contract.client.name,
              startDate: contract.startDate,
              endDate: contract.endDate,
              packageType: contract.packageType,
              packageName: contract.packageName,
              totalAmount: contract.totalAmount,
              status: contract.status,
              contractNumber: contract.contractNumber,
              notes: contract.notes,
              marketerId: contract.marketerId,
              archivedAt: now,
              archivedBy: session.user.id,
              archiveReason: "EXPIRED"
            }
          }),
          // حذف العقد الأصلي
          prisma.contract.delete({
            where: { id: contract.id }
          })
        ]);

        archivedCount++;
      } catch (error) {
        console.error(`❌ فشل أرشفة العقد ${contract.id}:`, error);
      }
    }

    // تسجيل في سجل الأرشفة
    await prisma.archiveLog.create({
      data: {
        id: `archive-completed-${Date.now()}`,
        entityType: "CONTRACT",
        entityId: "BULK",
        action: "ARCHIVE_COMPLETED",
        performedBy: session.user.id,
        reason: "أرشفة العقود المكتملة",
        metadata: JSON.stringify({ count: archivedCount })
      }
    });

    return NextResponse.json({
      success: true,
      archivedCount,
      message: `تم نقل ${archivedCount} عقد إلى الأرشيف`
    });
  } catch (error: unknown) {
    console.error("Error archiving expired contracts:", error);
    const message = error instanceof Error ? error.message : "حدث خطأ أثناء نقل العقود";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

/**
 * API لنقل العقود المنتهية تلقائياً إلى الأرشيف
 */
export const POST = withApiAuth<EmptyContext>(
  { permissions: [Permission.MANAGE_ARCHIVE], auditAction: "ARCHIVE_CONTRACTS" },
  async ({ session }) => archiveExpiredContracts(session)
);

export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.MANAGE_ARCHIVE], auditAction: "ARCHIVE_CONTRACTS" },
  async ({ session }) => archiveExpiredContracts(session)
);
