import { NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { Permission } from "@prisma/client";
import { auth } from "@/lib/auth";
import { hasAllPermissions, hasAnyPermission } from "@/lib/permissions";
import { createLog } from "@/lib/logger";

export type ApiGuardMode = "all" | "any";

// Rate limiting storage (in-memory for simplicity)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Security headers
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

export interface ApiGuardOptions {
  permissions?: Permission[];
  mode?: ApiGuardMode;
  auditAction?: string;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}

export interface ApiHandlerContext<TContext> {
  req: NextRequest;
  context: TContext;
  session: Session;
}

type ApiHandler<TContext> = (args: ApiHandlerContext<TContext>) => Promise<Response> | Response;

export function withApiAuth<TContext = Record<string, never>>(
  options: ApiGuardOptions,
  handler: ApiHandler<TContext>
) {
  return async (req: NextRequest, context: TContext) => {
    // Apply security headers to all responses
    const addSecurityHeaders = (response: Response) => {
      const newResponse = new Response(response.body, response);
      Object.entries(securityHeaders).forEach(([key, value]) => {
        newResponse.headers.set(key, value);
      });
      return newResponse;
    };

    // Rate limiting check
    if (options.rateLimit) {
      const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                       req.headers.get("x-real-ip") || 
                       "unknown";
      const key = `${clientIP}:${req.nextUrl.pathname}`;
      const now = Date.now();
      const rateData = rateLimitMap.get(key);

      if (rateData) {
        if (now < rateData.resetTime) {
          if (rateData.count >= options.rateLimit.maxRequests) {
            return addSecurityHeaders(
              NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429, headers: { "Retry-After": String(Math.ceil((rateData.resetTime - now) / 1000)) } }
              )
            );
          }
          rateData.count++;
        } else {
          rateLimitMap.set(key, { count: 1, resetTime: now + options.rateLimit.windowMs });
        }
      } else {
        rateLimitMap.set(key, { count: 1, resetTime: now + options.rateLimit.windowMs });
      }

      // Clean up old entries periodically
      if (rateLimitMap.size > 10000) {
        const entries = Array.from(rateLimitMap.entries());
        entries.filter(([, v]) => v.resetTime < now).forEach(([k]) => rateLimitMap.delete(k));
      }
    }

    const session = await auth();

    if (!session?.user) {
      return addSecurityHeaders(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      );
    }

    if (options.permissions?.length) {
      const hasAccess = (options.mode ?? "all") === "any"
        ? hasAnyPermission(session.user.permissions ?? [], options.permissions)
        : hasAllPermissions(session.user.permissions ?? [], options.permissions);

      if (!hasAccess) {
        await createLog(
          session.user.id,
          "PERMISSION_DENIED",
          `Blocked API access to ${req.nextUrl.pathname} (missing: ${options.permissions.join(", ")})`,
          "api",
          req.nextUrl.pathname
        );
        return addSecurityHeaders(
          NextResponse.json({ error: "Forbidden" }, { status: 403 })
        );
      }
    }

    try {
      const response = await handler({ req, context, session });

      if (options.auditAction) {
        await createLog(session.user.id, options.auditAction, `API ${req.method} ${req.nextUrl.pathname}`);
      }

      return addSecurityHeaders(response);
    } catch (error) {
      console.error("API handler error:", req.nextUrl.pathname, error);
      
      // Log the error for security monitoring
      if (session?.user?.id) {
        await createLog(
          session.user.id,
          "API_ERROR",
          `Error in ${req.method} ${req.nextUrl.pathname}: ${error instanceof Error ? error.message : "Unknown error"}`,
          "api",
          req.nextUrl.pathname
        ).catch(() => {}); // Ignore logging errors
      }

      return addSecurityHeaders(
        NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
      );
    }
  };
}
