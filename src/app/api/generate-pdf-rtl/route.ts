import { NextRequest, NextResponse } from 'next/server';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Initialize pdfMake with default fonts
pdfMake.vfs = pdfFonts.vfs;
pdfMake.fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  }
};
import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
// @ts-expect-error: html-to-pdfmake has no types
import htmlToPdfmake from 'html-to-pdfmake';
import { JSDOM } from 'jsdom';

export async function POST(req: NextRequest) {
  console.log('PDF API: Received request');
  try {
  const { content, options } = await req.json();
  console.log('PDF API: Parsed JSON', { hasContent: !!content, hasOptions: !!options });
    const {
      fontSize = 14,
      fileName = 'contract.pdf',
    } = options || {};

    // تحويل HTML إلى عناصر pdfmake
    let pdfContent: Content;
    try {
  const { window } = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  console.log('PDF API: Created JSDOM window');
  pdfContent = htmlToPdfmake(content, { window, defaultStyles: { fontSize } });
  console.log('PDF API: Converted HTML to pdfmake content');
    } catch (err) {
      console.error('خطأ في تحويل HTML إلى pdfmake:', err);
  let errMsg = 'خطأ في تحويل HTML إلى PDF: ';
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
    errMsg += (err as { message: string }).message;
  } else {
    errMsg += String(err);
  }
  return NextResponse.json({ error: errMsg }, { status: 500 });
    }

    // توليد PDF باستخدام خط Roboto (سيتم إضافة دعم العربية لاحقاً)
    let buffer: Buffer | null = null;
    const usedFont = 'Roboto';
    let errorMsg = '';
    try {
  console.log('PDF API: Generating PDF with Roboto font');
  const docDefinition: TDocumentDefinitions = {
        content: Array.isArray(pdfContent) ? pdfContent : [pdfContent],
        defaultStyle: {
          font: 'Roboto',
          alignment: 'right',
        },
        styles: {
          header: {
            fontSize: fontSize + 2,
            bold: true,
            alignment: 'right',
          }
        }
      };
  buffer = await new Promise((resolve, reject) => {
        pdfMake.createPdf(docDefinition).getBuffer((buf: Buffer) => {
          if (!buf || buf.length === 0) reject(new Error('Buffer فارغ'));
          else resolve(buf);
        });
      });
    } catch (err) {
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
    errorMsg = 'خطأ في توليد PDF: ' + (err as { message: string }).message;
  } else {
    errorMsg = 'خطأ في توليد PDF: ' + String(err);
  }
  console.error('PDF API: Error generating PDF', errorMsg);
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    // إذا نجح التوليد
    if (buffer) {
  console.log('PDF API: PDF generated successfully, sending response');
  const uint8Array = new Uint8Array(buffer);
      return new NextResponse(uint8Array, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'X-Used-Font': usedFont,
        },
      });
    }
    // إذا لم يصل هنا، هناك خطأ غير متوقع
    return NextResponse.json({ error: 'خطأ غير متوقع في توليد PDF' }, { status: 500 });
  } catch (err) {
  console.error('PDF API: General error', err);
  let errMsg = 'خطأ عام في API PDF: ';
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
    errMsg += (err as { message: string }).message;
  } else {
    errMsg += String(err);
  }
  return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
