import { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { healthCheck, optimizeDatabase } from '@/lib/performance';

export async function GET() {
  const session = await getSession();

  // التحقق من الصلاحيات - فقط المدير يمكنه الوصول
  if (!session || !['ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const health = await healthCheck();
    return new Response(JSON.stringify(health), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Health check error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();

  // التحقق من الصلاحيات - فقط المدير يمكنه تنفيذ التحسين
  if (!session || session.user.role !== 'ADMIN') {
    return new Response('Unauthorized', { status: 401 });
  }

  const { action } = await req.json();

  try {
    if (action === 'optimize') {
      await optimizeDatabase();
      return new Response(JSON.stringify({ message: 'Database optimized successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Invalid action', { status: 400 });
  } catch (error) {
    console.error('Database optimization error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}