import { NextResponse } from "next/server";
import { requireSession } from "@/lib/require";
import { getUserPermissions } from "@/lib/permissions";

// GET: استرجاع صلاحيات المستخدم الحالي
export async function GET() {
  try {
    const user = await requireSession();
    const permissions = await getUserPermissions(user.id);

    return NextResponse.json({ 
      permissions,
      role: user.role 
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
