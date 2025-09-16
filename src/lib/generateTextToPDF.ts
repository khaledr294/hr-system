// دالة لتوليد PDF من النص العربي مع دعم التنسيق
import * as fontkit from 'fontkit';
export async function generateTextToPDF(
  content: string,
  options: {
    title?: string;
    fileName?: string;
    fontSize?: number;
    textColor?: string;
    pageFrame?: string;
  } = {}
): Promise<Uint8Array> {
  const { PDFDocument, rgb } = await import('pdf-lib');
  // Load Arabic-supporting font from public/fonts using fetch (browser compatible)
  const fontResponse = await fetch('/fonts/NotoSansArabic-Regular.ttf');
  const fontBytes = await fontResponse.arrayBuffer();
  const pdfDoc = await PDFDocument.create();
  // @ts-expect-error: Type mismatch is safe to ignore for fontkit registration
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(fontBytes);
  
  const {
    fontSize = 12,
    textColor = '#000000',
    pageFrame = 'none'
  } = options;

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
      .replace(/\*\*(.*?)\*\*/g, '$1') // إزالة ** للنص العريض
      .replace(/__(.*?)__/g, '$1')    // إزالة __ للنص المسطر
      .replace(/##\s*(.*?)$/gm, '$1'); // إزالة ## للعناوين
  };

  // رسم إطار الصفحة  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const drawPageFrame = (page: any, frameType: string, width: number, height: number, margin: number) => {
    const frameMargin = margin - 20;
    
    switch (frameType) {
      case 'simple':
        page.drawRectangle({
          x: frameMargin,
          y: frameMargin,
          width: width - 2 * frameMargin,
          height: height - 2 * frameMargin,
          borderColor: rgb(0, 0, 0),
          borderWidth: 2
        });
        break;
      case 'double':
        // إطار خارجي
        page.drawRectangle({
          x: frameMargin - 5,
          y: frameMargin - 5,
          width: width - 2 * frameMargin + 10,
          height: height - 2 * frameMargin + 10,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1
        });
        // إطار داخلي
        page.drawRectangle({
          x: frameMargin,
          y: frameMargin,
          width: width - 2 * frameMargin,
          height: height - 2 * frameMargin,
          borderColor: rgb(0, 0, 0),
          borderWidth: 2
        });
        break;
      case 'decorative':
        // إطار زخرفي مع ظلال
        page.drawRectangle({
          x: frameMargin,
          y: frameMargin,
          width: width - 2 * frameMargin,
          height: height - 2 * frameMargin,
          borderColor: rgb(0.2, 0.2, 0.2),
          borderWidth: 4
        });
        break;
    }
  };

  const processedContent = processMarkdown(content);  // تقسيم النص إلى أسطر
  const lines = processedContent.split('\n');
  const pageWidth = 595.28; // A4 width
  const pageHeight = 841.89; // A4 height
  const margin = pageFrame !== 'none' ? 70 : 50; // هامش أكبر للإطارات
  const lineHeight = fontSize * 1.2;
  const maxLinesPerPage = Math.floor((pageHeight - 2 * margin) / lineHeight);
  
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - margin;
  let lineCount = 0;

  // رسم إطار الصفحة حسب النوع المختار
  if (pageFrame !== 'none') {
    drawPageFrame(currentPage, pageFrame, pageWidth, pageHeight, margin);
  }
  
  // إضافة النص سطراً بسطر
  for (const line of lines) {
    if (lineCount >= maxLinesPerPage) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      currentY = pageHeight - margin;
      lineCount = 0;
    }
    
    // تقسيم الأسطر الطويلة
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
  return pdfBytes;
}

// دالة مساعدة لتقسيم النص
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