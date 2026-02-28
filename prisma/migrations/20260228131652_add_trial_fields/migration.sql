-- AlterTable: Add trial/subscription fields to SystemSettings
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "trialStartDate" TIMESTAMP(3);
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "trialEndDate" TIMESTAMP(3);
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "isTrialActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT NOT NULL DEFAULT 'trial';
