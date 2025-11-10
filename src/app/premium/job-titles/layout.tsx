import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import PremiumPageShell from "@/components/premium/PremiumPageShell";
import { hasPermission } from "@/lib/permissions";

export default async function JobTitlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // التحقق من تسجيل الدخول
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // التحقق من صلاحية إدارة المسميات الوظيفية
  const canManage = await hasPermission(session.user.id, "MANAGE_JOB_TITLES");
  if (!canManage) {
    redirect("/403");
  }

  return (
    <PremiumPageShell title="المسميات الوظيفية">
      {children}
    </PremiumPageShell>
  );
}
