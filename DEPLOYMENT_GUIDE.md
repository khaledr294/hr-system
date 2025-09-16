# دليل نشر النظام على السيرفر

## 1. إعداد قاعدة البيانات السحابية

### خيار أ: Supabase (مجاني)
1. إنشاء حساب على https://supabase.com
2. إنشاء مشروع جديد
3. نسخ DATABASE_URL من Settings > Database

### خيار ب: PlanetScale (مجاني)
1. إنشاء حساب على https://planetscale.com
2. إنشاء قاعدة بيانات جديدة
3. الحصول على connection string

### خيار ج: Railway PostgreSQL
1. إنشاء حساب على https://railway.app
2. إضافة PostgreSQL database
3. نسخ DATABASE_URL

## 2. إعداد متغيرات البيئة

إنشاء ملف `.env.production`:
```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-long-random-secret"
NEXTAUTH_URL="https://yourdomain.com"
```

## 3. تحديث prisma/schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 4. رفع قاعدة البيانات

```bash
# إنشاء migration
npx prisma migrate deploy

# تشغيل seeding إذا لزم الأمر
npx prisma db seed
```

## 5. نشر على Vercel

```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# نشر المشروع
vercel --prod

# إضافة متغيرات البيئة في Vercel Dashboard
```

## 6. إعدادات الأمان

### في Vercel Dashboard:
- Environment Variables
- Functions (إعداد timeouts)
- Domains (ربط نطاق مخصص)

### في next.config.ts:
- تفعيل compression
- إزالة console.log
- تحسين الصور

## 7. اختبار النظام

### قائمة التحقق:
- [ ] تسجيل الدخول يعمل
- [ ] قاعدة البيانات متصلة
- [ ] جميع الصفحات تحمل
- [ ] التصاميم تعمل
- [ ] العمليات CRUD تعمل
- [ ] الجلسات آمنة

## 8. مراقبة الأداء

### أدوات المراقبة:
- Vercel Analytics
- Error Tracking
- Performance Monitoring

## نصائح الأمان:

1. **لا تكشف معلومات حساسة**
   - استخدم متغيرات البيئة دائماً
   - لا ترفع ملفات .env إلى git

2. **تأمين API Routes**
   - تحقق من الجلسات
   - تحقق من الصلاحيات
   - تنظيف المدخلات

3. **HTTPS إجباري**
   - Vercel يوفر SSL تلقائياً
   - تأكد من إعداد NEXTAUTH_URL صحيحاً

## التكلفة المتوقعة:

### المستوى المجاني:
- Vercel: مجاني (100GB bandwidth شهرياً)
- Supabase: مجاني (500MB database)
- Railway: مجاني ($5 credit شهرياً)

### التوسع المدفوع:
- Vercel Pro: $20/شهر
- Supabase Pro: $25/شهر  
- Railway: حسب الاستخدام