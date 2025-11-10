import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { hasPermission } from "@/lib/permissions";

/**
 * API لإلغاء حجوزات العاملات التي مر عليها أكثر من 3 ساعات
 * يتم استدعاؤها تلقائياً أو يدوياً
 */
export async function POST() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // التحقق من صلاحية تعديل العمال
    const canEdit = await hasPermission(session.user.id, 'EDIT_WORKERS');
    if (!canEdit) {
      return NextResponse.json({ 
        error: "ليس لديك صلاحية إلغاء حجوزات العمال" 
      }, { status: 403 });
    }
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

    // البحث عن العاملات المحجوزات لأكثر من 3 ساعات بدون عقد
    const result = await prisma.worker.updateMany({
      where: {
        status: "RESERVED",
        reservedAt: {
          lt: threeHoursAgo
        },
        // التأكد من عدم وجود عقود نشطة
        contracts: {
          none: {
            endDate: {
              gte: new Date()
            }
          }
        }
      },
      data: {
        status: "AVAILABLE",
        reservedAt: null,
        reservedBy: null,
        reservationNotes: null
      }
    });

    return NextResponse.json({
      success: true,
      releasedCount: result.count,
      message: `تم إلغاء حجز ${result.count} عاملة`
    });
  } catch (error) {
    console.error("Error releasing reservations:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إلغاء الحجوزات" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST(); // يمكن استدعاؤها عبر GET أيضاً
}
