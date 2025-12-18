# Zero-Cost Deployment Guide

## Stack
- **Frontend**: Vercel (Next.js)
- **Backend**: Render (NestJS)  
- **Database**: Supabase (PostgreSQL)

---

## Step 1: Create Accounts (5 minutes)

1. **GitHub** - Push your code (if not already)
2. **Vercel** - https://vercel.com (Sign up with GitHub)
3. **Render** - https://render.com (Sign up with GitHub)
4. **Supabase** - https://supabase.com (Sign up with GitHub)

---

## Step 2: Deploy Database - Supabase (5 minutes)

1. Go to https://supabase.com/dashboard
2. Click "New Project"
   - Name: `champius-db`
   - Database Password: (create a strong password, SAVE IT!)
   - Region: Choose closest to you
3. Wait 2-3 minutes for database to provision
4. Go to **Settings** → **Database**
5. Copy **Connection String** (URI format)
   - Example: `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres`
6. **IMPORTANT**: Replace `[PASSWORD]` with your actual password

### Run Database Migration

In your local terminal:
```bash
cd apps/api

# Set the Supabase database URL temporarily
$env:DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres"

# Run migrations
npx prisma migrate deploy

# Seed the database
npx prisma db seed
```

---

## Step 3: Deploy Backend - Render (10 minutes)

1. Go to https://dashboard.render.com
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `champius-api`
   - **Root Directory**: `apps/api`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm run start:prod`
   - **Instance Type**: `Free`

5. Add Environment Variables:
   ```
   DATABASE_URL = postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres
   JWT_SECRET = your-super-secret-jwt-key-min-32-chars
   CLIENT_ORIGIN = https://your-app.vercel.app
   PORT = 10000
   ```

6. Click **Create Web Service**
7. Wait 5-10 minutes for deployment
8. Copy your backend URL (e.g., `https://champius-api.onrender.com`)

**IMPORTANT**: Free tier sleeps after 15min inactivity. First request takes 30-60s to wake up.

---

## Step 4: Deploy Frontend - Vercel (5 minutes)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: (auto-detected)
   - **Output Directory**: (auto-detected)

4. Add Environment Variable:
   ```
   NEXT_PUBLIC_API_URL = https://champius-api.onrender.com
   ```

5. Click **Deploy**
6. Wait 2-3 minutes
7. Copy your frontend URL (e.g., `https://champius.vercel.app`)

---

## Step 5: Update CORS (2 minutes)

Go back to **Render** dashboard:
1. Open your `champius-api` service
2. Go to **Environment**
3. Update `CLIENT_ORIGIN` to your Vercel URL:
   ```
   CLIENT_ORIGIN = https://champius.vercel.app
   ```
4. Click **Save Changes** (triggers redeploy)

---

## Step 6: Test Deployment

1. Visit your Vercel URL: `https://champius.vercel.app`
2. Try logging in with seeded accounts:
   - Email: `student1@example.com`
   - Password: `Student@123`
3. If first load is slow (30-60s), that's normal - backend is waking up

---

## Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify DATABASE_URL is correct
- Ensure migrations ran successfully

### Frontend can't reach backend
- Check CORS settings in Render
- Verify NEXT_PUBLIC_API_URL is correct
- Check browser console for errors

### Database connection fails
- Verify Supabase password is correct
- Check if connection string has special characters (URL encode them)
- Ensure database is active in Supabase dashboard

### 500 errors
- Check Render logs
- Verify JWT_SECRET is set
- Ensure database has data (run seed script)

---

## Keep Backend Awake (Optional)

To prevent 15-minute sleep:

1. Create free account at https://uptimerobot.com
2. Add new monitor:
   - Type: HTTP(s)
   - URL: `https://champius-api.onrender.com/health` (or any endpoint)
   - Monitoring Interval: 5 minutes
3. Backend will stay awake 24/7

**Note**: This uses more of your 750 free hours/month.

---

## Cost Breakdown

- Vercel: **$0/month** (100GB bandwidth free)
- Render: **$0/month** (750 hours free, ~31 days)
- Supabase: **$0/month** (500MB storage, 2GB transfer free)
- **Total: $0/month** ✅

---

## Limitations of Free Tier

- Backend sleeps after 15min (30-60s wake time)
- 500MB database storage limit
- 750 hours/month backend uptime (~31 days if always on)
- Slower performance than paid tiers

---

## Upgrade Path (When Needed)

If you need better performance later:
- Render Starter: **$7/month** (no sleep, more resources)
- Supabase Pro: **$25/month** (8GB storage, better performance)
- Total: **$32/month** for production-ready setup

---

## Next Steps After Deployment

1. ✅ Test all features thoroughly
2. ⚠️ Change JWT_SECRET to a secure random string
3. ⚠️ Update all seeded passwords
4. 📊 Monitor usage in dashboards
5. 🔒 Add rate limiting before sharing publicly
6. 📝 Document known issues for users

---

## Support

If you encounter issues:
1. Check Render/Vercel deployment logs
2. Check browser console for frontend errors
3. Verify environment variables are set correctly
4. Test backend API directly (Postman/curl)

Good luck with your deployment! 🚀
