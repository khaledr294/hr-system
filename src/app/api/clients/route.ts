import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type EmptyContext = { params: Promise<Record<string, never>> };

export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.VIEW_CLIENTS] },
  async ({ req }) => {
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

      return NextResponse.json(clients);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);

export const POST = withApiAuth<EmptyContext>(
  { permissions: [Permission.CREATE_CLIENTS], auditAction: 'CLIENT_CREATE' },
  async ({ req }) => {
    try {
      const data = await req.json();

      const requiredFields = ['name', 'phone', 'address', 'idNumber'];
      for (const field of requiredFields) {
        if (!data[field]) {
          return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
        }
      }

      const existingClient = await prisma.client.findUnique({
        where: { idNumber: data.idNumber },
      });

      if (existingClient) {
        return NextResponse.json({ error: 'Client ID number already exists' }, { status: 400 });
      }

      const clientData = { ...data };
      if (clientData.dateOfBirth) {
        clientData.dateOfBirth = new Date(clientData.dateOfBirth);
      }

      const client = await prisma.client.create({ data: clientData });

      return NextResponse.json(client, { status: 201 });
    } catch (error) {
      console.error('Failed to create client:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);