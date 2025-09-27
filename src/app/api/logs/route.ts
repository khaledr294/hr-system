import { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { getLogs } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const action = searchParams.get('action') || undefined;
  
  // إذا كان المستخدم ليس أدمن، يجلب سجلاته فقط
  const userId = ['ADMIN', 'HR_MANAGER', 'GENERAL_MANAGER', 'HR'].includes(session.user.role) 
    ? searchParams.get('userId') || undefined 
    : session.user.id;

  try {
    const result = await getLogs(userId, page, limit, action);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
