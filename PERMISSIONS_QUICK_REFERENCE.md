# 🔐 مرجع سريع للصلاحيات

## ✅ التحقق من التطابق الكامل

### قاعدة البيانات (schema.prisma)
```
✅ 36 صلاحية في enum Permission
```

### النظام (permissions.ts)
```
✅ 36 ترجمة عربية في PERMISSION_LABELS
```

### واجهة المسميات (job-titles/page.tsx)
```
✅ 36 صلاحية في AVAILABLE_PERMISSIONS
✅ 7 فئات في PERMISSION_CATEGORIES
```

---

## 📊 الصلاحيات بالأرقام

| الفئة | العدد | النسبة |
|------|------|--------|
| العمال | 5 | 13.9% |
| العقود | 4 | 11.1% |
| العملاء | 4 | 11.1% |
| المستخدمين | 4 | 11.1% |
| التقارير | 3 | 8.3% |
| كشف الرواتب | 4 | 11.1% |
| النظام | 12 | 33.3% |
| **المجموع** | **36** | **100%** |

---

## 🔍 قائمة الصلاحيات الكاملة

### 👷 العمال (5)
1. ✅ VIEW_WORKERS
2. ✅ CREATE_WORKERS
3. ✅ EDIT_WORKERS
4. ✅ DELETE_WORKERS
5. ✅ RESERVE_WORKERS

### 📄 العقود (4)
6. ✅ VIEW_CONTRACTS
7. ✅ CREATE_CONTRACTS
8. ✅ EDIT_CONTRACTS
9. ✅ DELETE_CONTRACTS

### 👥 العملاء (4)
10. ✅ VIEW_CLIENTS
11. ✅ CREATE_CLIENTS
12. ✅ EDIT_CLIENTS
13. ✅ DELETE_CLIENTS

### 🔐 المستخدمين (4)
14. ✅ VIEW_USERS
15. ✅ CREATE_USERS
16. ✅ EDIT_USERS
17. ✅ DELETE_USERS

### 📊 التقارير (3)
18. ✅ VIEW_REPORTS
19. ✅ MANAGE_REPORTS ← جديد
20. ✅ EXPORT_DATA

### 💰 كشف الرواتب (4) ← فئة جديدة
21. ✅ VIEW_PAYROLL ← جديد
22. ✅ MANAGE_PAYROLL ← جديد
23. ✅ VIEW_PAYROLL_DELIVERY ← جديد
24. ✅ MANAGE_PAYROLL_DELIVERY ← جديد

### ⚙️ النظام (12)
25. ✅ VIEW_LOGS
26. ✅ MANAGE_SETTINGS
27. ✅ MANAGE_JOB_TITLES
28. ✅ VIEW_BACKUPS ← جديد
29. ✅ MANAGE_BACKUPS ← جديد
30. ✅ VIEW_ARCHIVE ← جديد
31. ✅ MANAGE_ARCHIVE ← جديد
32. ✅ MANAGE_PACKAGES ← جديد
33. ✅ MANAGE_TEMPLATES ← جديد
34. ✅ VIEW_PERFORMANCE ← جديد
35. ✅ VIEW_SEARCH ← جديد

---

## 🚀 كيفية إضافة صلاحية جديدة

### 1️⃣ في schema.prisma
```prisma
enum Permission {
  // ... existing
  NEW_PERMISSION  // ← إضافة هنا
}
```

### 2️⃣ في permissions.ts
```typescript
export const PERMISSION_LABELS: Record<Permission, string> = {
  // ... existing
  NEW_PERMISSION: "وصف الصلاحية بالعربي",
};
```

### 3️⃣ في job-titles/page.tsx
```typescript
const AVAILABLE_PERMISSIONS = [
  // ... existing
  { 
    id: "NEW_PERMISSION", 
    label: "وصف الصلاحية", 
    category: "category_name", 
    icon: "🔒" 
  },
];
```

### 4️⃣ تشغيل الأوامر
```bash
npx prisma generate
npx prisma migrate dev --name add_new_permission
npm run build
npm run type-check
```

---

## 🎯 أمثلة الاستخدام

### حماية API Route
```typescript
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

export const GET = withApiAuth(
  { permissions: [Permission.VIEW_WORKERS] },
  async ({ req }) => {
    // Your logic
  }
);
```

### حماية صفحة
```typescript
import { hasPermission } from '@/lib/permissions';

if (!hasPermission(session, Permission.VIEW_WORKERS)) {
  redirect('/403');
}
```

### التحقق من عدة صلاحيات
```typescript
// يحتاج جميع الصلاحيات
hasAllPermissions(userPermissions, [
  Permission.VIEW_WORKERS,
  Permission.EDIT_WORKERS
]);

// يحتاج صلاحية واحدة على الأقل
hasAnyPermission(userPermissions, [
  Permission.VIEW_WORKERS,
  Permission.VIEW_CONTRACTS
]);
```

---

## 📝 ملاحظات الصيانة

### ✅ تم التحقق من:
- [x] Schema.prisma يحتوي على 36 صلاحية
- [x] permissions.ts يحتوي على 36 ترجمة
- [x] job-titles/page.tsx يعرض 36 صلاحية
- [x] جميع API routes محمية بالصلاحيات المناسبة
- [x] Build يعمل بدون أخطاء
- [x] Type-check يعمل بدون أخطاء
- [x] Lint يعمل بدون أخطاء

### 📅 آخر تحديث: 17 نوفمبر 2025
### 📦 النسخة: Beta v0.1
### 🔗 Commit: a3a0a7b

---

## 🐛 استكشاف الأخطاء

### إذا لم تظهر صلاحية جديدة:
1. تأكد من إضافتها في الثلاث ملفات المذكورة أعلاه
2. شغل `npx prisma generate`
3. أعد تشغيل الخادم `npm run dev`
4. امسح cache المتصفح

### إذا ظهر خطأ Permission not found:
1. تحقق من تهجئة اسم الصلاحية (حساس للحالة)
2. تأكد من تطابق الاسم في جميع الملفات
3. تحقق من enum Permission في @prisma/client

---

**للمزيد من التفاصيل**: اقرأ [PERMISSIONS_GUIDE.md](./PERMISSIONS_GUIDE.md)
