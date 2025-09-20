import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const path = request.nextUrl.pathname;

  const isPublicPath = path === '/auth/login' ||
    path.startsWith('/_next') ||
    path.startsWith('/api/auth') ||
    path === '/favicon.ico';

  // Debug logging
  console.log('🔍 Middleware - Path:', path, 'Has token:', !!token, 'Token role:', token?.role);
  console.log('🔍 Token details:', token);
  console.log('🔍 Is public path:', isPublicPath);

  if (!token && !isPublicPath) {
    // fallback: إذا وُجد كوكي جلسة نسمح بالعبور (يحدث أحياناً سباق قبل فك الـ JWT)
    const hasSessionCookie = Array.from(request.cookies.getAll()).some(c => c.name.includes('next-auth.session-token'));
    if (!hasSessionCookie) {
      console.log('Redirecting to login - no token & no session cookie for protected path:', path);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  if (token && path === '/auth/login') {
    return NextResponse.redirect(new URL('/workers', request.url));
  }

  // حماية صفحات إدارة المستخدمين للـ HR فقط
  if (path.startsWith('/users') && token?.role !== 'HR') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // حماية صفحات العاملات والرواتب للـ HR فقط
  if ((path.startsWith('/workers') || path.startsWith('/nationality-salary') || path.startsWith('/payroll')) && token?.role !== 'HR') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // المدير العام: فقط لوحة المعلومات الرئيسية
  if (token?.role === 'GENERAL_MANAGER' && path !== '/' && !path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // المسوق: فقط إضافة العملاء والعقود
  if (token?.role === 'MARKETER' && !(path.startsWith('/clients') || path.startsWith('/contracts'))) {
    return NextResponse.redirect(new URL('/clients', request.url));
  }

  const res = NextResponse.next();
  // منع التخزين المؤقت للاستجابة للمسارات المحمية خاصة الصفحة الرئيسية
  if (path === '/' || !isPublicPath) {
    res.headers.set('Cache-Control', 'no-store');
  }
  return res;
}

export const config = {
  matcher: [
    '/',
    '/workers/:path*',
    '/clients/:path*',
    '/contracts/:path*',
    '/nationality-salary/:path*',
    '/((?!auth|api|_next/static|_next/image|favicon.ico).*)',
  ],
};
