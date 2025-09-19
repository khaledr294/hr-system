#!/bin/bash

# Script to check and guide GitHub Secrets setup
echo "🔐 HR System - GitHub Secrets Setup Guide"
echo "=========================================="
echo ""
echo "المطلوب إضافة الأسرار التالية في GitHub Repository Settings > Secrets and variables > Actions:"
echo ""
echo "1. VERCEL_TOKEN"
echo "   القيمة: nacMVzWFMyCPMsKkZwCpVeKi"
echo ""
echo "2. ORG_ID" 
echo "   القيمة: team_4C1lohhSsFJV7KOudO0i1RKs"
echo ""
echo "3. PROJECT_ID"
echo "   القيمة: prj_OvyBIfox4bnw8HAUQ0QPxgTIjsaX"
echo ""
echo "4. NEXTAUTH_SECRET"
echo "   القيمة: 5UmOwKJLu/6U3d5Pd1lYFme5jZQI4NSwnQByIbVRbWc="
echo ""
echo "5. DATABASE_URL"
echo "   القيمة: Prisma Accelerate URL الذي حصلت عليه من Prisma"
echo ""
echo "6. NEXTAUTH_URL"
echo "   القيمة: رابط التطبيق على Vercel (مثال: https://hr-system-khaledr294.vercel.app)"
echo ""
echo "📋 الخطوات:"
echo "1. اذهب إلى: https://github.com/khaledr294/hr-system/settings/secrets/actions"
echo "2. اضغط 'New repository secret'"
echo "3. أدخل اسم السر والقيمة"
echo "4. كرر العملية لكل سر"
echo ""
echo "⚠️  تنبيه مهم:"
echo "- NEXTAUTH_URL يجب أن يكون الرابط الصحيح لتطبيق Vercel"
echo "- DATABASE_URL يجب أن يكون رابط Prisma Accelerate صحيح"
echo ""