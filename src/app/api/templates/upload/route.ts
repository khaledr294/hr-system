export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const TEMPLATES_DIR = path.join(process.cwd(), 'templates');
const TEMPLATE_FILE = path.join(TEMPLATES_DIR, 'contract-template.docx');

export async function POST(req: NextRequest) {
  try {
    console.log('[upload] Received POST /api/templates/upload');
    const form = await req.formData();
    
    // طباعة جميع المفاتيح في FormData للتشخيص
    console.log('[upload] FormData keys:', Array.from(form.keys()));
    
    const file = form.get('template') as File | null;
    console.log('[upload] File object:', file ? { name: file.name, size: file.size, type: file.type } : 'null');
    
    if (!file || !file.name || !file.name.endsWith('.docx')) {
      console.error('[upload] No valid .docx file in FormData');
      return NextResponse.json({ error: 'يرجى رفع ملف .docx صالح' }, { status: 400 });
    }
    await fs.mkdir(TEMPLATES_DIR, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(TEMPLATE_FILE, bytes);
    console.log('[upload] Template saved to', TEMPLATE_FILE, 'size:', bytes.length);
    return NextResponse.json({ 
      success: true, 
      message: 'تم رفع القالب بنجاح',
      size: bytes.length 
    });
  } catch (err) {
    console.error('[upload] Error:', err);
    return NextResponse.json({ error: 'فشل رفع القالب: ' + String(err) }, { status: 500 });
  }
}

export async function GET() {
  // Simple health check endpoint
  try {
    return NextResponse.json({ ok: true, message: 'upload endpoint ready' });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
