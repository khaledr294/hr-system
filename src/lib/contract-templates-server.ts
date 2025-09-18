// وظائف الخادم فقط - تتطلب Node.js APIs
import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';

// إنشاء قالب Word افتراضي برمجياً
export function createDefaultTemplate(): Buffer {
  // محتوى XML بسيط لقالب Word مع تنسيق عربي
  const xmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:rPr>
          <w:b/>
          <w:sz w:val="32"/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="32"/>
        </w:rPr>
        <w:t>عقد عمل</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:pPr>
        <w:jc w:val="right"/>
      </w:pPr>
      <w:r>
        <w:t>اسم العميل: {{clientName}}</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:pPr>
        <w:jc w:val="right"/>
      </w:pPr>
      <w:r>
        <w:t>رقم الجوال: {{clientPhone}}</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:pPr>
        <w:jc w:val="right"/>
      </w:pPr>
      <w:r>
        <w:t>رقم العقد: {{contractNumber}}</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:pPr>
        <w:jc w:val="right"/>
      </w:pPr>
      <w:r>
        <w:t>اسم العاملة: {{workerName}}</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:pPr>
        <w:jc w:val="right"/>
      </w:pPr>
      <w:r>
        <w:t>المبلغ الإجمالي: {{totalAmount}} ريال</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:pPr>
        <w:jc w:val="right"/>
      </w:pPr>
      <w:r>
        <w:t>تاريخ بداية العقد: {{startDate}}</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:pPr>
        <w:jc w:val="right"/>
      </w:pPr>
      <w:r>
        <w:t>تاريخ انتهاء العقد: {{endDate}}</w:t>
      </w:r>
    </w:p>

    <w:p>
      <w:pPr>
        <w:spacing w:before="480"/>
        <w:jc w:val="right"/>
      </w:pPr>
      <w:r>
        <w:t>الشروط والأحكام:</w:t>
      </w:r>
    </w:p>

    <w:p>
      <w:pPr>
        <w:jc w:val="right"/>
      </w:pPr>
      <w:r>
        <w:t>{{terms}}</w:t>
      </w:r>
    </w:p>

  </w:body>
</w:document>`;

  // إنشاء ملف docx بسيط
  const zip = new PizZip();
  
  // إضافة الملفات الأساسية لـ docx
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);

  zip.file('word/document.xml', xmlContent);

  return zip.generate({ type: 'nodebuffer' }) as Buffer;
}

// إنشاء القالب إذا لم يكن موجوداً
export function ensureDefaultTemplate(templatesDir: string = 'templates'): string {
  const templatePath = path.join(process.cwd(), templatesDir);
  const templateFile = path.join(templatePath, 'contract-template.docx');

  if (!fs.existsSync(templatePath)) {
    fs.mkdirSync(templatePath, { recursive: true });
  }

  if (!fs.existsSync(templateFile)) {
    const defaultTemplate = createDefaultTemplate();
    fs.writeFileSync(templateFile, defaultTemplate);
    console.log('✅ تم إنشاء قالب Word افتراضي:', templateFile);
  }

  return templateFile;
}

// إنشاء بيانات تجريبية - نسخة الخادم
export function generateSampleData() {
  return {
    // بيانات العميل
    clientName: 'أحمد محمد العلي',
    clientPhone: '+966501234567',
    clientEmail: 'ahmed.ali@email.com',
    clientAddress: 'الرياض، حي النرجس، شارع الأمير محمد بن عبدالعزيز',
    clientId: '1234567890',
    
    // بيانات العقد
    contractNumber: 'HR-2024-001',
  startDate: new Date().toLocaleDateString('ar-SA-u-ca-gregory'),
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('ar-SA-u-ca-gregory'),
    duration: '12 شهر',
    totalAmount: '24000',
    monthlyAmount: '2000',
    
    // بيانات العاملة
    workerName: 'ماريا سانتوس',
    workerNationality: 'فلبينية',
    workerAge: '28 سنة',
    workerExperience: '5 سنوات',
    workerSpecialization: 'خدمة منزلية',
    workerPassport: 'P1234567',
    
    // الشروط والأحكام
    terms: 'تلتزم العاملة بأداء واجباتها وفقاً للقوانين المعمول بها في المملكة العربية السعودية.',
    workingHours: '8 ساعات يومياً',
    dayOff: 'الجمعة',
    responsibilities: 'تنظيف المنزل، طبخ الوجبات، العناية بالأطفال',
    benefits: 'إقامة، طعام، تأمين طبي'
  };
}