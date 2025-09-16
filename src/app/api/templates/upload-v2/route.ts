export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const TEMPLATES_DIR = path.join(process.cwd(), 'templates');
const TEMPLATE_FILE = path.join(TEMPLATES_DIR, 'contract-template.docx');

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 [upload-v2] بدء معالجة رفع القالب');
    
    // التأكد من وجود مجلد templates
    if (!existsSync(TEMPLATES_DIR)) {
      await mkdir(TEMPLATES_DIR, { recursive: true });
      console.log('📁 [upload-v2] تم إنشاء مجلد القوالب');
    }

    // قراءة FormData
    const formData = await request.formData();
    console.log('📋 [upload-v2] مفاتيح FormData:', Array.from(formData.keys()));
    
    // البحث عن الملف بأسماء مختلفة
    let file: File | null = null;
    const possibleNames = ['template', 'file', 'document', 'upload'];
    
    for (const name of possibleNames) {
      const foundFile = formData.get(name) as File | null;
      if (foundFile && foundFile.size > 0) {
        file = foundFile;
        console.log(`✅ [upload-v2] عثر على الملف باسم: ${name}`);
        break;
      }
    }

    if (!file) {
      console.error('❌ [upload-v2] لم يتم العثور على ملف');
      return NextResponse.json(
        { 
          success: false, 
          message: 'لم يتم العثور على ملف للرفع',
          availableKeys: Array.from(formData.keys())
        }, 
        { status: 400 }
      );
    }

    console.log('📄 [upload-v2] تفاصيل الملف:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // التحقق من نوع الملف
    if (!file.name.toLowerCase().endsWith('.docx')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'يجب أن يكون الملف من نوع .docx'
        }, 
        { status: 400 }
      );
    }

    // قراءة وحفظ الملف
    const bytes = new Uint8Array(await file.arrayBuffer());
    await writeFile(TEMPLATE_FILE, bytes);
    
    console.log(`✅ [upload-v2] تم حفظ القالب: ${TEMPLATE_FILE} (${bytes.length} بايت)`);

    return NextResponse.json({
      success: true,
      message: 'تم رفع القالب بنجاح',
      fileName: file.name,
      fileSize: bytes.length,
      savedPath: TEMPLATE_FILE
    });

  } catch (error) {
    console.error('💥 [upload-v2] خطأ في رفع القالب:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: `خطأ في رفع القالب: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'خدمة رفع القوالب نشطة',
    templatesDir: TEMPLATES_DIR,
    templateExists: existsSync(TEMPLATE_FILE)
  });
}