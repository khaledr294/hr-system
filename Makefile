# Production Build and Deployment Commands

# Local build test
build:
	npm run build

# Production deployment to Vercel
deploy-vercel:
	vercel --prod

# Production deployment to Railway
deploy-railway:
	railway up

# Database operations
db-migrate:
	npx prisma migrate deploy

db-reset:
	npx prisma migrate reset --force

db-seed:
	npx prisma db seed

# Environment setup
setup-env:
	cp .env.production.example .env.production
	@echo "Please edit .env.production with your actual values"

# Security check
security-check:
	npm audit
	npx prisma validate

# Performance test
performance-test:
	npm run build
	npm run start &
	npx lighthouse http://localhost:3000 --output=json --output=html --output-path=./lighthouse-results.json
	pkill -f "next start"

.PHONY: build deploy-vercel deploy-railway db-migrate db-reset db-seed setup-env security-check performance-test