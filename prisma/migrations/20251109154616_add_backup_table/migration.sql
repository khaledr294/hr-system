-- CreateTable
CREATE TABLE "public"."Backup" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'automatic',
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Backup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Backup_createdAt_idx" ON "public"."Backup"("createdAt");

-- CreateIndex
CREATE INDEX "Backup_status_idx" ON "public"."Backup"("status");
