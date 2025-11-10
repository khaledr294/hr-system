# 🔒 دليل الأمان - خطوات فورية

## ⚠️ تحذير أمني حرج - CRITICAL SECURITY WARNING

تم اكتشاف أن ملف `.env.local` قد يكون مكشوف في Git مما يعرض المفاتيح السرية للخطر.

---

## 📋 الخطوات المطلوبة فوراً

### 1. التحقق من تسريب المفاتيح
```bash
# افحص إذا كان .env.local موجود في Git history
git log --all --full-history -- .env.local
```

### 2. إزالة .env.local من Git (إذا كان موجود)
```bash
# إزالة من الـ staging area
git rm --cached .env.local

# Commit التغيير
git commit -m "security: Remove sensitive .env.local file"

# تأكد من وجوده في .gitignore
grep ".env" .gitignore
```

### 3. تدوير جميع المفاتيح السرية

#### أ. NEXTAUTH_SECRET (مطلوب)
```bash
# توليد سر جديد
openssl rand -base64 32

# أو في PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```
ضع القيمة الجديدة في `.env.local`:
```
NEXTAUTH_SECRET="القيمة_الجديدة_هنا"
```

#### ب. DATABASE_URL (Prisma Accelerate)
1. اذهب إلى: https://console.prisma.io
2. افتح مشروعك
3. اذهب إلى Settings > API Keys
4. احذف المفتاح القديم
5. أنشئ مفتاح جديد
6. انسخ `DATABASE_URL` الجديد إلى `.env.local`

#### ج. UPSTASH_REDIS (إذا كنت تستخدمه)
1. اذهب إلى: https://console.upstash.com
2. افتح قاعدة البيانات
3. اذهب إلى Details > REST API
4. انقر "Rotate Token"
5. انسخ القيم الجديدة إلى `.env.local`

#### د. VERCEL_OIDC_TOKEN
- هذا يتجدد تلقائياً
- لا حاجة لفعل شيء

---

## 🛡️ إعدادات الحماية المستقبلية

### 1. GitHub Secret Scanning (موصى به)
```bash
# تفعيل Secret Scanning في GitHub
# Repository Settings > Security > Secret scanning
# ✅ Enable "Secret scanning"
# ✅ Enable "Push protection"
```

### 2. استخدام .env.example فقط
```bash
# نسخ .env.example إلى .env.local
cp .env.example .env.local

# تعبئة القيم الحقيقية
nano .env.local  # أو استخدم أي محرر نصوص
```

### 3. Vercel Environment Variables
للـ Production، استخدم Vercel UI:
1. اذهب إلى: https://vercel.com/your-project
2. Settings > Environment Variables
3. أضف جميع المتغيرات هناك
4. ✅ لا تضع قيم حقيقية في `.env.local` في Git

---

## ✅ Checklist الأمان

- [ ] .env.local مضاف إلى .gitignore
- [ ] .env.local غير موجود في Git history
- [ ] تم تدوير NEXTAUTH_SECRET
- [ ] تم تدوير Prisma API Key
- [ ] تم تدوير Upstash tokens (إن وجد)
- [ ] تم اختبار النظام بالمفاتيح الجديدة
- [ ] تم تحديث Vercel Environment Variables
- [ ] تم تفعيل GitHub Secret Scanning

---

## 🔍 التحقق من الأمان

### اختبار 1: التأكد من عدم وجود .env.local في Git
```bash
git ls-files | grep ".env.local"
# يجب أن يكون الناتج فارغ
```

### اختبار 2: التأكد من صحة .gitignore
```bash
git check-ignore .env.local
# يجب أن يطبع: .env.local
```

### اختبار 3: اختبار النظام
```bash
npm run dev
# يجب أن يعمل بدون أخطاء
```

---

## 📞 في حالة الطوارئ

إذا كنت تعتقد أن المفاتيح قد تم كشفها:

1. **دور المفاتيح فوراً** (خطوات أعلاه)
2. **تحقق من Logs** للنشاط المشبوه
3. **راجع Access Logs** في:
   - Prisma Console
   - Upstash Console
   - Vercel Dashboard
4. **غير كلمات مرور Admin** في النظام

---

## 📚 مصادر إضافية

- [Prisma Security Best Practices](https://www.prisma.io/docs/guides/security)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [OWASP Secrets Management](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password)

---

**تاريخ الإنشاء:** 10 نوفمبر 2025  
**الأولوية:** 🔴 CRITICAL  
**الحالة:** يتطلب إجراء فوري
