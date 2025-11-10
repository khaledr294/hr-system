#!/bin/bash

# Script لمسح cache Next.js و node_modules cache
# استخدمه عند ظهور مشاكل في Hot Module Replacement (HMR)

echo "🧹 تنظيف cache Next.js..."

# حذف مجلد .next
if [ -d ".next" ]; then
    rm -rf .next
    echo "✅ تم حذف .next"
else
    echo "⚠️  مجلد .next غير موجود"
fi

# حذف cache في node_modules
if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    echo "✅ تم حذف node_modules/.cache"
else
    echo "⚠️  مجلد node_modules/.cache غير موجود"
fi

# حذف turbopack cache
if [ -d ".turbo" ]; then
    rm -rf .turbo
    echo "✅ تم حذف .turbo"
fi

echo ""
echo "✨ تم تنظيف جميع الـ cache بنجاح!"
echo "💡 الآن يمكنك تشغيل: npm run dev"
