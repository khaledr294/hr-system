import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  const marketers = await prisma.marketer.findMany({ orderBy: { createdAt: 'desc' } });
  return new Response(JSON.stringify(marketers), { headers: { 'Content-Type': 'application/json' } });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  const data = await req.json();
  if (!data.name || !data.phone) {
    return new Response('Missing required fields', { status: 400 });
  }
  const marketer = await prisma.marketer.create({ data });
  return new Response(JSON.stringify(marketer), { status: 201, headers: { 'Content-Type': 'application/json' } });
}
