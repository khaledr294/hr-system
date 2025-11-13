import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const session = await getSession();

  // Only HR_MANAGER can run migrations
  if (!session?.user || session.user.role !== 'HR_MANAGER') {
    return new Response('Unauthorized - Only HR Manager can run migrations', { status: 403 });
  }

  try {
    // Check if column already exists
    const checkResult = await prisma.$queryRawUnsafe(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Worker' 
      AND column_name = 'medicalStatus'
    `) as { column_name: string }[];

    if (checkResult.length > 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Column medicalStatus already exists',
        alreadyExists: true 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Add the column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Worker" 
      ADD COLUMN "medicalStatus" TEXT DEFAULT 'PENDING_REPORT'
    `);

    // Update existing workers
    await prisma.$executeRawUnsafe(`
      UPDATE "Worker" 
      SET "medicalStatus" = 'PENDING_REPORT' 
      WHERE "medicalStatus" IS NULL
    `);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Migration completed successfully',
      alreadyExists: false 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Migration error:', error);
    
    // Check if it's a permission error
    if (error instanceof Error && error.message.includes('must be owner')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Database permission denied. Please add the column manually via console.prisma.io',
        manualSQL: 'ALTER TABLE "Worker" ADD COLUMN "medicalStatus" TEXT DEFAULT \'PENDING_REPORT\';'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
