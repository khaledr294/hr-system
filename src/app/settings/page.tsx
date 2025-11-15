import { Permission } from "@prisma/client";
import { requirePermission } from "@/lib/page-protection";
import SettingsClientPage from "./SettingsClientPage";

export default async function SettingsPage() {
  await requirePermission(Permission.MANAGE_SETTINGS);
  return <SettingsClientPage />;
}
