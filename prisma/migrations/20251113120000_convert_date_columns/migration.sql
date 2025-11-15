-- Convert date-related columns to DATE type to avoid timezone shifts (PostgreSQL syntax)
ALTER TABLE "Worker"
    ALTER COLUMN "dateOfBirth" TYPE DATE USING "dateOfBirth"::date,
    ALTER COLUMN "arrivalDate" TYPE DATE USING "arrivalDate"::date;

ALTER TABLE "Client"
    ALTER COLUMN "dateOfBirth" TYPE DATE USING "dateOfBirth"::date;

ALTER TABLE "Contract"
    ALTER COLUMN "startDate" TYPE DATE USING "startDate"::date,
    ALTER COLUMN "endDate" TYPE DATE USING "endDate"::date;

ALTER TABLE "ArchivedContract"
    ALTER COLUMN "startDate" TYPE DATE USING "startDate"::date,
    ALTER COLUMN "endDate" TYPE DATE USING "endDate"::date;

ALTER TABLE "ArchivedWorker"
    ALTER COLUMN "dateOfBirth" TYPE DATE USING "dateOfBirth"::date;

ALTER TABLE "User"
    ALTER COLUMN "dateOfBirth" TYPE DATE USING "dateOfBirth"::date,
    ALTER COLUMN "dateOfBirth" DROP DEFAULT;
