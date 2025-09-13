import { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { checkExpiringContracts } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  const session = await getSession();

  if (!session || session.user.role !== 'ADMIN') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    await checkExpiringContracts();
    return new Response('Notification check completed successfully', {
      status: 200,
    });
  } catch (error) {
    console.error('Failed to check notifications:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}