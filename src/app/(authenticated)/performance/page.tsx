import { Permission } from "@prisma/client";
import { requirePermission } from "@/lib/page-protection";
import PerformanceClientPage from "./PerformanceClientPage";

export default async function PerformancePage() {
  await requirePermission(Permission.VIEW_PERFORMANCE);
  return <PerformanceClientPage />;
}
