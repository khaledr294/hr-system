import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { hasPermission } from "@/lib/permissions";

/**
 * API لنقل العقود المنتهية تلقائياً إلى الأرشيف
 */
export async function POST() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // التحقق من صلاحية حذف/أرشفة العقود
    const canArchive = await hasPermission(session.user.id, 'DELETE_CONTRACTS');
    if (!canArchive) {
      return NextResponse.json({ 
        error: "ليس لديك صلاحية أرشفة العقود" 
      }, { status: 403 });
    }

    const now = new Date();

    // البحث عن العقود المنتهية
    const expiredContracts = await prisma.contract.findMany({
      where: {
        endDate: {
          lt: now
        }
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
        message: "لا توجد عقود منتهية لنقلها"
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
        message: "جميع العقود المنتهية موجودة بالأرشيف بالفعل"
      });
    }

    // نقل العقود للأرشيف
    let archivedCount = 0;
    for (const contract of contractsToArchive) {
      try {
        // إنشاء نسخة في الأرشيف
        await prisma.archivedContract.create({
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
        });

        // حذف العقد الأصلي
        await prisma.contract.delete({
          where: { id: contract.id }
        });

        archivedCount++;
      } catch (error) {
        console.error(`Failed to archive contract ${contract.id}:`, error);
      }
    }

    // تسجيل في سجل الأرشفة
    await prisma.archiveLog.create({
      data: {
        id: `archive-expired-${Date.now()}`,
        entityType: "CONTRACT",
        entityId: "BULK",
        action: "ARCHIVE_EXPIRED",
        performedBy: session.user.id,
        reason: "انتهاء صلاحية العقود",
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

export async function GET() {
  return POST(); // يمكن استدعاؤها عبر GET أيضاً
}
