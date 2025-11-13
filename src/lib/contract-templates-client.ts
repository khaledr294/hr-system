import { formatDate } from './date';

// متغيرات الدمج مع الفئات - للاستخدام في العميل
export const mergeVariables = {
  client: {
    title: 'بيانات العميل',
    variables: [
      { key: 'clientName', label: 'اسم العميل', description: 'الاسم الكامل للعميل' },
      { key: 'clientPhone', label: 'رقم الجوال', description: 'رقم جوال العميل' },
      { key: 'clientEmail', label: 'البريد الإلكتروني', description: 'عنوان البريد الإلكتروني' },
      { key: 'clientAddress', label: 'العنوان', description: 'عنوان إقامة العميل' },
      { key: 'clientId', label: 'رقم الهوية', description: 'رقم الهوية الوطنية' }
    ]
  },
  contract: {
    title: 'بيانات العقد',
    variables: [
      { key: 'contractNumber', label: 'رقم العقد', description: 'الرقم المرجعي للعقد' },
      { key: 'startDate', label: 'تاريخ البداية', description: 'تاريخ بداية العقد' },
      { key: 'endDate', label: 'تاريخ الانتهاء', description: 'تاريخ انتهاء العقد' },
      { key: 'totalAmount', label: 'المبلغ الإجمالي', description: 'إجمالي قيمة العقد' },
      { key: 'packageType', label: 'نوع الباقة', description: 'نوع الباقة المختارة' },
      { key: 'packageName', label: 'اسم الباقة', description: 'اسم الباقة المختارة' },
      { key: 'status', label: 'حالة العقد', description: 'حالة العقد الحالية' },
      { key: 'notes', label: 'ملاحظات', description: 'ملاحظات إضافية على العقد' }
    ]
  },
  worker: {
    title: 'بيانات العاملة',
    variables: [
      { key: 'workerName', label: 'اسم العاملة', description: 'الاسم الكامل للعاملة' },
      { key: 'workerCode', label: 'كود العاملة', description: 'الرقم المرجعي للعاملة' },
      { key: 'workerNationality', label: 'الجنسية', description: 'جنسية العاملة' },
      { key: 'workerAge', label: 'العمر', description: 'عمر العاملة المحسوب من تاريخ الميلاد' },
      { key: 'workerPhone', label: 'رقم الهاتف', description: 'رقم هاتف العاملة' },
      { key: 'workerResidencyNumber', label: 'رقم الإقامة', description: 'رقم الإقامة للعاملة' },
      { key: 'workerSalary', label: 'الراتب', description: 'راتب العاملة الأساسي' },
      { key: 'workerStatus', label: 'الحالة', description: 'حالة العاملة الحالية' }
    ]
  },
  marketer: {
    title: 'بيانات المسوق',
    variables: [
      { key: 'marketerName', label: 'اسم المسوق', description: 'اسم المسوق المسؤول عن العقد' },
      { key: 'marketerPhone', label: 'هاتف المسوق', description: 'رقم هاتف المسوق' },
      { key: 'marketerEmail', label: 'بريد المسوق', description: 'البريد الإلكتروني للمسوق' }
    ]
  },
  company: {
    title: 'بيانات الشركة',
    variables: [
      { key: 'companyName', label: 'اسم الشركة', description: 'الاسم التجاري للشركة' },
      { key: 'companyAddress', label: 'عنوان الشركة', description: 'العنوان الرسمي للشركة' },
      { key: 'companyPhone', label: 'هاتف الشركة', description: 'رقم هاتف الشركة' }
    ]
  },
  dates: {
    title: 'التواريخ',
    variables: [
      { key: 'contractDate', label: 'تاريخ العقد', description: 'تاريخ إنشاء العقد' },
      { key: 'today', label: 'التاريخ الحالي', description: 'تاريخ اليوم' }
    ]
  },
  terms: {
    title: 'الشروط والأحكام',
    variables: [
      { key: 'terms', label: 'الشروط العامة', description: 'الشروط والأحكام العامة' },
      { key: 'workingHours', label: 'ساعات العمل', description: 'عدد ساعات العمل اليومية' },
      { key: 'dayOff', label: 'يوم الراحة', description: 'يوم الراحة الأسبوعي' },
      { key: 'responsibilities', label: 'المسؤوليات', description: 'مسؤوليات العاملة' },
      { key: 'benefits', label: 'المزايا', description: 'المزايا المقدمة للعاملة' }
    ]
  }
};

// إنشاء بيانات تجريبية - للاستخدام في العميل
export function generateSampleData() {
  return {
    // بيانات العميل (Client)
    clientName: 'أحمد محمد العلي',
    clientPhone: '+966501234567',
    clientEmail: 'ahmed.ali@email.com',
    clientAddress: 'الرياض، حي النرجس، شارع الأمير محمد بن عبدالعزيز',
    clientId: '1234567890',
    
    // بيانات العقد (Contract)
    contractNumber: 'HR-2025-001',
    startDate: formatDate(new Date()),
    endDate: formatDate(Date.now() + 365 * 24 * 60 * 60 * 1000),
    totalAmount: '24,000',
    packageType: 'FULL_TIME',
    packageName: 'باقة دوام كامل',
    status: 'ACTIVE',
    notes: 'عقد باقة دوام كامل مع عاملة منزلية',
    
    // بيانات العاملة (Worker)
    workerName: 'ماريا سانتوس',
    workerCode: '2025001',
    workerNationality: 'INDONESIA',
    workerAge: '28 سنة',
    workerPhone: '+966512345678',
    workerResidencyNumber: 'RES123456789',
    workerSalary: '1,500',
    workerStatus: 'AVAILABLE',
    
    // بيانات المسوق (Marketer)
    marketerName: 'خالد أحمد المطيري',
    marketerPhone: '+966551234567',
    marketerEmail: 'khalid.marketer@company.com',
    
    // بيانات الشركة (Company)
    companyName: 'شركة ساعد لاستقدام العمالة المنزلية',
    companyAddress: 'الرياض، المملكة العربية السعودية',
    companyPhone: '+966 11 234 5678',
    
    // التواريخ (Dates)
  contractDate: formatDate(new Date()),
  today: formatDate(new Date()),
    
    // الشروط والأحكام (Terms)
    terms: 'تلتزم العاملة بأداء واجباتها وفقاً للقوانين المعمول بها في المملكة العربية السعودية.',
    workingHours: '8 ساعات يومياً (6 أيام في الأسبوع)',
    dayOff: 'الجمعة',
    responsibilities: 'تنظيف المنزل، طبخ الوجبات، العناية بالأطفال، الأعمال المنزلية العامة',
    benefits: 'إقامة مناسبة، وجبات صحية، تأمين طبي، راتب شهري منتظم، يوم راحة أسبوعي'
  };
}