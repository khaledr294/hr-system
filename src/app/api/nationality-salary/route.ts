import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const nationalities = await prisma.nationalitySalary.findMany({
      orderBy: { nationality: 'asc' }
    });
    
    return new Response(JSON.stringify(nationalities), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Failed to fetch nationalities:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const data = await req.json();
    
    // Validate required fields
    const requiredFields = [
      'nationality',
      'salary'
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return new Response(`Missing required field: ${field}`, { status: 400 });
      }
    }

    // Validate unique nationality
    const existingNationality = await prisma.nationalitySalary.findUnique({
      where: { nationality: data.nationality }
    });

    if (existingNationality) {
      return new Response('Nationality already exists', { status: 400 });
    }

    const nationalitySalary = await prisma.nationalitySalary.create({
      data: {
        nationality: data.nationality,
        salary: parseFloat(data.salary)
      }
    });

    return new Response(JSON.stringify(nationalitySalary), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Failed to create nationality:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
