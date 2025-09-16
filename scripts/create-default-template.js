import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import PizZip from 'pizzip';

// إنشاء قالب Word افتراضي برمجياً
function createDefaultTemplate() {
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

  return zip.generate({ type: 'nodebuffer' });
}

// إنشاء القالب إذا لم يكن موجوداً
const templatesDir = join(__dirname, '../templates');
const templateFile = join(templatesDir, 'contract-template.docx');

if (!existsSync(templatesDir)) {
  mkdirSync(templatesDir, { recursive: true });
}

if (!existsSync(templateFile)) {
  const defaultTemplate = createDefaultTemplate();
  writeFileSync(templateFile, defaultTemplate);
  console.log('✅ تم إنشاء قالب Word افتراضي:', templateFile);
} else {
  console.log('✅ قالب Word موجود بالفعل:', templateFile);
}