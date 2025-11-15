export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

const TEMPLATES_DIR = path.join(process.cwd(), 'templates');
const TEMPLATE_FILE = path.join(TEMPLATES_DIR, 'contract-template.docx');

type EmptyContext = { params: Promise<Record<string, never>> };

export const POST = withApiAuth<EmptyContext>(
  { permissions: [Permission.MANAGE_TEMPLATES] },
  async ({ req }) => {
    try {
      console.log('🔥 [upload-v2] بدء معالجة رفع القالب');
      
      if (!existsSync(TEMPLATES_DIR)) {
        await mkdir(TEMPLATES_DIR, { recursive: true });
        console.log('📁 [upload-v2] تم إنشاء مجلد القوالب');
      }

      const formData = await req.formData();
      console.log('📋 [upload-v2] مفاتيح FormData:', Array.from(formData.keys()));
      
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

      if (!file.name.toLowerCase().endsWith('.docx')) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'يجب أن يكون الملف من نوع .docx'
          }, 
          { status: 400 }
        );
      }

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
);

export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.MANAGE_TEMPLATES] },
  async () => {
    return NextResponse.json({
      message: 'خدمة رفع القوالب نشطة',
      templatesDir: TEMPLATES_DIR,
      templateExists: existsSync(TEMPLATE_FILE)
    });
  }
);