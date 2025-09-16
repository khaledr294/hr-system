-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'HR', 'GENERAL_MANAGER', 'MARKETER', 'STAFF');

-- CreateEnum
CREATE TYPE "public"."Nationality" AS ENUM ('ETHIOPIA', 'UGANDA', 'KENYA', 'INDONESIA', 'BURUNDI');

-- CreateTable
CREATE TABLE "public"."Worker" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "nationality" TEXT NOT NULL,
    "residencyNumber" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "phone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "salary" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nationalitySalaryId" TEXT,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NationalitySalary" (
    "id" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "NationalitySalary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT,
    "password" TEXT,
    "role" TEXT DEFAULT 'STAFF',
    "nationality" TEXT DEFAULT '',
    "nationalitySalaryId" TEXT,
    "residencyNumber" TEXT,
    "dateOfBirth" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "phone" TEXT DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "salary" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "idNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Marketer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Marketer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Contract" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "packageType" TEXT NOT NULL,
    "packageName" TEXT DEFAULT '',
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notifiedBefore" BOOLEAN NOT NULL DEFAULT false,
    "contractNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "marketerId" TEXT,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Worker_code_key" ON "public"."Worker"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_residencyNumber_key" ON "public"."Worker"("residencyNumber");

-- CreateIndex
CREATE UNIQUE INDEX "NationalitySalary_nationality_key" ON "public"."NationalitySalary"("nationality");

-- CreateIndex
CREATE UNIQUE INDEX "User_residencyNumber_key" ON "public"."User"("residencyNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Client_idNumber_key" ON "public"."Client"("idNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_contractNumber_key" ON "public"."Contract"("contractNumber");

-- AddForeignKey
ALTER TABLE "public"."Worker" ADD CONSTRAINT "Worker_nationalitySalaryId_fkey" FOREIGN KEY ("nationalitySalaryId") REFERENCES "public"."NationalitySalary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Contract" ADD CONSTRAINT "Contract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Contract" ADD CONSTRAINT "Contract_marketerId_fkey" FOREIGN KEY ("marketerId") REFERENCES "public"."Marketer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Contract" ADD CONSTRAINT "Contract_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "public"."Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
