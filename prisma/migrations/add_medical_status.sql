-- Add medicalStatus column to Worker table if missing
ALTER TABLE "Worker" ADD COLUMN IF NOT EXISTS "medicalStatus" TEXT DEFAULT 'PENDING_REPORT';
