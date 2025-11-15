# خطوات تطبيق Migration على Prisma Postgres

## المشكلة الحالية:
- Migration `20251115152000_permission_overhaul` لم يُطبّق
- Prisma Accelerate API لا يدعم `CREATE TYPE`
- Prisma Postgres Tunnel لم يعمل بشكل صحيح

## الحل البديل: استخدام Prisma Data Platform

### الخيار 1: من Prisma Console (موصى به)

1. اذهب إلى: https://console.prisma.io
2. اختر المشروع الخاص بك
3. اذهب إلى **Data Browser**
4. في الأعلى، اختر **SQL Editor**
5. انسخ والصق SQL التالي:

```sql
-- Create Permission enum
CREATE TYPE "Permission" AS ENUM (
  'VIEW_WORKERS', 'CREATE_WORKERS', 'EDIT_WORKERS', 'DELETE_WORKERS', 'RESERVE_WORKERS',
  'VIEW_CONTRACTS', 'CREATE_CONTRACTS', 'EDIT_CONTRACTS', 'DELETE_CONTRACTS',
  'VIEW_CLIENTS', 'CREATE_CLIENTS', 'EDIT_CLIENTS', 'DELETE_CLIENTS',
  'VIEW_USERS', 'CREATE_USERS', 'EDIT_USERS', 'DELETE_USERS',
  'VIEW_REPORTS', 'MANAGE_REPORTS', 'EXPORT_DATA', 'VIEW_LOGS',
  'MANAGE_SETTINGS', 'MANAGE_JOB_TITLES',
  'VIEW_PAYROLL', 'MANAGE_PAYROLL',
  'VIEW_PAYROLL_DELIVERY', 'MANAGE_PAYROLL_DELIVERY',
  'VIEW_BACKUPS', 'MANAGE_BACKUPS',
  'VIEW_ARCHIVE', 'MANAGE_ARCHIVE',
  'MANAGE_TEMPLATES', 'VIEW_PERFORMANCE', 'VIEW_SEARCH', 'MANAGE_PACKAGES'
);

-- Add requiresTwoFactor column
ALTER TABLE "JobTitle" ADD COLUMN "requiresTwoFactor" BOOLEAN NOT NULL DEFAULT false;

-- Add new permissions array column
ALTER TABLE "JobTitle" ADD COLUMN "permissions_new" "Permission"[] NOT NULL DEFAULT ARRAY[]::"Permission"[];

-- Convert existing permissions (you'll need to do this manually for each job title)
-- For HR_MANAGER:
UPDATE "JobTitle" 
SET "permissions_new" = ARRAY[
  'VIEW_WORKERS', 'CREATE_WORKERS', 'EDIT_WORKERS', 'DELETE_WORKERS', 'RESERVE_WORKERS',
  'VIEW_CONTRACTS', 'CREATE_CONTRACTS', 'EDIT_CONTRACTS', 'DELETE_CONTRACTS',
  'VIEW_CLIENTS', 'CREATE_CLIENTS', 'EDIT_CLIENTS', 'DELETE_CLIENTS',
  'VIEW_USERS', 'CREATE_USERS', 'EDIT_USERS', 'DELETE_USERS',
  'VIEW_REPORTS', 'MANAGE_REPORTS', 'EXPORT_DATA', 'VIEW_LOGS',
  'MANAGE_SETTINGS', 'MANAGE_JOB_TITLES',
  'VIEW_PAYROLL', 'MANAGE_PAYROLL',
  'VIEW_PAYROLL_DELIVERY', 'MANAGE_PAYROLL_DELIVERY',
  'VIEW_BACKUPS', 'MANAGE_BACKUPS',
  'VIEW_ARCHIVE', 'MANAGE_ARCHIVE',
  'MANAGE_TEMPLATES', 'VIEW_PERFORMANCE', 'VIEW_SEARCH', 'MANAGE_PACKAGES'
]::"Permission"[]
WHERE name = 'HR_MANAGER';

-- For MARKETER:
UPDATE "JobTitle" 
SET "permissions_new" = ARRAY[
  'VIEW_CLIENTS', 'CREATE_CLIENTS', 'EDIT_CLIENTS',
  'VIEW_CONTRACTS', 'CREATE_CONTRACTS', 'EDIT_CONTRACTS',
  'VIEW_WORKERS', 'RESERVE_WORKERS', 'VIEW_SEARCH'
]::"Permission"[]
WHERE name = 'MARKETER';

-- Drop old permissions column
ALTER TABLE "JobTitle" DROP COLUMN "permissions";

-- Rename new column
ALTER TABLE "JobTitle" RENAME COLUMN "permissions_new" TO "permissions";

-- Drop role column from User (if exists)
ALTER TABLE "User" DROP COLUMN IF EXISTS "role";
```

6. اضغط **Execute**
7. انتظر حتى يكتمل التنفيذ

### الخيار 2: استخدام Script محلي (إذا فشل الخيار 1)

سأنشئ script يطبق التغييرات مباشرة عبر Prisma Client باستخدام transactions:

```bash
node apply-migration-transaction.js
```

### التحقق من نجاح العملية:

بعد تطبيق Migration، شغّل:
```bash
npm run db:seed
```

يجب أن يعمل بدون أخطاء!

## ملاحظات مهمة:

- ✅ جميع المستخدمين الحاليين (6 مستخدمين) سيبقون كما هم
- ✅ لن يتم حذف أي بيانات
- ✅ فقط ستتم إضافة أعمدة جديدة وتحويل الصلاحيات
