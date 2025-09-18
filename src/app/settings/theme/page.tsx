'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import NoSSR from '@/components/NoSSR';

type ThemeType = 'sharp' | 'premium';

const themes: Record<ThemeType, { name: string; description: string; preview: string }> = {
  sharp: {
    name: 'حاد',
    description: 'تصميم حاد بحواف مربعة وألوان قوية',
    preview: 'bg-slate-900 text-white border-2 border-slate-900',
  },
  premium: {
    name: 'بريميوم',
    description: 'تصميم راقٍ مستوحى من أفضل SaaS مع زجاجية وتدرجات ناعمة',
    preview: 'bg-gradient-to-br from-indigo-500 via-sky-400 to-pink-400 text-white rounded-2xl shadow-lg',
  },
};

export default function ThemeSettingsPage() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>('sharp');
  const [isLoading, setIsLoading] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme') as ThemeType;
    if (savedTheme && themes[savedTheme]) {
      setSelectedTheme(savedTheme);
    }
  }, []);

  const handleThemeChange = async (theme: ThemeType) => {
    if (theme === selectedTheme) return;
    
    setIsLoading(true);
    
    // Save to localStorage
    localStorage.setItem('selectedTheme', theme);
    setSelectedTheme(theme);
    
    // Apply theme immediately by updating CSS classes on document
    document.documentElement.className = `theme-${theme}`;
    
    // Show loading for smooth transition
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  return (
    <DashboardLayout>
      <NoSSR fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="font-bold text-slate-900">جاري تحميل الإعدادات...</p>
          </div>
        </div>
      }>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">إعدادات المظهر</h1>
            <p className="text-slate-600">اختر التصميم الذي يناسبك من الخيارات التالية</p>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(themes).map(([themeKey, theme]) => (
            <div
              key={themeKey}
              className={`border-2 p-6 cursor-pointer transition-all duration-200 ${
                selectedTheme === themeKey
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-300 bg-white hover:border-slate-400'
              }`}
              onClick={() => handleThemeChange(themeKey as ThemeType)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">{theme.name}</h3>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedTheme === themeKey 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-slate-300'
                }`}>
                  {selectedTheme === themeKey && (
                    <div className="w-full h-full bg-white rounded-full scale-50"></div>
                  )}
                </div>
              </div>

              <p className="text-slate-600 mb-4">{theme.description}</p>

              {/* Theme Preview */}
              <div className="space-y-3">
                <div className={`p-3 ${theme.preview} transition-all duration-200`}>
                  <p className="font-bold">معاينة الزر</p>
                </div>
                
                <div className={`p-3 border ${
                  themeKey === 'sharp' 
                    ? 'border-2 border-slate-900 bg-white' 
                    : 'border border-slate-200 bg-slate-50 rounded-lg'
                }`}>
                  <p className="text-slate-900 font-bold">معاينة البطاقة</p>
                  <p className="text-slate-600 text-sm">نص فرعي</p>
                </div>
              </div>

              {selectedTheme === themeKey && (
                <div className="mt-4 flex items-center text-blue-600">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold">التصميم المحدد حالياً</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 border-2 border-slate-900 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="font-bold text-slate-900">جاري تطبيق التصميم...</p>
            </div>
          </div>
        )}

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-bold text-blue-900 mb-2">ملاحظة:</h4>
            <p className="text-blue-800 text-sm">
              سيتم تطبيق التصميم المحدد على جميع صفحات النظام. قد يحتاج المتصفح إلى إعادة تحميل لتطبيق جميع التغييرات.
            </p>
            <p className="text-blue-800 text-sm mt-2">
              خيار إضافي: جرّب لوحة &quot;بريميوم&quot; التجريبية من الرابط
              <a href="/dashboard" className="text-blue-700 underline mx-1">/dashboard</a>
              لعرض نمط واجهة متقدم بتأثيرات حديثة.
            </p>
          </div>
        </div>
      </NoSSR>
    </DashboardLayout>
  );
}