import type { MedicalStatus } from '@/lib/medicalStatus';

export interface Worker {
  id: string;
  code: string;
  name: string;
  nationality: string;
  residencyNumber: string;
  dateOfBirth: Date;
  phone: string;
  status: string;
  nationalitySalaryId?: string;
  salary?: number;
  // حقول جديدة
  borderNumber?: string;
  officeName?: string;
  arrivalDate?: Date;
  passportNumber?: string;
  religion?: string;
  iban?: string;
  residenceBranch?: string;
  // حقول الحجز
  reservationNotes?: string;
  reservationNotesRaw?: string | null;
  reservedAt?: Date;
  reservedBy?: string;
  reservedByUserName?: string;
  medicalStatus?: MedicalStatus;
}