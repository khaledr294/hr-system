/**
 * Page Protection Helpers
 * دوال مساعدة لحماية الصفحات بناءً على الصلاحيات
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { hasPermission, type Permission } from '@/lib/permissions';

/**
 * حماية صفحة تتطلب صلاحية معينة
 */
export async function requirePermission(permission: Permission) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const allowed = await hasPermission(session.user.id, permission);
  
  if (!allowed) {
    redirect('/unauthorized');
  }

  return session;
}

/**
 * حماية صفحة تتطلب دور معين (admin أو hr_manager)
 */
export async function requireAdmin() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = session.user;
  const isAdmin = user.role === 'HR_MANAGER' || user.role === 'GENERAL_MANAGER';
  
  if (!isAdmin) {
    redirect('/unauthorized');
  }

  return session;
}

/**
 * حماية صفحات المسوقين - يمكنهم الوصول فقط لصفحات محددة
 */
export async function allowMarketerAccess(allowedPaths: string[]) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = session.user;
  
  // المدراء لديهم وصول كامل
  if (user.role === 'HR_MANAGER' || user.role === 'GENERAL_MANAGER') {
    return session;
  }

  // التحقق من أن المسار مسموح للمسوقين
  if (user.role === 'MARKETER') {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const isAllowed = allowedPaths.some(path => currentPath.startsWith(path));
    
    if (!isAllowed) {
      redirect('/unauthorized');
    }
  }

  return session;
}
