-- AlterTable
ALTER TABLE "public"."Contract" ADD COLUMN     "delayDays" INTEGER DEFAULT 0,
ADD COLUMN     "penaltyAmount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "penaltyRate" DOUBLE PRECISION DEFAULT 120;

-- AlterTable
ALTER TABLE "public"."Worker" ADD COLUMN     "arrivalDate" TIMESTAMP(3),
ADD COLUMN     "borderNumber" TEXT,
ADD COLUMN     "iban" TEXT,
ADD COLUMN     "officeName" TEXT,
ADD COLUMN     "passportNumber" TEXT,
ADD COLUMN     "religion" TEXT,
ADD COLUMN     "reservationNotes" TEXT,
ADD COLUMN     "reservedAt" TIMESTAMP(3),
ADD COLUMN     "reservedBy" TEXT,
ADD COLUMN     "residenceBranch" TEXT;
