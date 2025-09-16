#!/bin/bash

# Production Deployment Script
echo "🚀 Starting production deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build the application
echo "🏗️ Building application..."
npm run build

# Database migration
echo "🗃️ Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "⚙️ Generating Prisma client..."
npx prisma generate

# Optional: Seed database (uncomment if needed)
# echo "🌱 Seeding database..."
# npx prisma db seed

echo "✅ Deployment completed successfully!"
echo "🌐 Your application is ready to serve users"