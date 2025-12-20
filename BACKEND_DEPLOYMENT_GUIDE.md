# Complete Backend Deployment Guide

## Table of Contents
1. [Railway Deployment (Recommended)](#railway-deployment)
2. [Render Deployment](#render-deployment)
3. [Docker Deployment](#docker-deployment)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Post-Deployment](#post-deployment)

---

## Railway Deployment (Recommended)

Railway is the easiest option for deploying NestJS + Prisma + PostgreSQL.

### Step 1: Create Railway Account
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your Champius repository
4. Railway will auto-detect your monorepo

### Step 3: Add PostgreSQL Database
1. In your project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway automatically creates the database and sets `DATABASE_URL`

### Step 4: Configure API Service
1. Click on your service
2. Go to "Settings" → "Root Directory"
3. Set to: `apps/api`
4. Build Command: `npm install && npx prisma generate && npm run build`
5. Start Command: `npx prisma migrate deploy && npm run start:prod`

### Step 5: Set Environment Variables
Go to "Variables" tab and add:

```bash
NODE_ENV=production
JWT_SECRET=your-super-secret-key-min-32-characters-long
CLIENT_ORIGIN=https://your-app.vercel.app
PORT=4000
```

**Note**: `DATABASE_URL` is automatically set by Railway.

### Step 6: Deploy
1. Click "Deploy"
2. Railway will build and deploy your API
3. Your API URL will be: `https://your-app.up.railway.app`

### Step 7: Update Frontend
Update your Vercel environment variables:
```bash
NEXT_PUBLIC_API_URL=https://your-app.up.railway.app/api
```

---

## Render Deployment

### Step 1: Create Render Account
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub

### Step 2: Create PostgreSQL Database
1. Click "New +" → "PostgreSQL"
2. Name: `champius-db`
3. Plan: Free
4. Click "Create Database"
5. Copy the "Internal Database URL"

### Step 3: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: champius-api
   - **Region**: Oregon (US West) or closest to you
   - **Branch**: main
   - **Root Directory**: `apps/api`
   - **Environment**: Node
   - **Build Command**: 
     ```bash
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command**: 
     ```bash
     npx prisma migrate deploy && npm run start:prod
     ```

### Step 4: Set Environment Variables
Add these in "Environment" tab:

```bash
NODE_ENV=production
DATABASE_URL=<paste-your-internal-database-url>
JWT_SECRET=your-super-secret-key-min-32-characters-long
CLIENT_ORIGIN=https://your-app.vercel.app
PORT=4000
```

### Step 5: Configure Health Check
- **Health Check Path**: `/api/health`
- **Health Check Grace Period**: 30 seconds

### Step 6: Deploy
1. Click "Create Web Service"
2. Render will deploy your API
3. Your API URL: `https://champius-api.onrender.com`

**Note**: Free tier spins down after 15 minutes of inactivity.

### Step 7: Update Frontend
```bash
NEXT_PUBLIC_API_URL=https://champius-api.onrender.com/api
```

---

## Docker Deployment

For platforms like DigitalOcean, AWS, or Azure:

### Build and Run Locally
```bash
# Navigate to project root
cd Champius

# Build the image
docker build -f apps/api/Dockerfile -t champius-api .

# Run the container
docker run -p 4000:4000 \
  -e DATABASE_URL="your-database-url" \
  -e JWT_SECRET="your-secret" \
  -e CLIENT_ORIGIN="https://your-app.vercel.app" \
  champius-api
```

### Deploy to Cloud
1. Push image to registry (Docker Hub, ECR, GCR)
2. Use docker-compose.yml for production
3. Set environment variables in your cloud platform

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | `your-super-secret-key-here` |
| `CLIENT_ORIGIN` | Frontend URLs (comma-separated) | `https://app.vercel.app` |
| `PORT` | API port | `4000` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | Email server host | `smtp.gmail.com` |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_USER` | Email username | `your-email@gmail.com` |
| `SMTP_PASS` | Email password | `your-app-password` |
| `EMAIL_FROM` | Sender email | `noreply@champius.com` |

---

## Database Setup

### Automatic Migration (Recommended)
The start command includes `npx prisma migrate deploy`, which:
- Runs pending migrations automatically
- Creates tables if they don't exist
- Safe for production

### Manual Migration
If you need to run migrations manually:

```bash
# SSH into your server or use Railway CLI
cd apps/api

# Run migrations
npx prisma migrate deploy

# (Optional) Seed database
npm run seed
```

### Database Backup
Set up automated backups on your hosting platform:
- **Railway**: Automatic daily backups
- **Render**: Manual backups via dashboard
- **Docker**: Use pg_dump with cron jobs

---

## Post-Deployment

### 1. Test Health Endpoint
```bash
curl https://your-api-url.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-20T...",
  "uptime": 123.45,
  "environment": "production",
  "database": "connected"
}
```

### 2. Test API Endpoint
```bash
curl https://your-api-url.com/api
```

### 3. Verify CORS
From your frontend:
```javascript
fetch('https://your-api-url.com/api/health')
  .then(r => r.json())
  .then(console.log)
```

### 4. Test Authentication
Try logging in through your frontend to verify:
- JWT token generation
- Database connections
- CORS settings

### 5. Monitor Logs
- **Railway**: View logs in dashboard
- **Render**: Check logs tab
- **Docker**: `docker logs <container-id>`

### 6. Set Up Monitoring (Optional)
- Use Railway/Render built-in monitoring
- Or integrate [Sentry](https://sentry.io) for error tracking
- Set up [UptimeRobot](https://uptimerobot.com) for uptime monitoring

---

## Troubleshooting

### Issue: CORS Errors
**Solution**: Add your Vercel URL to `CLIENT_ORIGIN`:
```bash
CLIENT_ORIGIN=https://your-app.vercel.app,https://your-app-git-main.vercel.app
```

### Issue: Database Connection Failed
**Solution**: Check `DATABASE_URL` format:
```
postgresql://username:password@host:port/database?sslmode=require
```

### Issue: Build Fails - Prisma Error
**Solution**: Ensure `postinstall` script runs:
```json
"postinstall": "prisma generate"
```

### Issue: JWT Errors
**Solution**: Ensure `JWT_SECRET` is set and matches between deployments

### Issue: 502 Bad Gateway
**Solution**: 
- Check if app is listening on `0.0.0.0` (not `localhost`)
- Verify `PORT` environment variable
- Check health endpoint

### Issue: Migrations Don't Run
**Solution**: Manually run migrations:
```bash
npx prisma migrate deploy
```

---

## Production Checklist

- [ ] Database deployed and accessible
- [ ] All environment variables set correctly
- [ ] Migrations run successfully
- [ ] Health endpoint returns 200 OK
- [ ] CORS configured with frontend URL
- [ ] JWT_SECRET is strong and secure
- [ ] SSL/HTTPS enabled
- [ ] Logs are accessible
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Frontend can connect to backend
- [ ] Authentication works end-to-end

---

## Support & Resources

- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **Prisma Deployment**: https://www.prisma.io/docs/guides/deployment
- **NestJS Deployment**: https://docs.nestjs.com/faq/deployment

---

## Quick Reference

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# View logs
railway logs

# Run command in production
railway run npm run prisma:migrate
```

### Render
```bash
# View logs
render logs <service-id>

# Restart service via dashboard
```

### Health Check URLs
- Railway: `https://<your-app>.up.railway.app/api/health`
- Render: `https://<your-app>.onrender.com/api/health`

---

## Next Steps

1. Deploy backend using Railway or Render
2. Get your API URL
3. Update Vercel environment variables with API URL
4. Test the complete flow
5. Set up monitoring
6. Configure custom domain (optional)

Your backend is now production-ready! 🚀
