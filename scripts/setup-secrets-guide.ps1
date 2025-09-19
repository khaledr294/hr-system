# HR System - GitHub Secrets Setup Guide
# دليل إعداد الأسرار في GitHub

Write-Host "🔐 HR System - GitHub Secrets Setup Guide" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""
Write-Host "المطلوب إضافة الأسرار التالية في GitHub Repository Settings > Secrets and variables > Actions:" -ForegroundColor Yellow
Write-Host ""

$secrets = @(
    @{Name="VERCEL_TOKEN"; Value="nacMVzWFMyCPMsKkZwCpVeKi"; Description="رمز Vercel للنشر"},
    @{Name="ORG_ID"; Value="team_4C1lohhSsFJV7KOudO0i1RKs"; Description="معرف المنظمة في Vercel"},
    @{Name="PROJECT_ID"; Value="prj_OvyBIfox4bnw8HAUQ0QPxgTIjsaX"; Description="معرف المشروع في Vercel"},
    @{Name="NEXTAUTH_SECRET"; Value="5UmOwKJLu/6U3d5Pd1lYFme5jZQI4NSwnQByIbVRbWc="; Description="سر NextAuth للمصادقة"},
    @{Name="DATABASE_URL"; Value="[Prisma Accelerate URL]"; Description="رابط قاعدة البيانات من Prisma"},
    @{Name="NEXTAUTH_URL"; Value="[Vercel App URL]"; Description="رابط التطبيق على Vercel"}
)

foreach ($secret in $secrets) {
    Write-Host "📌 $($secret.Name)" -ForegroundColor Cyan
    Write-Host "   القيمة: $($secret.Value)" -ForegroundColor White
    Write-Host "   الوصف: $($secret.Description)" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "📋 الخطوات:" -ForegroundColor Yellow
Write-Host "1. اذهب إلى: https://github.com/khaledr294/hr-system/settings/secrets/actions" -ForegroundColor White
Write-Host "2. اضغط 'New repository secret'" -ForegroundColor White
Write-Host "3. أدخل اسم السر والقيمة" -ForegroundColor White
Write-Host "4. كرر العملية لكل سر" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  تنبيهات مهمة:" -ForegroundColor Red
Write-Host "- NEXTAUTH_URL يجب أن يكون الرابط الصحيح لتطبيق Vercel" -ForegroundColor Yellow
Write-Host "- DATABASE_URL يجب أن يكون رابط Prisma Accelerate صحيح" -ForegroundColor Yellow
Write-Host "- تأكد من عدم وجود مسافات إضافية في القيم" -ForegroundColor Yellow
Write-Host ""

Write-Host "🔗 روابط مفيدة:" -ForegroundColor Green
Write-Host "- GitHub Secrets: https://github.com/khaledr294/hr-system/settings/secrets/actions" -ForegroundColor Blue
Write-Host "- Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor Blue
Write-Host "- Prisma Data Platform: https://cloud.prisma.io/" -ForegroundColor Blue