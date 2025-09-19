# 🚨 DATABASE_URL Still Invalid - Troubleshooting Guide

## Current Error
```
Error parsing connection string: invalid port number in database URL
```

## Problem Analysis
The DATABASE_URL is still not in the correct format for Prisma Accelerate.

## Step-by-Step Fix

### 1️⃣ Go to Prisma Cloud
- Visit: https://cloud.prisma.io/
- Click on **saed-hr-system** project
- Look for **"Accelerate"** section

### 2️⃣ Get the Correct Format
The connection string should look like:
```
prisma://accelerate.prisma-data.net/?api_key=YOUR_API_KEY_HERE
```

**Important:** Make sure it's:
- ✅ Starts with `prisma://` (NOT `prisma+postgres://`)
- ✅ Contains only the API key parameter
- ✅ No additional database parameters

### 3️⃣ Double-Check GitHub Secret
1. Go to: https://github.com/khaledr294/hr-system/settings/secrets/actions
2. Click edit (pencil icon) next to `DATABASE_URL`
3. Verify the value is EXACTLY:
   ```
   prisma://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza18xUWVEOFRKNWx6X3N5T1RsUi1sMTkiLCJhcGlfa2V5IjoiMDFLNUhLWjBBSDdUR0tEMzhHSjkxV1JNN1QiLCJ0ZW5hbnRfaWQiOiIyNzIwODViOTQyODFjYWZiYjI4MzRmYTUyMDQ5ZGUyYzcyNWZmZDg0MjFhZTg2NzBiZDNiMzgxYTBiYTEyODA3IiwiaW50ZXJuYWxfc2VjcmV0IjoiMWYxNzIwZjUtYTg2My00ZTJkLWE5MGUtY2NlNjRiYTJmM2E0In0.fmGkQyVY8v0VgoUOyBKbJOV8Mh7-H9dytIpUOA3NZk0
   ```

### 4️⃣ What NOT to Use ❌
- `prisma+postgres://...` (Wrong)
- `postgresql://...` (Direct connection, not Accelerate)
- Any URL with database name, username, password, or port

### 5️⃣ Alternative: Generate New Connection String
If the above doesn't work:
1. In Prisma Cloud → saed-hr-system project
2. Go to **Settings** → **Accelerate**
3. Click **"Generate new connection string"**
4. Copy the new URL and update GitHub secret

## Test After Fix
After updating the secret, the app will automatically redeploy.
Test at: https://hr-system-khaled294s-projects.vercel.app

---

**The issue is that Prisma Accelerate requires a specific URL format that's different from regular PostgreSQL connections.**