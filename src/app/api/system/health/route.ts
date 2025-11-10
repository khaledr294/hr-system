import { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { healthCheck, optimizeDatabase } from '@/lib/performance';
import { hasPermission } from '@/lib/permissions';

export async function GET() {
  const session = await getSession();

  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // التحقق من صلاحية عرض النظام
  const canView = await hasPermission(session.user.id, 'VIEW_LOGS');
  if (!canView) {
    return new Response('Forbidden - ليس لديك صلاحية عرض حالة النظام', { status: 403 });
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

  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // التحقق من صلاحية إدارة الإعدادات
  const canManage = await hasPermission(session.user.id, 'MANAGE_SETTINGS');
  if (!canManage) {
    return new Response('Forbidden - ليس لديك صلاحية تحسين النظام', { status: 403 });
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