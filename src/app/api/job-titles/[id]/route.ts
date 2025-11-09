import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireHROrManager } from "@/lib/require";

// GET: استرجاع مسمى وظيفي واحد
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireHROrManager();

    const jobTitle = await prisma.jobTitle.findUnique({
      where: { id: params.id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!jobTitle) {
      return NextResponse.json(
        { error: "المسمى الوظيفي غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json(jobTitle);
  } catch (error: any) {
    console.error("Error fetching job title:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء استرجاع المسمى الوظيفي" },
      { status: error.status || 500 }
    );
  }
}

// PATCH: تحديث مسمى وظيفي
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireHROrManager();
    const body = await request.json();

    const { name, nameAr, description, permissions, isActive } = body;

    // التحقق من وجود المسمى الوظيفي
    const existing = await prisma.jobTitle.findUnique({
      where: { id: params.id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: "المسمى الوظيفي غير موجود" },
        { status: 404 }
      );
    }

    // التحقق من عدم تكرار الاسم
    if (name && name !== existing.name) {
      const duplicate = await prisma.jobTitle.findUnique({
        where: { name }
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "هذا المسمى الوظيفي موجود بالفعل" },
          { status: 400 }
        );
      }
    }

    const jobTitle = await prisma.jobTitle.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(nameAr && { nameAr }),
        ...(description !== undefined && { description }),
        ...(permissions && { permissions: JSON.stringify(permissions) }),
        ...(isActive !== undefined && { isActive })
      }
    });

    // تسجيل في Log
    await prisma.log.create({
      data: {
        userId: user.id,
        action: "UPDATE_JOB_TITLE",
        entity: "JobTitle",
        entityId: jobTitle.id,
        message: `تم تحديث المسمى الوظيفي: ${jobTitle.nameAr}`
      }
    });

    return NextResponse.json(jobTitle);
  } catch (error: any) {
    console.error("Error updating job title:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء تحديث المسمى الوظيفي" },
      { status: error.status || 500 }
    );
  }
}

// DELETE: حذف مسمى وظيفي
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireHROrManager();

    // التحقق من وجود المسمى الوظيفي
    const jobTitle = await prisma.jobTitle.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { users: true }
        }
      }
    });

    if (!jobTitle) {
      return NextResponse.json(
        { error: "المسمى الوظيفي غير موجود" },
        { status: 404 }
      );
    }

    // التحقق من عدم وجود مستخدمين مرتبطين
    if (jobTitle._count.users > 0) {
      return NextResponse.json(
        { error: `لا يمكن حذف المسمى الوظيفي لأنه مرتبط بـ ${jobTitle._count.users} مستخدم` },
        { status: 400 }
      );
    }

    await prisma.jobTitle.delete({
      where: { id: params.id }
    });

    // تسجيل في Log
    await prisma.log.create({
      data: {
        userId: user.id,
        action: "DELETE_JOB_TITLE",
        entity: "JobTitle",
        entityId: params.id,
        message: `تم حذف المسمى الوظيفي: ${jobTitle.nameAr}`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting job title:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء حذف المسمى الوظيفي" },
      { status: error.status || 500 }
    );
  }
}
