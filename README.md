# Champius - Learning Management System

A modern, full-stack Learning Management System built with NestJS, Next.js, Prisma, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- PostgreSQL database
- Git

### Local Development

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Champius
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install API dependencies
cd apps/api
npm install

# Install Web dependencies
cd ../web
pnpm install
```

3. **Set up environment variables**
```bash
# Backend (.env in apps/api/)
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your database credentials

# Frontend (.env.local in apps/web/)
cp apps/web/.env.example apps/web/.env.local
# Edit with your API URL (http://localhost:4000 for local)
```

4. **Run database migrations**
```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
```

5. **Start development servers**
```bash
# From project root
npm run dev

# Or start individually:
npm run dev:api   # Backend on http://localhost:4000
npm run dev:web   # Frontend on http://localhost:3000
```

## 📦 Project Structure

```
Champius/
├── apps/
│   ├── api/                 # NestJS Backend
│   │   ├── prisma/         # Database schema & migrations
│   │   ├── src/            # Source code
│   │   └── package.json
│   └── web/                 # Next.js Frontend
│       ├── src/            # Source code
│       ├── public/         # Static assets
│       └── package.json
├── railway.json            # Railway deployment config
├── render.yaml             # Render deployment config
├── vercel.json             # Vercel deployment config
└── package.json            # Root package.json
```

## 🌐 Production Deployment

**This project is production-ready and can be deployed in minutes!**

### Frontend (Vercel)
1. Push code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Set environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy

### Backend (Railway - Recommended)
1. Create account at [Railway.app](https://railway.app)
2. Deploy from GitHub repository
3. Add PostgreSQL database
4. Set environment variables
5. Deploy

**📖 Detailed Guides:**
- [Complete Deployment Guide](COMPLETE_DEPLOYMENT_GUIDE.md) - Full step-by-step instructions
- [Backend Deployment](BACKEND_DEPLOYMENT_GUIDE.md) - Railway, Render, Docker options
- [Vercel Deployment](VERCEL_DEPLOYMENT.md) - Frontend deployment
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Pre-flight checks

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: class-validator

### Frontend
- **Framework**: Next.js 15
- **UI Library**: Material-UI (MUI)
- **State Management**: React Query
- **HTTP Client**: Axios
- **Styling**: Emotion

## 📚 Features

- 👤 User Authentication (Students & Instructors)
- 📚 Course Management
- 📝 Assignment & Task Management
- 📊 Dashboard Analytics
- 📢 Announcements
- 👥 Attendance Tracking
- 📅 Calendar & Scheduling
- 📎 Material Management
- 🎯 Grade Tracking

## 🔐 Environment Variables

### Backend (apps/api/.env)
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-32-char-secret
CLIENT_ORIGIN=https://your-frontend.vercel.app
PORT=4000
```

### Frontend (apps/web/.env.local or Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-api.railway.app/api
```

## 🧪 Testing

```bash
# Backend tests
cd apps/api
npm test

# Frontend build test
cd apps/web
pnpm build
```

## 📝 API Documentation

API runs on `/api` prefix:
- Health Check: `GET /api/health`
- Authentication: `POST /api/auth/login`, `POST /api/auth/register`
- Protected routes require `Authorization: Bearer <token>` header

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

**Deployment Issues?** Check:
1. [COMPLETE_DEPLOYMENT_GUIDE.md](COMPLETE_DEPLOYMENT_GUIDE.md)
2. [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
3. Platform logs (Railway/Vercel dashboard)

**Common Issues:**
- CORS errors → Update `CLIENT_ORIGIN` in backend
- Database errors → Check `DATABASE_URL` format
- Build errors → Run `npm run build` locally first

## ⚡ Quick Commands

```bash
# Build everything
npm run build

# Start production locally
npm start

# Database operations
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio

# Linting
npm run lint
```

## 🎯 Production Status

✅ **Deployment Ready**
- All deployment configurations included
- Production environment variables documented
- Health checks implemented
- Error handling configured
- CORS properly set up
- Database migrations automated
- Build scripts optimized

**Deploy now**: Follow [COMPLETE_DEPLOYMENT_GUIDE.md](COMPLETE_DEPLOYMENT_GUIDE.md)

---

**Made with ❤️ by the Champius Team**
