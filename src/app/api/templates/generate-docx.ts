import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

const TEMPLATE_FILE = path.join(process.cwd(), 'templates', 'contract-template.docx');

export async function POST(req: NextRequest) {
	try {
		const data = await req.json();
		const content = await fs.readFile(TEMPLATE_FILE, 'binary');
		const zip = new PizZip(content);
		const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
		doc.render(data);
			const buf = doc.getZip().generate({ type: 'uint8array' });
			const body = new Uint8Array(buf);
			return new NextResponse(body, {
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

