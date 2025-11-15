import { Permission } from "@prisma/client";
import { requirePermission } from "@/lib/page-protection";
import PayrollClient from "./PayrollClient";

export default async function PayrollPage() {
  await requirePermission(Permission.VIEW_PAYROLL);
  return <PayrollClient />;
}
