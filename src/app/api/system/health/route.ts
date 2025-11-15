import { NextResponse } from 'next/server';
import { healthCheck, optimizeDatabase } from '@/lib/performance';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

type EmptyContext = { params: Promise<Record<string, never>> };

export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.VIEW_LOGS] },
  async () => {
    try {
      const health = await healthCheck();
      return NextResponse.json(health);
    } catch (error) {
      console.error('Health check error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);

export const POST = withApiAuth<EmptyContext>(
  { permissions: [Permission.MANAGE_SETTINGS], auditAction: 'SYSTEM_OPTIMIZE' },
  async ({ req }) => {
    const { action } = await req.json();

    try {
      if (action === 'optimize') {
        await optimizeDatabase();
        return NextResponse.json({ message: 'Database optimized successfully' });
      }

      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
      console.error('Database optimization error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);