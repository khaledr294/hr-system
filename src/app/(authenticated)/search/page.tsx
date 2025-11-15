import { Permission } from "@prisma/client";
import { requirePermission } from "@/lib/page-protection";
import SearchClientPage from "./SearchClientPage";

export default async function AdvancedSearchPage() {
  await requirePermission(Permission.VIEW_SEARCH);
  return <SearchClientPage />;
}

