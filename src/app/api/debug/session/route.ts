import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const allCookies = request.cookies.getAll();
    const cookieNames = allCookies.map(c => c.name);
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    return NextResponse.json({ ok: true, cookieNames, token });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message });
  }
}
