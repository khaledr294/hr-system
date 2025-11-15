export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { prisma } from '@/lib/prisma';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

const TEMPLATE_FILE = path.join(process.cwd(), 'templates', 'contract-template.docx');

type EmptyContext = { params: Promise<Record<string, never>> };

export const POST = withApiAuth<EmptyContext>(
  { permissions: [Permission.MANAGE_TEMPLATES] },
  async ({ req }) => {
    try {
      const payload = await req.json();
    // If body has contractId, load real data from DB
  let data = payload;
  if (payload && payload.contractId) {
      const contract = await prisma.contract.findUnique({
  where: { id: payload.contractId },
        include: { client: true, worker: true, marketer: true },
      });
      if (!contract) {
        return NextResponse.json({ error: 'لم يتم العثور على العقد' }, { status: 404 });
      }
      data = {
        clientName: contract.client?.name || '',
        clientPhone: contract.client?.phone || '',
        clientIdNumber: contract.client?.idNumber || '',
        contractNumber: contract.contractNumber || '',
        startDate: contract.startDate?.toISOString().split('T')[0] || '',
        endDate: contract.endDate?.toISOString().split('T')[0] || '',
        packageName: contract.packageName || contract.packageType || '',
        totalAmount: contract.totalAmount?.toString() || '',
        workerName: contract.worker?.name || '',
        marketerName: contract.marketer?.name || '',
      };
    }
    const content = await fs.readFile(TEMPLATE_FILE, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    try {
      doc.render(data);
    } catch (err) {
      // If docxtemplater error, return detailed info
      let errorMsg = 'فشل توليد ملف Word: ';
      if (err && typeof err === 'object') {
        const e = err as Record<string, unknown>;
        if (typeof e.message === 'string') errorMsg += e.message;
        if (typeof e.explanation === 'string') errorMsg += '\n' + e.explanation;
        if (Array.isArray(e.errors)) {
          errorMsg += '\nتفاصيل:\n' + JSON.stringify(e.errors, null, 2);
        }
        // Log the full error object for debugging
         
        console.error('[DOCXTEMPLATER ERROR]', JSON.stringify(e, null, 2));
      } else {
        errorMsg += String(err);
         
        console.error('[DOCXTEMPLATER ERROR]', err);
      }
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }
    const buf = doc.getZip().generate({ type: 'uint8array' });
  const binary = new Uint8Array(buf);
      return new NextResponse(binary, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="contract.docx"'
      }
    });
    } catch (err) {
      let msg = 'فشل توليد ملف Word: ';
      if (err && typeof err === 'object' && 'message' in err) {
        msg += String((err as { message?: unknown }).message);
      } else {
        msg += String(err);
      }
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }
);
