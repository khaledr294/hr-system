# HR System GitHub Secrets Configuration Guide

Write-Host "GitHub Secrets Setup Required" -ForegroundColor Red
Write-Host "==============================" -ForegroundColor Red
Write-Host ""
Write-Host "Go to: https://github.com/khaledr294/hr-system/settings/secrets/actions" -ForegroundColor Yellow
Write-Host ""
Write-Host "Add these secrets:" -ForegroundColor Green
Write-Host ""
Write-Host "1. VERCEL_TOKEN = nacMVzWFMyCPMsKkZwCpVeKi" -ForegroundColor White
Write-Host "2. ORG_ID = team_4C1lohhSsFJV7KOudO0i1RKs" -ForegroundColor White  
Write-Host "3. PROJECT_ID = prj_OvyBIfox4bnw8HAUQ0QPxgTIjsaX" -ForegroundColor White
Write-Host "4. NEXTAUTH_SECRET = 5UmOwKJLu/6U3d5Pd1lYFme5jZQI4NSwnQByIbVRbWc=" -ForegroundColor White
Write-Host "5. DATABASE_URL = [Your Prisma Accelerate URL]" -ForegroundColor Cyan
Write-Host "6. NEXTAUTH_URL = [Your Vercel App URL]" -ForegroundColor Cyan
Write-Host ""
Write-Host "Missing URLs:" -ForegroundColor Red
Write-Host "- You need to provide DATABASE_URL (Prisma Accelerate)" -ForegroundColor Yellow
Write-Host "- You need to provide NEXTAUTH_URL (Vercel domain)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Example NEXTAUTH_URL: https://hr-system-abc123.vercel.app" -ForegroundColor Gray