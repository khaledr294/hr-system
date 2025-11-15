import { Permission } from "@prisma/client";
import { requirePermission } from "@/lib/page-protection";
import PayrollDeliveryClient from "./PayrollDeliveryClient";

export default async function PayrollDeliveryPage() {
  await requirePermission(Permission.VIEW_PAYROLL_DELIVERY);
  return <PayrollDeliveryClient />;
}
