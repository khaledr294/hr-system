import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { nextUrl } = req;
  const path = nextUrl.pathname;

  // إذا كان المستخدم مسجل دخول ويحاول الوصول لصفحة تسجيل الدخول
  if (token && path === '/auth/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // إذا لم يكن مسجل دخول ويحاول الوصول لصفحة محمية
  if (!token && path !== '/auth/login') {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // التحقق من الصلاحيات للصفحات الحساسة
  if (token && path.startsWith('/users') && !['ADMIN', 'HR_MANAGER'].includes(token.role as string)) {
    return NextResponse.redirect(new URL('/workers', req.url));
  }

  return NextResponse.next();
}

export const config = { 
  matcher: [
    '/dashboard/:path*',
    '/workers/:path*',
    '/clients/:path*', 
    '/contracts/:path*',
    '/nationality-salary/:path*',
    '/payroll/:path*',
    '/users/:path*',
    '/marketers/:path*',
    '/settings/:path*'
  ]
};
