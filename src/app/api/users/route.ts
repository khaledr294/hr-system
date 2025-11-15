import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Permission } from "@prisma/client";
import { withApiAuth } from "@/lib/api-guard";

type EmptyContext = { params: Promise<Record<string, never>> };

export const POST = withApiAuth<EmptyContext>({
  permissions: [Permission.CREATE_USERS],
  auditAction: "CREATE_USER",
},
async ({ req }) => {
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
    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashed,
        jobTitleId
      },
    });

    return NextResponse.json({ success: true, id: user.id }, { status: 201 });
  } catch (error: unknown) {
    console.error('Failed to create user:', error);
    const message = error instanceof Error ? error.message : "خطأ في النظام";
    return NextResponse.json({ 
      error: message 
    }, { status: 500 });
  }
});
