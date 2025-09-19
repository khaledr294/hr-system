# Update GitHub Secret for DATABASE_URL
# You need to run this manually or update the secret in GitHub web interface

Write-Host "=== GitHub Secret Update Required ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "Go to: https://github.com/YOUR_USERNAME/hr-system/settings/secrets/actions" -ForegroundColor Cyan
Write-Host ""
Write-Host "Update the DATABASE_URL secret with this EXACT value:" -ForegroundColor Green
Write-Host ""
Write-Host 'prisma://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19ubV94eF9uQkR4S3JMalk4b2VKUmUiLCJhcGlfa2V5IjoiMDFLNTIySEQwVzkyTkNBOFpISldGNDlYWUIiLCJ0ZW5hbnRfaWQiOiIyNzIwODViOTQyODFjYWZiYjI4MzRmYTUyMDQ5ZGUyYzcyNWZmZDg0MjFhZTg2NzBiZDNiMzgxYTBiYTEyODA3IiwiaW50ZXJuYWxfc2VjcmV0IjoiMWYxNzIwZjUtYTg2My00ZTJkLWE5MGUtY2NlNjRiYTJmM2E0In0.-YR6oF9Defn2wph5Y_g7G9onI7tv4IqZEEHZyw3Rke0' -ForegroundColor White -BackgroundColor DarkBlue
Write-Host ""
Write-Host "IMPORTANT: Remove the 'prisma+postgres://' format and use only 'prisma://' for Prisma Accelerate!" -ForegroundColor Red
Write-Host ""
Write-Host "After updating the secret, come back and I'll trigger a new deployment." -ForegroundColor Yellow