-- إضافة الحقول الجديدة لجدول Worker
ALTER TABLE "Worker" ADD COLUMN "borderNumber" TEXT;
ALTER TABLE "Worker" ADD COLUMN "officeName" TEXT;
ALTER TABLE "Worker" ADD COLUMN "arrivalDate" TIMESTAMP(3);
ALTER TABLE "Worker" ADD COLUMN "passportNumber" TEXT;
ALTER TABLE "Worker" ADD COLUMN "religion" TEXT;
ALTER TABLE "Worker" ADD COLUMN "iban" TEXT;
ALTER TABLE "Worker" ADD COLUMN "residenceBranch" TEXT;

-- إضافة الحقول الجديدة لجدول Contract
ALTER TABLE "Contract" ADD COLUMN "delayDays" INTEGER;
ALTER TABLE "Contract" ADD COLUMN "penaltyAmount" DOUBLE PRECISION;
ALTER TABLE "Contract" ADD COLUMN "penaltyRate" DOUBLE PRECISION;

-- إنشاء جدول WorkerReservation
CREATE TABLE "WorkerReservation" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "reservationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'reserved',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerReservation_pkey" PRIMARY KEY ("id")
);

-- إضافة Foreign Key constraints
ALTER TABLE "WorkerReservation" ADD CONSTRAINT "WorkerReservation_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- إنشاء Index على workerId
CREATE INDEX "WorkerReservation_workerId_idx" ON "WorkerReservation"("workerId");