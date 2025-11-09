import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  generateTOTPSecret, 
  generateTOTPQRCode,
  generateBackupCodes,
  prepareBackupCodesForStorage,
  verifyTOTPToken,
  parseBackupCodes,
  verifyBackupCode
} from '@/lib/two-factor';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

// GET: الحصول على حالة 2FA
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        twoFactorEnabled: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    return NextResponse.json({
      enabled: user.twoFactorEnabled || false,
      email: user.email
    });
  } catch (error) {
    console.error('خطأ في الحصول على حالة 2FA:', error);
    return NextResponse.json(
      { error: 'فشل في الحصول على الحالة' },
      { status: 500 }
    );
  }
}

// POST: تفعيل أو إلغاء 2FA
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body; // 'setup', 'enable', 'disable', 'verify'

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorBackupCodes: true
      }
    });

    if (!user || !user.email) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    // بدء إعداد 2FA
    if (action === 'setup') {
      const secret = generateTOTPSecret();
      const otpauthUrl = generateTOTPQRCode(user.email, secret);
      
      // توليد QR Code
      const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
      
      // توليد رموز احتياطية
      const backupCodes = generateBackupCodes(10);
      
      // حفظ مؤقت (بدون تفعيل)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorSecret: secret,
          twoFactorBackupCodes: await prepareBackupCodesForStorage(backupCodes)
        }
      });

      return NextResponse.json({
        secret,
        qrCode: qrCodeDataUrl,
        backupCodes,
        message: 'تم توليد رمز QR والرموز الاحتياطية'
      });
    }

    // التحقق وتفعيل 2FA
    if (action === 'enable') {
      const { token } = body;

      if (!user.twoFactorSecret) {
        return NextResponse.json(
          { error: 'يجب إعداد 2FA أولاً' },
          { status: 400 }
        );
      }

      const isValid = verifyTOTPToken(user.twoFactorSecret, token);
      
      if (!isValid) {
        return NextResponse.json(
          { error: 'الرمز غير صحيح' },
          { status: 400 }
        );
      }

      // تفعيل 2FA
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorEnabled: true }
      });

      return NextResponse.json({
        success: true,
        message: 'تم تفعيل المصادقة الثنائية بنجاح'
      });
    }

    // إلغاء تفعيل 2FA
    if (action === 'disable') {
      const { token, password } = body;

      // التحقق من الرمز أو الرمز الاحتياطي
      let isValid = false;
      
      if (user.twoFactorSecret && token) {
        isValid = verifyTOTPToken(user.twoFactorSecret, token);
        
        // إذا لم يكن الرمز صحيح، جرب الرموز الاحتياطية
        if (!isValid && user.twoFactorBackupCodes) {
          const backupCodes = parseBackupCodes(user.twoFactorBackupCodes);
          const result = await verifyBackupCode(token, backupCodes);
          isValid = result.valid;
        }
      }

      if (!isValid) {
        return NextResponse.json(
          { error: 'الرمز غير صحيح' },
          { status: 400 }
        );
      }

      // إلغاء التفعيل
      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
          twoFactorBackupCodes: null
        }
      });

      return NextResponse.json({
        success: true,
        message: 'تم إلغاء تفعيل المصادقة الثنائية'
      });
    }

    // التحقق من رمز 2FA
    if (action === 'verify') {
      const { token } = body;

      if (!user.twoFactorEnabled || !user.twoFactorSecret) {
        return NextResponse.json(
          { error: 'المصادقة الثنائية غير مفعلة' },
          { status: 400 }
        );
      }

      let isValid = verifyTOTPToken(user.twoFactorSecret, token);
      let usedBackupCode = false;

      // إذا لم يكن الرمز صحيح، جرب الرموز الاحتياطية
      if (!isValid && user.twoFactorBackupCodes) {
        const backupCodes = parseBackupCodes(user.twoFactorBackupCodes);
        const result = await verifyBackupCode(token, backupCodes);
        
        if (result.valid) {
          isValid = true;
          usedBackupCode = true;
          
          // حذف الرمز الاحتياطي المستخدم
          backupCodes.splice(result.index, 1);
          await prisma.user.update({
            where: { id: user.id },
            data: { twoFactorBackupCodes: JSON.stringify(backupCodes) }
          });
        }
      }

      if (!isValid) {
        return NextResponse.json(
          { error: 'الرمز غير صحيح' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        usedBackupCode,
        remainingBackupCodes: usedBackupCode 
          ? parseBackupCodes(user.twoFactorBackupCodes).length 
          : undefined
      });
    }

    return NextResponse.json(
      { error: 'إجراء غير معروف' },
      { status: 400 }
    );
  } catch (error) {
    console.error('خطأ في إدارة 2FA:', error);
    return NextResponse.json(
      { error: 'فشل في تنفيذ العملية' },
      { status: 500 }
    );
  }
}
