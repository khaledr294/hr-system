import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireHR } from '@/lib/require';

type PasswordContext = { params: Promise<{ id: string }> };

export async function GET(
  request: Request,
  context: PasswordContext
) {
  try {
    await requireHR();
    
    const params = await context.params;
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { password: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return the password (it's already hashed in the database)
    return NextResponse.json({ password: user.password });
  } catch (error) {
    console.error('Error fetching user password:', error);
    return NextResponse.json(
      { error: 'Failed to fetch password' },
      { status: 500 }
    );
  }
}
