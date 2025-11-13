-- Add medicalStatus column to Worker table (PostgreSQL syntax)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Worker' AND column_name = 'medicalStatus'
    ) THEN
        ALTER TABLE "Worker" ADD COLUMN "medicalStatus" TEXT DEFAULT 'PENDING_REPORT';
    END IF;
END $$;
