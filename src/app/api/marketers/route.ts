import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  // جلب المستخدمين الذين لديهم المسمى الوظيفي "مسوق"
  const marketerJobTitle = await prisma.jobTitle.findFirst({
    where: { nameAr: 'مسوق' },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  const marketers = marketerJobTitle?.users || [];
  return new Response(JSON.stringify(marketers), { headers: { 'Content-Type': 'application/json' } });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // هذا الـ endpoint لم يعد يستخدم - المسوقون الآن يُدارون من خلال Users
  return new Response(JSON.stringify({ 
    error: 'هذا الـ endpoint لم يعد مدعوماً. يرجى استخدام /api/users لإدارة المستخدمين' 
  }), { 
    status: 410, // Gone
    headers: { 'Content-Type': 'application/json' } 
  });
}
