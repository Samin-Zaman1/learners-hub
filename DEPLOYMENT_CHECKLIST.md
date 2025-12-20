# Deployment Pre-Flight Checklist

Run this checklist before deploying to production.

## Local Testing

### Backend (API)
```bash
cd apps/api

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations (local DB)
npx prisma migrate dev

# Build the project
npm run build

# Test build output
npm run start:prod
```

**Expected**: Server starts on port 4000

### Frontend (Web)
```bash
cd apps/web

# Install dependencies
pnpm install

# Build for production
pnpm build

# Test production build
pnpm start
```

**Expected**: Next.js starts on port 3000

## Environment Variables Check

### Backend Required Variables
- [ ] `NODE_ENV` set to "production"
- [ ] `DATABASE_URL` is valid PostgreSQL connection
- [ ] `JWT_SECRET` is strong (32+ characters)
- [ ] `CLIENT_ORIGIN` includes your Vercel URL
- [ ] `PORT` is set (default: 4000)

### Frontend Required Variables
- [ ] `NEXT_PUBLIC_API_URL` points to your API

## Security Check

- [ ] No hardcoded secrets in code
- [ ] .env files are gitignored
- [ ] JWT_SECRET is random and strong
- [ ] CORS only allows your frontend
- [ ] Database has strong password
- [ ] No console.log with sensitive data

## Code Quality

- [ ] No TypeScript errors: `npm run build`
- [ ] No ESLint errors: `npm run lint`
- [ ] Tests pass (if any): `npm test`
- [ ] No TODO/FIXME for critical features

## Database

- [ ] Migrations are up to date
- [ ] Schema is finalized
- [ ] Seed data is ready (optional)
- [ ] Backup strategy planned

## Deployment Platform

### Railway/Render
- [ ] GitHub repo is up to date
- [ ] Service is created
- [ ] Environment variables set
- [ ] Build/start commands configured
- [ ] Health check path set: `/api/health`

### Vercel
- [ ] Project imported
- [ ] Environment variables set
- [ ] Build settings verified
- [ ] Domain configured (optional)

## Testing Endpoints

Test these manually before going live:

### Backend
```bash
# Health check
curl https://your-api.railway.app/api/health

# Should return 200 OK with JSON response
```

### Frontend
```bash
# Homepage
curl https://your-app.vercel.app

# Should return HTML
```

## Post-Deployment

- [ ] Health endpoint returns 200
- [ ] Can register new user
- [ ] Can login
- [ ] API calls work from frontend
- [ ] No CORS errors in console
- [ ] All features functional
- [ ] Logs show no critical errors

## Rollback Plan

If deployment fails:

1. **Revert Backend**: Railway/Render → Deployments → Redeploy previous version
2. **Revert Frontend**: Vercel → Deployments → Promote previous deployment
3. **Database**: Restore from backup (if schema changed)

## Monitoring Setup

- [ ] Error tracking configured (Sentry)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Log aggregation (Railway/Render built-in)
- [ ] Alerts configured for downtime

---

## Quick Commands

### Generate Secure JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Test Database Connection
```bash
# Install PostgreSQL client
psql $DATABASE_URL

# If connects successfully, DATABASE_URL is correct
```

### Check Environment Variables (Railway)
```bash
railway variables
```

### View Logs (Railway)
```bash
railway logs
```

---

**Status**: Ready for deployment ✅

**Last Updated**: December 20, 2025
