import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { Permission } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // Check MANAGE_SETTINGS permission
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { jobTitle: true },
    });

    if (!user?.jobTitle?.permissions || !hasPermission(user.jobTitle.permissions, Permission.MANAGE_SETTINGS)) {
      return NextResponse.json(
        { error: "ليس لديك صلاحية الوصول إلى الإعدادات" },
        { status: 403 }
      );
    }

    // Get or create settings
    let settings = await prisma.systemSettings.findUnique({
      where: { id: "system" },
    });

    if (!settings) {
      // Create default settings if they don't exist
      settings = await prisma.systemSettings.create({
        data: {
          id: "system",
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الإعدادات" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // Check MANAGE_SETTINGS permission
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { jobTitle: true },
    });

    if (!user?.jobTitle?.permissions || !hasPermission(user.jobTitle.permissions, Permission.MANAGE_SETTINGS)) {
      return NextResponse.json(
        { error: "ليس لديك صلاحية تعديل الإعدادات" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate numeric fields
    if (body.sessionTimeout !== undefined) {
      const timeout = Number(body.sessionTimeout);
      if (timeout < 15 || timeout > 480) {
        return NextResponse.json(
          { error: "مدة انتهاء الجلسة يجب أن تكون بين 15 و 480 دقيقة" },
          { status: 400 }
        );
      }
    }

    if (body.maxLoginAttempts !== undefined) {
      const attempts = Number(body.maxLoginAttempts);
      if (attempts < 3 || attempts > 10) {
        return NextResponse.json(
          { error: "الحد الأقصى لمحاولات تسجيل الدخول يجب أن يكون بين 3 و 10" },
          { status: 400 }
        );
      }
    }

    // Update settings
    const settings = await prisma.systemSettings.upsert({
      where: { id: "system" },
      update: {
        companyName: body.companyName,
        commercialRegister: body.commercialRegister,
        address: body.address,
        phone: body.phone,
        language: body.language,
        timezone: body.timezone,
        dateFormat: body.dateFormat,
        currency: body.currency,
        notifyContractExpiry: body.notifyContractExpiry,
        notifyNewWorker: body.notifyNewWorker,
        notifyPayment: body.notifyPayment,
        sessionTimeout: body.sessionTimeout,
        maxLoginAttempts: body.maxLoginAttempts,
        enableActivityLogging: body.enableActivityLogging,
      },
      create: {
        id: "system",
        companyName: body.companyName,
        commercialRegister: body.commercialRegister,
        address: body.address,
        phone: body.phone,
        language: body.language,
        timezone: body.timezone,
        dateFormat: body.dateFormat,
        currency: body.currency,
        notifyContractExpiry: body.notifyContractExpiry,
        notifyNewWorker: body.notifyNewWorker,
        notifyPayment: body.notifyPayment,
        sessionTimeout: body.sessionTimeout,
        maxLoginAttempts: body.maxLoginAttempts,
        enableActivityLogging: body.enableActivityLogging,
      },
    });

    // Log the action
    await prisma.log.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_SETTINGS",
        entity: "SystemSettings",
        entityId: "system",
        message: `قام ${user.name} بتحديث إعدادات النظام`,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حفظ الإعدادات" },
      { status: 500 }
    );
  }
}
