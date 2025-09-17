# 🔐 بيانات تسجيل الدخول - نظام إدارة الموارد البشرية

## 👥 المستخدمين الافتراضيين

بعد نشر التطبيق على Vercel، يجب إنشاء المستخدمين الافتراضيين أولاً.

### 🎯 بيانات تسجيل الدخول الافتراضية:

#### مدير النظام:
```
Email: admin@hr-system.com
Password: 123456
الصلاحيات: كامل النظام
```

#### مدير الموارد البشرية:
```
Email: hr@hr-system.com  
Password: 123456
الصلاحيات: إدارة الموظفين والعقود
```

## 🚀 كيفية إنشاء المستخدمين في Vercel

### الطريقة الأولى: تشغيل Seed Script

1. **في Vercel Dashboard:**
   - اذهب إلى Settings > Environment Variables
   - تأكد من وجود `DATABASE_URL`

2. **تشغيل الـ Seed:**
   ```bash
   # في الـ terminal المحلي مع DATABASE_URL من Vercel
   DATABASE_URL="your-vercel-database-url" npm run db:seed
   ```

### الطريقة الثانية: إنشاء المستخدمين مباشرة

```bash
# تشغيل script إنشاء المستخدمين
DATABASE_URL="your-vercel-database-url" npm run db:create-users
```

### الطريقة الثالثة: عبر Prisma Studio

1. ```bash
   DATABASE_URL="your-vercel-database-url" npx prisma studio
   ```
2. إضافة مستخدم جديد يدوياً

## 🔧 حل مشاكل تسجيل الدخول

### المشكلة: "بيانات غير صحيحة"
**السبب:** قاعدة البيانات فارغة
**الحل:** تشغيل أحد scripts إنشاء المستخدمين أعلاه

### المشكلة: "Database connection error"  
**السبب:** `DATABASE_URL` خاطئ في Vercel
**الحل:** تحديث Environment Variables في Vercel

### المشكلة: "NextAuth error"
**السبب:** `NEXTAUTH_SECRET` أو `NEXTAUTH_URL` مفقودين
**الحل:** إضافة المتغيرات في Vercel Environment Variables

## 📋 Environment Variables المطلوبة في Vercel:

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-app.vercel.app
```

## 🎭 أدوار المستخدمين:

- **ADMIN**: كامل الصلاحيات
- **HR_MANAGER**: إدارة الموظفين والعقود  
- **STAFF**: عرض البيانات فقط
- **MARKETER**: إدارة العملاء والتسويق

## 🔒 أمان كلمات المرور:

- كلمات المرور مشفرة باستخدام bcrypt
- كلمة المرور الافتراضية: `123456`
- **يُنصح بتغيير كلمة المرور بعد أول تسجيل دخول**

## 🆘 المساعدة السريعة:

إذا لم تتمكن من تسجيل الدخول:

1. **تأكد من إنشاء المستخدمين** (تشغيل seed script)
2. **تحقق من Environment Variables** في Vercel  
3. **راجع Vercel Function Logs** للأخطاء
4. **جرب البيانات الصحيحة:**
   - Email: `admin@hr-system.com`
   - Password: `123456`

---

**📞 للدعم الفني:** تأكد من اتباع الخطوات بالترتيب المذكور أعلاه