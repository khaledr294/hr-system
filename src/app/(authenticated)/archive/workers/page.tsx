import { Permission } from "@prisma/client";
import { requirePermission } from "@/lib/page-protection";
import ArchivedWorkersClientPage from "./ArchivedWorkersClientPage";

export default async function ArchivedWorkersPage() {
  await requirePermission(Permission.VIEW_ARCHIVE);
  return <ArchivedWorkersClientPage />;
}
