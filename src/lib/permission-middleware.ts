import { NextResponse } from "next/server";
import { getSession } from "./session";
import { sessionHasPermission, sessionHasAny, Permission } from "./permissions";

/**
 * التحقق من الصلاحية على مستوى الصفحة
 * يعيد توجيه للصفحة 403 إذا لم يكن لدى المستخدم الصلاحية
 */
export async function checkPagePermission(permission: Permission) {
  const session = await getSession();
  
  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL));
  }

  const hasAccess = sessionHasPermission(session, permission);
  
  if (!hasAccess) {
    return NextResponse.redirect(new URL('/403', process.env.NEXTAUTH_URL));
  }

  return null; // المستخدم لديه الصلاحية
}

/**
 * التحقق من أي صلاحية من قائمة على مستوى الصفحة
 */
export async function checkPageAnyPermission(permissions: Permission[]) {
  const session = await getSession();
  
  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL));
  }

  const hasAccess = sessionHasAny(session, permissions);
  
  if (!hasAccess) {
    return NextResponse.redirect(new URL('/403', process.env.NEXTAUTH_URL));
  }

  return null;
}

/**
 * التحقق من الصلاحية في API route
 * يرمي خطأ 403 إذا لم يكن لدى المستخدم الصلاحية
 */
export async function requireApiPermission(permission: Permission) {
  const session = await getSession();
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const hasAccess = sessionHasPermission(session, permission);
  
  if (!hasAccess) {
    throw new Error('Forbidden - ليس لديك الصلاحية المطلوبة');
  }
}

/**
 * التحقق من أي صلاحية من قائمة في API route
 */
export async function requireApiAnyPermission(permissions: Permission[]) {
  const session = await getSession();
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const hasAccess = sessionHasAny(session, permissions);
  
  if (!hasAccess) {
    throw new Error('Forbidden - ليس لديك أي من الصلاحيات المطلوبة');
  }
}
