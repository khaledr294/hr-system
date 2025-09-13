import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const marketer = await prisma.marketer.findUnique({ where: { id: params.id } });
  if (!marketer) return new Response('Not found', { status: 404 });
  return new Response(JSON.stringify(marketer), { headers: { 'Content-Type': 'application/json' } });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return new Response('Unauthorized', { status: 401 });
  const data = await req.json();
  const marketer = await prisma.marketer.update({ where: { id: params.id }, data });
  return new Response(JSON.stringify(marketer), { headers: { 'Content-Type': 'application/json' } });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return new Response('Unauthorized', { status: 401 });
  await prisma.marketer.delete({ where: { id: params.id } });
  return new Response(null, { status: 204 });
}
