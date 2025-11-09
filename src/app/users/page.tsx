import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteUserButton from "@/components/DeleteUserButton";
import DashboardLayout from "@/components/DashboardLayout";
import { requireHR } from "@/lib/require";

export const revalidate = 20; // Cache page for 20 seconds

const roleLabels = {
  HR: "مدير الموارد البشرية",
  GENERAL_MANAGER: "المدير العام", 
  MARKETER: "مسوق",
  STAFF: "موظف"
};

async function getUsers() {
  return await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export default async function UsersPage() {
  const currentUser = await requireHR(); // This will redirect if not HR role
  
  const users = await getUsers();
  
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <div className="bg-blue-600 p-3 border-2 border-slate-900 mr-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold leading-tight text-slate-900">
                  إدارة المستخدمين
                </h1>
                <p className="mt-1 text-base text-slate-700 font-bold">
                  إضافة وإدارة مستخدمي النظام وصلاحياتهم
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex md:mt-0 md:mr-4">
            <Link
              href="/users/new"
              className="inline-flex items-center px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border-2 border-slate-900"
            >
              <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              إضافة مستخدم جديد
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div key={user.id} className="bg-white border-2 border-slate-900 hover:bg-slate-50 transition-all duration-200">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 bg-slate-200 border-2 border-slate-900 flex items-center justify-center">
                      <span className="text-slate-900 font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="mr-4 flex-1 min-w-0">
                    <div className="flex items-center">
                      <h3 className="text-lg font-bold text-slate-900 truncate">
                        {user.name}
                      </h3>
                      {user.id === currentUser.id && (
                        <span className="mr-2 inline-flex items-center px-2 py-1 text-xs font-bold bg-green-200 text-green-800 border-2 border-green-600">
                          أنت
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 font-bold truncate">{user.email}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <span className={`inline-flex items-center px-3 py-1.5 text-sm font-bold border-2 ${
                    user.role === 'HR_MANAGER' 
                      ? 'bg-blue-200 text-blue-800 border-blue-600'
                      : user.role === 'GENERAL_MANAGER'
                      ? 'bg-purple-200 text-purple-800 border-purple-600'
                      : user.role === 'MARKETER'
                      ? 'bg-green-200 text-green-800 border-green-600'
                      : 'bg-slate-200 text-slate-800 border-slate-600'
                  }`}>
                    {roleLabels[user.role as keyof typeof roleLabels] || user.role}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t-2 border-slate-300">
                  <Link
                    href={`/users/${user.id}/edit`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold border-2 border-slate-900 transition-all duration-200"
                  >
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    تعديل
                  </Link>
                  {user.id !== currentUser.id && (
                    <DeleteUserButton userId={user.id} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

