# Learners Hub Development Stack

## 📋 Project Overview
**Learners Hub Learning Management System** - A full-stack LMS application with a modern tech stack designed for scalability and developer experience.

---

## 🏗️ Architecture
**Monorepo Structure** using workspaces
- `/apps/api` - Backend API
- `/apps/web` - Frontend Web Application

---

## 🎯 Backend Stack (NestJS)

### Core Framework
- **[NestJS](https://nestjs.com/)** v11.1.6 - Progressive Node.js framework
  - Built with TypeScript
  - Modular architecture
  - Dependency injection
  - Decorator-based

### Database & ORM
- **[PostgreSQL](https://www.postgresql.org/)** 15 - Primary relational database
- **[Prisma](https://www.prisma.io/)** v6.15.0 - Next-generation ORM
  - Type-safe database client
  - Schema migrations
  - Prisma Studio for data management
  - Binary targets: native, debian-openssl-3.0.x

### Authentication & Security
- **[Passport](https://www.passportjs.org/)** v11.0.5 - Authentication middleware
- **[JWT](https://jwt.io/)** v11.0.0 - JSON Web Tokens
- **[Bcrypt](https://www.npmjs.com/package/bcrypt)** v6.0.0 - Password hashing
- **Cookie Parser** v1.4.7 - Cookie handling

### Validation & Transformation
- **[Class Validator](https://github.com/typestack/class-validator)** v0.14.2 - Decorator-based validation
- **[Class Transformer](https://github.com/typestack/class-transformer)** v0.5.1 - Object transformation

### Development Tools
- **TypeScript** v5.9.2 - Type-safe JavaScript
- **ESLint** v9.34.0 - Linting
- **Prettier** v3.6.2 - Code formatting
- **ts-node** v10.9.2 - TypeScript execution
- **Nodemon** (via nest start --watch) - Auto-reload

---

## 🎨 Frontend Stack (Next.js)

### Core Framework
- **[Next.js](https://nextjs.org/)** v15.0.3 - React framework
  - App Router architecture
  - Server-side rendering (SSR)
  - Static site generation (SSG)
  - API routes
  - Image optimization
  - Standalone output for deployment

### UI Framework
- **[React](https://react.dev/)** v19.0.0 - UI library
- **[React DOM](https://react.dev/)** v19.0.0 - DOM rendering

### UI Components & Styling
- **[Material-UI (MUI)](https://mui.com/)** v7.3.1 - Component library
  - @mui/material - Core components
  - @mui/icons-material - Icon set
- **[Emotion](https://emotion.sh/)** v11.14.0 - CSS-in-JS
  - @emotion/react
  - @emotion/styled

### State Management & Data Fetching
- **[TanStack Query (React Query)](https://tanstack.com/query)** v5.85.6
  - Server state management
  - Caching
  - Auto-refetching
  - Optimistic updates

### HTTP Client
- **[Axios](https://axios-http.com/)** v1.11.0 - Promise-based HTTP client

### Development Tools
- **TypeScript** v5 - Type safety
- **ESLint** v9 - Linting
  - eslint-config-next v15.0.3 - Next.js specific rules
- **SWC** - Fast compilation and minification

---

## 🗄️ Database Schema

### Database Provider
- PostgreSQL with connection pooling

### Models (Prisma Schema)
Core entities include:
- **User Management**: User, Role-based access
- **Course System**: Course, Enrollment, Progress
- **Content**: Lessons, Materials, Resources
- **Assessment**: Tasks, Assignments, Grades
- **Communication**: Announcements, Messages, Notifications
- **Activity Tracking**: Activity logs, Analytics
- **Attendance System**: Attendance records

### Migrations
- Version-controlled migrations in `/prisma/migrations/`
- Latest migration: `20251213031240_add_missing_tables_and_relations`

---

## 🔧 Development Infrastructure

### Package Management
- **pnpm** - Fast, disk space efficient package manager
- **npm workspaces** - Monorepo management

### Containerization & Services
- **Docker** & **Docker Compose** v3.9
  - PostgreSQL container (port 5432)
  - Redis container (port 6379)
  - MailHog for email testing (ports 8025, 1025)
  - MinIO for S3-compatible storage (ports 9000, 9001)

### Process Management
- **Concurrently** v8.2.2 - Run multiple commands simultaneously

---

## 🚀 Deployment Platforms

### Supported Platforms
1. **[Vercel](https://vercel.com/)** - Frontend & Serverless backend
   - Configuration: `vercel.json`
   - Guides: `VERCEL_DEPLOYMENT_GUIDE.md`, `VERCEL_FINAL_CONFIG.md`, `VERCEL_QUICK_START.md`

2. **[Netlify](https://netlify.com/)** - Alternative frontend hosting
   - Configuration: `netlify.toml`
   - Guides: `NETLIFY_DEPLOYMENT.md`, `NETLIFY_SIMPLE_GUIDE.md`

3. **[Railway](https://railway.app/)** - Full-stack deployment
   - Configuration: `railway.json`

4. **[Render](https://render.com/)** - Container-based deployment
   - Configuration: `render.yaml`

### Deployment Scripts
- `verify-deployment.js` - Deployment verification
- Multiple deployment guides and checklists

---

## 📂 Project Structure

```
champius/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   ├── src/
│   │   │   ├── admin/          # Admin module
│   │   │   ├── instructor/     # Instructor module
│   │   │   ├── student/        # Student module
│   │   │   ├── dashboard/      # Dashboard module
│   │   │   ├── auth/           # Authentication
│   │   │   ├── filters/        # Exception filters
│   │   │   └── utils/          # Utilities
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Database schema
│   │   │   ├── seed.ts         # Seed data
│   │   │   └── migrations/     # DB migrations
│   │   ├── test/               # E2E tests
│   │   └── Dockerfile          # Container config
│   │
│   └── web/                    # Next.js Frontend
│       ├── src/
│       │   ├── app/            # App router pages
│       │   ├── components/     # React components
│       │   ├── contexts/       # React contexts
│       │   ├── hooks/          # Custom hooks
│       │   ├── lib/            # Libraries
│       │   ├── theme/          # MUI theme
│       │   └── utils/          # Utilities
│       ├── public/             # Static assets
│       ├── assets/             # Asset files
│       └── netlify.toml        # Netlify config
│
├── docker-compose.yml          # Development services
├── package.json                # Root package config
└── *.md                        # Documentation
```

---

## 🛠️ Development Commands

### Root Level (Monorepo)
```bash
# Development
pnpm dev              # Run both API and Web in dev mode
pnpm dev:api          # Run API only
pnpm dev:web          # Run Web only

# Build
pnpm build            # Build both applications
pnpm build:api        # Build API only
pnpm build:web        # Build Web only

# Production
pnpm start            # Start both in production
pnpm start:api        # Start API in production
pnpm start:web        # Start Web in production

# Database
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:migrate   # Run migrations
pnpm prisma:studio    # Open Prisma Studio

# Code Quality
pnpm lint             # Lint all projects
pnpm verify           # Verify deployment readiness
```

### API Commands
```bash
cd apps/api

# Development
npm run start:dev     # Start with watch mode
npm run start:prod    # Start production build

# Database
npm run prisma:migrate
npm run prisma:generate
npm run prisma:studio
npm run seed          # Seed database

# Testing
npm run test          # Unit tests
npm run test:watch    # Watch mode
npm run test:cov      # Coverage
npm run test:e2e      # E2E tests

# Code Quality
npm run format        # Format code
npm run lint          # Lint and fix
```

### Web Commands
```bash
cd apps/web

# Development
pnpm dev              # Start dev server (port 3000)
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Lint code
```

---

## 🌐 Environment Variables

### Backend (API)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/champius"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=4000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:3000"

# Email (Development with MailHog)
SMTP_HOST="localhost"
SMTP_PORT=1025
SMTP_USER=""
SMTP_PASSWORD=""
EMAIL_FROM="noreply@learnershub.com"

# File Storage (MinIO)
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minio"
MINIO_SECRET_KEY="minio123"
MINIO_BUCKET="champius"

# Redis (Optional)
REDIS_HOST="localhost"
REDIS_PORT=6379
```

### Frontend (Web)
```env
# API Endpoint
NEXT_PUBLIC_API_URL="http://localhost:4000"

# Optional
NEXT_PUBLIC_APP_NAME="Learners Hub"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

---

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt with salt rounds
- **CORS Protection** - Configurable origin whitelist
- **Validation** - Input validation with class-validator
- **Type Safety** - Full TypeScript coverage
- **SQL Injection Prevention** - Prisma parameterized queries
- **Cookie Security** - HttpOnly, Secure flags

---

## 📦 Build & Optimization

### Backend
- **NestJS CLI** - Production-optimized builds
- **Prisma Generate** - Type-safe client generation
- **TypeScript Compilation** - Strict mode enabled
- **Source Maps** - Debugging support

### Frontend
- **Next.js Standalone** - Minimal production output
- **SWC Minification** - Fast, optimized builds
- **Image Optimization** - Automatic WebP conversion
- **Code Splitting** - Automatic route-based splitting
- **Tree Shaking** - Dead code elimination

---

## 🎯 Key Features

### Backend Features
- ✅ Role-based access control (Admin, Instructor, Student)
- ✅ Course management system
- ✅ Attendance tracking
- ✅ Assignment & grading system
- ✅ Announcement system
- ✅ Activity logging
- ✅ Email verification
- ✅ Password reset functionality
- ✅ Dashboard analytics

### Frontend Features
- ✅ Modern Material Design UI
- ✅ Responsive layout
- ✅ Dark/Light theme support
- ✅ Real-time data updates (React Query)
- ✅ Optimistic UI updates
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states

---

## 🔄 Development Workflow

### 1. Local Development
```bash
# Start services
docker-compose up -d

# Install dependencies
pnpm install

# Generate Prisma client
cd apps/api && pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed database
cd apps/api && npm run seed

# Start development servers
pnpm dev
```

### 2. Making Changes
- API: Edit files in `apps/api/src/`
- Web: Edit files in `apps/web/src/`
- Database: Modify `apps/api/prisma/schema.prisma` and create migration

### 3. Testing
```bash
# API tests
cd apps/api && npm run test

# E2E tests
cd apps/api && npm run test:e2e
```

### 4. Building for Production
```bash
# Build both apps
pnpm build

# Verify deployment readiness
pnpm verify
```

---

## 📚 Documentation Files

- `ARCHITECTURE_IMPLEMENTATION_COMPLETE.md` - Architecture details
- `INSTRUCTOR_DRIVEN_ARCHITECTURE.md` - Instructor features
- `DEPLOYMENT_GUIDE.md` - General deployment guide
- `COMPLETE_DEPLOYMENT_GUIDE.md` - Comprehensive deployment
- `BACKEND_DEPLOYMENT_GUIDE.md` - Backend-specific deployment
- `DEPLOYMENT_CHECKLIST.md` - Pre-deployment checklist
- `DEPLOYMENT_READY.md` - Deployment readiness
- `IMPLEMENTATION_GUIDE.md` - Implementation details
- `MANUAL_DATA_POPULATION_GUIDE.md` - Data seeding guide
- `DASHBOARD_AUDIT.md` - Dashboard documentation
- `THEME_SYSTEM.md` - Theme documentation
- `UI_ENHANCEMENTS.md` - UI improvements

---

## 🏃 Quick Start

### Prerequisites
- Node.js ≥ 18.0.0
- npm ≥ 9.0.0
- pnpm (recommended)
- Docker & Docker Compose
- PostgreSQL 15

### Installation
```bash
# Clone repository
git clone <repository-url>
cd champius

# Install dependencies
pnpm install

# Start infrastructure services
docker-compose up -d

# Setup database
cd apps/api
pnpm prisma:generate
pnpm prisma:migrate
npm run seed

# Start development
cd ../..
pnpm dev
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Prisma Studio**: http://localhost:5555 (run `pnpm prisma:studio`)
- **MailHog**: http://localhost:8025
- **MinIO Console**: http://localhost:9001
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

---

## 🎓 Learning Resources

### NestJS
- [Official Documentation](https://docs.nestjs.com/)
- [Prisma with NestJS](https://docs.nestjs.com/recipes/prisma)

### Next.js
- [Official Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)

### Material-UI
- [MUI Documentation](https://mui.com/material-ui/getting-started/)

### TanStack Query
- [Official Documentation](https://tanstack.com/query/latest)

### Prisma
- [Official Documentation](https://www.prisma.io/docs)

---

## 📝 Version Information

| Technology | Version |
|------------|---------|
| Node.js | ≥18.0.0 |
| NestJS | 11.1.6 |
| Next.js | 15.0.3 |
| React | 19.0.0 |
| Prisma | 6.15.0 |
| TypeScript | 5.9.2 |
| MUI | 7.3.1 |
| TanStack Query | 5.85.6 |
| PostgreSQL | 15 |
| Redis | 7 |

---

## 🤝 Contributing

This is a modern, production-ready full-stack application built with industry best practices:
- Type-safe throughout
- Modular architecture
- Comprehensive testing
- Multiple deployment options
- Developer-friendly tooling

---

## 📄 License

MIT License - See package.json for details

---

**Last Updated**: January 2026
**Maintained By**: Learners Hub Development Team
