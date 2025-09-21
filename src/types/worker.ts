export interface Worker {
  id: string;
  code: number;
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
  reservedAt?: Date;
  reservedBy?: string;
}