# Champius - Complete Deployment Guide
## End-to-End Production Deployment

This guide will help you deploy the complete Champius Learning Management System to production.

---

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Vercel        │         │   Railway/Render │         │   PostgreSQL    │
│   (Frontend)    │────────▶│   (Backend API)  │────────▶│   (Database)    │
│   Next.js       │         │   NestJS         │         │   Hosted DB     │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

---

## Deployment Checklist

### Phase 1: Database Setup
- [ ] Create PostgreSQL database
- [ ] Note down DATABASE_URL
- [ ] Configure connection pooling

### Phase 2: Backend Deployment
- [ ] Choose hosting platform (Railway/Render)
- [ ] Configure environment variables
- [ ] Deploy API
- [ ] Run database migrations
- [ ] Test health endpoint
- [ ] Note down API URL

### Phase 3: Frontend Deployment
- [ ] Set NEXT_PUBLIC_API_URL in Vercel
- [ ] Deploy to Vercel
- [ ] Test frontend build
- [ ] Verify API connection

### Phase 4: Integration Testing
- [ ] Test authentication flow
- [ ] Test API calls from frontend
- [ ] Verify CORS configuration
- [ ] Check all features work

### Phase 5: Production Readiness
- [ ] Set up monitoring
- [ ] Configure custom domains (optional)
- [ ] Set up error tracking
- [ ] Configure backups
- [ ] Document credentials

---

## Quick Start (Fastest Path to Production)

### 1. Deploy Database & Backend (Railway - 5 minutes)

```bash
# 1. Go to railway.app and sign in with GitHub
# 2. Click "New Project" → "Deploy from GitHub repo"
# 3. Select your Champius repository
# 4. Add PostgreSQL database (automatic)
# 5. Configure service:
```

**Service Settings:**
- Root Directory: `apps/api`
- Build Command: `npm install && npx prisma generate && npm run build`
- Start Command: `npx prisma migrate deploy && npm run start:prod`

**Environment Variables:**
```env
NODE_ENV=production
JWT_SECRET=<generate-a-secure-random-string-32-chars-minimum>
CLIENT_ORIGIN=https://your-app.vercel.app
PORT=4000
```

**Note your API URL**: `https://your-app.up.railway.app`

### 2. Deploy Frontend (Vercel - 3 minutes)

```bash
# 1. Go to vercel.com and sign in with GitHub
# 2. Click "Add New" → "Project"
# 3. Import your Champius repository
# 4. Vercel auto-detects configuration
# 5. Add environment variable:
```

**Environment Variable:**
```env
NEXT_PUBLIC_API_URL=https://your-app.up.railway.app/api
```

### 3. Test Deployment (2 minutes)

1. Open your Vercel URL: `https://your-app.vercel.app`
2. Try to register/login
3. Check if API calls work
4. Verify all features

**Done! Your app is live! 🚀**

---

## Detailed Deployment Steps

### Option A: Railway (Recommended)

#### Why Railway?
- ✅ Automatic database provisioning
- ✅ Zero-config deployments
- ✅ Built-in monitoring
- ✅ Automatic SSL
- ✅ GitHub integration
- ✅ Free $5/month credit

See [BACKEND_DEPLOYMENT_GUIDE.md](BACKEND_DEPLOYMENT_GUIDE.md#railway-deployment) for detailed steps.

### Option B: Render

#### Why Render?
- ✅ Free tier available
- ✅ Automatic SSL
- ✅ Good for side projects
- ⚠️ Spins down after 15min (free tier)

See [BACKEND_DEPLOYMENT_GUIDE.md](BACKEND_DEPLOYMENT_GUIDE.md#render-deployment) for detailed steps.

### Option C: Docker

For self-hosting on DigitalOcean, AWS, Azure, etc.

See [BACKEND_DEPLOYMENT_GUIDE.md](BACKEND_DEPLOYMENT_GUIDE.md#docker-deployment) for detailed steps.

---

## Environment Variables Reference

### Frontend (.env.local or Vercel)

```env
# Required
NEXT_PUBLIC_API_URL=https://your-api-url.com/api
```

### Backend (.env or Railway/Render)

```env
# Required
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-super-secret-key-min-32-characters
CLIENT_ORIGIN=https://your-app.vercel.app
PORT=4000

# Optional (for email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@champius.com
```

---

## Security Checklist

### Before Production

- [ ] Change all default secrets
- [ ] Use strong JWT_SECRET (32+ characters, random)
- [ ] Enable HTTPS only
- [ ] Configure CORS properly (no wildcards)
- [ ] Review database permissions
- [ ] Enable rate limiting (if available)
- [ ] Review authentication flows
- [ ] Test password reset flows
- [ ] Validate all user inputs
- [ ] Sanitize database queries

### JWT Secret Generation

```bash
# Generate a secure random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Testing Your Deployment

### 1. Backend Health Check

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

### 2. CORS Test

```bash
curl -H "Origin: https://your-app.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  https://your-api-url.com/api/auth/login
```

Should return CORS headers.

### 3. Frontend Test

1. Visit `https://your-app.vercel.app`
2. Open browser DevTools → Network tab
3. Try to login
4. Check API requests succeed

### 4. End-to-End Test

- [ ] User registration works
- [ ] Email verification works (if enabled)
- [ ] Login works
- [ ] JWT token is stored
- [ ] Protected routes work
- [ ] Data loads from API
- [ ] Forms submit successfully
- [ ] File uploads work (if applicable)
- [ ] Logout works

---

## Common Issues & Solutions

### Issue: CORS Errors

**Symptom**: Browser console shows CORS policy errors

**Solution**:
```env
# Backend - Add your Vercel URLs (including preview deployments)
CLIENT_ORIGIN=https://your-app.vercel.app,https://your-app-git-main.vercel.app,https://your-app-preview.vercel.app
```

### Issue: 504 Gateway Timeout

**Symptom**: API requests timeout

**Solutions**:
1. Check backend is running: `curl https://your-api-url.com/api/health`
2. Verify DATABASE_URL is correct
3. Check logs for errors
4. Ensure app listens on `0.0.0.0` not `localhost`

### Issue: Database Connection Errors

**Symptom**: API returns 500 errors, logs show Prisma errors

**Solutions**:
1. Verify DATABASE_URL format:
   ```
   postgresql://user:password@host:5432/database?sslmode=require
   ```
2. Check database is accessible
3. Run migrations: `npx prisma migrate deploy`
4. Generate Prisma client: `npx prisma generate`

### Issue: Frontend Shows "Network Error"

**Symptom**: All API calls fail

**Solutions**:
1. Check NEXT_PUBLIC_API_URL is set correctly
2. Verify API URL is accessible
3. Check browser console for details
4. Test API directly with curl

### Issue: JWT Verification Failed

**Symptom**: Login works but subsequent requests fail

**Solutions**:
1. Ensure JWT_SECRET is the same across all backend instances
2. Check token expiration settings
3. Verify localStorage has token
4. Check Authorization header is sent

---

## Performance Optimization

### Frontend (Vercel)

Already optimized with:
- ✅ Output: standalone
- ✅ SWC minification
- ✅ Automatic image optimization
- ✅ Edge caching
- ✅ Compression

### Backend

1. **Enable Connection Pooling**:
   ```env
   DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=60
   ```

2. **Add Caching** (optional):
   ```typescript
   // Install: npm install cache-manager
   // Add Redis or in-memory cache
   ```

3. **Enable Compression**:
   ```typescript
   // Already enabled in main.ts via NestJS defaults
   ```

---

## Monitoring & Maintenance

### Built-in Monitoring

- **Railway**: Dashboard → Metrics tab
- **Vercel**: Dashboard → Analytics
- **Render**: Dashboard → Metrics

### Error Tracking (Optional)

Install Sentry for error tracking:

```bash
# Frontend
npm install --save @sentry/nextjs

# Backend
npm install --save @sentry/node
```

### Uptime Monitoring

Use [UptimeRobot](https://uptimerobot.com) (free):
- Monitor: `https://your-api-url.com/api/health`
- Alert: Email when down

---

## Backup Strategy

### Database Backups

- **Railway**: Automatic daily backups (included)
- **Render**: Manual backups via dashboard
- **Self-hosted**: Set up pg_dump cron jobs

### Code Backups

- ✅ Stored in GitHub (already done)
- ✅ Vercel deployment history
- ✅ Railway deployment history

---

## Scaling Considerations

### When to Scale

Monitor these metrics:
- Response time > 1 second
- Error rate > 1%
- CPU usage > 80%
- Memory usage > 80%
- Database connections exhausted

### How to Scale

**Railway**:
- Upgrade to higher plan
- Enable auto-scaling

**Vercel**:
- Automatically scales (no action needed)

**Database**:
- Upgrade to larger instance
- Enable connection pooling
- Add read replicas

---

## Custom Domain Setup (Optional)

### Frontend (Vercel)

1. Go to Project Settings → Domains
2. Add your domain: `www.champius.com`
3. Update DNS records as instructed
4. Vercel automatically provisions SSL

### Backend (Railway/Render)

1. Add custom domain in settings
2. Update DNS CNAME record
3. SSL auto-provisions

### Update CORS

```env
# Backend
CLIENT_ORIGIN=https://www.champius.com,https://champius.com
```

---

## Cost Estimation

### Free Tier (Hobby Projects)

| Service | Cost | Limits |
|---------|------|--------|
| Vercel | $0 | 100GB bandwidth/month |
| Railway | $5 credit/month | ~500 hours |
| Render | $0 | Sleeps after 15min |

**Total**: $0-5/month

### Production Tier (Small App)

| Service | Cost | Features |
|---------|------|----------|
| Vercel Pro | $20/month | Custom domains, analytics |
| Railway | $20/month | 24/7 uptime, 8GB RAM |
| PostgreSQL | $7/month | 2GB storage |

**Total**: ~$47/month

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **NestJS Docs**: https://docs.nestjs.com
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

## Final Checklist

### Pre-Deployment
- [ ] All tests passing locally
- [ ] Environment variables documented
- [ ] Database schema finalized
- [ ] Security review completed
- [ ] Performance tested

### During Deployment
- [ ] Database deployed
- [ ] Migrations ran successfully
- [ ] Backend deployed and healthy
- [ ] Frontend deployed
- [ ] Environment variables set
- [ ] CORS configured

### Post-Deployment
- [ ] All features tested
- [ ] Authentication working
- [ ] API calls succeeding
- [ ] No console errors
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Team has access
- [ ] Documentation updated

---

## Success Criteria

Your deployment is successful when:

✅ Frontend loads at your Vercel URL  
✅ Health endpoint returns 200 OK  
✅ Users can register and login  
✅ API calls work from frontend  
✅ No CORS errors  
✅ Database queries succeed  
✅ All features functional  
✅ No critical errors in logs  

---

## Next Steps After Deployment

1. **Set up monitoring** - Add Sentry or UptimeRobot
2. **Configure backups** - Ensure database backups work
3. **Add custom domain** - Use your own domain name
4. **Enable analytics** - Track user behavior
5. **Set up CI/CD** - Automate deployments on git push
6. **Load testing** - Test with realistic traffic
7. **Security audit** - Review security best practices
8. **Documentation** - Document deployment process for team

---

**Congratulations! Your Champius LMS is now live in production! 🎉**

For issues or questions:
1. Check logs in Railway/Vercel dashboards
2. Review this documentation
3. Test each component individually
4. Check environment variables

Happy deploying! 🚀
