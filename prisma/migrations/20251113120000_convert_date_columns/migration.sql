-- Convert date-related columns to DATE type to avoid timezone shifts
ALTER TABLE "Worker"
    ALTER COLUMN "dateOfBirth" TYPE DATE USING CAST("dateOfBirth" AS DATE),
    ALTER COLUMN "arrivalDate" TYPE DATE USING CASE WHEN "arrivalDate" IS NULL THEN NULL ELSE CAST("arrivalDate" AS DATE) END;

ALTER TABLE "Client"
    ALTER COLUMN "dateOfBirth" TYPE DATE USING CASE WHEN "dateOfBirth" IS NULL THEN NULL ELSE CAST("dateOfBirth" AS DATE) END;

ALTER TABLE "Contract"
    ALTER COLUMN "startDate" TYPE DATE USING CAST("startDate" AS DATE),
    ALTER COLUMN "endDate" TYPE DATE USING CAST("endDate" AS DATE);

ALTER TABLE "ArchivedContract"
    ALTER COLUMN "startDate" TYPE DATE USING CAST("startDate" AS DATE),
    ALTER COLUMN "endDate" TYPE DATE USING CAST("endDate" AS DATE);

ALTER TABLE "ArchivedWorker"
    ALTER COLUMN "dateOfBirth" TYPE DATE USING CAST("dateOfBirth" AS DATE);

ALTER TABLE "User"
    ALTER COLUMN "dateOfBirth" TYPE DATE USING CASE WHEN "dateOfBirth" IS NULL THEN NULL ELSE CAST("dateOfBirth" AS DATE) END,
    ALTER COLUMN "dateOfBirth" DROP DEFAULT;
