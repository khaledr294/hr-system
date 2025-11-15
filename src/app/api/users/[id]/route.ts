import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Permission } from "@prisma/client";
import { withApiAuth } from "@/lib/api-guard";

type UserContext = { params: Promise<{ id: string }> };

export const GET = withApiAuth<UserContext>(
  { permissions: [Permission.VIEW_USERS] },
  async ({ context }) => {
    try {
      const { id } = await context.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          jobTitle: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              permissions: true
            }
          }
        }
      });

      if (!user) {
        return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
      }

      return NextResponse.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      return NextResponse.json({ error: "حدث خطأ أثناء جلب بيانات المستخدم" }, { status: 500 });
    }
  }
);

export const PUT = withApiAuth<UserContext>(
  { permissions: [Permission.EDIT_USERS], auditAction: "EDIT_USER" },
  async ({ req, context }) => {
    try {
      const { id } = await context.params;
      const formData = await req.formData();
    
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const jobTitleId = formData.get("jobTitleId") as string;

    if (!name || !email || !jobTitleId) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    // التحقق من وجود المسمى الوظيفي
    const jobTitle = await prisma.jobTitle.findUnique({
      where: { id: jobTitleId }
    });

    if (!jobTitle || !jobTitle.isActive) {
      return NextResponse.json({ error: "المسمى الوظيفي غير صالح" }, { status: 400 });
    }

    // إعداد البيانات للتحديث
    const updateData: {
      name: string;
      email: string;
      jobTitleId: string;
      password?: string;
    } = {
      name,
      email,
      jobTitleId
    };

    // إضافة كلمة المرور فقط إذا تم إدخالها
    if (password && password.trim()) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // تحديث المستخدم
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        jobTitle: true
      }
    });

    return NextResponse.json({ 
      message: "تم تحديث المستخدم بنجاح",
      user: { 
        id: updatedUser.id, 
        name: updatedUser.name, 
        email: updatedUser.email, 
        jobTitleId: updatedUser.jobTitleId,
        jobTitle: updatedUser.jobTitle 
      }
    });
    } catch (error) {
      console.error("Error updating user:", error);
      return NextResponse.json({ error: "حدث خطأ أثناء تحديث المستخدم" }, { status: 500 });
    }
  }
);

export const DELETE = withApiAuth<UserContext>(
  { permissions: [Permission.DELETE_USERS], auditAction: "DELETE_USER" },
  async ({ context, session }) => {
    try {
      const { id } = await context.params;

      if (session.user.id === id) {
        return NextResponse.json({ error: "لا يمكن حذف حسابك الخاص" }, { status: 400 });
      }

      await prisma.user.delete({
        where: { id }
      });

      return NextResponse.json({ message: "تم حذف المستخدم بنجاح" });
    } catch (error) {
      console.error("Error deleting user:", error);
      return NextResponse.json({ error: "حدث خطأ أثناء حذف المستخدم" }, { status: 500 });
    }
  }
);