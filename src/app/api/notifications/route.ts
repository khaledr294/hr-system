import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const countOnly = searchParams.get('countOnly') === 'true';

    if (countOnly) {
      const count = await getUnreadCount(session.user.id);
      return NextResponse.json({ count });
    }

    const notifications = await getUserNotifications(session.user.id, unreadOnly);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, notificationId } = body;

    if (action === 'markAsRead' && notificationId) {
      await markAsRead(notificationId);
      return NextResponse.json({ success: true });
    }

    if (action === 'markAllAsRead') {
      await markAllAsRead(session.user.id);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete' && notificationId) {
      await deleteNotification(notificationId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing notification action:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
