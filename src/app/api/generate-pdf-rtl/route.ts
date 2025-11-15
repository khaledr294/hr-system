import { NextResponse } from 'next/server';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

type EmptyContext = { params: Promise<Record<string, never>> };

export const POST = withApiAuth<EmptyContext>(
  { permissions: [Permission.MANAGE_TEMPLATES] },
  async () => {
    console.log('PDF API: Received request');

    return NextResponse.json(
      { error: 'PDF generation is temporarily disabled during deployment setup' },
      { status: 503 }
    );
  }
);
