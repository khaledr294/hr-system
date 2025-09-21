"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Login page loaded successfully");
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log("Form submission started");
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const identifier = formData.get("identifier") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        identifier,
        password,
        callbackUrl: '/dashboard',
        redirect: false, // تغيير إلى false لمعالجة النتيجة يدوياً
      });
      
      if (res?.error) {
        setError("بيانات تسجيل الدخول غير صحيحة");
      } else if (res?.ok) {
        // إنجاح تسجيل الدخول - إعادة توجيه يدوياً
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("حدث خطأ في النظام");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-slate-100 to-blue-50 py-12 sm:px-6 lg:px-8" dir="rtl">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto w-24 h-24 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg border border-white/20">
          <span className="text-2xl font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>ساعد</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
          تسجيل الدخول
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-sm px-4 py-8 shadow-xl border border-white/50 sm:rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="identifier"
                className="block text-right text-sm font-bold text-slate-800"
                style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.1)' }}
              >
                اسم المستخدم أو البريد الإلكتروني
              </label>
              <div className="mt-1 text-left" dir="ltr">
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  className="block w-full appearance-none rounded-lg border-2 border-slate-300 px-3 py-3 placeholder-slate-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm text-slate-900 font-bold focus:text-indigo-900 bg-white/90"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-right text-sm font-bold text-slate-800"
                style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.1)' }}
              >
                كلمة المرور
              </label>
              <div className="mt-1 text-left" dir="ltr">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full appearance-none rounded-lg border-2 border-slate-300 px-3 py-3 placeholder-slate-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm text-slate-900 font-bold focus:text-indigo-900 bg-white/90"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-100 p-4 border-2 border-red-200">
                <div className="flex">
                  <div className="mr-3">
                    <h3 className="text-sm font-bold text-red-900" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.1)' }}>{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-lg border border-transparent bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:from-indigo-400 disabled:to-blue-400 transition-all duration-200"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}
              >
                {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}