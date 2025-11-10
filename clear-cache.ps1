# Script لمسح cache Next.js و node_modules cache
# استخدمه عند ظهور مشاكل في Hot Module Replacement (HMR)

Write-Host "🧹 تنظيف cache Next.js..." -ForegroundColor Yellow

# حذف مجلد .next
if (Test-Path .next) {
    Remove-Item -Path .next -Recurse -Force
    Write-Host "✅ تم حذف .next" -ForegroundColor Green
} else {
    Write-Host "⚠️  مجلد .next غير موجود" -ForegroundColor Gray
}

# حذف cache في node_modules
if (Test-Path node_modules/.cache) {
    Remove-Item -Path node_modules/.cache -Recurse -Force
    Write-Host "✅ تم حذف node_modules/.cache" -ForegroundColor Green
} else {
    Write-Host "⚠️  مجلد node_modules/.cache غير موجود" -ForegroundColor Gray
}

# حذف turbopack cache
if (Test-Path .turbo) {
    Remove-Item -Path .turbo -Recurse -Force
    Write-Host "✅ تم حذف .turbo" -ForegroundColor Green
}

Write-Host ""
Write-Host "✨ تم تنظيف جميع الـ cache بنجاح!" -ForegroundColor Green
Write-Host "💡 الآن يمكنك تشغيل: npm run dev" -ForegroundColor Cyan
