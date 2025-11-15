import { Permission } from "@prisma/client";
import { requirePermission } from "@/lib/page-protection";
import ReportsClientPage from "./ReportsClientPage";

export default async function ReportsPage() {
  await requirePermission(Permission.VIEW_REPORTS);
  return <ReportsClientPage />;
}
