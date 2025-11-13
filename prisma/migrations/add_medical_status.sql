-- Add medicalStatus column to Worker table
ALTER TABLE "Worker" ADD COLUMN IF NOT EXISTS "medicalStatus" TEXT DEFAULT 'PENDING_REPORT';
