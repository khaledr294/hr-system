import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Security headers to apply to all responses
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

// Protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/workers",
  "/clients",
  "/contracts",
  "/payroll",
  "/salaries",
  "/settings",
  "/users",
  "/admin",
  "/reports",
  "/premium",
  "/nationality-salary",
];

// Public routes that don't require authentication
const publicRoutes = ["/", "/auth/login", "/auth/register", "/api/auth"];

// Blocked routes (old test pages that should return 404)
const blockedRoutes = ["/test-apis", "/test-session", "/test-simple"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip for static files and API routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Block access to test routes
  if (blockedRoutes.some((route) => pathname.startsWith(route))) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Create response with security headers
  const response = NextResponse.next();

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const session = await auth();

    if (!session?.user) {
      // Redirect to login if not authenticated
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Prevent access to sensitive files
  const sensitivePatterns = [/\.env/i, /\.git/i, /prisma\/.*\.ts$/i, /\.sql$/i];

  if (sensitivePatterns.some((pattern) => pattern.test(pathname))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
