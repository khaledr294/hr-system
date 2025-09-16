// سكريبت Node.js: دمج بيانات عقد مع قالب Word (docx) باستخدام docxtemplater
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

// 1. تحميل قالب Word (يجب أن يكون موجوداً في مجلد templates)
const templatePath = join(__dirname, '../templates/contract-template.docx');
const outputPath = join(__dirname, '../output/contract-filled.docx');

const contractData = {
  clientName: 'أحمد محمد',
  clientPhone: '0501234567',
  contractNumber: '20250916001',
  startDate: '2025-09-16',
  endDate: '2025-12-16',
  packageName: 'باقة شهرية',
  totalAmount: '1500',
  workerName: 'فاطمة علي',
  marketerName: 'سارة مسوق',
  // أضف أي متغيرات أخرى حسب القالب
};

// 2. قراءة القالب
const content = readFileSync(templatePath, 'binary');
const zip = new PizZip(content);
const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

// 3. دمج البيانات
try {
  doc.render(contractData);
} catch (error) {
  console.error('خطأ في دمج البيانات:', error);
  process.exit(1);
}

// 4. إخراج الملف النهائي
const buf = doc.getZip().generate({ type: 'nodebuffer' });
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, buf);
console.log('تم إنشاء ملف العقد:', outputPath);
