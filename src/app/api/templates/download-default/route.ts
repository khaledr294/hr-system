import { NextResponse } from 'next/server';
import { ensureDefaultTemplate } from '@/lib/contract-templates-server';
import fs from 'fs';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type EmptyContext = { params: Promise<Record<string, never>> };

export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.MANAGE_TEMPLATES] },
  async () => {
    try {
      const templateFile = ensureDefaultTemplate();

      if (!fs.existsSync(templateFile)) {
        return NextResponse.json(
          { success: false, message: 'القالب غير موجود' },
          { status: 404 }
        );
      }

      const templateBuffer = fs.readFileSync(templateFile);

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
);