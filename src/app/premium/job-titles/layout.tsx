import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import PremiumPageShell from "@/components/premium/PremiumPageShell";

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

  // التحقق من صلاحية HR_MANAGER فقط
  if (session.user.role !== "HR_MANAGER") {
    redirect("/premium/dashboard");
  }

  return (
    <PremiumPageShell title="المسميات الوظيفية">
      {children}
    </PremiumPageShell>
  );
}
