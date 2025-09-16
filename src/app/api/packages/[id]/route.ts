import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return new Response('Unauthorized', { status: 401 });
  try {
    const { id } = params;
    const data = await req.json();
    const allowed = ['name', 'duration', 'price'];
    const updateData: Partial<{ name: string; duration: number; price: number }> = {};
    for (const key of allowed) {
      if (key in data) {
        if (key === 'name') updateData.name = String(data.name);
        if (key === 'duration') updateData.duration = Number(data.duration);
        if (key === 'price') updateData.price = Number(data.price);
      }
    }
    const pkg = await prisma.package.update({ where: { id }, data: updateData });
    return new Response(JSON.stringify(pkg), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return new Response('Unauthorized', { status: 401 });
  try {
    const { id } = params;
    await prisma.package.delete({ where: { id } });
    return new Response('Deleted', { status: 200 });
  } catch {
    return new Response('Internal Server Error', { status: 500 });
  }
}
