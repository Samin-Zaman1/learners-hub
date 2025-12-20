# Vercel Deployment Guide for Champius

## Prerequisites
- Vercel account connected to your GitHub repository
- Backend API deployed separately (Railway, Render, or another Vercel project)

## Deployment Steps

### 1. Push to GitHub
Ensure all changes are committed and pushed to your repository.

### 2. Import Project to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your repository
4. Vercel will auto-detect the monorepo structure

### 3. Configure Project Settings
- **Framework Preset**: Next.js
- **Root Directory**: Leave as default (vercel.json handles this)
- **Build Command**: Automatic (defined in vercel.json)
- **Output Directory**: Automatic (defined in vercel.json)

### 4. Set Environment Variables
Go to Project Settings → Environment Variables and add:

```
NEXT_PUBLIC_API_URL=https://your-deployed-api-url.com
```

**Important**: Add this for all environments (Production, Preview, Development)

### 5. Deploy
Click "Deploy" and Vercel will:
1. Install dependencies using pnpm
2. Build the Next.js app from apps/web
3. Deploy to production

## Common Issues Fixed

### ✅ Issue 1: Turbopack Build Failures
**Problem**: `--turbopack` flag causes build errors on Vercel
**Solution**: Removed from build scripts

### ✅ Issue 2: Monorepo Configuration
**Problem**: Vercel can't find the Next.js app in monorepo
**Solution**: Added vercel.json with proper paths

### ✅ Issue 3: Large Bundle Size
**Problem**: Slow builds and deployments
**Solution**: Added `output: 'standalone'` in next.config.ts

### ✅ Issue 4: Environment Variables
**Problem**: API URL not configured for production
**Solution**: Documented in .env.example and next.config.ts

## Backend Deployment Options

Since your backend is NestJS with Prisma, deploy it separately:

### Option 1: Railway (Recommended)
1. Connect your GitHub repo to Railway
2. Set root directory to `apps/api`
3. Add DATABASE_URL environment variable
4. Railway auto-detects Prisma and runs migrations

### Option 2: Render
1. Create new Web Service
2. Set root directory to `apps/api`
3. Build command: `npm install && npx prisma generate && npm run build`
4. Start command: `npm run start:prod`

### Option 3: Separate Vercel Project
1. Create another Vercel project
2. Use custom build commands for NestJS
3. Not ideal for APIs with databases

## Verification Checklist

- [ ] Frontend deploys successfully
- [ ] No build errors or warnings
- [ ] Environment variables are set
- [ ] Backend API is accessible
- [ ] Frontend can connect to backend
- [ ] API calls work in production
- [ ] Authentication flows work
- [ ] Images and assets load correctly

## Local Testing Before Deploy

```bash
# Test production build locally
cd apps/web
pnpm build
pnpm start
```

## Support

If deployment fails:
1. Check Vercel build logs
2. Verify environment variables
3. Ensure backend API is accessible
4. Check CORS settings on backend
