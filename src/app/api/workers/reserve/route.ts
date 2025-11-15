import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createLog } from '@/lib/logger';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';
import { mergeWorkerMeta, parseWorkerMeta } from '@/lib/medicalStatus';

type EmptyContext = { params: Promise<Record<string, never>> };

export const POST = withApiAuth<EmptyContext>(
  { permissions: [Permission.RESERVE_WORKERS], auditAction: 'WORKER_RESERVE' },
  async ({ req, session }) => {
    try {
      const { workerId, reservationNotes } = await req.json();
      const normalizedReservationNote =
        typeof reservationNotes === 'string'
          ? reservationNotes.trim() === ''
            ? null
            : reservationNotes.trim()
          : reservationNotes ?? null;

      if (!workerId) {
        return NextResponse.json({ error: 'معرف العاملة مطلوب' }, { status: 400 });
      }

      const worker = await prisma.worker.findUnique({ where: { id: workerId } });

      if (!worker) {
        return NextResponse.json({ error: 'العاملة غير موجودة' }, { status: 404 });
      }

      if (worker.status !== 'AVAILABLE') {
        return NextResponse.json({ error: 'العاملة غير متاحة للحجز' }, { status: 400 });
      }

      const updatedWorker = await prisma.worker.update({
        where: { id: workerId },
        data: {
          status: 'RESERVED',
          reservationNotes: mergeWorkerMeta({
            existingRawNotes: worker.reservationNotes,
            reservationNote: normalizedReservationNote,
          }),
          reservedAt: new Date(),
          reservedBy: session.user.id,
        },
      });

      await createLog(
        session.user.id,
        'WORKER_RESERVED',
        `تم حجز العاملة ${worker.name} (الكود: ${worker.code})`
      );

      const meta = parseWorkerMeta(updatedWorker.reservationNotes);

      return NextResponse.json({
        message: 'تم حجز العاملة بنجاح',
        worker: {
          ...updatedWorker,
          reservationNotes: meta.reservationNote,
          reservationNotesRaw: meta.raw,
          medicalStatus: meta.medicalStatus,
        },
      });
    } catch (error) {
      console.error('خطأ في حجز العاملة:', error);
      return NextResponse.json({ error: 'حدث خطأ في حجز العاملة' }, { status: 500 });
    }
  }
);

export const DELETE = withApiAuth<EmptyContext>(
  { permissions: [Permission.RESERVE_WORKERS], auditAction: 'WORKER_RESERVATION_CANCEL' },
  async ({ req, session }) => {
    try {
      const { searchParams } = new URL(req.url);
      const workerId = searchParams.get('workerId');

      if (!workerId) {
        return NextResponse.json({ error: 'معرف العاملة مطلوب' }, { status: 400 });
      }

      const worker = await prisma.worker.findUnique({ where: { id: workerId } });

      if (!worker) {
        return NextResponse.json({ error: 'العاملة غير موجودة' }, { status: 404 });
      }

      if (worker.status !== 'RESERVED') {
        return NextResponse.json({ error: 'العاملة غير محجوزة' }, { status: 400 });
      }

      const updatedWorker = await prisma.worker.update({
        where: { id: workerId },
        data: {
          status: 'AVAILABLE',
          reservationNotes: mergeWorkerMeta({
            existingRawNotes: worker.reservationNotes,
            reservationNote: null,
          }),
          reservedAt: null,
          reservedBy: null,
        },
      });

      await createLog(
        session.user.id,
        'WORKER_RESERVATION_CANCELLED',
        `تم إلغاء حجز العاملة ${worker.name} (الكود: ${worker.code})`
      );

      const meta = parseWorkerMeta(updatedWorker.reservationNotes);

      return NextResponse.json({
        message: 'تم إلغاء حجز العاملة بنجاح',
        worker: {
          ...updatedWorker,
          reservationNotes: meta.reservationNote,
          reservationNotesRaw: meta.raw,
          medicalStatus: meta.medicalStatus,
        },
      });
    } catch (error) {
      console.error('خطأ في إلغاء حجز العاملة:', error);
      return NextResponse.json({ error: 'حدث خطأ في إلغاء حجز العاملة' }, { status: 500 });
    }
  }
);