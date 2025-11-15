import { Permission } from "@prisma/client";
import { requirePermission } from "@/lib/page-protection";
import UsersClientPage from "./UsersClientPage";

export default async function UsersPage() {
  await requirePermission(Permission.VIEW_USERS);
  return <UsersClientPage />;
}

