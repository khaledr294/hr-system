# ✅ إعداد قاعدة البيانات الصحيحة - HR System

## الوضع الحالي
- ✅ **saed-hr-system**: تحتوي على البيانات الفعلية (استخدم هذه)
- ❌ **hr-system-db**: فارغة (احذف هذه)

## الخطوات المطلوبة

### 1️⃣ احصل على رابط Prisma Accelerate
1. اذهب إلى https://cloud.prisma.io/
2. اضغط على **saed-hr-system**
3. انسخ رابط "Prisma Accelerate connection string"
   ```
   prisma://accelerate.prisma-data.net/eyJ...
   ```

### 2️⃣ أضف DATABASE_URL إلى GitHub Secrets
1. اذهب إلى: https://github.com/khaledr294/hr-system/settings/secrets/actions
2. اضغط **New repository secret**
3. اسم المتغير: `DATABASE_URL`
4. القيمة: الرابط الذي نسخته من saed-hr-system
5. اضغط **Add secret**

### 3️⃣ أضف NEXTAUTH_URL إلى GitHub Secrets  
1. في نفس الصفحة، اضغط **New repository secret**
2. اسم المتغير: `NEXTAUTH_URL`
3. القيمة: `https://hr-system-wine.vercel.app` (أو رابط تطبيقك في Vercel)
4. اضغط **Add secret**

### 4️⃣ احذف قاعدة البيانات الفارغة
1. في https://cloud.prisma.io/
2. اضغط على **hr-system-db**
3. اذهب إلى Settings → Delete Project
4. اكتب اسم قاعدة البيانات للتأكيد
5. احذفها نهائياً

### 5️⃣ اختبر النشر
بعد إضافة المتغيرات، سيتم نشر التطبيق تلقائياً. اختبر تسجيل الدخول:
- المدير: `admin@hr-system.com` / `123456`
- موظف الموارد البشرية: `hr@hr-system.com` / `123456`

## النص الجاهز للنسخ

### DATABASE_URL (انسخ الرابط الفعلي من Prisma)
```
prisma://accelerate.prisma-data.net/eyJ...
```

### NEXTAUTH_URL
```
https://hr-system-wine.vercel.app
```

---

## المساعدة السريعة
إذا كنت تحتاج المساعدة في أي خطوة، أخبرني وسأوضح لك بالتفصيل!