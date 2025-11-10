import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">الإعدادات</h1>
          <p className="text-slate-600">إدارة إعدادات النظام والتخصيص</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Theme Settings Card */}
          <Link href="/settings/theme" className="group">
            <div className="border-2 border-slate-900 bg-white p-6 hover:bg-slate-50 transition-all duration-200">
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 text-white p-3 border-2 border-slate-900">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mr-4">إعدادات المظهر</h3>
              </div>
              <p className="text-slate-600 mb-4">
                اختر التصميم المناسب لك من بين التصاميم المتاحة
              </p>
              <div className="flex items-center text-blue-600 font-bold">
                <span>تخصيص المظهر</span>
                <svg className="w-4 h-4 mr-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* General Settings Card */}
          <Link href="/settings/general" className="group">
            <div className="border-2 border-slate-900 bg-white p-6 hover:bg-slate-50 transition-all duration-200">
              <div className="flex items-center mb-4">
                <div className="bg-green-600 text-white p-3 border-2 border-slate-900">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mr-4">الإعدادات العامة</h3>
              </div>
              <p className="text-slate-600 mb-4">
                إعدادات الشركة والنظام والتفضيلات العامة والأمان
              </p>
              <div className="flex items-center text-blue-600 font-bold">
                <span>إعدادات الشركة والنظام</span>
                <svg className="w-4 h-4 mr-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Backup Settings Card */}
          <div className="border-2 border-slate-900 bg-white p-6 opacity-50">
            <div className="flex items-center mb-4">
              <div className="bg-green-600 text-white p-3 border-2 border-slate-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mr-4">النسخ الاحتياطي</h3>
            </div>
            <p className="text-slate-600 mb-4">
              إدارة النسخ الاحتياطية واستعادة البيانات
            </p>
            <div className="flex items-center text-slate-400 font-bold">
              <span>قريباً...</span>
            </div>
          </div>

          {/* Security Settings Card */}
          <div className="border-2 border-slate-900 bg-white p-6 opacity-50">
            <div className="flex items-center mb-4">
              <div className="bg-red-600 text-white p-3 border-2 border-slate-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mr-4">الأمان والخصوصية</h3>
            </div>
            <p className="text-slate-600 mb-4">
              إعدادات الأمان وحماية الحساب
            </p>
            <div className="flex items-center text-slate-400 font-bold">
              <span>قريباً...</span>
            </div>
          </div>
        </div>
      </div>
  );
}
