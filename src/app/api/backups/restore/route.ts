import { NextRequest } from 'next/server';
import { withApiAuth } from '@/lib/api-guard';
import { Permission } from '@prisma/client';
import { restoreBackup } from '@/lib/backup';

type EmptyContext = { params: Promise<Record<string, never>> };

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const POST = withApiAuth<EmptyContext>(
  { permissions: [Permission.MANAGE_BACKUPS], auditAction: 'BACKUP_RESTORE' },
  async ({ req, session }) => {
    try {
      const { backupId, confirmationCode } = await req.json();

      if (!backupId) {
        return new Response('Backup ID is required', { status: 400 });
      }

      // Verify confirmation code
      if (confirmationCode !== 'RESTORE') {
        return new Response('Invalid confirmation code. Please type RESTORE to confirm.', { status: 400 });
      }

      const result = await restoreBackup(backupId, session?.user?.id);

      return Response.json(result);
    } catch (error: any) {
      console.error('Error restoring backup:', error);
      return new Response(error.message || 'Failed to restore backup', { status: 500 });
    }
  }
);
