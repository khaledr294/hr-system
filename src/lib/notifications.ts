import { prisma } from '@/lib/prisma';
import { sendEmail, generateContractExpirationEmail } from '@/lib/email';

export async function checkExpiringContracts() {
  try {
    // Get contracts that are expiring in the next 7 days and haven't been notified
    const expiringContracts = await prisma.contract.findMany({
      where: {
        status: 'ACTIVE',
        notifiedBefore: false,
        endDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
      },
      include: {
        worker: true,
        client: true,
      },
    });

    // Send notifications for each expiring contract
    for (const contract of expiringContracts) {
      if (contract.client.email) {
        const emailSent = await sendEmail({
          to: contract.client.email,
          subject: 'تنبيه انتهاء عقد',
          html: generateContractExpirationEmail(
            contract.client.name,
            contract.worker.name,
            contract.endDate
          ),
        });

        if (emailSent) {
          // Mark the contract as notified
          await prisma.contract.update({
            where: { id: contract.id },
            data: { notifiedBefore: true },
          });
        }
      }
    }

    console.log(
      `Processed ${expiringContracts.length} expiring contracts notifications`
    );
  } catch (error) {
    console.error('Error checking expiring contracts:', error);
  }
}