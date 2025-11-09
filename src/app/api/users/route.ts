import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const role = form.get("role") as string;
    const jobTitleId = form.get("jobTitleId") as string | null;
    
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }
    
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashed, 
        role: role as Role,
        ...(jobTitleId && { jobTitleId })
      },
    });
    
    return NextResponse.redirect("/users");
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json({ error: "خطأ في النظام" }, { status: 500 });
  }
}
