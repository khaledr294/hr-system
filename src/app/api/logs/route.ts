import { NextResponse } from 'next/server';
import { getLogs } from '@/lib/logger';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';
import { sessionHasPermission } from '@/lib/permissions';

type EmptyContext = { params: Promise<Record<string, never>> };

export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.VIEW_LOGS] },
  async ({ req, session }) => {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const action = searchParams.get('action') || undefined;

    const canScopeUsers = sessionHasPermission(session, Permission.MANAGE_SETTINGS);
    const requestedUserId = searchParams.get('userId') || undefined;
    const userId = canScopeUsers ? requestedUserId : session.user.id;

    try {
      const result = await getLogs(userId, page, limit, action);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Error fetching logs:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);
