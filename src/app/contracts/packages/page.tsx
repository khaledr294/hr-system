import { Permission } from "@prisma/client";
import { requirePermission } from "@/lib/page-protection";
import PackagesClientPage from "./PackagesClientPage";

export default async function PackagesPage() {
  await requirePermission(Permission.MANAGE_PACKAGES);
  return <PackagesClientPage />;
}

