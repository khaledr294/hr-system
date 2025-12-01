import { withApiAuth } from '@/lib/api-guard';
import { Permission } from '@prisma/client';
import { archiveWorker, restoreWorker } from '@/lib/archive';
import { prisma } from '@/lib/prisma';

type EmptyContext = { params: Promise<Record<string, never>> };

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Archive a worker
export const POST = withApiAuth<EmptyContext>(
  { permissions: [Permission.MANAGE_ARCHIVE], auditAction: 'WORKER_ARCHIVE' },
  async ({ req, session }) => {
    try {
      const { workerId, reason } = await req.json();

      if (!workerId || !reason) {
        return new Response('Worker ID and reason are required', { status: 400 });
      }

      const result = await archiveWorker(workerId, reason, session?.user?.id);

      return Response.json(result);
    } catch (error) {
      console.error('Error archiving worker:', error);
      return new Response(error instanceof Error ? error.message : 'Failed to archive worker', { status: 500 });
    }
  }
);

// Restore a worker
export const PUT = withApiAuth<EmptyContext>(
  { permissions: [Permission.MANAGE_ARCHIVE], auditAction: 'WORKER_RESTORE' },
  async ({ req, session }) => {
    try {
      const { archivedWorkerId } = await req.json();

      if (!archivedWorkerId) {
        return new Response('Archived worker ID is required', { status: 400 });
      }

      const result = await restoreWorker(archivedWorkerId, session?.user?.id);

      return Response.json(result);
    } catch (error) {
      console.error('Error restoring worker:', error);
      return new Response(error instanceof Error ? error.message : 'Failed to restore worker', { status: 500 });
    }
  }
);

// List archived workers
export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.VIEW_ARCHIVE], auditAction: 'ARCHIVED_WORKERS_VIEW' },
  async () => {
    try {
      const archivedWorkers = await prisma.archivedWorker.findMany({
        orderBy: { archivedAt: 'desc' }
      });

      return Response.json(archivedWorkers);
    } catch (error) {
      console.error('Error fetching archived workers:', error);
      return new Response('Failed to fetch archived workers', { status: 500 });
    }
  }
);
