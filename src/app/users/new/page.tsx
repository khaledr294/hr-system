import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import NewUserForm from "@/components/NewUserForm";
import { requireHR } from "@/lib/require";

export default async function NewUserPage() {
  await requireHR(); // This will redirect if not HR role

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate">
              إضافة مستخدم جديد
            </h2>
            <p className="mt-1 text-sm text-slate-700 font-bold">
              إنشاء حساب جديد وتعيين الصلاحيات المناسبة
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:mr-4">
            <Link
              href="/users"
              className="inline-flex items-center px-4 py-2 border-2 border-slate-900 text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              العودة للمستخدمين
            </Link>
          </div>
        </div>

        <NewUserForm />
      </div>
    </DashboardLayout>
  );
}

