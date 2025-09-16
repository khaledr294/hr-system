import { NextRequest, NextResponse } from 'next/server';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { notoVfs, notoFonts } from '@/lib/pdfmake-noto-arabic';
// دمج خطوط pdfmake الافتراضية مع خط نوتو العربي
pdfMake.vfs = { ...pdfFonts.vfs, ...notoVfs };
pdfMake.fonts = { ...pdfMake.fonts, ...notoFonts };
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

    // محاولة توليد PDF مع الخط العربي، وإذا فشل جرب Roboto
    let buffer: Buffer | null = null;
    let usedFont = 'NotoSansArabic';
    let errorMsg = '';
    try {
  console.log('PDF API: Trying to generate PDF with NotoSansArabic');
  const docDefinition: TDocumentDefinitions = {
        content: Array.isArray(pdfContent) ? pdfContent : [pdfContent],
        defaultStyle: {
          font: 'NotoSansArabic',
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
    errorMsg = 'خطأ في توليد PDF مع الخط العربي: ' + (err as { message: string }).message;
  } else {
    errorMsg = 'خطأ في توليد PDF مع الخط العربي: ' + String(err);
  }
  console.error('PDF API: Error with NotoSansArabic', errorMsg);
      console.error(errorMsg);
      usedFont = 'Roboto';
      // جرب Roboto
      try {
  console.log('PDF API: Trying to generate PDF with Roboto fallback');
  const docDefinition: TDocumentDefinitions = {
          content: [
            { text: '⚠️ حدث خطأ في الخط العربي، تم استخدام Roboto مؤقتاً', color: 'red', fontSize: 10 },
            ...(Array.isArray(pdfContent) ? pdfContent : [pdfContent])
          ],
          defaultStyle: {
            font: 'Roboto',
            alignment: 'right',
          },
        };
  buffer = await new Promise((resolve, reject) => {
          pdfMake.createPdf(docDefinition).getBuffer((buf: Buffer) => {
            if (!buf || buf.length === 0) reject(new Error('Buffer فارغ Roboto'));
            else resolve(buf);
          });
        });
      } catch (err2) {
  if (err2 && typeof err2 === 'object' && 'message' in err2 && typeof (err2 as { message?: unknown }).message === 'string') {
    errorMsg += '\nثم فشل Roboto: ' + (err2 as { message: string }).message;
  } else {
    errorMsg += '\nثم فشل Roboto: ' + String(err2);
  }
  console.error('PDF API: Error with Roboto fallback', errorMsg);
        console.error(errorMsg);
        return NextResponse.json({ error: errorMsg }, { status: 500 });
      }
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
