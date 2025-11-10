import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Keep the proxy lightweight so NextAuth can manage sessions at the page level
export default function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (
    path === "/auth/login" ||
    path.startsWith("/api/") ||
    path.startsWith("/_next/") ||
    path === "/favicon.ico" ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  // Allow the request to continue so route-level guards handle protection
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
