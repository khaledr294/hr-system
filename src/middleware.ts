import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/auth/login'
  }
});

export const config = { matcher: [
  '/workers/:path*',
  '/clients/:path*',
  '/contracts/:path*',
  '/nationality-salary/:path*',
  '/payroll/:path*',
  '/users/:path*'
]};
