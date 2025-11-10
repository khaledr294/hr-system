import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { hasPermission } from '@/lib/permissions';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  try {
    const params = await context.params;
    const nationalitySalary = await prisma.nationalitySalary.findUnique({
      where: { id: params.id },
      include: {
        workers: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
          },
        },
      },
    });

    if (!nationalitySalary) {
      return new Response('NationalitySalary not found', { status: 404 });
    }

    return new Response(JSON.stringify(nationalitySalary), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to fetch nationality salary:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // التحقق من صلاحية إدارة الإعدادات
  const canManage = await hasPermission(session.user.id, 'MANAGE_SETTINGS');
  if (!canManage) {
    return new Response('Forbidden - ليس لديك صلاحية تعديل الرواتب', { status: 403 });
  }
  try {
    const params = await context.params;
    const data = await req.json();
    // Validate required fields
    const requiredFields = ['nationality', 'salary'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return new Response(`Missing required field: ${field}`, { status: 400 });
      }
    }

    // Check if nationality is already in use by another entry
    const existingNationality = await prisma.nationalitySalary.findFirst({
      where: {
        nationality: data.nationality,
        NOT: {
          id: params.id,
        },
      },
    });

    if (existingNationality) {
      return new Response('Nationality already exists', { status: 400 });
    }

    // Update nationality salary
    const nationalitySalary = await prisma.nationalitySalary.update({
      where: { id: params.id },
      data: {
        nationality: data.nationality,
        salary: parseFloat(data.salary),
      },
    });

    return new Response(JSON.stringify(nationalitySalary), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to update nationality salary:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // التحقق من صلاحية إدارة الإعدادات
  const canManage = await hasPermission(session.user.id, 'MANAGE_SETTINGS');
  if (!canManage) {
    return new Response('Forbidden - ليس لديك صلاحية حذف الرواتب', { status: 403 });
  }
  try {
    const params = await context.params;
    // Check if nationality has any associated workers
    const nationalitySalary = await prisma.nationalitySalary.findUnique({
      where: { id: params.id },
      include: {
        workers: true,
      },
    });

    if (!nationalitySalary) {
      return new Response('NationalitySalary not found', { status: 404 });
    }

    if (nationalitySalary.workers.length > 0) {
      return new Response('Cannot delete nationality with associated workers', {
        status: 400,
      });
    }

    // Delete nationality salary
    await prisma.nationalitySalary.delete({
      where: { id: params.id },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete nationality salary:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}