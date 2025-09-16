// سكريبت Node.js: يحول الخط إلى base64 ويولّد ملف vfs مناسب لـ pdfmake
import fs from 'fs';
import path from 'path';

const fontPath = path.join(__dirname, '../public/fonts/NotoSansArabic-Regular.ttf');
const outPath = path.join(__dirname, '../src/lib/pdfmake-noto-arabic.js');

const fontData = fs.readFileSync(fontPath);
const base64 = fontData.toString('base64');

const js = `// تم التوليد تلقائياً بواسطة scripts/generate-noto-vfs.js\nexport const notoVfs = {\n  'NotoSansArabic-Regular.ttf': '${base64}'\n};\n\nexport const notoFonts = {\n  NotoSansArabic: {\n    normal: 'NotoSansArabic-Regular.ttf',\n    bold: 'NotoSansArabic-Regular.ttf',\n    italics: 'NotoSansArabic-Regular.ttf',\n    bolditalics: 'NotoSansArabic-Regular.ttf',\n  }\n};\n`;

fs.writeFileSync(outPath, js, 'utf8');
console.log('تم توليد ملف pdfmake-noto-arabic.js بنجاح!');
