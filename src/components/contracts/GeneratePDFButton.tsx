'use client';

interface GeneratePDFButtonProps {
  contract: {
    id: string;
    startDate: Date;
    endDate: Date;
    packageType: string;
    packageName?: string;
    totalAmount?: number;
    client: {
      name: string;
      phone: string;
      idNumber: string;
      address: string;
      email?: string;
    };
    worker: {
      name: string;
      code: number;
      residencyNumber: string;
      nationality: string;
      phone?: string;
      dateOfBirth?: Date;
    };
    marketer?: {
      name: string;
      phone?: string;
      email?: string;
    };
  };
  userName: string;
}

// Helper types and functions to avoid undefined identifier errors.
type TemplateSettings = {
  fontSize?: string;
  textColor?: string;
  pageFrame?: string;
};

function getSavedTemplate(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('contractTemplate');
    if (stored && stored.trim()) return stored;
  }
  // Default Arabic template with placeholders.
  return `
عقد رقم {{contract.id}}

العميل:
الاسم: {{client.name}} | الهاتف: {{client.phone}} | رقم الهوية: {{client.idNumber}} | العنوان: {{client.address}} {{client.email}}

العامل:
الاسم: {{worker.name}} | الجنسية: {{worker.nationality}} | رقم الإقامة: {{worker.residencyNumber}} | الكود: {{worker.code}} {{worker.phone}}

تفاصيل العقد:
الباقة: {{contract.packageName}} | من: {{contract.startDate}} إلى: {{contract.endDate}} | الإجمالي: {{contract.totalAmount}}

المسوق:
{{marketer.name}} {{marketer.phone}} {{marketer.email}}
`.trim();
}

function processContractTemplate(template: string, data: Record<string, unknown>): string {
  const getByPath = (obj: unknown, path: string) => {
    return path.split('.').reduce<unknown>((acc, key) => {
      if (acc == null) return undefined;
      if (typeof acc === 'object') {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  };

  const formatValue = (v: unknown) => {
    if (v instanceof Date) return v.toLocaleDateString();
    if (typeof v === 'number') return String(v);
    if (v == null) return '';
    return String(v);
  };

  return template.replace(/{{\s*([^}]+)\s*}}/g, (_match, p1: string) => {
    const val = getByPath(data, p1.trim());
    return formatValue(val);
  });
}

function getSavedTemplateSettings(): TemplateSettings {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('contractTemplateSettings');
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as TemplateSettings;
        return {
          fontSize: parsed.fontSize ?? '14',
          textColor: parsed.textColor ?? '#000000',
          pageFrame: parsed.pageFrame ?? 'none'
        };
      } catch {
        // fallthrough to defaults
      }
    }
  }
  return { fontSize: '14', textColor: '#000000', pageFrame: 'none' };
}

export default function GeneratePDFButton({ contract, userName }: GeneratePDFButtonProps) {
  const handleGeneratePDF = async () => {
    try {
      // الحصول على القالب المخصص
      const template = getSavedTemplate();
      // معالجة القالب مع بيانات العقد
      const processedContent = processContractTemplate(template, {
        client: contract.client,
        worker: contract.worker,
        contract: {
          ...contract,
          packageName: contract.packageName || contract.packageType
        },
        marketer: contract.marketer || { name: userName, phone: '', email: '' }
      });
      // الحصول على إعدادات التنسيق المحفوظة
      const settings = getSavedTemplateSettings();
  // إرسال البيانات إلى API لتوليد PDF من الخادم (يدعم العربية و RTL)
  const response = await fetch('/api/generate-pdf-rtl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: processedContent,
          options: {
            title: `عقد رقم ${contract.id}`,
            fileName: `contract-${contract.id}.pdf`,
            fontSize: parseInt(settings.fontSize || '14'),
            textColor: settings.textColor || '#000000',
            pageFrame: settings.pageFrame || 'none'
          }
        })
      });
      if (!response.ok) {
        let msg = 'PDF generation failed';
        try {
          const data = await response.json();
          msg = data?.error || msg;
        } catch {}
        throw new Error(msg);
      }
      const pdfBytes = await response.arrayBuffer();
      // تحميل ملف PDF
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `contract-${contract.id}.pdf`;
      link.click();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('حدث خطأ في توليد ملف PDF:\n' + (error instanceof Error ? error.message : error));
    }
  };

  return (
    <button
      type="button"
      className="inline-flex items-center px-4 py-2 border border-green-600 rounded-md shadow-sm text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      onClick={handleGeneratePDF}
    >
      توليد عقد PDF
    </button>
  );
}
