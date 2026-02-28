import { NextResponse } from "next/server";
import { getTrialStatus } from "@/lib/trial-guard";
import { auth } from "@/lib/auth";

/**
 * GET /api/system/trial-status
 * Returns trial/subscription status and sets cookie for middleware.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trialStatus = await getTrialStatus();

  const response = NextResponse.json({
    status: trialStatus.status,
    isReadOnly: trialStatus.isReadOnly,
    daysRemaining: trialStatus.daysRemaining,
    trialEndDate: trialStatus.trialEndDate,
  });

  // Set cookie for middleware to read (lightweight, no DB call needed in middleware)
  response.cookies.set("x-subscription-status", trialStatus.status, {
    httpOnly: false, // Frontend JS needs to read this
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 120, // 2 minutes — re-checked on next API call
  });

  return response;
}
