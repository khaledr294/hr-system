import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Count workers
    const workersCount = await prisma.worker.count();
    
    // Count contracts
    const contractsCount = await prisma.contract.count();
    
    // Count nationality salaries
    const nationalitySalariesCount = await prisma.nationalitySalary.count();
    
    // Get sample workers if any exist
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

    // Get sample contracts if any exist
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

    // Get nationality salaries
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