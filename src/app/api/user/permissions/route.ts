import { NextResponse } from "next/server";
import { withApiAuth } from "@/lib/api-guard";

type EmptyContext = { params: Promise<Record<string, never>> };

// GET: استرجاع صلاحيات المستخدم الحالي
export const GET = withApiAuth<EmptyContext>(
  {},
  async ({ session }) => {
    try {
      return NextResponse.json({
        permissions: session.user.permissions ?? [],
        role: session.user.role,
        roleLabel: session.user.roleLabel,
        jobTitleId: session.user.jobTitleId,
      });
    } catch (error: unknown) {
      console.error("Error fetching user permissions:", error);
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء استرجاع الصلاحيات";
      const status =
        typeof (error as { status?: number }).status === "number"
          ? (error as { status?: number }).status
          : 500;

      return NextResponse.json(
        { error: message },
        { status }
      );
    }
  }
);
