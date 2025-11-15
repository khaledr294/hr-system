import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Permission } from "@prisma/client";
import { withApiAuth } from "@/lib/api-guard";

type EmptyContext = { params: Promise<Record<string, never>> };

interface CreateJobTitlePayload {
  name: string;
  nameAr: string;
  description?: string | null;
  permissions?: Permission[];
}

// GET: استرجاع جميع المسميات الوظيفية
export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.MANAGE_JOB_TITLES] },
  async () => {
    try {
      const jobTitles = await prisma.jobTitle.findMany({
        include: {
          _count: {
            select: { users: true }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      return NextResponse.json(jobTitles);
    } catch (error: unknown) {
      console.error("Error fetching job titles:", error);
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء استرجاع المسميات الوظيفية";
      return NextResponse.json(
        { error: message },
        { status: 500 }
      );
    }
  }
);

// POST: إنشاء مسمى وظيفي جديد
export const POST = withApiAuth<EmptyContext>(
  { permissions: [Permission.MANAGE_JOB_TITLES], auditAction: "CREATE_JOB_TITLE" },
  async ({ req, session }) => {
    try {
      const body = (await req.json()) as CreateJobTitlePayload;

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
          permissions: {
            set: permissions ?? []
          }
        }
      });

      // تسجيل في Log
      await prisma.log.create({
        data: {
          userId: session.user.id,
          action: "CREATE_JOB_TITLE",
          entity: "JobTitle",
          entityId: jobTitle.id,
          message: `تم إنشاء المسمى الوظيفي: ${nameAr}`
        }
      });

      return NextResponse.json(jobTitle, { status: 201 });
    } catch (error: unknown) {
      console.error("Error creating job title:", error);
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء المسمى الوظيفي";
      return NextResponse.json(
        { error: message },
        { status: 500 }
      );
    }
  }
);
