import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

type ClientContext = { params: Promise<{ id: string }> };

export const GET = withApiAuth<ClientContext>(
  { permissions: [Permission.VIEW_CLIENTS] },
  async ({ context }) => {
    try {
      const params = await context.params;
      const client = await prisma.client.findUnique({
        where: { id: params.id },
        include: {
          contracts: {
            include: { worker: true },
            orderBy: { startDate: 'desc' },
          },
        },
      });

      if (!client) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }

      return NextResponse.json(client);
    } catch (error) {
      console.error('Failed to fetch client:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);

export const PUT = withApiAuth<ClientContext>(
  { permissions: [Permission.EDIT_CLIENTS], auditAction: 'CLIENT_UPDATE' },
  async ({ req, context }) => {
    try {
      const params = await context.params;
      const data = await req.json();

      const requiredFields = ['name', 'phone', 'address', 'idNumber'];
      for (const field of requiredFields) {
        if (!data[field]) {
          return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
        }
      }

      const existingClient = await prisma.client.findFirst({
        where: {
          idNumber: data.idNumber,
          NOT: { id: params.id },
        },
      });

      if (existingClient) {
        return NextResponse.json({ error: 'Client ID number already exists' }, { status: 400 });
      }

      const client = await prisma.client.update({
        where: { id: params.id },
        data,
      });

      return NextResponse.json(client);
    } catch (error) {
      console.error('Failed to update client:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);

export const DELETE = withApiAuth<ClientContext>(
  { permissions: [Permission.DELETE_CLIENTS], auditAction: 'CLIENT_DELETE' },
  async ({ context }) => {
    try {
      const params = await context.params;
      const client = await prisma.client.findUnique({
        where: { id: params.id },
        include: {
          contracts: {
            where: { status: 'ACTIVE' },
          },
        },
      });

      if (client?.contracts.length) {
        return NextResponse.json(
          { error: 'Cannot delete client with active contracts' },
          { status: 400 }
        );
      }

      await prisma.client.delete({ where: { id: params.id } });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Failed to delete client:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);