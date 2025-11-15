import { Permission } from "@prisma/client";
import { requirePermission } from "@/lib/page-protection";
import TemplatesClientPage from "./TemplatesClientPage";

export default async function ContractTemplatesPage() {
  await requirePermission(Permission.MANAGE_TEMPLATES);
  return <TemplatesClientPage />;
}
