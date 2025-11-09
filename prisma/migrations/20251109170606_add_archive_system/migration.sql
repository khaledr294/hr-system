-- CreateTable
CREATE TABLE "public"."ArchivedContract" (
    "id" TEXT NOT NULL,
    "originalId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "workerName" TEXT NOT NULL,
    "workerCode" INTEGER NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "packageType" TEXT NOT NULL,
    "packageName" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "contractNumber" TEXT,
    "notes" TEXT,
    "delayDays" INTEGER,
    "penaltyAmount" DOUBLE PRECISION,
    "marketerId" TEXT,
    "marketerName" TEXT,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedBy" TEXT,
    "archiveReason" TEXT NOT NULL DEFAULT 'EXPIRED',
    "metadata" TEXT,

    CONSTRAINT "ArchivedContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ArchivedWorker" (
    "id" TEXT NOT NULL,
    "originalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "nationality" TEXT NOT NULL,
    "residencyNumber" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "phone" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "passportNumber" TEXT,
    "salary" DOUBLE PRECISION,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedBy" TEXT,
    "archiveReason" TEXT NOT NULL DEFAULT 'INACTIVE',
    "contractsCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT,

    CONSTRAINT "ArchivedWorker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ArchiveLog" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT,
    "reason" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArchiveLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArchivedContract_originalId_key" ON "public"."ArchivedContract"("originalId");

-- CreateIndex
CREATE INDEX "ArchivedContract_archivedAt_idx" ON "public"."ArchivedContract"("archivedAt");

-- CreateIndex
CREATE INDEX "ArchivedContract_workerId_idx" ON "public"."ArchivedContract"("workerId");

-- CreateIndex
CREATE INDEX "ArchivedContract_clientId_idx" ON "public"."ArchivedContract"("clientId");

-- CreateIndex
CREATE INDEX "ArchivedContract_archiveReason_idx" ON "public"."ArchivedContract"("archiveReason");

-- CreateIndex
CREATE UNIQUE INDEX "ArchivedWorker_originalId_key" ON "public"."ArchivedWorker"("originalId");

-- CreateIndex
CREATE INDEX "ArchivedWorker_archivedAt_idx" ON "public"."ArchivedWorker"("archivedAt");

-- CreateIndex
CREATE INDEX "ArchivedWorker_archiveReason_idx" ON "public"."ArchivedWorker"("archiveReason");

-- CreateIndex
CREATE INDEX "ArchiveLog_entityType_entityId_idx" ON "public"."ArchiveLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ArchiveLog_createdAt_idx" ON "public"."ArchiveLog"("createdAt");
