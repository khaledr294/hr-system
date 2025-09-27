import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  try {
    // محاولة الحصول على token بعدة طرق للتأكد
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
      cookieName: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token'
    });
    
    const { nextUrl } = req;
    const path = nextUrl.pathname;

    console.log("🔒 Middleware - Path:", path);
    console.log("� Cookie names in request:", Object.keys(req.cookies.getAll().reduce((acc, cookie) => {
      acc[cookie.name] = cookie.value;
      return acc;
    }, {} as Record<string, string>)));
    
    if (token) {
      console.log("✅ Token found:", { 
        id: token.id, 
        name: token.name, 
        role: token.role,
        exp: token.exp ? new Date(token.exp * 1000).toISOString() : 'no expiry',
        sub: token.sub
      });
    } else {
      console.log("❌ No token found");
    }

    // إذا كان المستخدم مسجل دخول ويحاول الوصول لصفحة تسجيل الدخول
    if (token && path === '/auth/login') {
      console.log("➡️ Redirecting logged-in user from login to dashboard");
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // إذا لم يكن مسجل دخول ويحاول الوصول لصفحة محمية
    if (!token && path !== '/auth/login') {
      console.log("❌ Redirecting unauthenticated user to login");
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // التحقق من الصلاحيات للصفحات الحساسة
    if (token && path.startsWith('/users') && !['ADMIN', 'HR_MANAGER'].includes(token.role as string)) {
      console.log("⚠️ Redirecting user with insufficient permissions");
      return NextResponse.redirect(new URL('/workers', req.url));
    }

    console.log("✅ Middleware passed, allowing request");
    return NextResponse.next();
  } catch (error) {
    console.error("💥 Middleware error:", error);
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}

export const config = { 
  matcher: [
    '/auth/login',
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
