"use client";

import { useState, useEffect } from "react";

interface SystemSettings {
  companyName: string;
  commercialRegister: string | null;
  address: string | null;
  phone: string | null;
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  notifyContractExpiry: boolean;
  notifyNewWorker: boolean;
  notifyPayment: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  enableActivityLogging: boolean;
}

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    companyName: "شركة ساعد للإستقدام",
    commercialRegister: "",
    address: "",
    phone: "",
    language: "ar",
    timezone: "Asia/Riyadh",
    dateFormat: "dd/mm/yyyy",
    currency: "SAR",
    notifyContractExpiry: true,
    notifyNewWorker: true,
    notifyPayment: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    enableActivityLogging: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.status === 403) {
        setError("ليس لديك صلاحية الوصول إلى الإعدادات");
        return;
      }
      if (!response.ok) {
        throw new Error("فشل في جلب الإعدادات");
      }
      const data = await response.json();
      setSettings(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError("حدث خطأ أثناء جلب الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "فشل في حفظ الإعدادات");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      console.error("Error saving settings:", err);
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">الإعدادات العامة</h1>
          <p className="text-slate-600">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">الإعدادات العامة</h1>
          <div className="bg-red-50 border-2 border-red-600 text-red-900 px-4 py-3 font-bold">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">الإعدادات العامة</h1>
        <p className="text-slate-600">إدارة إعدادات النظام والتفضيلات العامة</p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-600 text-red-900 px-4 py-3 font-bold">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-2 border-green-600 text-green-900 px-4 py-3 font-bold">
          ✓ تم حفظ الإعدادات بنجاح
        </div>
      )}

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
              name="companyName"
              value={settings.companyName}
              onChange={handleChange}
              className="w-full px-3 py-2 border-2 border-slate-300 focus:border-blue-600 text-slate-900 font-bold"
              placeholder="اسم الشركة"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">رقم السجل التجاري</label>
            <input
              type="text"
              name="commercialRegister"
              value={settings.commercialRegister || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border-2 border-slate-300 focus:border-blue-600 text-slate-900 font-bold"
              placeholder="رقم السجل التجاري"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">العنوان</label>
            <input
              type="text"
              name="address"
              value={settings.address || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border-2 border-slate-300 focus:border-blue-600 text-slate-900 font-bold"
              placeholder="عنوان الشركة"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">رقم الهاتف</label>
            <input
              type="text"
              name="phone"
              value={settings.phone || ""}
              onChange={handleChange}
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
              <select
                name="language"
                value={settings.language}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-slate-300 focus:border-blue-600 text-slate-900 font-bold"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">المنطقة الزمنية</label>
              <select
                name="timezone"
                value={settings.timezone}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-slate-300 focus:border-blue-600 text-slate-900 font-bold"
              >
                <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                <option value="Asia/Dubai">دبي (GMT+4)</option>
                <option value="Asia/Kuwait">الكويت (GMT+3)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">تنسيق التاريخ</label>
              <select
                name="dateFormat"
                value={settings.dateFormat}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-slate-300 focus:border-blue-600 text-slate-900 font-bold"
              >
                <option value="dd/mm/yyyy">يوم/شهر/سنة</option>
                <option value="mm/dd/yyyy">شهر/يوم/سنة</option>
                <option value="yyyy-mm-dd">سنة-شهر-يوم</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">العملة الافتراضية</label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-slate-300 focus:border-blue-600 text-slate-900 font-bold"
              >
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
                <input
                  type="checkbox"
                  name="notifyContractExpiry"
                  checked={settings.notifyContractExpiry}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none border-2 border-slate-900 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-900 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">تنبيهات العمالة الجديدة</h3>
                <p className="text-sm text-slate-600">إرسال تنبيه عند إضافة عاملة جديدة</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="notifyNewWorker"
                  checked={settings.notifyNewWorker}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none border-2 border-slate-900 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-900 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">تنبيهات الدفع</h3>
                <p className="text-sm text-slate-600">إرسال تنبيه عند استحقاق المدفوعات</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="notifyPayment"
                  checked={settings.notifyPayment}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none border-2 border-slate-900 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-900 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                name="sessionTimeout"
                value={settings.sessionTimeout}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-slate-300 focus:border-blue-600 text-slate-900 font-bold"
                min="15"
                max="480"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">الحد الأقصى لمحاولات تسجيل الدخول</label>
              <input
                type="number"
                name="maxLoginAttempts"
                value={settings.maxLoginAttempts}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-slate-300 focus:border-blue-600 text-slate-900 font-bold"
                min="3"
                max="10"
              />
            </div>
          </div>
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900">المصادقة الثنائية غير متاحة</h3>
              <p className="text-sm text-slate-600 mt-1">
                تم إيقاف خيار المصادقة الثنائية بقرار إداري. إذا تقرر إعادتها لاحقاً فسيتم الإعلان عن ذلك في تحديث لاحق للنظام.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">تسجيل الأنشطة</h3>
                <p className="text-sm text-slate-600">تتبع جميع العمليات في النظام</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="enableActivityLogging"
                  checked={settings.enableActivityLogging}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none border-2 border-slate-900 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-900 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white font-bold border-2 border-slate-900 hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </div>
    </form>
  );
}
