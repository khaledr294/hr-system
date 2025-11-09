'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { generateSampleData } from '@/lib/contract-templates-client';

interface GenerateWordButtonProps {
  contractId?: string;
  contractData?: Record<string, unknown>;
  fileName?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function GenerateWordButton({ 
  contractId, 
  contractData, 
  fileName,
  className = "",
  children = "📄 إنتاج وثيقة Word"
}: GenerateWordButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateWord = async () => {
    setIsGenerating(true);
    
    try {
      // تحديد البيانات المرسلة
      const payload: { contractId?: string; contractData?: Record<string, unknown> } = {};
      
      if (contractId) {
        payload.contractId = contractId;
      } else if (contractData) {
        payload.contractData = contractData;
      } else {
        // استخدام بيانات تجريبية
        payload.contractData = generateSampleData();
      }

      console.log('📤 إرسال طلب إنتاج وثيقة Word:', payload);

      const response = await fetch('/api/templates/generate-docx-new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // تحميل الملف
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || `contract-${contractId || Date.now()}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert('✅ تم إنتاج وثيقة Word بنجاح');
      } else {
        const error = await response.json();
        console.error('خطأ من الخادم:', error);
        alert(`❌ فشل في إنتاج الوثيقة: ${error.message || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      console.error('خطأ في إنتاج وثيقة Word:', error);
      alert('❌ خطأ في الاتصال بالخادم');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGenerateWord}
      disabled={isGenerating}
      className={className}
    >
      {isGenerating ? '⏳ جارٍ إنتاج الوثيقة...' : children}
    </Button>
  );
}

