# 🏢 HR System Database Identification Guide

## Problem
You have 2 Prisma databases connected:
- **saed-hr-system** 
- **hr-system-db**

## Step-by-Step Solution

### Step 1: Get Database URLs
1. Go to https://cloud.prisma.io/
2. Sign in to your account
3. Click on **saed-hr-system** database
4. Copy the "Prisma Accelerate" connection string
5. Go back and click on **hr-system-db** database  
6. Copy its "Prisma Accelerate" connection string

### Step 2: Test Databases (Option A - Using Script)
1. Open `scripts/test-databases.mjs`
2. Replace the two URLs with your actual Prisma Accelerate URLs:
   ```javascript
   const databases = [
     {
       name: 'saed-hr-system',
       url: 'YOUR_SAED_ACCELERATE_URL_HERE'
     },
     {
       name: 'hr-system-db', 
       url: 'YOUR_HR_SYSTEM_DB_ACCELERATE_URL_HERE'
     }
   ];
   ```
3. Run the test:
   ```bash
   node scripts/test-databases.mjs
   ```

### Step 3: Manual Check (Option B - If script fails)
1. Update your `.env` file with first database URL:
   ```
   DATABASE_URL="saed-hr-system-accelerate-url-here"
   ```
2. Run: `npx prisma studio`
3. Check if you see:
   - Admin user (admin@hr-system.com)
   - Your workers data
   - Your contracts data
4. Note down what you find
5. Close Prisma Studio
6. Update `.env` with second database URL:
   ```
   DATABASE_URL="hr-system-db-accelerate-url-here"  
   ```
7. Run: `npx prisma studio` again
8. Compare the data

### Step 4: Decision Making
**Keep the database that has:**
- ✅ Admin user (admin@hr-system.com) 
- ✅ More worker records
- ✅ More contract data
- ✅ Recent activity/updates

**Delete the database that has:**
- ❌ Empty or minimal data
- ❌ No admin user
- ❌ Looks like test data

### Step 5: Recommended Choice (Based on Names)
**Recommendation: Keep `hr-system-db`**
- More professional naming convention
- Matches your project structure
- `saed-hr-system` looks like personal/test database

### Step 6: Update GitHub Secrets
1. Go to GitHub → Your Repository → Settings → Secrets and variables → Actions
2. Update **DATABASE_URL** with the correct Prisma Accelerate URL
3. Add **NEXTAUTH_URL** with your Vercel app URL: `https://your-app-name.vercel.app`

### Step 7: Delete Unused Database  
1. Go to https://cloud.prisma.io/
2. Click on the database you want to delete
3. Go to Settings → Delete Project
4. Type the database name to confirm
5. Delete it permanently

### Step 8: Test Login
After deployment, test these credentials:
- **Admin**: admin@hr-system.com / 123456
- **HR User**: hr@hr-system.com / 123456

## Quick Commands Summary
```bash
# Test first database
echo "DATABASE_URL=saed-url" > .env.local
npx prisma studio

# Test second database  
echo "DATABASE_URL=hr-db-url" > .env.local
npx prisma studio

# After choosing, update GitHub secrets and redeploy
```

## Need Help?
If both databases look the same or you're unsure, we can run a migration to ensure the correct schema and seed data in your chosen database.

---
**Next Action**: Follow this guide, then tell me which database you chose so we can complete the deployment setup.