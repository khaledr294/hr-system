import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

type NationalityContext = { params: Promise<{ id: string }> };

export const GET = withApiAuth<NationalityContext>(
  { permissions: [Permission.VIEW_WORKERS] },
  async ({ context }) => {
    try {
      const params = await context.params;
      const nationalitySalary = await prisma.nationalitySalary.findUnique({
        where: { id: params.id },
        include: {
          workers: {
            select: { id: true, name: true, code: true, status: true },
          },
        },
      });

      if (!nationalitySalary) {
        return NextResponse.json({ error: 'NationalitySalary not found' }, { status: 404 });
      }

      return NextResponse.json(nationalitySalary);
    } catch (error) {
      console.error('Failed to fetch nationality salary:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);

export const PUT = withApiAuth<NationalityContext>(
  { permissions: [Permission.MANAGE_SETTINGS], auditAction: 'NATIONALITY_SALARY_UPDATE' },
  async ({ req, context }) => {
    try {
      const params = await context.params;
      const data = await req.json();
      const requiredFields = ['nationality', 'salary'];
      for (const field of requiredFields) {
        if (!data[field]) {
          return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
        }
      }

      const existingNationality = await prisma.nationalitySalary.findFirst({
        where: {
          nationality: data.nationality,
          NOT: { id: params.id },
        },
      });

      if (existingNationality) {
        return NextResponse.json({ error: 'Nationality already exists' }, { status: 400 });
      }

      const nationalitySalary = await prisma.nationalitySalary.update({
        where: { id: params.id },
        data: {
          nationality: data.nationality,
          salary: parseFloat(data.salary),
        },
      });

      return NextResponse.json(nationalitySalary);
    } catch (error) {
      console.error('Failed to update nationality salary:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);

export const DELETE = withApiAuth<NationalityContext>(
  { permissions: [Permission.MANAGE_SETTINGS], auditAction: 'NATIONALITY_SALARY_DELETE' },
  async ({ context }) => {
    try {
      const params = await context.params;
      const nationalitySalary = await prisma.nationalitySalary.findUnique({
        where: { id: params.id },
        include: { workers: true },
      });

      if (!nationalitySalary) {
        return NextResponse.json({ error: 'NationalitySalary not found' }, { status: 404 });
      }

      if (nationalitySalary.workers.length > 0) {
        return NextResponse.json({ error: 'Cannot delete nationality with associated workers' }, { status: 400 });
      }

      await prisma.nationalitySalary.delete({ where: { id: params.id } });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Failed to delete nationality salary:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);