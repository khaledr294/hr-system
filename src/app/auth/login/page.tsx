"use client";

import { useState } from "react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔥 تم الضغط على زر تسجيل الدخول!");
    
    setIsLoading(true);
    setError("");
    
    try {
      // Get form data
      const formData = new FormData(e.target as HTMLFormElement);
      const identifier = formData.get("username") as string;
      const password = formData.get("password") as string;
      
      console.log("📝 محاولة تسجيل دخول للمستخدم:", identifier);
      console.log("🔑 كلمة المرور موجودة:", !!password);
      
      if (!identifier || !password) {
        console.log("❌ بيانات ناقصة!");
        setError("يرجى إدخال جميع البيانات المطلوبة");
        return;
      }
      
      const { signIn } = await import("next-auth/react");
      console.log("⚡ بدء عملية تسجيل الدخول...");
      
      const result = await signIn("credentials", {
        identifier,
        password,
        redirect: false
      });
      
      console.log("🔍 نتيجة تسجيل الدخول الكاملة:", JSON.stringify(result, null, 2));
      
      if (result?.error) {
        console.log("❌ فشل تسجيل الدخول:", result.error);
        setError(`فشل في تسجيل الدخول: ${result.error}`);
      } else if (result?.ok) {
        console.log("✅ تم تسجيل الدخول بنجاح!");
        console.log("🔄 التوجه إلى Dashboard...");
        
        // تأخير قصير للتأكد من حفظ الجلسة
        setTimeout(() => {
          window.location.replace("/dashboard");
        }, 500);
      } else {
        console.log("⚠️ نتيجة غير متوقعة:", result);
        setError("حدث خطأ غير متوقع");
      }
    } catch (error) {
      console.error("💥 خطأ في تسجيل الدخول:", error);
      setError("حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">شركة ساعد للإستقدام</h2>
          <p className="mt-2 text-sm text-gray-600">نظام إدارة الموارد البشرية</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                اسم المستخدم أو البريد الإلكتروني
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                defaultValue="admin"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition duration-200"
                placeholder="أدخل اسم المستخدم"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                defaultValue="123456"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition duration-200"
                placeholder="أدخل كلمة المرور"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex">
                  <svg className="h-5 w-5 text-red-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white
                transition duration-200 transform hover:scale-105
                ${isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }
              `}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري تسجيل الدخول...
                </div>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center mb-2">بيانات تجريبية للاختبار:</p>
            <div className="grid grid-cols-1 gap-1 text-xs text-gray-700">
              <div className="flex justify-between">
                <span>👤 مدير النظام:</span>
                <span>admin / 123456</span>
              </div>
              <div className="flex justify-between">
                <span>👨‍💼 مدير موارد بشرية:</span>
                <span>nader@saed-hr.com / 123456</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          © 2025 شركة ساعد للإستقدام. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  );
}
