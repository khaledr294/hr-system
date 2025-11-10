import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { hasPermission } from '@/lib/permissions';

export async function GET() {
  const packages = await prisma.package.findMany({ orderBy: { createdAt: 'desc' } });
  return new Response(JSON.stringify(packages), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) return new Response('Unauthorized', { status: 401 });

  // التحقق من صلاحية إدارة الإعدادات (الباقات جزء من الإعدادات)
  const canManage = await hasPermission(session.user.id, 'MANAGE_SETTINGS');
  if (!canManage) {
    return new Response('Forbidden - ليس لديك صلاحية إدارة الباقات', { status: 403 });
  }
  try {
    const data = await req.json();
    if (!data.name || !data.duration || !data.price) {
      return new Response('Missing required fields', { status: 400 });
    }
    const pkg = await prisma.package.create({ data });
    return new Response(JSON.stringify(pkg), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response('Internal Server Error', { status: 500 });
  }
}
