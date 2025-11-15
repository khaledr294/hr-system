import { Permission } from "@prisma/client";
import { requirePermission } from "@/lib/page-protection";
import ArchiveClientPage from "./ArchiveClientPage";

export default async function ArchivePage() {
  await requirePermission(Permission.VIEW_ARCHIVE);
  return <ArchiveClientPage />;
}

