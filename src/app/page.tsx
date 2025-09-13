import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <DashboardLayout>
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          مرحبا بك في نظام شركة ساعد للإستقدام
        </h1>
        <p className="text-gray-600">
          يمكنك إدارة العمال والعملاء والعقود من خلال القائمة في الأعلى
        </p>
      </div>
    </DashboardLayout>
  );
}
