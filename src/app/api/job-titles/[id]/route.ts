import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Permission } from "@prisma/client";
import { withApiAuth } from "@/lib/api-guard";

type JobTitleContext = { params: Promise<{ id: string }> };

interface UpdateJobTitlePayload {
  name?: string;
  nameAr?: string;
  description?: string | null;
  permissions?: Permission[];
  isActive?: boolean;
}

// GET: استرجاع مسمى وظيفي واحد
export const GET = withApiAuth<JobTitleContext>(
  { permissions: [Permission.MANAGE_JOB_TITLES] },
  async ({ context }) => {
    try {
      const params = await context.params;
      const jobTitle = await prisma.jobTitle.findUnique({
        where: { id: params.id },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              jobTitle: {
                select: { name: true }
              }
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
    } catch (error: unknown) {
      console.error("Error fetching job title:", error);
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء استرجاع المسمى الوظيفي";
      return NextResponse.json(
        { error: message },
        { status: 500 }
      );
    }
  }
);

// PATCH: تحديث مسمى وظيفي
export const PATCH = withApiAuth<JobTitleContext>(
  { permissions: [Permission.MANAGE_JOB_TITLES], auditAction: "UPDATE_JOB_TITLE" },
  async ({ req, context, session }) => {
    try {
      const body = (await req.json()) as UpdateJobTitlePayload;
      const params = await context.params;

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
        ...(permissions !== undefined && { permissions: { set: permissions ?? [] } }),
        ...(isActive !== undefined && { isActive })
      }
    });

    // تسجيل في Log
    await prisma.log.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_JOB_TITLE",
        entity: "JobTitle",
        entityId: jobTitle.id,
        message: `تم تحديث المسمى الوظيفي: ${jobTitle.nameAr}`
      }
    });

    return NextResponse.json(jobTitle);
    } catch (error: unknown) {
      console.error("Error updating job title:", error);
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء تحديث المسمى الوظيفي";
      return NextResponse.json(
        { error: message },
        { status: 500 }
      );
    }
  }
);

// DELETE: حذف مسمى وظيفي
export const DELETE = withApiAuth<JobTitleContext>(
  { permissions: [Permission.MANAGE_JOB_TITLES], auditAction: "DELETE_JOB_TITLE" },
  async ({ context, session }) => {
    try {
      const params = await context.params;

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
        userId: session.user.id,
        action: "DELETE_JOB_TITLE",
        entity: "JobTitle",
        entityId: params.id,
        message: `تم حذف المسمى الوظيفي: ${jobTitle.nameAr}`
      }
    });

    return NextResponse.json({ success: true });
    } catch (error: unknown) {
      console.error("Error deleting job title:", error);
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء حذف المسمى الوظيفي";
      return NextResponse.json(
        { error: message },
        { status: 500 }
      );
    }
  }
);
