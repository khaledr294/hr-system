import { NextResponse } from 'next/server';
import { withApiAuth } from '@/lib/api-guard';
import { getUserNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '@/lib/notifications';

type EmptyContext = { params: Promise<Record<string, never>> };

export const GET = withApiAuth<EmptyContext>({}, async ({ req, session }) => {
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
);

export const POST = withApiAuth<EmptyContext>({}, async ({ req, session }) => {
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
);
