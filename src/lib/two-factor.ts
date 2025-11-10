const MESSAGE = 'تم إيقاف المصادقة الثنائية في النظام.';

export function generateTOTPSecret(): string {
  throw new Error(MESSAGE);
}

export function generateTOTPQRCode(): string {
  throw new Error(MESSAGE);
}

export function verifyTOTPToken(): boolean {
  throw new Error(MESSAGE);
}

export function generateBackupCodes(): string[] {
  throw new Error(MESSAGE);
}

export async function hashBackupCode(): Promise<string> {
  throw new Error(MESSAGE);
}

export async function verifyBackupCode(): Promise<{ valid: boolean; index: number }> {
  throw new Error(MESSAGE);
}

export async function prepareBackupCodesForStorage(): Promise<string> {
  throw new Error(MESSAGE);
}

export function parseBackupCodes(): string[] {
  throw new Error(MESSAGE);
}
