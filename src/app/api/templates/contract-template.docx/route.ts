export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

const TEMPLATE_FILE = path.join(process.cwd(), 'templates', 'contract-template.docx');

type EmptyContext = { params: Promise<Record<string, never>> };

export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.MANAGE_TEMPLATES] },
  async () => {
    try {
      const data = await fs.readFile(TEMPLATE_FILE);
      const body = new Uint8Array(data);
      return new NextResponse(body, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': 'attachment; filename="contract-template.docx"'
        }
      });
    } catch {
      return new NextResponse('Template not found', { status: 404 });
    }
  }
);
