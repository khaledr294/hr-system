import { Permission } from "@prisma/client";
import { requirePermission } from "@/lib/page-protection";
import NationalitySalaryClient from "./NationalitySalaryClient";

export default async function NationalitySalaryPage() {
  await requirePermission(Permission.MANAGE_PAYROLL);
  return <NationalitySalaryClient />;
}
