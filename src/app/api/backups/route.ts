import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createDatabaseBackup, getBackups, deleteBackup, cleanupOldBackups, getBackupStats } from '@/lib/backup';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['ADMIN', 'GENERAL_MANAGER', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    if (action === 'stats') {
      const stats = await getBackupStats();
      return NextResponse.json(stats);
    }
    const backups = await getBackups();
    return NextResponse.json({ backups });
  } catch (error) {
    return NextResponse.json({ error: 'error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['ADMIN', 'GENERAL_MANAGER', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    const body = await request.json();
    const { action, backupId } = body;
    if (action === 'create') {
      const result = await createDatabaseBackup('manual');
      return NextResponse.json({ success: true, backup: result.backup, data: result.data });
    }
    if (action === 'delete') {
      if (!backupId) return NextResponse.json({ error: 'id required' }, { status: 400 });
      const success = await deleteBackup(backupId);
      return NextResponse.json({ success });
    }
    if (action === 'cleanup') {
      const deletedCount = await cleanupOldBackups();
      return NextResponse.json({ success: true, deletedCount });
    }
    return NextResponse.json({ error: 'unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'error' }, { status: 500 });
  }
}
