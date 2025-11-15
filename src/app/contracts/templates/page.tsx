'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import { mergeVariables, generateSampleData } from '@/lib/contract-templates-client';

export default function ContractTemplatesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [templateExists, setTemplateExists] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // استخدام templateExists للحالة المستقبلية
  console.log('Template exists status:', templateExists);

  // التحقق من الصلاحيات
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/login');
      return;
    }

    const userRole = session.user.role;
    if (userRole !== 'HR_MANAGER' && userRole !== 'GENERAL_MANAGER') {
      router.push('/unauthorized');
      return;
    }
  }, [session, status, router]);

  // فحص وجود القالب عند تحميل الصفحة
  const checkTemplateExists = async () => {
    try {
      const response = await fetch('/api/templates/download-default', { method: 'HEAD' });
      setTemplateExists(response.ok);
    } catch (error) {
      console.error('خطأ في فحص القالب:', error);
      setTemplateExists(false);
    }
  };

  // تحميل القالب الافتراضي
  const handleDownloadDefault = async () => {
    try {
      const response = await fetch('/api/templates/download-default');
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'contract-template.docx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert('تم تحميل القالب الافتراضي بنجاح');
      } else {
        alert('فشل في تحميل القالب الافتراضي');
      }
    } catch (error) {
      console.error('خطأ في تحميل القالب:', error);
      alert('خطأ في تحميل القالب');
    }
  };

  // رفع قالب جديد
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('يرجى اختيار ملف القالب');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('template', selectedFile);

      console.log('📤 رفع القالب:', selectedFile.name, selectedFile.size, 'بايت');

      // المحاولة الأولى مع API الأصلي
      let response = await fetch('/api/templates/upload', {
        method: 'POST',
        body: formData,
      });

      // إذا فشل، جرب API البديل
      if (!response.ok) {
        console.log('🔄 تجربة API البديل...');
        response = await fetch('/api/templates/upload-v2', {
          method: 'POST',
          body: formData,
        });
      }

      const result = await response.json();

      if (response.ok && result.success !== false) {
        alert(result.message || 'تم رفع القالب بنجاح');
        setTemplateExists(true);
        setSelectedFile(null);
        // إعادة فحص وجود القالب
        await checkTemplateExists();
      } else {
        console.error('فشل الرفع:', result);
        alert(result.message || 'فشل في رفع القالب');
      }
    } catch (error) {
      console.error('خطأ في رفع القالب:', error);
      alert('خطأ في رفع القالب: ' + (error instanceof Error ? error.message : 'خطأ غير معروف'));
    } finally {
      setIsUploading(false);
    }
  };

  // إنتاج وثيقة تجريبية
  const handleGenerateSample = async () => {
    setIsGenerating(true);
    try {
      const sampleData = generateSampleData();
      
      const response = await fetch('/api/templates/generate-docx-new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contractData: sampleData }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sample-contract-${Date.now()}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert('تم إنتاج الوثيقة التجريبية بنجاح');
      } else {
        const error = await response.json();
        alert(error.message || 'فشل في إنتاج الوثيقة');
      }
    } catch (error) {
      console.error('خطأ في إنتاج الوثيقة:', error);
      alert('خطأ في إنتاج الوثيقة');
    } finally {
      setIsGenerating(false);
    }
  };

  // نسخ المتغير إلى الحافظة
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(`{{${text}}}`);
    alert(`تم نسخ {{${text}}}`);
  };

  // تشغيل فحص القالب عند تحميل الصفحة
  useEffect(() => {
    checkTemplateExists();
  }, []);

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-7xl" dir="rtl">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة قوالب العقود</h1>
              <p className="text-lg text-gray-700">
                قم بإدارة قوالب Word للعقود ودمج البيانات تلقائياً
              </p>
            </div>
            <div className="text-6xl">📄</div>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* قسم إدارة القوالب */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center mb-6">
            <span className="text-2xl ml-3">⚙️</span>
            <h2 className="text-2xl font-bold text-gray-900">
              إدارة القوالب
            </h2>
          </div>

          {/* تحميل القالب الافتراضي */}
          <div className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
            <div className="flex items-center mb-3">
              <span className="text-xl ml-2">📥</span>
              <h3 className="text-lg font-bold text-gray-900">القالب الافتراضي</h3>
            </div>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              قالب جاهز باللغة العربية مع جميع المتغيرات الأساسية
            </p>
            <Button 
              onClick={handleDownloadDefault}
              className="w-full"
              variant="secondary"
            >
              📥 تحميل القالب الافتراضي
            </Button>
          </div>

          {/* رفع قالب مخصص */}
          <div className="mb-8 p-6 bg-green-50 border-l-4 border-green-500 rounded-lg">
            <div className="flex items-center mb-3">
              <span className="text-xl ml-2">📤</span>
              <h3 className="text-lg font-bold text-gray-900">رفع قالب مخصص</h3>
            </div>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              ارفع قالب Word مخصص يحتوي على متغيرات الدمج
            </p>
            
            <input
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setSelectedFile(file);
                if (file) {
                  console.log('📁 ملف مختار:', file.name, file.size, 'بايت', file.type);
                }
              }}
              className="block w-full text-base text-gray-700
                file:mr-4 file:py-3 file:px-6
                file:rounded-lg file:border-0
                file:text-base file:font-bold
                file:bg-green-500 file:text-white
                hover:file:bg-green-600 file:shadow-md
                file:transition-all file:duration-200
                mb-4 border border-gray-300 rounded-lg p-2
                focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            
            {selectedFile && (
              <div className="mb-4 p-4 bg-white rounded-lg border border-green-200 text-sm shadow-sm">
                <div className="flex items-center mb-2">
                  <span className="text-green-600 ml-2">✅</span>
                  <strong className="text-gray-900">الملف المختار:</strong>
                </div>
                <div className="space-y-1 text-gray-700">
                  <div><strong>الاسم:</strong> {selectedFile.name}</div>
                  <div><strong>الحجم:</strong> {(selectedFile.size / 1024).toFixed(1)} KB</div>
                  <div><strong>النوع:</strong> {selectedFile.type || 'غير محدد'}</div>
                </div>
              </div>
            )}
            
            <Button 
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full"
            >
              {isUploading ? '⏳ جارٍ الرفع...' : '📤 رفع القالب'}
            </Button>
          </div>

          {/* إنتاج وثيقة تجريبية */}
          <div className="p-6 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
            <div className="flex items-center mb-3">
              <span className="text-xl ml-2">🧪</span>
              <h3 className="text-lg font-bold text-gray-900">اختبار القالب</h3>
            </div>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              إنتج وثيقة تجريبية لاختبار القالب مع بيانات عينة
            </p>
            <div className="space-y-3">
              <Button 
                onClick={handleGenerateSample}
                disabled={isGenerating}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3"
              >
                {isGenerating ? '⏳ جارٍ الإنتاج...' : '📄 إنتاج وثيقة Word تجريبية'}
              </Button>
            </div>
          </div>
        </div>

        {/* قسم متغيرات الدمج */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center mb-6">
            <span className="text-2xl ml-3">🏷️</span>
            <h2 className="text-2xl font-bold text-gray-900">
              متغيرات الدمج
            </h2>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg mb-6">
            <p className="text-base text-gray-800 leading-relaxed">
              <span className="font-semibold">💡 كيفية الاستخدام:</span> انقر على أي متغير لنسخه إلى الحافظة واستخدامه في القالب
            </p>
          </div>

          <div className="space-y-6">
            {Object.entries(mergeVariables).map(([categoryKey, category]) => (
              <div key={categoryKey} className="border-b border-gray-200 pb-6 mb-6 last:border-b-0">
                <div className="flex items-center mb-4">
                  <span className="text-lg ml-2">📋</span>
                  <h3 className="text-xl font-bold text-gray-900">
                    {category.title}
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {category.variables.map((variable) => (
                    <button
                      key={variable.key}
                      onClick={() => copyToClipboard(variable.key)}
                      className="flex justify-between items-center p-4 rounded-lg 
                        border border-gray-200 hover:border-blue-400 
                        hover:bg-blue-50 hover:shadow-md transition-all duration-200 text-right
                        group cursor-pointer active:bg-blue-100"
                    >
                      <div className="flex items-center text-blue-600 group-hover:text-blue-700">
                        <span className="text-sm font-medium ml-2">انقر للنسخ</span>
                        <span className="text-lg">📋</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 text-base mb-1">
                          {variable.label}
                        </div>
                        <div className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                          {'{{' + variable.key + '}}'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* نصائح للاستخدام */}
          <div className="mt-8 p-6 bg-linear-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
            <div className="flex items-center mb-4">
              <span className="text-2xl ml-3">💡</span>
              <h4 className="text-lg font-bold text-purple-900">نصائح مهمة للاستخدام</h4>
            </div>
            <ul className="text-base text-purple-800 space-y-3 text-right leading-relaxed">
              <li className="flex items-start">
                <span className="text-purple-600 ml-2 mt-1">✓</span>
                <span>استخدم الأقواس المزدوجة <code className="bg-purple-100 px-2 py-1 rounded text-purple-900">{'{{متغير}}'}</code> في القالب</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 ml-2 mt-1">✓</span>
                <span>احفظ القالب بصيغة <code className="bg-purple-100 px-2 py-1 rounded text-purple-900">.docx</code> فقط</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 ml-2 mt-1">✓</span>
                <span>تأكد من التنسيق العربي (RTL) في Microsoft Word</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 ml-2 mt-1">✓</span>
                <span>اختبر القالب دائماً بالبيانات التجريبية قبل الاستخدام النهائي</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
