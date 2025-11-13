'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function MigrationPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; manualSQL?: string } | null>(null);

  const runMigration = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/migrate', {
        method: 'POST',
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">تشغيل Migration للحقول الجديدة</h1>
        
        <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <p className="text-blue-800 font-bold mb-2">
            ℹ️ حول هذه الصفحة:
          </p>
          <p className="text-blue-800">
            هذه الصفحة تقوم بإضافة حقل <code className="bg-blue-100 px-2 py-1 rounded">medicalStatus</code> إلى جدول العاملات.
          </p>
          <p className="text-blue-700 mt-2 text-sm">
            الحقل يتتبع حالة الفحص الطبي: لائق، غير لائق، أو بانتظار التقرير.
          </p>
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded">
            <p className="text-yellow-800 text-sm font-semibold">
              ⚠️ ملاحظة: إذا فشل التنفيذ التلقائي، ستحتاج لإضافة الحقل يدوياً عبر Prisma Studio
            </p>
          </div>
        </div>

        <button
          onClick={runMigration}
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'جاري التنفيذ...' : 'تشغيل Migration'}
        </button>

        {result && (
          <div className={`mt-6 p-4 rounded-lg border-2 ${
            result.success 
              ? 'bg-green-50 border-green-300' 
              : 'bg-red-50 border-red-300'
          }`}>
            <h3 className={`font-bold mb-2 ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.success ? '✅ نجح' : '❌ فشل'}
            </h3>
            <p className={result.success ? 'text-green-700' : 'text-red-700'}>
              {result.message}
            </p>
            
            {result.manualSQL && (
              <div className="mt-4 p-4 bg-gray-50 rounded border-2 border-gray-300">
                <h4 className="text-sm text-gray-900 font-bold mb-3">
                  📋 دليل إضافة الحقل يدوياً عبر Prisma Studio:
                </h4>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-600 min-w-6">1.</span>
                    <div>
                      <p className="text-gray-800">افتح مشروعك في Prisma:</p>
                      <a 
                        href="https://console.prisma.io" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block mt-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                      >
                        فتح Prisma Console →
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-600 min-w-6">2.</span>
                    <p className="text-gray-800">اضغط على مشروعك ثم اختر <strong>&quot;Data Browser&quot;</strong></p>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-600 min-w-6">3.</span>
                    <p className="text-gray-800">من القائمة الجانبية، اضغط على <strong>&quot;Worker&quot;</strong></p>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-600 min-w-6">4.</span>
                    <div className="flex-1">
                      <p className="text-gray-800 mb-2">في أعلى الصفحة، ابحث عن زر <strong>&quot;Add field&quot;</strong> أو <strong>&quot;+&quot;</strong></p>
                      <div className="p-2 bg-white border border-gray-300 rounded text-xs">
                        <p className="text-gray-600 mb-1">أضف الحقل بهذه الإعدادات:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          <li><strong>Field name:</strong> medicalStatus</li>
                          <li><strong>Type:</strong> String (Text)</li>
                          <li><strong>Default value:</strong> &quot;PENDING_REPORT&quot;</li>
                          <li><strong>Optional:</strong> نعم (اختياري)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-600 min-w-6">5.</span>
                    <p className="text-gray-800">احفظ التغييرات واضغط <strong>&quot;Apply Changes&quot;</strong></p>
                  </div>

                  <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded">
                    <p className="text-green-800 text-xs">
                      ✅ بعد إضافة الحقل، قم بتحديث الصفحة وجرب زر &quot;تشغيل Migration&quot; مرة أخرى
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-100 rounded border border-gray-300">
                  <p className="text-xs text-gray-600 font-semibold mb-2">
                    بديل: إذا لم تجد خيار Add field، استخدم هذا الأمر SQL:
                  </p>
                  <code className="block p-2 bg-white rounded text-xs overflow-x-auto font-mono">
                    {result.manualSQL}
                  </code>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-2">ملاحظة:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• هذه العملية آمنة ويمكن تكرارها بدون مشاكل</li>
            <li>• إذا كان الحقل موجوداً بالفعل، سيتم تخطي الإضافة</li>
            <li>• فقط HR Manager يمكنه تشغيل هذه العملية</li>
            <li>• في حالة فشل التنفيذ، يمكن تنفيذ الأمر يدوياً عبر console.prisma.io</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
