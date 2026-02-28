import { prisma } from "@/lib/prisma";

// Force dynamic rendering — this page reads from DB
export const dynamic = "force-dynamic";

export default async function TrialExpiredPage() {
  let settings = null;
  try {
    settings = await prisma.systemSettings.findUnique({
      where: { id: "system" },
      select: {
        companyName: true,
        phone: true,
        trialEndDate: true,
        subscriptionStatus: true,
      },
    });
  } catch {
    // DB may not have trial fields yet — graceful fallback
  }

  const expiredDate = settings?.trialEndDate
    ? new Intl.DateTimeFormat("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(settings.trialEndDate)
    : null;

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4"
    >
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          انتهت فترة التجربة
        </h1>

        <p className="text-gray-600 leading-relaxed">
          انتهت الفترة التجريبية لنظام{" "}
          <span className="font-semibold">
            {settings?.companyName || "إدارة الموارد البشرية"}
          </span>
          . البيانات محفوظة بأمان ويمكنك الاطلاع عليها، لكن لا يمكن إجراء أي
          تعديلات حتى يتم تفعيل الاشتراك.
        </p>

        {expiredDate && (
          <p className="text-sm text-gray-500">
            تاريخ انتهاء التجربة: {expiredDate}
          </p>
        )}

        <div className="bg-blue-50 rounded-xl p-4 space-y-2">
          <p className="font-semibold text-blue-900">للترقية إلى الاشتراك الكامل</p>
          <p className="text-blue-700">
            تواصل معنا عبر الهاتف:{" "}
            <span dir="ltr" className="font-mono">
              {settings?.phone || "—"}
            </span>
          </p>
        </div>

        <a
          href="/auth/login"
          className="inline-block px-6 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
        >
          العودة لتسجيل الدخول
        </a>
      </div>
    </div>
  );
}
