#!/bin/bash
# Deployment improvement script

echo "🚀 HR System Deployment Improvements"
echo "====================================="

# 1. Clean npm cache to avoid deprecated warnings
echo "🧹 Cleaning npm cache..."
npm cache clean --force

# 2. Update minor version packages safely
echo "📦 Updating safe dependencies..."
npm update --save \
  @hookform/resolvers \
  zod \
  react \
  react-dom

# 3. Update dev dependencies
echo "🛠️  Updating dev dependencies..."
npm update --save-dev \
  @types/node \
  typescript

# 4. Clean up deprecated packages in node_modules
echo "🔄 Rebuilding node_modules..."
rm -rf node_modules package-lock.json
npm install

# 5. Run security audit
echo "🛡️  Running security audit..."
npm audit --audit-level high

# 6. Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

echo "✅ Deployment improvements completed!"
echo "💡 Recommended next steps:"
echo "   1. Test the application locally"
echo "   2. Commit and push changes"
echo "   3. Monitor deployment for improved performance"