"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Session } from "next-auth";

const navigation = [
  { name: "الرئيسية", href: "/" },
  {
    name: "العمالة",
    children: [
      { name: "إضافة و عرض العاملات", href: "/workers" },
      {
        name: "الرواتب",
        children: [
          { name: "تحديد الجنسيات و الرواتب", href: "/nationality-salary" },
          { name: "حساب الرواتب الشهرية", href: "/payroll" },
        ],
        href: "/payroll",
      },
    ],
    href: "/workers",
  },
  { name: "العملاء", href: "/clients" },
  {
    name: "العقود",
    children: [
      { name: "عرض العقود", href: "/contracts" },
      { name: "إدارة قوالب Word", href: "/contracts/templates" },
      { name: "الباقات والخدمات", href: "/contracts/packages" },
    ],
    href: "/contracts",
  },
  {
    name: "المسوقين",
    children: [
      { name: "عرض المسوقين", href: "/marketers" },
      { name: "تقارير", href: "/marketers/reports" },
    ],
    href: "/marketers",
  },
  {
    name: "الإعدادات",
    children: [
      { name: "إعدادات المظهر", href: "/settings/theme" },
      { name: "الإعدادات العامة", href: "/settings/general" },
    ],
    href: "/settings",
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function NavLinks({ session, pathname }: { session: Session | null; pathname: string }) {
  return (
    <>
      {navigation.map((item) => (
        <div key={item.name} className="relative group">
          <Link
            href={item.href}
            className={classNames(
              "inline-flex items-center px-4 py-2.5 mx-1 text-sm font-bold whitespace-nowrap transition-all duration-200",
              pathname.startsWith(item.href)
                ? "bg-white text-slate-900 shadow-lg border-2 border-slate-900"
                : "text-white bg-transparent hover:bg-slate-700 hover:text-white border-2 border-transparent hover:border-white"
            )}
          >
            {item.name}
            {item.children && (
              <svg className="w-4 h-4 mr-1 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </Link>
          {item.children && (
            <div className="absolute right-0 top-full z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
              <div className="bg-white rounded-none overflow-hidden mt-2 min-w-[260px] border-2 border-slate-900 shadow-2xl">
                <div className="py-0">
                  {item.children.map((sub) => (
                    <div key={sub.name}>
                      <Link
                        href={sub.href}
                        className="block px-5 py-3 text-right text-slate-900 font-bold hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 border-b-2 border-slate-300 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <span>{sub.name}</span>
                          <div className="w-2 h-2 bg-slate-900"></div>
                        </div>
                      </Link>
                      {sub.children && (
                        <div className="bg-slate-200 border-t-2 border-slate-400">
                          {sub.children.map((subsub) => (
                            <Link
                              key={subsub.name}
                              href={subsub.href}
                              className="block px-7 py-2.5 text-right text-slate-900 text-sm font-bold hover:bg-slate-300 hover:text-slate-900 transition-all duration-200"
                            >
                              <div className="flex items-center justify-between">
                                <span>• {subsub.name}</span>
                                <div className="w-1.5 h-1.5 bg-slate-900"></div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      {session?.user?.role === "HR" && (
        <Link
          href="/users"
          className={classNames(
            "inline-flex items-center px-4 py-2.5 mx-1 text-sm font-bold whitespace-nowrap transition-all duration-200",
            pathname.startsWith("/users")
              ? "bg-white text-slate-900 shadow-lg border-2 border-slate-900"
              : "text-white hover:bg-slate-900 hover:text-white border-2 border-transparent hover:border-white"
          )}
        >
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          إدارة المستخدمين
        </Link>
      )}
    </>
  );
}

function MobileNavLinks({ session, pathname }: { session: Session | null; pathname: string }) {
  return (
    <>
      {navigation.map((item) => (
        <div key={item.name}>
          <Link
            href={item.href}
            className={classNames(
              "block border-r-4 py-3 pr-4 pl-6 text-lg font-semibold",
              pathname.startsWith(item.href)
                ? "border-white bg-indigo-50 text-indigo-700"
                : "border-transparent text-indigo-50 hover:border-indigo-200 hover:bg-indigo-500 hover:text-white"
            )}
          >
            {item.name}
          </Link>
          {item.children && (
            <div className="pl-4">
              {item.children.map((sub) => (
                <div key={sub.name}>
                  <Link
                    href={sub.href}
                    className="block px-4 py-2 text-right text-indigo-700 hover:bg-yellow-50"
                  >
                    {sub.name}
                  </Link>
                  {sub.children && (
                    <div className="pl-4">
                      {sub.children.map((subsub) => (
                        <Link
                          key={subsub.name}
                          href={subsub.href}
                          className="block px-4 py-2 text-right text-indigo-700 hover:bg-yellow-50"
                        >
                          {subsub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      {session?.user?.role === "HR" && (
        <Link
          href="/users"
          className={classNames(
            "block border-r-4 py-3 pr-4 pl-6 text-lg font-semibold",
            pathname.startsWith("/users")
              ? "border-white bg-indigo-50 text-indigo-700"
              : "border-transparent text-indigo-50 hover:border-indigo-200 hover:bg-indigo-500 hover:text-white"
          )}
        >
          إدارة المستخدمين
        </Link>
      )}
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // إذا كانت الجلسة قيد التحميل، أظهر شاشة تحميل
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-slate-800 shadow-xl border-b-4 border-slate-900">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
          <div className="flex h-20 justify-between items-center">
            <div className="flex items-center min-w-0 flex-1">
              <div className="flex items-center md:hidden">
                <button
                  type="button"
                  className="text-white hover:text-slate-300 p-2.5 hover:bg-slate-700 transition-all duration-200"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <span className="sr-only">افتح القائمة</span>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center ml-2 min-w-0">
                <div className="bg-white p-2 flex-shrink-0 border-2 border-slate-900">
                  <svg className="h-7 w-7 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div className="mr-3 min-w-0">
                  <h1 className="text-white text-xl font-bold leading-tight truncate">
                    شركة ساعد
                  </h1>
                  <p className="text-slate-300 text-sm font-bold leading-tight">
                    نظام إدارة الموارد البشرية
                  </p>
                </div>
              </div>
              <div className="hidden lg:mr-6 lg:flex lg:space-x-1 lg:space-x-reverse">
                <NavLinks session={session} pathname={pathname} />
              </div>
            </div>
            <div className="flex items-center flex-shrink-0">
              {session ? (
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="text-right ml-3 hidden sm:block">
                    <div className="text-white font-bold text-sm leading-tight truncate max-w-36">
                      {session.user?.name || session.user?.email}
                    </div>
                    <div className="text-slate-300 text-xs font-bold leading-tight">
                      {session.user?.role === 'HR' ? 'مدير الموارد البشرية' : 
                       session.user?.role === 'GENERAL_MANAGER' ? 'المدير العام' :
                       session.user?.role === 'MARKETER' ? 'مسوق' : 'موظف'}
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-white border-2 border-slate-900 flex items-center justify-center">
                    <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="inline-flex items-center text-slate-900 bg-white hover:bg-slate-200 px-4 py-2.5 font-bold text-sm transition-all duration-200 border-2 border-slate-900"
                  >
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    خروج
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3 space-x-reverse">
                  <span className="text-slate-200 text-sm font-medium hidden sm:block">غير مسجل</span>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center text-slate-900 bg-white hover:bg-slate-200 px-4 py-2.5 font-bold text-sm transition-all duration-200 border-2 border-slate-900"
                  >
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    دخول
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Mobile Sidebar */}
        <div className="md:hidden">
          <div
            className={classNames(
              "space-y-2 pb-4 pt-3",
              sidebarOpen ? "block" : "hidden"
            )}
          >
            <MobileNavLinks session={session} pathname={pathname} />
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border-2 border-slate-900 min-h-[calc(100vh-140px)] p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
