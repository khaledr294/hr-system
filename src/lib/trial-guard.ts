import { prisma } from "@/lib/prisma";

export interface TrialStatus {
  isReadOnly: boolean;
  daysRemaining: number;
  status: "trial" | "active" | "expired" | "suspended";
  trialEndDate: Date | null;
}

// In-memory cache (60 second TTL)
let cachedStatus: TrialStatus | null = null;
let cacheExpiry = 0;

/**
 * Check the current subscription/trial status from SystemSettings.
 * Caches result for 60 seconds to avoid DB queries on every request.
 */
export async function getTrialStatus(): Promise<TrialStatus> {
  const now = Date.now();

  if (cachedStatus && now < cacheExpiry) {
    return cachedStatus;
  }

  const settings = await prisma.systemSettings.findUnique({
    where: { id: "system" },
    select: {
      subscriptionStatus: true,
      trialEndDate: true,
      isTrialActive: true,
    },
  });

  if (!settings) {
    // No settings row — treat as active (first-time setup)
    const fallback: TrialStatus = {
      isReadOnly: false,
      daysRemaining: -1,
      status: "active",
      trialEndDate: null,
    };
    cachedStatus = fallback;
    cacheExpiry = now + 60_000;
    return fallback;
  }

  let status = settings.subscriptionStatus as TrialStatus["status"];
  let isReadOnly = false;

  // Auto-detect expiry for trial accounts
  if (status === "trial" && settings.trialEndDate) {
    const remaining = settings.trialEndDate.getTime() - now;
    if (remaining <= 0) {
      status = "expired";
      isReadOnly = true;
      // Update DB asynchronously (don't block the request)
      prisma.systemSettings
        .update({
          where: { id: "system" },
          data: { subscriptionStatus: "expired", isTrialActive: false },
        })
        .catch(() => {});
    }
  }

  if (status === "expired" || status === "suspended") {
    isReadOnly = true;
  }

  const daysRemaining = settings.trialEndDate
    ? Math.max(0, Math.ceil((settings.trialEndDate.getTime() - now) / 86_400_000))
    : -1; // -1 = no trial end date (active subscription)

  const result: TrialStatus = {
    isReadOnly,
    daysRemaining,
    status,
    trialEndDate: settings.trialEndDate,
  };

  cachedStatus = result;
  cacheExpiry = now + 60_000;
  return result;
}

/** Force-clear the cached status (e.g. after admin changes subscription) */
export function clearTrialCache() {
  cachedStatus = null;
  cacheExpiry = 0;
}
