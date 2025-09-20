import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getToken } from 'next-auth/jwt';

export async function GET() {
  try {
    const store = await cookies();
    const allCookies = store.getAll();
    const cookieNames = allCookies.map((c: { name: string }) => c.name);
    // محاولة استخراج التوكن إن أمكن (النوع هنا مسموح لأن بيئة راوت تدعم getToken)
    let token: unknown = null;
    try {
  token = await getToken({ req: { cookies: Object.fromEntries(allCookies.map((c: { name: string, value: string }) => [c.name, c.value])) } as any, secret: process.env.NEXTAUTH_SECRET });
    } catch {
      // تجاهل أي خطأ داخلي
    }
    return NextResponse.json({ ok: true, cookieNames, token });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message });
  }
}
