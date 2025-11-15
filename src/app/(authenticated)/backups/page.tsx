import { Permission } from "@prisma/client";
import { requirePermission } from "@/lib/page-protection";
import BackupsClientPage from "./BackupsClientPage";

export default async function BackupsPage() {
  await requirePermission(Permission.MANAGE_BACKUPS);
  return <BackupsClientPage />;
}

