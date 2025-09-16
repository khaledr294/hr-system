import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb } from 'pdf-lib';
import * as fontkit from 'fontkit';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  const { content, options } = await req.json();
  const {
    fontSize = 12,
    textColor = '#000000',
    pageFrame = 'none',
  } = options || {};

  // تحميل الخط العربي من نظام الملفات
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSansArabic-Regular.ttf');
  const fontBytes = fs.readFileSync(fontPath);

  const pdfDoc = await PDFDocument.create();
  // @ts-expect-error: pdf-lib expects Fontkit type mismatch, safe to ignore
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(fontBytes);

  // تحويل اللون من hex إلى RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
  };
  const color = hexToRgb(textColor);

  // معالجة النص وإزالة تنسيقات Markdown
  const processMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/##\s*(.*?)$/gm, '$1');
  };

  const processedContent = processMarkdown(content);
  const lines = processedContent.split('\n');
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = pageFrame !== 'none' ? 70 : 50;
  const lineHeight = fontSize * 1.2;
  const maxLinesPerPage = Math.floor((pageHeight - 2 * margin) / lineHeight);

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - margin;
  let lineCount = 0;

  for (const line of lines) {
    if (lineCount >= maxLinesPerPage) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      currentY = pageHeight - margin;
      lineCount = 0;
    }
    const maxCharsPerLine = Math.floor((pageWidth - 2 * margin) / (fontSize * 0.6));
    const wrappedLines = wrapText(line, maxCharsPerLine);
    for (const wrappedLine of wrappedLines) {
      if (lineCount >= maxLinesPerPage) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
        lineCount = 0;
      }
      currentPage.drawText(wrappedLine, {
        x: margin,
        y: currentY,
        size: fontSize,
        font: font,
        color: rgb(color.r, color.g, color.b),
      });
      currentY -= lineHeight;
      lineCount++;
    }
  }

  const pdfBytes = await pdfDoc.save();
  // Convert Uint8Array to Buffer for NextResponse
  const buffer = Buffer.from(pdfBytes);
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="contract.pdf"',
    },
  });
}

function wrapText(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) {
    return [text];
  }
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  for (const word of words) {
    if ((currentLine + ' ' + word).length <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}
