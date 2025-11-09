"use client";
import PremiumDashboard from "@/components/premium/PremiumDashboard";
import type { DashboardStats } from "@/components/DashboardDataProvider";

export default function HomeClient({ data }: { data: DashboardStats }) {
  // Always use Premium Dashboard
  return <PremiumDashboard data={data} />;
}
