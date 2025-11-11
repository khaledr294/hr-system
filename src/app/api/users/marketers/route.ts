import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await getSession();
  
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
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
          },
          orderBy: {
            name: 'asc'
          }
        }
      }
    });

    const marketers = marketerJobTitle?.users || [];

    return new Response(JSON.stringify(marketers), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching marketers:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
