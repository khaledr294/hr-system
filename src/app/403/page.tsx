import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function ForbiddenPage() {
  return (
  <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <ShieldAlert className="h-16 w-16 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          403
        </h1>
        
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          غير مصرح بالدخول
        </h2>
        
        <p className="text-gray-600 mb-6">
          ليس لديك الصلاحية للوصول إلى هذه الصفحة. يرجى التواسل مع مدير الموارد البشرية إذا كنت تعتقد أن هذا خطأ.
        </p>
        
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            العودة للرئيسية
          </Link>
          
          <Link
            href="/dashboard/users"
            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            الاتصال بمدير الموارد البشرية
          </Link>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            إذا كنت بحاجة لصلاحيات إضافية، يمكنك التواصل مع مدير الموارد البشرية لتحديث صلاحياتك.
          </p>
        </div>
      </div>
    </div>
  );
}
