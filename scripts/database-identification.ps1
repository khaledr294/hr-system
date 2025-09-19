# Database Identification Guide for HR System

Write-Host "🔍 Identifying the Correct Prisma Database" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

Write-Host "You have 2 databases in Prisma:" -ForegroundColor Yellow
Write-Host "1. saed-hr-system" -ForegroundColor White
Write-Host "2. hr-system-db" -ForegroundColor White
Write-Host ""

Write-Host "🔍 Steps to identify the correct one:" -ForegroundColor Cyan
Write-Host ""

Write-Host "STEP 1: Check Current DATABASE_URL" -ForegroundColor Green
Write-Host "Go to your Prisma Data Platform:" -ForegroundColor White
Write-Host "- https://cloud.prisma.io/" -ForegroundColor Blue
Write-Host "- Look at both databases" -ForegroundColor White
Write-Host "- Check which one shows recent activity" -ForegroundColor White
Write-Host "- Copy the Accelerate URL from both" -ForegroundColor White
Write-Host ""

Write-Host "STEP 2: Check Database Content" -ForegroundColor Green
Write-Host "For each database, check if it contains:" -ForegroundColor White
Write-Host "✓ User table with admin@hr-system.com" -ForegroundColor Gray
Write-Host "✓ Worker table with sample data" -ForegroundColor Gray  
Write-Host "✓ Contract table" -ForegroundColor Gray
Write-Host "✓ Recent data/activity" -ForegroundColor Gray
Write-Host ""

Write-Host "STEP 3: Database Names Analysis" -ForegroundColor Green
Write-Host "- 'saed-hr-system' - looks like personal/test database" -ForegroundColor White
Write-Host "- 'hr-system-db' - looks like production database" -ForegroundColor White
Write-Host ""

Write-Host "STEP 4: Safe Testing Method" -ForegroundColor Green
Write-Host "1. Try connecting to each database locally" -ForegroundColor White
Write-Host "2. Run: npx prisma studio" -ForegroundColor Cyan
Write-Host "3. Check which one has your actual data" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  Before Deleting Any Database:" -ForegroundColor Red
Write-Host "1. Export/backup data from both databases" -ForegroundColor Yellow
Write-Host "2. Test connection with both URLs" -ForegroundColor Yellow
Write-Host "3. Confirm which one your Vercel app uses" -ForegroundColor Yellow
Write-Host ""

Write-Host "🎯 Recommended Action:" -ForegroundColor Green  
Write-Host "1. Keep 'hr-system-db' (production-like name)" -ForegroundColor White
Write-Host "2. Delete 'saed-hr-system' (test/personal name)" -ForegroundColor White
Write-Host "3. Update your GitHub SECRET 'DATABASE_URL' to hr-system-db URL" -ForegroundColor White
Write-Host ""

Write-Host "🔗 Quick Links:" -ForegroundColor Blue
Write-Host "- Prisma Cloud: https://cloud.prisma.io/" -ForegroundColor Blue
Write-Host "- GitHub Secrets: https://github.com/khaledr294/hr-system/settings/secrets/actions" -ForegroundColor Blue