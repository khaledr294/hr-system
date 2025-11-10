import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { hasPermission } from "@/lib/permissions";

export async function POST(req: Request) {
  const session = await getSession();
  
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  // التحقق من صلاحية إنشاء مستخدمين
  const canCreate = await hasPermission(session.user.id, 'CREATE_USERS');
  if (!canCreate) {
    return NextResponse.json({ error: "ليس لديك صلاحية إضافة مستخدمين" }, { status: 403 });
  }
  try {
    const form = await req.formData();
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const jobTitleId = form.get("jobTitleId") as string;
    
    if (!name || !email || !password || !jobTitleId) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    // التحقق من وجود المسمى الوظيفي
    const jobTitle = await prisma.jobTitle.findUnique({
      where: { id: jobTitleId }
    });

    if (!jobTitle || !jobTitle.isActive) {
      return NextResponse.json({ error: "المسمى الوظيفي غير صالح" }, { status: 400 });
    }
    
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashed,
        jobTitleId,
        role: "USER" // قيمة افتراضية للـ backward compatibility
      },
    });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error('Failed to create user:', error);
    const message = error instanceof Error ? error.message : "خطأ في النظام";
    return NextResponse.json({ 
      error: message 
    }, { status: 500 });
  }
}
