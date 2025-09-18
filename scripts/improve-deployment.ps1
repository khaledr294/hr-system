# HR System Deployment Improvements Script
# PowerShell version for Windows

Write-Host "🚀 HR System Deployment Improvements" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

try {
    # 1. Clean npm cache to avoid deprecated warnings
    Write-Host "🧹 Cleaning npm cache..." -ForegroundColor Yellow
    npm cache clean --force
    
    # 2. Update safe dependencies
    Write-Host "📦 Updating safe dependencies..." -ForegroundColor Yellow
    npm update @hookform/resolvers zod react react-dom
    
    # 3. Update dev dependencies  
    Write-Host "🛠️  Updating dev dependencies..." -ForegroundColor Yellow
    npm update --save-dev @types/node typescript
    
    # 4. Run security audit
    Write-Host "🛡️  Running security audit..." -ForegroundColor Yellow
    npm audit --audit-level high
    
    # 5. Generate Prisma client
    Write-Host "🗄️  Generating Prisma client..." -ForegroundColor Yellow
    npx prisma generate
    
    Write-Host "✅ Deployment improvements completed!" -ForegroundColor Green
    Write-Host "💡 Recommended next steps:" -ForegroundColor Cyan
    Write-Host "   1. Test the application locally" -ForegroundColor White
    Write-Host "   2. Commit and push changes" -ForegroundColor White
    Write-Host "   3. Monitor deployment for improved performance" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error during improvement process: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}