import PremiumPageShell from "@/components/premium/PremiumPageShell";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <PremiumPageShell>
      {children}
    </PremiumPageShell>
  );
}
