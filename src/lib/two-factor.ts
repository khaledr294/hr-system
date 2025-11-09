import * as OTPAuth from 'otpauth';
import { randomBytes } from 'crypto';

const APP_NAME = 'HR System';

/**
 * توليد secret جديد للـ TOTP
 */
export function generateTOTPSecret(): string {
  const secret = new OTPAuth.Secret({ size: 20 });
  return secret.base32;
}

/**
 * توليد QR Code URL للـ authenticator app
 */
export function generateTOTPQRCode(email: string, secret: string): string {
  const totp = new OTPAuth.TOTP({
    issuer: APP_NAME,
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret)
  });

  return totp.toString();
}

/**
 * التحقق من كود TOTP
 */
export function verifyTOTPToken(secret: string, token: string): boolean {
  try {
    const totp = new OTPAuth.TOTP({
      issuer: APP_NAME,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret)
    });

    // التحقق مع سماح بفارق +/- 1 period (30 ثانية)
    const delta = totp.validate({ token, window: 1 });
    return delta !== null;
  } catch (error) {
    console.error('خطأ في التحقق من TOTP:', error);
    return false;
  }
}

/**
 * توليد رموز احتياطية (Backup Codes)
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // توليد رمز مكون من 8 حروف/أرقام
    const code = randomBytes(4).toString('hex').toUpperCase();
    // إضافة شرطة في المنتصف لسهولة القراءة
    const formattedCode = `${code.slice(0, 4)}-${code.slice(4)}`;
    codes.push(formattedCode);
  }
  
  return codes;
}

/**
 * hash رمز احتياطي
 */
export async function hashBackupCode(code: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(code, 10);
}

/**
 * التحقق من رمز احتياطي
 */
export async function verifyBackupCode(
  code: string,
  hashedCodes: string[]
): Promise<{ valid: boolean; index: number }> {
  const bcrypt = await import('bcryptjs');
  
  for (let i = 0; i < hashedCodes.length; i++) {
    const isValid = await bcrypt.compare(code, hashedCodes[i]);
    if (isValid) {
      return { valid: true, index: i };
    }
  }
  
  return { valid: false, index: -1 };
}

/**
 * تنسيق رموز احتياطية للتخزين
 */
export async function prepareBackupCodesForStorage(codes: string[]): Promise<string> {
  const hashedCodes = await Promise.all(
    codes.map(code => hashBackupCode(code))
  );
  return JSON.stringify(hashedCodes);
}

/**
 * استرجاع رموز احتياطية من التخزين
 */
export function parseBackupCodes(storedCodes: string | null): string[] {
  if (!storedCodes) return [];
  try {
    return JSON.parse(storedCodes);
  } catch {
    return [];
  }
}
