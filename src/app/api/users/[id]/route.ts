import { NextResponse } from "next/server";
import { auth } from '@/lib/auth';
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "HR") {
      return NextResponse.json({ error: "غير مخول" }, { status: 403 });
    }

    const { id } = await context.params;
    const formData = await request.formData();
    
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;

    if (!name || !email || !role) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    // إعداد البيانات للتحديث
    const updateData: {
      name: string;
      email: string;
      role: Role;
      password?: string;
    } = {
      name,
      email,
      role: role as Role
    };

    // إضافة كلمة المرور فقط إذا تم إدخالها
    if (password && password.trim()) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // تحديث المستخدم
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ 
      message: "تم تحديث المستخدم بنجاح",
      user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role }
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
    
    if (!session || session.user.role !== "HR") {
      return NextResponse.json({ error: "غير مخول" }, { status: 403 });
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