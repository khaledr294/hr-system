import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { createLog } from '@/lib/logger';
import { hasPermission } from '@/lib/permissions';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // التحقق من صلاحية عرض العملاء
  const canView = await hasPermission(session.user.id, 'VIEW_CLIENTS');
  if (!canView) {
    return new Response('Forbidden - ليس لديك صلاحية عرض العملاء', { status: 403 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('query');

    const where = query
      ? {
          OR: [
            { name: { contains: query } },
            { idNumber: { contains: query } },
            { phone: { contains: query } },
          ],
        }
      : {};

    const clients = await prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return new Response(JSON.stringify(clients), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();

  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // التحقق من صلاحية إنشاء عملاء
  const canCreate = await hasPermission(session.user.id, 'CREATE_CLIENTS');
  if (!canCreate) {
    return new Response('Forbidden - ليس لديك صلاحية إضافة عملاء', { status: 403 });
  }

  try {
    const data = await req.json();

    // Validate required fields
    const requiredFields = ['name', 'phone', 'address', 'idNumber'];

    for (const field of requiredFields) {
      if (!data[field]) {
        return new Response(`Missing required field: ${field}`, { status: 400 });
      }
    }

    // Validate unique idNumber
    const existingClient = await prisma.client.findUnique({
      where: { idNumber: data.idNumber },
    });

    if (existingClient) {
      return new Response('Client ID number already exists', { status: 400 });
    }

    // تحويل تاريخ الميلاد من نص إلى Date إذا كان موجودًا
    const clientData = { ...data };
    if (clientData.dateOfBirth) {
      clientData.dateOfBirth = new Date(clientData.dateOfBirth);
    }
    // Create client
    const client = await prisma.client.create({
      data: clientData,
    });

    return new Response(JSON.stringify(client), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to create client:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}