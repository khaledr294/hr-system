-- Permission & RBAC overhaul (PostgreSQL)

-- 1. Add the new Permission enum used by Job Titles if it does not already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'Permission'
  ) THEN
    CREATE TYPE "Permission" AS ENUM (
  'VIEW_WORKERS',
  'CREATE_WORKERS',
  'EDIT_WORKERS',
  'DELETE_WORKERS',
  'RESERVE_WORKERS',
  'VIEW_CONTRACTS',
  'CREATE_CONTRACTS',
  'EDIT_CONTRACTS',
  'DELETE_CONTRACTS',
  'VIEW_CLIENTS',
  'CREATE_CLIENTS',
  'EDIT_CLIENTS',
  'DELETE_CLIENTS',
  'VIEW_USERS',
  'CREATE_USERS',
  'EDIT_USERS',
  'DELETE_USERS',
  'VIEW_REPORTS',
  'MANAGE_REPORTS',
  'EXPORT_DATA',
  'VIEW_LOGS',
  'MANAGE_SETTINGS',
  'MANAGE_JOB_TITLES',
  'VIEW_PAYROLL',
  'MANAGE_PAYROLL',
  'VIEW_PAYROLL_DELIVERY',
  'MANAGE_PAYROLL_DELIVERY',
  'VIEW_BACKUPS',
  'MANAGE_BACKUPS',
  'VIEW_ARCHIVE',
  'MANAGE_ARCHIVE',
  'MANAGE_TEMPLATES',
  'VIEW_PERFORMANCE',
  'VIEW_SEARCH',
  'MANAGE_PACKAGES'
    );
  END IF;
END
$$;

-- 2. Add two-factor requirement + enum array permissions on Job Titles
ALTER TABLE "JobTitle" ADD COLUMN     "requiresTwoFactor" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "JobTitle" ADD COLUMN     "permissions_new" "Permission"[] NOT NULL DEFAULT ARRAY[]::"Permission"[];

WITH raw_permissions AS (
  SELECT id,
         jsonb_array_elements_text(COALESCE("permissions"::jsonb, '[]'::jsonb)) AS permission_label
  FROM "JobTitle"
)
UPDATE "JobTitle" jt
SET "permissions_new" = COALESCE(
  (
    SELECT array_agg(permission_label::"Permission")
    FROM raw_permissions raw
    WHERE raw.id = jt.id
      AND raw.permission_label = ANY (
        SELECT enumlabel
        FROM pg_enum
        WHERE enumtypid = 'Permission'::regtype
      )
  ),
  ARRAY[]::"Permission"[]
);

ALTER TABLE "JobTitle" DROP COLUMN "permissions";
ALTER TABLE "JobTitle" RENAME COLUMN "permissions_new" TO "permissions";
ALTER TABLE "JobTitle" ALTER COLUMN "permissions" SET DEFAULT ARRAY[]::"Permission"[];

-- 3. Remove legacy role column from users (role now derives from job titles)
ALTER TABLE "User" DROP COLUMN "role";
