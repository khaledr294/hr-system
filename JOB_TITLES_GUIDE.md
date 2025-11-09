# نظام المسميات الوظيفية والصلاحيات

تم إنشاء نظام شامل لإدارة المسميات الوظيفية والصلاحيات في النظام.

## الملفات المضافة

### 1. قاعدة البيانات
- **prisma/schema.prisma**
  - أضيف نموذج `JobTitle` مع الحقول:
    - `name` - الاسم بالإنجليزية (فريد)
    - `nameAr` - الاسم بالعربية
    - `description` - الوصف
    - `permissions` - JSON array للصلاحيات
    - `isActive` - حالة النشاط
  - أضيف حقل `jobTitleId` في نموذج `User`
  - تم تشغيل Migration: `20251109220438_add_job_titles`

### 2. API Endpoints
- **src/app/api/job-titles/route.ts**
  - `GET` - استرجاع جميع المسميات الوظيفية
  - `POST` - إنشاء مسمى وظيفي جديد

- **src/app/api/job-titles/[id]/route.ts**
  - `GET` - استرجاع مسمى وظيفي محدد
  - `PATCH` - تحديث مسمى وظيفي
  - `DELETE` - حذف مسمى وظيفي (مع التحقق من عدم وجود مستخدمين مرتبطين)

### 3. صفحة الإدارة
- **src/app/premium/job-titles/page.tsx**
  - واجهة سهلة وجميلة لإدارة المسميات الوظيفية
  - إضافة/تعديل/حذف المسميات
  - تحديد الصلاحيات بشكل مرن ومرئي
  - تجميع الصلاحيات حسب الفئات (العمال، العقود، العملاء، إلخ)
  - عرض عدد المستخدمين المرتبطين بكل مسمى

- **src/app/premium/job-titles/layout.tsx**
  - حماية الصفحة - متاحة فقط لـ HR_MANAGER
  - إعادة توجيه تلقائية إذا لم يكن المستخدم HR_MANAGER

### 4. مكتبة الصلاحيات
- **src/lib/permissions.ts**
  - `hasPermission()` - فحص صلاحية واحدة
  - `hasAllPermissions()` - فحص عدة صلاحيات (يجب توفر الكل)
  - `hasAnyPermission()` - فحص عدة صلاحيات (يكفي واحدة)
  - `getUserPermissions()` - الحصول على جميع صلاحيات المستخدم

### 5. Sidebar
- **src/components/premium/Sidebar.tsx**
  - أضيف رابط "المسميات الوظيفية" في قسم الإدارة

## الصلاحيات المتاحة

### العمال (Workers)
- `VIEW_WORKERS` - عرض العمال
- `CREATE_WORKERS` - إضافة عمال
- `EDIT_WORKERS` - تعديل العمال
- `DELETE_WORKERS` - حذف العمال

### العقود (Contracts)
- `VIEW_CONTRACTS` - عرض العقود
- `CREATE_CONTRACTS` - إنشاء عقود
- `EDIT_CONTRACTS` - تعديل العقود
- `DELETE_CONTRACTS` - حذف العقود

### العملاء (Clients)
- `VIEW_CLIENTS` - عرض العملاء
- `CREATE_CLIENTS` - إضافة عملاء
- `EDIT_CLIENTS` - تعديل العملاء
- `DELETE_CLIENTS` - حذف العملاء

### المستخدمين (Users)
- `VIEW_USERS` - عرض المستخدمين
- `CREATE_USERS` - إضافة مستخدمين
- `EDIT_USERS` - تعديل المستخدمين
- `DELETE_USERS` - حذف المستخدمين

### التقارير (Reports)
- `VIEW_REPORTS` - عرض التقارير
- `EXPORT_DATA` - تصدير البيانات

### النظام (System)
- `VIEW_LOGS` - عرض السجلات
- `MANAGE_SETTINGS` - إدارة الإعدادات
- `MANAGE_JOB_TITLES` - إدارة المسميات الوظيفية

## كيفية الاستخدام

### 1. الوصول إلى صفحة الإدارة
- سجل دخول بحساب HR_MANAGER (مثل: nader@saed-hr.com)
- اذهب إلى: القائمة → الإدارة → المسميات الوظيفية
- أو مباشرة: `/premium/job-titles`

### 2. إنشاء مسمى وظيفي
1. اضغط "إضافة مسمى وظيفي"
2. أدخل الاسم بالعربية والإنجليزية
3. أضف وصف (اختياري)
4. حدد الصلاحيات من القائمة
5. يمكنك تحديد كل الصلاحيات في فئة معينة بضغطة واحدة
6. اضغط "إضافة المسمى الوظيفي"

### 3. استخدام الصلاحيات في الكود

```typescript
import { hasPermission, getUserPermissions } from "@/lib/permissions";

// في API Route
export async function POST(request: Request) {
  const user = await requireUser();
  
  // فحص صلاحية واحدة
  const canCreate = await hasPermission(user.id, "CREATE_WORKERS");
  if (!canCreate) {
    return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });
  }
  
  // تنفيذ العملية...
}

// في Component
"use client";

export default function MyPage() {
  const [permissions, setPermissions] = useState<string[]>([]);
  
  useEffect(() => {
    fetch("/api/user/permissions")
      .then(res => res.json())
      .then(data => setPermissions(data));
  }, []);
  
  return (
    <div>
      {permissions.includes("CREATE_WORKERS") && (
        <button>إضافة عامل</button>
      )}
    </div>
  );
}
```

### 4. ربط مستخدم بمسمى وظيفي

عند تعديل المستخدم، يمكنك الآن إضافة حقل `jobTitleId`:

```typescript
await prisma.user.update({
  where: { id: userId },
  data: {
    jobTitleId: "job-title-id-here",
  }
});
```

## ملاحظات مهمة

1. **HR_MANAGER و GENERAL_MANAGER** لديهم صلاحيات كاملة تلقائياً
2. **لا يمكن حذف مسمى وظيفي** مرتبط بمستخدمين
3. **المسميات غير النشطة** (isActive = false) لا تعطي صلاحيات
4. **جميع العمليات مسجلة** في جدول Log
5. **الصفحة محمية** ومتاحة فقط لـ HR_MANAGER

## مثال: إنشاء مسمى "مدير فرع"

```json
{
  "name": "Branch Manager",
  "nameAr": "مدير فرع",
  "description": "مسؤول عن إدارة فرع معين وموظفيه",
  "permissions": [
    "VIEW_WORKERS",
    "CREATE_WORKERS",
    "EDIT_WORKERS",
    "VIEW_CONTRACTS",
    "CREATE_CONTRACTS",
    "VIEW_CLIENTS",
    "CREATE_CLIENTS",
    "VIEW_REPORTS"
  ],
  "isActive": true
}
```

## الخطوات التالية (اختيارية)

1. **تحديث صفحة المستخدمين**: إضافة حقل لاختيار المسمى الوظيفي
2. **إنشاء API للصلاحيات**: `/api/user/permissions` لاسترجاع صلاحيات المستخدم الحالي
3. **حماية الصفحات**: استخدام `hasPermission()` في باقي الصفحات
4. **عرض الصلاحيات**: إضافة صفحة لعرض صلاحيات المستخدم الحالي

---

✅ **تم التنفيذ بنجاح!**
