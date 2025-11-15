import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <ShieldAlert className="w-16 h-16 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          غير مصرح لك
        </h1>
        
        <p className="text-gray-600 mb-8">
          عذراً، ليس لديك صلاحية الوصول إلى هذه الصفحة.
          <br />
          يرجى التواصل مع مدير النظام إذا كنت تعتقد أن هذا خطأ.
        </p>
        
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            العودة للصفحة الرئيسية
          </Link>
          
          <Link
            href="/dashboard"
            className="block w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            لوحة التحكم
          </Link>
        </div>
      </div>
    </div>
  );
}
