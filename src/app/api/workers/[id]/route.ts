import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { createLog } from '@/lib/logger';
import { hasPermission } from '@/lib/permissions';
import {
    mergeWorkerMeta,
    parseWorkerMeta,
    type MedicalStatus,
} from '@/lib/medicalStatus';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // التحقق من صلاحية عرض العمال
        const canView = await hasPermission(session.user.id, 'VIEW_WORKERS');
        if (!canView) {
            return NextResponse.json({ error: 'Forbidden - ليس لديك صلاحية عرض العمال' }, { status: 403 });
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

        const meta = parseWorkerMeta(worker.reservationNotes);

        return NextResponse.json({
            ...worker,
            reservationNotes: meta.reservationNote,
            reservationNotesRaw: meta.raw,
            medicalStatus: meta.medicalStatus,
        });
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
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // التحقق من صلاحية تعديل العمال
        const canEdit = await hasPermission(session.user.id, 'EDIT_WORKERS');
        if (!canEdit) {
            return NextResponse.json({ error: 'Forbidden - ليس لديك صلاحية تعديل العمال' }, { status: 403 });
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
        
        const existingWorker = await prisma.worker.findUnique({
            where: { id: params.id },
            select: { reservationNotes: true },
        });

        if (!existingWorker) {
            return NextResponse.json(
                { error: 'Worker not found' },
                { status: 404 }
            );
        }

        const reservationNoteInput = data.reservationNote ?? data.reservationNotes;
        const reservationNote =
            reservationNoteInput === undefined
                ? undefined
                : typeof reservationNoteInput === 'string'
                    ? reservationNoteInput.trim() === ''
                        ? null
                        : reservationNoteInput.trim()
                    : null;

        const reservationNotes = mergeWorkerMeta({
            existingRawNotes: existingWorker.reservationNotes,
            medicalStatus: data.medicalStatus as MedicalStatus | undefined,
            reservationNote,
        });

        const updateData: {
          name?: string;
          nationality?: string;
          residencyNumber?: string;
          phone?: string;
          status?: string;
          dateOfBirth?: Date;
          nationalitySalaryId?: string;
          borderNumber?: string | null;
          officeName?: string | null;
          arrivalDate?: Date | null;
          passportNumber?: string | null;
          religion?: string | null;
          iban?: string | null;
          residenceBranch?: string | null;
          reservationNotes?: string | null;
        } = {
            name: data.name,
            nationality: data.nationality,
            residencyNumber: data.residencyNumber,
            phone: data.phone,
            nationalitySalaryId,
            borderNumber: data.borderNumber ?? null,
            officeName: data.officeName ?? null,
            passportNumber: data.passportNumber ?? null,
            religion: data.religion ?? null,
            iban: data.iban ?? null,
            residenceBranch: data.residenceBranch ?? null,
            reservationNotes,
        };
        
        // Convert dateOfBirth to Date object if provided
        if (data.dateOfBirth) {
            updateData.dateOfBirth = new Date(data.dateOfBirth);
        }

        if (data.arrivalDate) {
            const arrivalDateValue = new Date(data.arrivalDate);
            updateData.arrivalDate = isNaN(arrivalDateValue.getTime())
                ? null
                : arrivalDateValue;
        } else if (data.arrivalDate === null) {
            updateData.arrivalDate = null;
        }
        
        const worker = await prisma.worker.update({
            where: { id: params.id },
            data: updateData,
        });

        // Log the worker update
        await createLog(session.user.id, 'WORKER_UPDATED', `Worker updated: ${data.name} (ID: ${params.id})`);

        const meta = parseWorkerMeta(worker.reservationNotes);

        return NextResponse.json({
            ...worker,
            reservationNotes: meta.reservationNote,
            reservationNotesRaw: meta.raw,
            medicalStatus: meta.medicalStatus,
        });
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
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // التحقق من صلاحية حذف العمال
        const canDelete = await hasPermission(session.user.id, 'DELETE_WORKERS');
        if (!canDelete) {
            return NextResponse.json({ error: 'Forbidden - ليس لديك صلاحية حذف العمال' }, { status: 403 });
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

        // Log the worker deletion
        await createLog(session.user.id, 'WORKER_DELETED', `Worker deleted: ${worker?.name} (ID: ${params.id})`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting worker:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}