export type MedicalStatus = 'PENDING_REPORT' | 'FIT' | 'UNFIT';

const MARKER_KEY = '__worker_meta_v1';

interface WorkerMetaPayload {
  [MARKER_KEY]: true;
  medicalStatus: MedicalStatus;
  reservationNote: string | null;
}

const DEFAULT_STATUS: MedicalStatus = 'PENDING_REPORT';

function isWorkerMetaPayload(value: unknown): value is WorkerMetaPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    MARKER_KEY in value &&
    (value as WorkerMetaPayload)[MARKER_KEY] === true
  );
}

export function parseWorkerMeta(rawNotes: string | null | undefined): {
  medicalStatus: MedicalStatus;
  reservationNote: string | null;
  raw: string | null;
} {
  if (!rawNotes) {
    return { medicalStatus: DEFAULT_STATUS, reservationNote: null, raw: null };
  }

  try {
    const parsed = JSON.parse(rawNotes) as unknown;
    if (isWorkerMetaPayload(parsed)) {
      return {
        medicalStatus: parsed.medicalStatus ?? DEFAULT_STATUS,
        reservationNote: parsed.reservationNote ?? null,
        raw: rawNotes,
      };
    }
  } catch {
    // Ignore JSON parse errors and fallback to legacy behaviour
  }

  return {
    medicalStatus: DEFAULT_STATUS,
    reservationNote: rawNotes,
    raw: rawNotes,
  };
}

export function buildWorkerMeta({
  medicalStatus,
  reservationNote,
}: {
  medicalStatus?: MedicalStatus;
  reservationNote?: string | null;
}): string | null {
  const status = medicalStatus ?? DEFAULT_STATUS;
  const note = reservationNote ?? null;

  if (status === DEFAULT_STATUS && (note === null || note === '')) {
    return null;
  }

  const payload: WorkerMetaPayload = {
    [MARKER_KEY]: true,
    medicalStatus: status,
    reservationNote: note,
  };

  return JSON.stringify(payload);
}

export function mergeWorkerMeta({
  existingRawNotes,
  medicalStatus,
  reservationNote,
}: {
  existingRawNotes: string | null | undefined;
  medicalStatus?: MedicalStatus;
  reservationNote?: string | null;
}): string | null {
  const current = parseWorkerMeta(existingRawNotes);

  const nextStatus = medicalStatus ?? current.medicalStatus;
  const nextNote =
    reservationNote === undefined ? current.reservationNote : reservationNote;

  return buildWorkerMeta({
    medicalStatus: nextStatus,
    reservationNote: nextNote,
  });
}
