import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

type EmptyContext = { params: Promise<Record<string, never>> };

export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.VIEW_WORKERS] },
  async () => {
    try {
      const nationalities = await prisma.nationalitySalary.findMany({
        orderBy: { nationality: 'asc' },
      });

      return NextResponse.json(nationalities);
    } catch (error) {
      console.error('Failed to fetch nationalities:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);

export const POST = withApiAuth<EmptyContext>(
  { permissions: [Permission.MANAGE_SETTINGS], auditAction: 'NATIONALITY_SALARY_CREATE' },
  async ({ req }) => {
    try {
      const data = await req.json();
      const requiredFields = ['nationality', 'salary'];
      for (const field of requiredFields) {
        if (!data[field]) {
          return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
        }
      }

      const existingNationality = await prisma.nationalitySalary.findUnique({
        where: { nationality: data.nationality },
      });

      if (existingNationality) {
        return NextResponse.json({ error: 'Nationality already exists' }, { status: 400 });
      }

      const nationalitySalary = await prisma.nationalitySalary.create({
        data: {
          nationality: data.nationality,
          salary: parseFloat(data.salary),
        },
      });

      return NextResponse.json(nationalitySalary, { status: 201 });
    } catch (error) {
      console.error('Failed to create nationality:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);
