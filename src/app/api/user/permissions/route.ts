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
  } catch (error: any) {
    console.error("Error fetching user permissions:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء استرجاع الصلاحيات" },
      { status: error.status || 500 }
    );
  }
}
