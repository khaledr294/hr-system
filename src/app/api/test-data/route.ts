import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

type EmptyContext = { params: Promise<Record<string, never>> };

export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.MANAGE_SETTINGS] },
  async () => {
    try {
      const workersCount = await prisma.worker.count();
      const contractsCount = await prisma.contract.count();
      const nationalitySalariesCount = await prisma.nationalitySalary.count();
      
      const workers = await prisma.worker.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          nationality: true,
          status: true
        },
        take: 5
      });

      const contracts = await prisma.contract.findMany({
        select: {
          id: true,
          workerId: true,
          startDate: true,
          endDate: true,
          status: true,
          packageType: true,
          totalAmount: true
        },
        take: 5
      });

      const nationalitySalaries = await prisma.nationalitySalary.findMany({
        select: {
          id: true,
          nationality: true,
          salary: true
        }
      });

      return NextResponse.json({
        success: true,
        counts: {
          workers: workersCount,
          contracts: contractsCount,
          nationalitySalaries: nationalitySalariesCount
        },
        data: {
          workers,
          contracts,
          nationalitySalaries
        }
      });
    } catch (error) {
      console.error('Database test error:', error);
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  }
);