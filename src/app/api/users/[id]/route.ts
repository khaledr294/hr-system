import { NextResponse } from "next/server";
import { auth } from '@/lib/auth';
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { hasPermission } from '@/lib/permissions';

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // التحقق من صلاحية تعديل المستخدمين
    const canEdit = await hasPermission(session.user.id, 'EDIT_USERS');
    if (!canEdit) {
      return NextResponse.json({ error: "ليس لديك صلاحية تعديل المستخدمين" }, { status: 403 });
    }

    const { id } = await context.params;
    const formData = await request.formData();
    
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

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // التحقق من صلاحية حذف المستخدمين
    const canDelete = await hasPermission(session.user.id, 'DELETE_USERS');
    if (!canDelete) {
      return NextResponse.json({ error: "ليس لديك صلاحية حذف المستخدمين" }, { status: 403 });
    }

    const { id } = await context.params;

    // التأكد من عدم حذف المستخدم لنفسه
    if (session.user.id === id) {
      return NextResponse.json({ error: "لا يمكن حذف حسابك الخاص" }, { status: 400 });
    }

    // حذف المستخدم
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ message: "تم حذف المستخدم بنجاح" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء حذف المستخدم" }, { status: 500 });
  }
}