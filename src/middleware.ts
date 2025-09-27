import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simplified middleware that doesn't interfere with NextAuth
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Always allow access to login page and API routes
  if (
    path === '/auth/login' ||
    path.startsWith('/api/') ||
    path.startsWith('/_next/') ||
    path === '/favicon.ico' ||
    path.includes('.')
  ) {
    return NextResponse.next();
  }

  // For protected pages, let NextAuth handle authentication at page level
  // This prevents middleware from interfering with NextAuth session management
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
