import { getSession } from '@/lib/session';
import { checkExpiringContracts } from '@/lib/notifications';
import { hasPermission } from '@/lib/permissions';

export async function POST() {
  const session = await getSession();

  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // التحقق من صلاحية عرض العقود
  const canView = await hasPermission(session.user.id, 'VIEW_CONTRACTS');
  if (!canView) {
    return new Response('Forbidden - ليس لديك صلاحية فحص الإشعارات', { status: 403 });
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