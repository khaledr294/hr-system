import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

type PackageContext = { params: Promise<{ id: string }> };

export const PATCH = withApiAuth<PackageContext>(
  { permissions: [Permission.MANAGE_PACKAGES], auditAction: 'PACKAGE_UPDATE' },
  async ({ req, context }) => {
    try {
      const { id } = await context.params;
      const data = await req.json();
      const allowed = ['name', 'duration', 'price'];
      const updateData: Partial<{ name: string; duration: number; price: number }> = {};

      for (const key of allowed) {
        if (key in data) {
          if (key === 'name') updateData.name = String(data.name);
          if (key === 'duration') updateData.duration = Number(data.duration);
          if (key === 'price') updateData.price = Number(data.price);
        }
      }

      const pkg = await prisma.package.update({ where: { id }, data: updateData });
      return NextResponse.json(pkg);
    } catch (error) {
      console.error('Failed to update package:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);

export const DELETE = withApiAuth<PackageContext>(
  { permissions: [Permission.MANAGE_PACKAGES], auditAction: 'PACKAGE_DELETE' },
  async ({ context }) => {
    try {
      const { id } = await context.params;
      await prisma.package.delete({ where: { id } });
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Failed to delete package:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);
