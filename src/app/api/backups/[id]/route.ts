import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Adjust this path to your backup storage directory
const BACKUP_DIR = path.resolve(process.cwd(), 'backups');

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // Find the backup file by id (assuming filename contains the id)
    const files = await fs.readdir(BACKUP_DIR);
    const fileToDelete = files.find(f => f.includes(id));
    if (!fileToDelete) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
    }
    await fs.unlink(path.join(BACKUP_DIR, fileToDelete));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
