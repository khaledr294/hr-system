import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default async function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
