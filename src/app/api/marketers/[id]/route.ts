import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  
  // إعادة توجيه إلى /api/users/[id]
  const user = await prisma.user.findUnique({ 
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      jobTitle: {
        select: {
          nameAr: true
        }
      }
    }
  });
  
  if (!user) return new Response('Not found', { status: 404 });
  return new Response(JSON.stringify(user), { headers: { 'Content-Type': 'application/json' } });
}

export async function PUT(_req: NextRequest, _context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new Response('Unauthorized', { status: 401 });
  
  return new Response(JSON.stringify({ 
    error: 'هذا الـ endpoint لم يعد مدعوماً. يرجى استخدام /api/users/[id]' 
  }), { 
    status: 410,
    headers: { 'Content-Type': 'application/json' } 
  });
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
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
    
    return new Response(JSON.stringify({ 
      error: 'هذا الـ endpoint لم يعد مدعوماً. المسوقون الآن جزء من Users' 
    }), { 
      status: 410,
      headers: { 'Content-Type': 'application/json' } 
    });
    
  } catch (error) {
    console.error('Error deleting marketer:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
