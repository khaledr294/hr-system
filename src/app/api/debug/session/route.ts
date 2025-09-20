import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
    return NextResponse.json({ ok: true, token });
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: e.message });
  }
}
