import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const params = await context.params;
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
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'HR')) {
            return NextResponse.json(
                { error: 'Unauthorized - Admin or HR access required' },
                { status: 401 }
            );
        }
        const params = await context.params;
        const data = await req.json();
        // Check for unique residency number if it's being updated
        if (data.residencyNumber) {
            const existingWorker = await prisma.worker.findFirst({
                where: {
                    residencyNumber: data.residencyNumber,
                    id: { not: params.id }
                }
            });
            
            if (existingWorker) {
                return NextResponse.json(
                    { error: 'Worker with this residency number already exists' },
                    { status: 400 }
                );
            }
        }
        
        let nationalitySalaryId = undefined;
        if (data.nationality) {
          const ns = await prisma.nationalitySalary.findFirst({ where: { nationality: data.nationality } });
          if (ns) nationalitySalaryId = ns.id;
        }
        
        const updateData: {
          name?: string;
          nationality?: string;
          residencyNumber?: string;
          phone?: string;
          status?: string;
          dateOfBirth?: Date;
          nationalitySalaryId?: string;
        } = {
            name: data.name,
            nationality: data.nationality,
            residencyNumber: data.residencyNumber,
            phone: data.phone,
            nationalitySalaryId,
        };
        
        // Convert dateOfBirth to Date object if provided
        if (data.dateOfBirth) {
            updateData.dateOfBirth = new Date(data.dateOfBirth);
        }
        
        const worker = await prisma.worker.update({
            where: { id: params.id },
            data: updateData,
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
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'HR')) {
            return NextResponse.json(
                { error: 'Unauthorized - Admin or HR access required' },
                { status: 401 }
            );
        }
        const params = await context.params;
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