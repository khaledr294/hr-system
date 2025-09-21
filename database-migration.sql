-- Migration to add new fields to Worker table
ALTER TABLE "Worker" ADD COLUMN "reservationNotes" TEXT;
ALTER TABLE "Worker" ADD COLUMN "reservedAt" TIMESTAMP(3);
ALTER TABLE "Worker" ADD COLUMN "reservedBy" TEXT;
ALTER TABLE "Worker" ADD COLUMN "borderNumber" TEXT;
ALTER TABLE "Worker" ADD COLUMN "officeName" TEXT;
ALTER TABLE "Worker" ADD COLUMN "arrivalDate" TIMESTAMP(3);
ALTER TABLE "Worker" ADD COLUMN "passportNumber" TEXT;
ALTER TABLE "Worker" ADD COLUMN "religion" TEXT;
ALTER TABLE "Worker" ADD COLUMN "iban" TEXT;
ALTER TABLE "Worker" ADD COLUMN "residenceBranch" TEXT;

-- Migration to add new fields to Contract table
ALTER TABLE "Contract" ADD COLUMN "delayDays" INTEGER DEFAULT 0;
ALTER TABLE "Contract" ADD COLUMN "penaltyAmount" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "Contract" ADD COLUMN "penaltyRate" DOUBLE PRECISION DEFAULT 120;