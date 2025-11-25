import { NextRequest } from 'next/server';
import { withApiAuth } from '@/lib/api-guard';
import { Permission } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

type EmptyContext = { params: Promise<Record<string, never>> };

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const POST = withApiAuth<EmptyContext>(
  { permissions: [Permission.MANAGE_BACKUPS], auditAction: 'BACKUP_UPLOAD' },
  async ({ req, session }) => {
    try {
      const formData = await req.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return new Response('No file uploaded', { status: 400 });
      }

      // Validate file extension
      if (!file.name.endsWith('.gz')) {
        return new Response('Invalid file format. Only .gz files are supported', { status: 400 });
      }

      // Read file as base64
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Data = buffer.toString('base64');

      // Create backup record in database
      const backup = await prisma.backup.create({
        data: {
          id: uuidv4(),
          filename: file.name,
          size: BigInt(file.size),
          type: 'manual',
          status: 'completed',
          data: base64Data,
          createdAt: new Date(),
        },
      });

      // Log upload action
      await prisma.log.create({
        data: {
          id: uuidv4(),
          userId: session?.user?.id,
          action: 'BACKUP_UPLOAD',
          details: JSON.stringify({
            filename: file.name,
            size: file.size,
            backupId: backup.id,
          }),
        },
      }).catch(() => null);

      return Response.json({
        success: true,
        backup: {
          id: backup.id,
          filename: backup.filename,
          size: Number(backup.size),
          type: backup.type,
          status: backup.status,
          createdAt: backup.createdAt,
        },
      });
    } catch (error: any) {
      console.error('Error uploading backup:', error);
      return new Response(error.message || 'Failed to upload backup', { status: 500 });
    }
  }
);
