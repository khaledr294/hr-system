import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { nextauth, nextUrl } = req;
    const token = nextauth?.token;
    const path = nextUrl.pathname;

    if (token && path === '/auth/login') {
      return NextResponse.redirect(new URL('/workers', req.url));
    }
    return NextResponse.next();
  },
  {
    pages: {
      signIn: '/auth/login'
    }
  }
);

export const config = { matcher: [
  '/dashboard',
  '/workers/:path*',
  '/clients/:path*',
  '/contracts/:path*',
  '/nationality-salary/:path*',
  '/payroll/:path*',
  '/users/:path*'
]};
