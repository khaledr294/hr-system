"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

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
        ],
        href: "/salaries", // Placeholder, can be routed to payroll tab later
      },
    ],
    href: "/workers", // Default route for parent
  },
  { name: "العملاء", href: "/clients" },
  { name: "العقود", href: "/contracts" },
  { name: "المسوقين", href: "/marketers" },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-indigo-600 shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex items-center md:hidden">
                <button
                  type="button"
                  className="text-indigo-50 hover:text-white p-2"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <span className="sr-only">افتح القائمة</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-shrink-0 items-center">
                <span className="text-white text-xl font-bold">شركة ساعد للإستقدام</span>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8 md:space-x-reverse">
                {navigation.map((item) =>
                  item.children ? (
                    <div key={item.name} className="relative group">
                      <Link
                        href={item.href}
                        className={classNames(
                          "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium",
                          pathname.startsWith(item.href)
                            ? "border-white text-white"
                            : "border-transparent text-indigo-50 hover:border-indigo-200 hover:text-white"
                        )}
                      >
                        {item.name}
                      </Link>
                      <div className="absolute right-0 z-10 hidden min-w-[180px] bg-white shadow-lg group-hover:block">
                        {item.children.map((sub) =>
                          sub.children ? (
                            <div key={sub.name} className="relative group">
                              <Link
                                href={sub.href}
                                className="block px-4 py-2 text-right text-indigo-700 hover:bg-indigo-50"
                              >
                                {sub.name}
                              </Link>
                              <div className="absolute right-full top-0 z-20 hidden min-w-[180px] bg-white shadow-lg group-hover:block">
                                {sub.children.map((subsub) => (
                                  <Link
                                    key={subsub.name}
                                    href={subsub.href}
                                    className="block px-4 py-2 text-right text-indigo-700 hover:bg-indigo-50"
                                  >
                                    {subsub.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              className="block px-4 py-2 text-right text-indigo-700 hover:bg-indigo-50"
                            >
                              {sub.name}
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium",
                        pathname === item.href
                          ? "border-white text-white"
                          : "border-transparent text-indigo-50 hover:border-indigo-200 hover:text-white"
                      )}
                    >
                      {item.name}
                    </Link>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center">
              {session ? (
                <div className="flex items-center space-x-4 space-x-reverse">
                  <span className="text-white">{session.user?.name}</span>
                  <button
                    onClick={() => signOut()}
                    className="text-indigo-50 hover:text-white"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="text-indigo-50 hover:text-white"
                >
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="md:hidden">
          <div
            className={classNames(
              "space-y-1 pb-3 pt-2",
              sidebarOpen ? "block" : "hidden"
            )}
          >
            {navigation.map((item) =>
              item.children ? (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className={classNames(
                      "block border-r-4 py-2 pr-3 pl-4 text-base font-medium",
                      pathname.startsWith(item.href)
                        ? "border-white bg-indigo-50 text-indigo-700"
                        : "border-transparent text-indigo-50 hover:border-indigo-200 hover:bg-indigo-500 hover:text-white"
                    )}
                  >
                    {item.name}
                  </Link>
                  <div className="pl-4">
                    {item.children.map((sub) =>
                      sub.children ? (
                        <div key={sub.name}>
                          <Link
                            href={sub.href}
                            className="block py-2 pr-3 text-base text-indigo-700 hover:bg-indigo-50"
                          >
                            {sub.name}
                          </Link>
                          <div className="pl-4">
                            {sub.children.map((subsub) => (
                              <Link
                                key={subsub.name}
                                href={subsub.href}
                                className="block py-2 pr-3 text-base text-indigo-700 hover:bg-indigo-50"
                              >
                                {subsub.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className="block py-2 pr-3 text-base text-indigo-700 hover:bg-indigo-50"
                        >
                          {sub.name}
                        </Link>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    "block border-r-4 py-2 pr-3 pl-4 text-base font-medium",
                    pathname === item.href
                      ? "border-white bg-indigo-50 text-indigo-700"
                      : "border-transparent text-indigo-50 hover:border-indigo-200 hover:bg-indigo-500 hover:text-white"
                  )}
                >
                  {item.name}
                </Link>
              )
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
