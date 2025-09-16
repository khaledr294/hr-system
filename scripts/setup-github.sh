#!/bin/bash

echo "🚀 إعداد المشروع للرفع على GitHub..."

# تحقق من وجود git
if ! command -v git &> /dev/null; then
    echo "❌ Git غير مثبت. يرجى تثبيت Git أولاً"
    exit 1
fi

# تهيئة git إذا لم يكن مهيأ
if [ ! -d .git ]; then
    echo "📂 تهيئة Git repository..."
    git init
fi

# إنشاء .gitignore إذا لم يكن موجود
if [ ! -f .gitignore ]; then
    echo "📝 إنشاء .gitignore..."
    cat > .gitignore << EOF
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/

# Production build
build/
dist/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.production

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Database
*.db
*.sqlite
*.sqlite3

# Prisma
prisma/dev.db
prisma/migrations/dev.db

# Vercel
.vercel
EOF
fi

# إضافة الملفات
echo "📦 إضافة الملفات..."
git add .

# التحقق من وجود تغييرات
if git diff --staged --quiet; then
    echo "ℹ️  لا توجد تغييرات جديدة للرفع"
else
    # Commit الملفات
    echo "💾 حفظ التغييرات..."
    git commit -m "feat: إعداد نظام إدارة الموارد البشرية

    ✨ المميزات المضافة:
    - نظام إدارة العمالة المنزلية
    - إدارة العقود والعملاء
    - إدارة المسوقين والمستخدمين
    - تصميمان (حاد وعصري) قابل للتبديل
    - دعم كامل للغة العربية
    - نظام مصادقة آمن
    - قاعدة بيانات Prisma + PostgreSQL
    - إعدادات نشر جاهزة للإنتاج"
fi

echo ""
echo "✅ المشروع جاهز للرفع على GitHub!"
echo ""
echo "الخطوات التالية:"
echo "1. إنشاء repository جديد على GitHub"
echo "2. تشغيل الأمر التالي:"
echo "   git remote add origin https://github.com/username/repository-name.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. للنشر على Vercel:"
echo "   - اذهب إلى vercel.com"
echo "   - اربط حساب GitHub"
echo "   - اختر Repository"
echo "   - أضف Environment Variables"
echo "   - انقر Deploy"
echo ""
echo "4. لتفعيل Codespaces:"
echo "   - في GitHub repository اضغط Settings"
echo "   - اذهب إلى Codespaces"
echo "   - فعّل الخاصية"
echo ""
echo "🎉 استمتع بنشر نظامك!"