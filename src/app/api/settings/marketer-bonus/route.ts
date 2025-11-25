import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

interface PackageBonus {
  packageName: string;
  bonusAmount: number;
  enabled: boolean;
}

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session || session.user.role !== 'HR_MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'system' },
      select: {
        marketerBonusPackages: true,
        marketerBonusAmount: true,
      },
    });

    let packages: PackageBonus[] = [];
    if (settings?.marketerBonusPackages) {
      try {
        packages = JSON.parse(settings.marketerBonusPackages);
      } catch {
        packages = [];
      }
    }

    return NextResponse.json({
      packages,
      defaultBonusAmount: settings?.marketerBonusAmount || 50,
    });
  } catch (error) {
    console.error('Error fetching marketer bonus settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    
    if (!session || session.user.role !== 'HR_MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    console.log('Received body:', body);
    
    const { packages } = body as { packages: PackageBonus[] };
    console.log('Packages to save:', packages);

    // Ensure system settings exist
    const result = await prisma.systemSettings.upsert({
      where: { id: 'system' },
      create: {
        id: 'system',
        marketerBonusPackages: JSON.stringify(packages),
      },
      update: {
        marketerBonusPackages: JSON.stringify(packages),
      },
    });
    
    console.log('Save result:', result);

    await prisma.log.create({
      data: {
        action: 'UPDATE_MARKETER_BONUS_SETTINGS',
        message: `تم تحديث إعدادات بونص المسوقين`,
        entity: 'SystemSettings',
        entityId: 'system',
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating marketer bonus settings:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
