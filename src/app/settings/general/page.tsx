import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export default async function GeneralSettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/auth/login');
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">الإعدادات العامة</h1>
          <p className="text-slate-600">إدارة إعدادات النظام والتفضيلات العامة</p>
        </div>

        {/* Company Information Section */}
        <div className="bg-white border-2 border-slate-900 p-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-600 text-white p-3 border-2 border-slate-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h4a1 1 0 011 1v5m-6 0V9a1 1 0 011-1h4a1 1 0 011 1v8.5" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mr-4">معلومات الشركة</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">اسم الشركة</label>
              <input
                type="text"
                defaultValue="شركة ساعد للإستقدام"
                className="w-full px-3 py-2 border-2 border-slate-300 focus:border-blue-600 text-slate-900 font-bold"
                placeholder="اسم الشركة"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">رقم السجل التجاري</label>
              <input
                type="text"
                className="w-full px-3 py-2 border-2 border-slate-300 focus:border-blue-600 text-slate-900 font-bold"
                placeholder="رقم السجل التجاري"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">العنوان</label>
              <input
                type="text"
                className="w-full px-3 py-2 border-2 border-slate-300 focus:border-blue-600 text-slate-900 font-bold"
                placeholder="عنوان الشركة"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">رقم الهاتف</label>
              <input
                type="text"
                className="w-full px-3 py-2 border-2 border-slate-300 focus:border-blue-600 text-slate-900 font-bold"
                placeholder="رقم الهاتف"
              />
            </div>
          </div>
        </div>

        {/* System Preferences Section */}
        <div className="bg-white border-2 border-slate-900 p-6">
          <div className="flex items-center mb-4">
            <div className="bg-green-600 text-white p-3 border-2 border-slate-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mr-4">تفضيلات النظام</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">اللغة الافتراضية</label>
              <select className="w-full px-3 py-2 border-2 border-slate-300 focus:border-blue-600 text-slate-900 font-bold">
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">المنطقة الزمنية</label>
              <select className="w-full px-3 py-2 border-2 border-slate-300 focus:border-blue-600 text-slate-900 font-bold">
                <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                <option value="Asia/Dubai">دبي (GMT+4)</option>
                <option value="Asia/Kuwait">الكويت (GMT+3)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">تنسيق التاريخ</label>
              <select className="w-full px-3 py-2 border-2 border-slate-300 focus:border-blue-600 text-slate-900 font-bold">
                <option value="dd/mm/yyyy">يوم/شهر/سنة</option>
                <option value="mm/dd/yyyy">شهر/يوم/سنة</option>
                <option value="yyyy-mm-dd">سنة-شهر-يوم</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">العملة الافتراضية</label>
              <select className="w-full px-3 py-2 border-2 border-slate-300 focus:border-blue-600 text-slate-900 font-bold">
                <option value="SAR">ريال سعودي</option>
                <option value="AED">درهم إماراتي</option>
                <option value="KWD">دينار كويتي</option>
                <option value="USD">دولار أمريكي</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings Section */}
        <div className="bg-white border-2 border-slate-900 p-6">
          <div className="flex items-center mb-4">
            <div className="bg-yellow-600 text-white p-3 border-2 border-slate-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6h5l-5-5v5H4v6z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mr-4">إعدادات التنبيهات</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">تنبيهات انتهاء العقود</h3>
                <p className="text-sm text-slate-600">إرسال تنبيه قبل انتهاء العقد</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none border-2 border-slate-900 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-900 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">تنبيهات العمالة الجديدة</h3>
                <p className="text-sm text-slate-600">إرسال تنبيه عند إضافة عاملة جديدة</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none border-2 border-slate-900 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-900 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">تنبيهات الدفع</h3>
                <p className="text-sm text-slate-600">إرسال تنبيه عند استحقاق المدفوعات</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none border-2 border-slate-900 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-900 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings Section */}
        <div className="bg-white border-2 border-slate-900 p-6">
          <div className="flex items-center mb-4">
            <div className="bg-red-600 text-white p-3 border-2 border-slate-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mr-4">إعدادات الأمان</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">مدة انتهاء الجلسة (بالدقائق)</label>
              <input
                type="number"
                defaultValue="60"
                className="w-full px-3 py-2 border-2 border-slate-300 focus:border-blue-600 text-slate-900 font-bold"
                min="15"
                max="480"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">الحد الأقصى لمحاولات تسجيل الدخول</label>
              <input
                type="number"
                defaultValue="5"
                className="w-full px-3 py-2 border-2 border-slate-300 focus:border-blue-600 text-slate-900 font-bold"
                min="3"
                max="10"
              />
            </div>
          </div>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">تفعيل المصادقة الثنائية</h3>
                <p className="text-sm text-slate-600">إضافة طبقة حماية إضافية للحساب</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none border-2 border-slate-900 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-900 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">تسجيل الأنشطة</h3>
                <p className="text-sm text-slate-600">تتبع جميع العمليات في النظام</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none border-2 border-slate-900 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-900 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="px-6 py-3 bg-blue-600 text-white font-bold border-2 border-slate-900 hover:bg-blue-700 transition-colors duration-200">
            حفظ الإعدادات
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
