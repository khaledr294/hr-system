import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const worker = await prisma.worker.findUnique({
            where: { id: params.id },
            include: {
                contracts: {
                    include: {
                        client: true,
                    },
                },
            },
        });

        if (!worker) {
            return NextResponse.json(
                { error: 'Worker not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(worker);
    } catch (error) {
        console.error('Error fetching worker:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 401 }
            );
        }

        const data = await req.json();
        let nationalitySalaryId = undefined;
        if (data.nationality) {
          const ns = await prisma.nationalitySalary.findFirst({ where: { nationality: data.nationality } });
          if (ns) nationalitySalaryId = ns.id;
        }
        const worker = await prisma.worker.update({
            where: { id: params.id },
            data: {
                ...data,
                nationality: data.nationality,
                nationalitySalaryId,
            },
        });

        return NextResponse.json(worker);
    } catch (error) {
        console.error('Error updating worker:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 401 }
            );
        }

        // Check if worker has any active contracts
        const worker = await prisma.worker.findUnique({
            where: { id: params.id },
            include: {
                contracts: {
                    where: {
                        status: 'ACTIVE',
                    },
                },
            },
        });

        if (worker?.contracts.length) {
            return NextResponse.json(
                { error: 'Cannot delete worker with active contracts' },
                { status: 400 }
            );
        }

        await prisma.worker.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting worker:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}