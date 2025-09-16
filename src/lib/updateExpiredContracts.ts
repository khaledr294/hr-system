import { prisma } from '@/lib/prisma';
import { ContractStatus } from '@prisma/client';

export async function updateExpiredContracts() {
  const today = new Date();
  
  try {
    const result = await prisma.contract.updateMany({
      where: {
        endDate: {
          lt: today
        },
        status: {
          not: ContractStatus.EXPIRED
        }
      },
      data: {
        status: ContractStatus.EXPIRED
      }
    });

    return {
      success: true,
      updatedCount: result.count,
      message: 'Contracts updated successfully'
    };
  } catch (error) {
    console.error('Error updating expired contracts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      updatedCount: 0
    };
  }
}
