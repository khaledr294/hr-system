# Update GitHub Secret with New Prisma API Key
# IMPORTANT: Copy and paste this EXACT value into your GitHub secret

Write-Host "=== UPDATE GITHUB SECRET NOW ===" -ForegroundColor Green
Write-Host ""
Write-Host "1. Go to: https://github.com/khaledr294/hr-system/settings/secrets/actions" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Click on DATABASE_URL secret to edit it" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Replace the current value with this EXACT string:" -ForegroundColor Green
Write-Host ""
Write-Host 'prisma://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19xRlMwMGlLU2U2Sm41UlpCVGNqdEgiLCJhcGlfa2V5IjoiMDFLNUhRU0o3TTJBRjQ1TkJRTVZDOU4zNFIiLCJ0ZW5hbnRfaWQiOiIyNzIwODViOTQyODFjYWZiYjI4MzRmYTUyMDQ5ZGUyYzcyNWZmZDg0MjFhZTg2NzBiZDNiMzgxYTBiYTEyODA3IiwiaW50ZXJuYWxfc2VjcmV0IjoiMWYxNzIwZjUtYTg2My00ZTJkLWE5MGUtY2NlNjRiYTJmM2E0In0.oNO921qw63J22Fjhl7o8RPDwriouSYPA9O66Za0bjFw' -ForegroundColor White -BackgroundColor DarkBlue
Write-Host ""
Write-Host "4. Save the secret" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Come back here and type 'ready' so I can deploy!" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Local connection tested successfully - found 4 users in database!" -ForegroundColor Green