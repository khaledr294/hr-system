# PowerShell Script for GitHub Setup
Write-Host "Setting up project for GitHub..." -ForegroundColor Green

# Check if git is available
try {
    git --version | Out-Null
    Write-Host "Git is available" -ForegroundColor Green
} catch {
    Write-Host "Git is not installed. Please install Git from https://git-scm.com/" -ForegroundColor Red
    exit 1
}

# Initialize git if not already done
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
}

# Create .gitignore if it doesn't exist
if (-not (Test-Path ".gitignore")) {
    Write-Host "Creating .gitignore..." -ForegroundColor Yellow
    
    $gitignoreContent = @"
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/

# Production build
build/
dist/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.production

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Database
*.db
*.sqlite
*.sqlite3

# Prisma
prisma/dev.db
prisma/migrations/dev.db

# Vercel
.vercel
"@
    
    Set-Content -Path ".gitignore" -Value $gitignoreContent
}

# Add files
Write-Host "Adding files..." -ForegroundColor Yellow
git add .

# Check for changes
$changes = git diff --staged --name-only
if ($changes) {
    # Commit files
    Write-Host "Saving changes..." -ForegroundColor Yellow
    $commitMessage = @"
feat: Setup HR Management System

Features added:
- Domestic worker management system
- Contract and client management  
- Marketer and user management
- Two themes (Sharp and Modern) with switching capability
- Full Arabic language support
- Secure authentication system
- Prisma + PostgreSQL database
- Production-ready deployment settings
"@
    
    git commit -m $commitMessage
    Write-Host "Changes saved successfully!" -ForegroundColor Green
} else {
    Write-Host "No new changes to commit" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Project is ready for GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "1. Create a new repository on GitHub" -ForegroundColor Cyan
Write-Host "2. Run the following commands:" -ForegroundColor Cyan
Write-Host "   git remote add origin https://github.com/username/repository-name.git" -ForegroundColor Yellow
Write-Host "   git branch -M main" -ForegroundColor Yellow
Write-Host "   git push -u origin main" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. To deploy on Vercel:" -ForegroundColor Cyan
Write-Host "   - Go to vercel.com" -ForegroundColor White
Write-Host "   - Connect GitHub account" -ForegroundColor White  
Write-Host "   - Select Repository" -ForegroundColor White
Write-Host "   - Add Environment Variables" -ForegroundColor White
Write-Host "   - Click Deploy" -ForegroundColor White
Write-Host ""
Write-Host "4. To enable Codespaces:" -ForegroundColor Cyan
Write-Host "   - In GitHub repository go to Settings" -ForegroundColor White
Write-Host "   - Go to Codespaces" -ForegroundColor White
Write-Host "   - Enable the feature" -ForegroundColor White
Write-Host ""
Write-Host "Enjoy deploying your system!" -ForegroundColor Magenta