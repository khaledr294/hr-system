import { NextRequest, NextResponse } from 'next/server';
import { Permission } from '@prisma/client';
import { createDatabaseBackup, getBackups, deleteBackup, cleanupOldBackups, getBackupStats } from '@/lib/backup';
import { withApiAuth } from '@/lib/api-guard';

type EmptyContext = { params: Promise<Record<string, never>> };

export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.MANAGE_BACKUPS], auditAction: 'BACKUP_VIEW' },
  async ({ req }) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get('action');
    if (action === 'stats') {
      const stats = await getBackupStats();
      return NextResponse.json(stats);
    }
    const backups = await getBackups();
    return NextResponse.json({ backups });
  } catch (error) {
    console.error('Failed to load backups:', error);
    return NextResponse.json({ error: 'error' }, { status: 500 });
  }
}
);

export const POST = withApiAuth<EmptyContext>(
  { permissions: [Permission.MANAGE_BACKUPS], auditAction: 'BACKUP_ACTION' },
  async ({ req }) => {
  try {
    const body = await req.json();
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
    console.error('Failed to process backup action:', error);
    return NextResponse.json({ error: 'error' }, { status: 500 });
  }
}
);
