Write-Host "Database Identification Guide for HR System" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""

Write-Host "You have 2 databases in Prisma:" -ForegroundColor Yellow
Write-Host "1. saed-hr-system" -ForegroundColor White
Write-Host "2. hr-system-db" -ForegroundColor White
Write-Host ""

Write-Host "Steps to identify the correct one:" -ForegroundColor Cyan
Write-Host ""

Write-Host "STEP 1: Check Database Activity" -ForegroundColor Green
Write-Host "Go to Prisma Data Platform: https://cloud.prisma.io/" -ForegroundColor Blue
Write-Host "- Look at both databases" -ForegroundColor White
Write-Host "- Check which one shows recent activity" -ForegroundColor White
Write-Host "- Check data size and tables" -ForegroundColor White
Write-Host ""

Write-Host "STEP 2: Check Database Content" -ForegroundColor Green
Write-Host "For each database, verify if it contains:" -ForegroundColor White
Write-Host "- User table with admin@hr-system.com" -ForegroundColor Gray
Write-Host "- Worker table with sample data" -ForegroundColor Gray  
Write-Host "- Contract table" -ForegroundColor Gray
Write-Host "- Recent activity/data" -ForegroundColor Gray
Write-Host ""

Write-Host "STEP 3: Database Names Analysis" -ForegroundColor Green
Write-Host "- 'saed-hr-system' looks like personal/test database" -ForegroundColor White
Write-Host "- 'hr-system-db' looks like production database" -ForegroundColor White
Write-Host ""

Write-Host "Recommended Action:" -ForegroundColor Green  
Write-Host "1. Keep 'hr-system-db' (production name)" -ForegroundColor White
Write-Host "2. Delete 'saed-hr-system' (test name)" -ForegroundColor White
Write-Host "3. Update GitHub SECRET DATABASE_URL to hr-system-db URL" -ForegroundColor White
Write-Host ""

Write-Host "Before deleting:" -ForegroundColor Red
Write-Host "1. Export/backup data from both" -ForegroundColor Yellow
Write-Host "2. Test connection with both URLs" -ForegroundColor Yellow
Write-Host "3. Confirm which your Vercel app uses" -ForegroundColor Yellow