import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import EditUserForm from "@/components/EditUserForm";
import { requireHR } from "@/lib/require";

export default async function EditUserPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  await requireHR(); // This will redirect if not HR role
  
  const user = await prisma.user.findUnique({ 
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      jobTitleId: true
    }
  });
  
  if (!user) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="mr-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  المستخدم غير موجود
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>المستخدم المطلوب غير موجود أو تم حذفه.</p>
                </div>
                <div className="mt-4">
                  <Link
                    href="/users"
                    className="text-yellow-800 font-medium underline hover:text-yellow-600"
                  >
                    العودة لقائمة المستخدمين
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              تعديل المستخدم: {user.name}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              تحديث البيانات والصلاحيات
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:mr-4">
            <Link
              href="/users"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              العودة للمستخدمين
            </Link>
          </div>
        </div>

        <EditUserForm user={{
          id: user.id,
          name: user.name,
          email: user.email || "",
          jobTitleId: user.jobTitleId
        }} />
      </div>
    </DashboardLayout>
  );
}
