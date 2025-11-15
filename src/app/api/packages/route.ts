import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type EmptyContext = { params: Promise<Record<string, never>> };

export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.VIEW_CONTRACTS] },
  async () => {
    const packages = await prisma.package.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(packages);
  }
);

export const POST = withApiAuth<EmptyContext>(
  { permissions: [Permission.MANAGE_PACKAGES], auditAction: 'PACKAGE_CREATE' },
  async ({ req }) => {
    try {
      const data = await req.json();
      if (!data.name || !data.duration || !data.price) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
      const pkg = await prisma.package.create({ data });
      return NextResponse.json(pkg, { status: 201 });
    } catch (error) {
      console.error('Failed to create package:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);
