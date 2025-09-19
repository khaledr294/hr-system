# Database URL Verification and Fix Script
# The deployment failed with "invalid port number" - let's fix this

Write-Host "🔍 DEBUGGING DATABASE CONNECTION ERROR" -ForegroundColor Red
Write-Host ""
Write-Host "Error: 'invalid port number in database URL'" -ForegroundColor Yellow
Write-Host "This means production is still using old DATABASE_URL format" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔧 SOLUTIONS TO TRY:" -ForegroundColor Green
Write-Host ""
Write-Host "1. DOUBLE-CHECK GITHUB SECRET:" -ForegroundColor Cyan
Write-Host "   Go to: https://github.com/khaledr294/hr-system/settings/secrets/actions"
Write-Host "   Verify DATABASE_URL contains EXACTLY:" -ForegroundColor White
Write-Host "   prisma://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19xRlMwMGlLU2U2Sm41UlpCVGNqdEgiLCJhcGlfa2V5IjoiMDFLNUhRU0o3TTJBRjQ1TkJRTVZDOU4zNFIiLCJ0ZW5hbnRfaWQiOiIyNzIwODViOTQyODFjYWZiYjI4MzRmYTUyMDQ5ZGUyYzcyNWZmZDg0MjFhZTg2NzBiZDNiMzgxYTBiYTEyODA3IiwiaW50ZXJuYWxfc2VjcmV0IjoiMWYxNzIwZjUtYTg2My00ZTJkLWE5MGUtY2NlNjRiYTJmM2E0In0.oNO921qw63J22Fjhl7o8RPDwriouSYPA9O66Za0bjFw" -ForegroundColor Blue
Write-Host ""
Write-Host "2. CHECK VERCEL DASHBOARD:" -ForegroundColor Cyan  
Write-Host "   Go to: https://vercel.com/khaledr294/hr-system/settings/environment-variables"
Write-Host "   Look for DATABASE_URL and delete any conflicting values"
Write-Host "   Make sure only GitHub deployment variables are used"
Write-Host ""
Write-Host "3. CLEAR VERCEL CACHE:" -ForegroundColor Cyan
Write-Host "   In Vercel dashboard, go to Deployments"  
Write-Host "   Click 'Redeploy' with 'Clear Build Cache' checked"
Write-Host ""
Write-Host "❌ WRONG FORMATS TO AVOID:" -ForegroundColor Red
Write-Host "   - prisma+postgres://... (WRONG)"
Write-Host "   - postgresql://... (WRONG for Accelerate)" 
Write-Host ""
Write-Host "✅ CORRECT FORMAT:" -ForegroundColor Green
Write-Host "   - prisma://accelerate.prisma-data.net/?api_key=..." 
Write-Host ""
Write-Host "After fixing, let me know and we'll redeploy!" -ForegroundColor Yellow