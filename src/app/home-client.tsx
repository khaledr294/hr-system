"use client";
import PremiumDashboard from "@/components/premium/PremiumDashboard";
import DashboardLayout from "@/components/DashboardLayout";
import KpiCards from "@/components/premium/KpiCards";
import Charts from "@/components/premium/Charts";
import ActivityLog from "@/components/premium/ActivityLog";
import LastUpdated from "@/components/LastUpdated";
import { useTheme } from "@/components/ThemeProvider";

export default function HomeClient() {
  const { theme, mounted } = useTheme();
  if (!mounted) return null;
  if (theme === "premium") {
    return <PremiumDashboard />;
  }
  return (
    <DashboardLayout>
      <div dir="rtl" className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">الملخص</h1>
          <KpiCards />
        </div>
        <div>
          <LastUpdated className="mb-3" />
          <Charts />
        </div>
        <div>
          <ActivityLog />
        </div>
      </div>
    </DashboardLayout>
  );
}
