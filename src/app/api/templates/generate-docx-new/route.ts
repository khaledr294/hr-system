import { NextRequest, NextResponse } from 'next/server';
import { ensureDefaultTemplate, generateSampleData } from '@/lib/contract-templates-server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { formatDate } from '@/lib/date';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 طلب جديد لإنتاج وثيقة Word');

    // التأكد من وجود القالب الافتراضي
    const templatePath = ensureDefaultTemplate();
    console.log('📁 استخدام القالب:', templatePath);

    // تحديد مصدر البيانات
    let contractData;
    
    if (body.contractId) {
      // جلب بيانات العقد من قاعدة البيانات
      console.log('🔍 جلب بيانات العقد من قاعدة البيانات:', body.contractId);
      
      const contract = await prisma.contract.findUnique({
        where: { id: body.contractId },
        include: { 
          client: true, 
          worker: true, 
          marketer: true 
        }
      });

      if (!contract) {
        return NextResponse.json(
          { success: false, message: 'العقد غير موجود' },
          { status: 404 }
        );
      }

      // تحويل بيانات العقد إلى صيغة القالب المكتملة
      const startDateObj = contract.startDate ? new Date(contract.startDate) : new Date();
      const endDateObj = contract.endDate ? new Date(contract.endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      // حساب مدة العقد بالأشهر (تم حذف المتغير غير المستخدم)
      
      contractData = {
        // بيانات العميل
        clientName: contract.client?.name || 'غير محدد',
        clientPhone: contract.client?.phone || 'غير محدد',
        clientEmail: contract.client?.email || 'غير محدد',
        clientAddress: contract.client?.address || 'غير محدد',
        clientId: contract.client?.idNumber || 'غير محدد',
        
        // بيانات العقد (متطابقة مع قاعدة البيانات)
        contractNumber: contract.contractNumber || `HR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        startDate: formatDate(startDateObj),
        endDate: formatDate(endDateObj),
        totalAmount: contract.totalAmount?.toLocaleString('ar-SA') || '0',
        packageType: contract.packageType || 'غير محدد',
        packageName: contract.packageName || 'غير محدد',
        status: contract.status || 'غير محدد',
        notes: contract.notes || 'لا توجد ملاحظات',
        
        // بيانات العاملة (متطابقة مع قاعدة البيانات)
        workerName: contract.worker?.name || 'غير محدد',
        workerCode: contract.worker?.code?.toString() || 'غير محدد',
        workerNationality: contract.worker?.nationality || 'غير محدد',
        workerAge: contract.worker?.dateOfBirth ? 
          `${new Date().getFullYear() - new Date(contract.worker.dateOfBirth).getFullYear()} سنة` : 'غير محدد',
        workerPhone: contract.worker?.phone || 'غير محدد',
        workerResidencyNumber: contract.worker?.residencyNumber || 'غير محدد',
        workerSalary: contract.worker?.salary?.toLocaleString('ar-SA') || 'غير محدد',
        workerStatus: contract.worker?.status || 'غير محدد',
        
        // الشروط والأحكام
        terms: 'تلتزم العاملة بأداء واجباتها وفقاً للقوانين المعمول بها في المملكة العربية السعودية وتطبق الشروط والأحكام العامة للعقد.',
        workingHours: '8 ساعات يومياً (6 أيام في الأسبوع)',
        dayOff: 'الجمعة',
        responsibilities: contract.packageType === 'FULL_TIME' ? 
          'تنظيف المنزل، طبخ الوجبات، العناية بالأطفال، الأعمال المنزلية العامة' :
          contract.packageType === 'HOURLY' ?
          'حسب الساعات المتفق عليها والمهام المحددة' :
          'حسب المتفق عليه في العقد والباقة المختارة',
        benefits: 'إقامة مناسبة، وجبات صحية، تأمين طبي، راتب شهري منتظم، يوم راحة أسبوعي',
        
        // بيانات المسوق (متطابقة مع قاعدة البيانات)
        marketerName: contract.marketer?.name || 'غير محدد',
        marketerPhone: contract.marketer?.phone || 'غير محدد',
        marketerEmail: contract.marketer?.email || 'غير محدد',
        
        // تواريخ بصيغ مختلفة
  contractDate: formatDate(new Date()),
  today: formatDate(new Date()),
        
        // معلومات الشركة (افتراضية)
        companyName: 'شركة ساعد لاستقدام العمالة المنزلية',
        companyAddress: 'المملكة العربية السعودية',
        companyPhone: '+966 11 234 5678'
      };
    } else if (body.contractData) {
      // استخدام البيانات المرسلة مباشرة
      contractData = body.contractData;
    } else {
      // استخدام بيانات تجريبية
      contractData = generateSampleData();
      console.log('📋 استخدام بيانات تجريبية');
    }

    // إضافة متغيرات بأسماء مختلفة لضمان التوافق مع القوالب المختلفة
    const enhancedContractData = {
      ...contractData,
      
      // بيانات العميل بصيغ مختلفة
      'اسم العميل': contractData.clientName,
      'اسم_العميل': contractData.clientName,
      'client_name': contractData.clientName,
      'العميل': contractData.clientName,
      'رقم جوال العميل': contractData.clientPhone,
      'رقم_جوال_العميل': contractData.clientPhone,
      'client_phone': contractData.clientPhone,
      'عنوان العميل': contractData.clientAddress,
      'عنوان_العميل': contractData.clientAddress,
      'client_address': contractData.clientAddress,
      'هوية العميل': contractData.clientId,
      'هوية_العميل': contractData.clientId,
      'client_id': contractData.clientId,
      
      // بيانات العقد بصيغ مختلفة
      'رقم العقد': contractData.contractNumber,
      'رقم_العقد': contractData.contractNumber,
      'contract_number': contractData.contractNumber,
      'العقد': contractData.contractNumber,
      'تاريخ البداية': contractData.startDate,
      'تاريخ_البداية': contractData.startDate,
      'start_date': contractData.startDate,
      'البداية': contractData.startDate,
      'تاريخ النهاية': contractData.endDate,
      'تاريخ_النهاية': contractData.endDate,
      'end_date': contractData.endDate,
      'النهاية': contractData.endDate,
      'المبلغ الإجمالي': contractData.totalAmount,
      'المبلغ_الإجمالي': contractData.totalAmount,
      'total_amount': contractData.totalAmount,
      'المبلغ': contractData.totalAmount,
      'نوع الباقة': contractData.packageType,
      'نوع_الباقة': contractData.packageType,
      'package_type': contractData.packageType,
      'الباقة': contractData.packageType,
      
      // بيانات العاملة بصيغ مختلفة  
      'اسم العاملة': contractData.workerName,
      'اسم_العاملة': contractData.workerName,
      'worker_name': contractData.workerName,
      'العاملة': contractData.workerName,
      'كود العاملة': contractData.workerCode,
      'كود_العاملة': contractData.workerCode,
      'worker_code': contractData.workerCode,
      'جنسية العاملة': contractData.workerNationality,
      'جنسية_العاملة': contractData.workerNationality,
      'worker_nationality': contractData.workerNationality,
      'الجنسية': contractData.workerNationality,
      'عمر العاملة': contractData.workerAge,
      'عمر_العاملة': contractData.workerAge,
      'worker_age': contractData.workerAge,
      'العمر': contractData.workerAge,
      'رقم إقامة العاملة': contractData.workerResidencyNumber,
      'رقم_إقامة_العاملة': contractData.workerResidencyNumber,
      'worker_residency_number': contractData.workerResidencyNumber,
      'الإقامة': contractData.workerResidencyNumber,
      'راتب العاملة': contractData.workerSalary,
      'راتب_العاملة': contractData.workerSalary,
      'worker_salary': contractData.workerSalary,
      'الراتب': contractData.workerSalary,
      
      // بيانات المسوق بصيغ مختلفة
      'اسم المسوق': contractData.marketerName,
      'اسم_المسوق': contractData.marketerName,
      'marketer_name': contractData.marketerName,
      'المسوق': contractData.marketerName,
      'هاتف المسوق': contractData.marketerPhone,
      'هاتف_المسوق': contractData.marketerPhone,
      'marketer_phone': contractData.marketerPhone,
      
      // بيانات الشركة بصيغ مختلفة
      'اسم الشركة': contractData.companyName,
      'اسم_الشركة': contractData.companyName,
      'company_name': contractData.companyName,
      'الشركة': contractData.companyName,
      'عنوان الشركة': contractData.companyAddress,
      'عنوان_الشركة': contractData.companyAddress,
      'company_address': contractData.companyAddress,
      'هاتف الشركة': contractData.companyPhone,
      'هاتف_الشركة': contractData.companyPhone,
      'company_phone': contractData.companyPhone,
      
      // التواريخ بصيغ مختلفة
      'تاريخ العقد': contractData.contractDate,
      'تاريخ_العقد': contractData.contractDate,
      'contract_date': contractData.contractDate,
      'التاريخ الحالي': contractData.today,
      'التاريخ_الحالي': contractData.today,
      'today': contractData.today,
      'التاريخ': contractData.today,
      'اليوم': contractData.today,
      'date': contractData.today
    };

    // استخدام البيانات المحسنة بدلاً من البيانات الأصلية
    contractData = enhancedContractData;

    console.log('📄 البيانات المعدة للدمج:', Object.keys(contractData).length, 'متغير');
    console.log('🔍 عينة من البيانات:', {
      clientName: contractData.clientName,
      contractNumber: contractData.contractNumber,
      workerName: contractData.workerName,
      startDate: contractData.startDate
    });

    // قراءة القالب ومعالجته
    const templateBuffer = fs.readFileSync(templatePath);
    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: {
        start: '{{',
        end: '}}'
      }
    });

    try {
      // دمج البيانات مع القالب
      doc.render(contractData);
      console.log('✅ تم دمج البيانات بنجاح');
    } catch (error) {
      console.error('❌ خطأ في دمج البيانات:', error);
      throw error;
    }
    
    // إنتاج الملف النهائي
    const outputBuffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    console.log('✅ تم إنتاج الوثيقة بنجاح، الحجم:', outputBuffer.length, 'بايت');

    // تحديد اسم الملف
    const fileName = contractData.contractNumber 
      ? `contract-${contractData.contractNumber}.docx`
      : `contract-${Date.now()}.docx`;

    // إرسال الملف للتحميل
    return new NextResponse(Buffer.from(outputBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': outputBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('❌ خطأ في إنتاج وثيقة Word:', error);
    
    let errorMessage = 'خطأ في إنتاج الوثيقة';
    let errorDetails = '';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // استخراج تفاصيل أخطاء docxtemplater
      if ('properties' in error && error.properties) {
        const props = error.properties as { errors?: unknown[] };
        if (props.errors) {
          errorDetails = JSON.stringify(props.errors, null, 2);
        }
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        details: errorDetails || undefined
      },
      { status: 500 }
    );
  }
}