import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        contracts: {
          include: {
            worker: true,
          },
          orderBy: {
            startDate: 'desc',
          },
        },
      },
    });

    if (!client) {
      return new Response('Client not found', { status: 404 });
    }

    return new Response(JSON.stringify(client), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to fetch client:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
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

    // Check if idNumber is already in use by another client
    const existingClient = await prisma.client.findFirst({
      where: {
        idNumber: data.idNumber,
        NOT: {
          id: params.id,
        },
      },
    });

    if (existingClient) {
      return new Response('Client ID number already exists', { status: 400 });
    }

    // Update client
    const client = await prisma.client.update({
      where: { id: params.id },
      data,
    });

    return new Response(JSON.stringify(client), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to update client:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Check if client has any active contracts
    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        contracts: {
          where: {
            status: 'ACTIVE',
          },
        },
      },
    });

    if (client?.contracts.length) {
      return new Response('Cannot delete client with active contracts', {
        status: 400,
      });
    }

    // Delete client
    await prisma.client.delete({
      where: { id: params.id },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete client:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}