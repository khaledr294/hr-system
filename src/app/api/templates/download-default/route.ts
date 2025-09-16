import { NextResponse } from 'next/server';
import { ensureDefaultTemplate } from '@/lib/contract-templates-server';
import fs from 'fs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // التأكد من وجود القالب الافتراضي
    const templateFile = ensureDefaultTemplate();
    
    if (!fs.existsSync(templateFile)) {
      return NextResponse.json(
        { success: false, message: 'القالب غير موجود' },
        { status: 404 }
      );
    }

    // قراءة القالب
    const templateBuffer = fs.readFileSync(templateFile);
    
    // إرسال الملف للتحميل
    return new NextResponse(templateBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="contract-template.docx"',
        'Content-Length': templateBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('خطأ في تحميل القالب:', error);
    return NextResponse.json(
      { success: false, message: 'خطأ في تحميل القالب' },
      { status: 500 }
    );
  }
}