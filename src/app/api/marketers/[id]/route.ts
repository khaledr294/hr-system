import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const marketer = await prisma.marketer.findUnique({ where: { id: params.id } });
  if (!marketer) return new Response('Not found', { status: 404 });
  return new Response(JSON.stringify(marketer), { headers: { 'Content-Type': 'application/json' } });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new Response('Unauthorized', { status: 401 });
  const params = await context.params;
  const data = await req.json();
  const marketer = await prisma.marketer.update({ where: { id: params.id }, data });
  return new Response(JSON.stringify(marketer), { headers: { 'Content-Type': 'application/json' } });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return new Response('Unauthorized', { status: 401 });
    
    const params = await context.params;
    
    // التحقق من وجود عقود مرتبطة بالمسوق
    const contractsCount = await prisma.contract.count({
      where: { marketerId: params.id }
    });
    
    if (contractsCount > 0) {
      return new Response(
        JSON.stringify({ 
          error: `لا يمكن حذف المسوق لوجود ${contractsCount} عقد مرتبط به. يجب حذف العقود أولاً.` 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // حذف المسوق إذا لم تكن هناك عقود مرتبطة
    await prisma.marketer.delete({ where: { id: params.id } });
    return new Response(null, { status: 204 });
    
  } catch (error) {
    console.error('Error deleting marketer:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
