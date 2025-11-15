import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Permission } from "@prisma/client";
import { withApiAuth } from "@/lib/api-guard";

/**
 * API لإلغاء حجوزات العاملات التي مر عليها أكثر من 3 ساعات
 * يتم استدعاؤها تلقائياً أو يدوياً
 */
type EmptyContext = { params: Promise<Record<string, never>> };

const releaseReservationsHandler = withApiAuth<EmptyContext>(
  { permissions: [Permission.EDIT_WORKERS], auditAction: 'WORKER_RELEASE_RESERVATIONS' },
  async () => {
    try {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

      const result = await prisma.worker.updateMany({
        where: {
          status: "RESERVED",
          reservedAt: {
            lt: threeHoursAgo
          },
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
);

export const POST = releaseReservationsHandler;
export const GET = releaseReservationsHandler;
