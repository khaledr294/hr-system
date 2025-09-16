# دليل إعداد Vercel - خطوة بخطوة

## 🔧 Environment Variables المطلوبة

في صفحة Vercel، في قسم "Environment Variables"، أضف المتغيرات التالية:

### 1. قاعدة البيانات
```
Name: DATABASE_URL
Value: postgresql://username:password@host:port/database?schema=public
```
**مثال:**
```
postgresql://postgres:mypassword@db.railway.app:5432/railway
```

### 2. NextAuth Configuration
```
Name: NEXTAUTH_SECRET
Value: your-secret-key-here
```
**لإنشاء مفتاح آمن:**
```bash
openssl rand -base64 32
```
أو استخدم: `hr-system-2024-secure-key-123456789`

### 3. NextAuth URL
```
Name: NEXTAUTH_URL
Value: https://your-vercel-app-url.vercel.app
```
**ملاحظة:** ستحصل على الرابط بعد النشر، يمكنك إضافته لاحقاً

### 4. Google OAuth (إذا كنت تستخدمه)
```
Name: GOOGLE_CLIENT_ID
Value: your-google-client-id

Name: GOOGLE_CLIENT_SECRET
Value: your-google-client-secret
```

## 🎯 خطوات الإعداد المفصلة

### المرحلة 1: إعدادات المشروع
1. **Project Name**: `hr-management-system`
2. **Framework**: Next.js (سيُختار تلقائياً)
3. **Root Directory**: `/` (افتراضي)
4. **Build Settings**: اتركها كما هي

### المرحلة 2: قاعدة البيانات
اختر إحدى الخيارات:

#### الخيار الأول: Supabase (مجاني)
1. اذهب إلى [supabase.com](https://supabase.com)
2. أنشئ حساب جديد
3. أنشئ مشروع جديد
4. انسخ CONNECTION STRING
5. ضعه في `DATABASE_URL`

#### الخيار الثاني: Railway (مجاني)
1. اذهب إلى [railway.app](https://railway.app)
2. أنشئ حساب بـ GitHub
3. أنشئ PostgreSQL database
4. انسخ CONNECTION STRING
5. ضعه في `DATABASE_URL`

#### الخيار الثالث: Neon (مجاني)
1. اذهب إلى [neon.tech](https://neon.tech)
2. أنشئ حساب جديد
3. أنشئ database
4. انسخ CONNECTION STRING
5. ضعه في `DATABASE_URL`

### المرحلة 3: Environment Variables
```
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-app.vercel.app
```

### المرحلة 4: النشر والاختبار
1. اضغط **Deploy**
2. انتظر اكتمال البناء (2-3 دقائق)
3. احصل على رابط التطبيق
4. حدّث `NEXTAUTH_URL` بالرابط الفعلي
5. أعد النشر

## ⚡ إعدادات متقدمة

### Build & Development Settings
```
Build Command: npm run build
Output Directory: .next
Install Command: npm ci
Development Command: npm run dev
```

### Node.js Version
```
Node.js Version: 18.x (recommended)
```

### Functions
اتركها كافتراضي - Vercel سيتعامل معها تلقائياً

## 🔍 استكشاف الأخطاء

### إذا فشل البناء:
1. تأكد من `DATABASE_URL`
2. تأكد من `NEXTAUTH_SECRET`
3. راجع logs في Vercel

### إذا لم يعمل تسجيل الدخول:
1. تأكد من `NEXTAUTH_URL`
2. تأكد من إعدادات قاعدة البيانات

## 🎉 اختبار النهائي

بعد النشر:
1. افتح الرابط
2. جرب تسجيل الدخول
3. تأكد من عمل جميع الصفحات
4. اختبر النظام بالكامل

## 📞 دعم إضافي

إذا واجهت أي مشاكل:
1. راجع Vercel Logs
2. تأكد من Environment Variables
3. اختبر الاتصال بقاعدة البيانات

---
**تم إنشاؤه في:** 16 سبتمبر 2025  
**للمشروع:** HR Management System