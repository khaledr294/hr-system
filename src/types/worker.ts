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
}