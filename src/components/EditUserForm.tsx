"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RolePermissionsSummary from "./RolePermissionsSummary";

const roles = [
  { value: "HR", label: "مدير الموارد البشرية" },
  { value: "GENERAL_MANAGER", label: "المدير العام" },
  { value: "MARKETER", label: "مسوق" },
  { value: "STAFF", label: "موظف" },
];

interface EditUserFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export default function EditUserForm({ user }: EditUserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        router.push("/users");
      } else {
        const data = await response.json();
        setError(data.error || "حدث خطأ أثناء تحديث المستخدم");
      }
    } catch {
      setError("حدث خطأ أثناء تحديث المستخدم");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow-lg rounded-xl border border-amber-200 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-700 to-yellow-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white">تعديل بيانات المستخدم</h3>
            <p className="mt-1 text-amber-100">
              تحديث المعلومات الشخصية والصلاحيات
            </p>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-base font-semibold text-gray-800 mb-2">
                    الاسم الكامل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    defaultValue={user.name}
                    className="w-full px-4 py-3 text-base border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="أدخل الاسم الكامل"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-base font-semibold text-gray-800 mb-2">
                    البريد الإلكتروني <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    defaultValue={user.email}
                    className="w-full px-4 py-3 text-base border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="password" className="block text-base font-semibold text-gray-800 mb-2">
                    كلمة المرور الجديدة
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    minLength={6}
                    className="w-full px-4 py-3 text-base border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="اتركها فارغة للاحتفاظ بكلمة المرور الحالية"
                  />
                  <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    💡 اتركها فارغة إذا كنت لا تريد تغيير كلمة المرور الحالية
                  </p>
                </div>

                <div>
                  <label htmlFor="role" className="block text-base font-semibold text-gray-800 mb-2">
                    الدور والصلاحيات <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    id="role"
                    required
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-4 py-3 text-base border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 bg-white text-gray-900"
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value} className="text-gray-900 bg-white">
                        {role.label}
                      </option>
                    ))}
                  </select>
                  
                  <RolePermissionsSummary selectedRole={selectedRole} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-red-100 p-2 rounded-full">
                  <svg className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-bold text-red-800">
                  حدث خطأ!
                </h3>
                <div className="mt-2 text-base text-red-700 font-medium">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 rounded-b-xl">
          <div className="flex justify-end space-x-4 space-x-reverse">
            <button
              type="button"
              onClick={() => router.push("/users")}
              className="inline-flex items-center px-6 py-3 border-2 border-amber-300 rounded-lg shadow-sm text-base font-medium text-amber-700 bg-white hover:bg-amber-50 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200"
            >
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent shadow-lg text-base font-bold rounded-lg text-white bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  حفظ التعديلات
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}