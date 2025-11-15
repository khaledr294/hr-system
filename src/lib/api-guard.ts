import { NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { Permission } from "@prisma/client";
import { auth } from "@/lib/auth";
import { hasAllPermissions, hasAnyPermission } from "@/lib/permissions";
import { createLog } from "@/lib/logger";

export type ApiGuardMode = "all" | "any";

export interface ApiGuardOptions {
  permissions?: Permission[];
  mode?: ApiGuardMode;
  auditAction?: string;
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
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    try {
      const response = await handler({ req, context, session });

      if (options.auditAction) {
        await createLog(session.user.id, options.auditAction, `API ${req.method} ${req.nextUrl.pathname}`);
      }

      return response;
    } catch (error) {
      console.error("API handler error:", req.nextUrl.pathname, error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  };
}
