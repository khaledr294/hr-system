import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireHROrManager } from "@/lib/require";

// GET: استرجاع جميع المسميات الوظيفية
export async function GET() {
  try {
    await requireHROrManager();

    const jobTitles = await prisma.jobTitle.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(jobTitles);
  } catch (error: any) {
    console.error("Error fetching job titles:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء استرجاع المسميات الوظيفية" },
      { status: error.status || 500 }
    );
  }
}

// POST: إنشاء مسمى وظيفي جديد
export async function POST(request: Request) {
  try {
    const user = await requireHROrManager();
    const body = await request.json();

    const { name, nameAr, description, permissions } = body;

    if (!name || !nameAr) {
      return NextResponse.json(
        { error: "الاسم بالإنجليزية والعربية مطلوبان" },
        { status: 400 }
      );
    }

    // التحقق من عدم تكرار الاسم
    const existing = await prisma.jobTitle.findUnique({
      where: { name }
    });

    if (existing) {
      return NextResponse.json(
        { error: "هذا المسمى الوظيفي موجود بالفعل" },
        { status: 400 }
      );
    }

    const jobTitle = await prisma.jobTitle.create({
      data: {
        name,
        nameAr,
        description: description || null,
        permissions: JSON.stringify(permissions || [])
      }
    });

    // تسجيل في Log
    await prisma.log.create({
      data: {
        userId: user.id,
        action: "CREATE_JOB_TITLE",
        entity: "JobTitle",
        entityId: jobTitle.id,
        message: `تم إنشاء المسمى الوظيفي: ${nameAr}`
      }
    });

    return NextResponse.json(jobTitle, { status: 201 });
  } catch (error: any) {
    console.error("Error creating job title:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء إنشاء المسمى الوظيفي" },
      { status: error.status || 500 }
    );
  }
}
