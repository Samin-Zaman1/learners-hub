# Learners Hub - Learning Management System

A full-stack learning management system for students, instructors and admins: courses, tasks and grading, schedules, announcements and course materials.

| | Stack |
|---|---|
| API (`apps/api`) | NestJS, Prisma, PostgreSQL, JWT auth |
| Web (`apps/web`) | Next.js 15, React 19, MUI 7, TanStack Query, Axios |

## Local development

Prerequisites: Node.js 20+, npm, Docker.

```bash
# 1. Install dependencies (root, api and web are separate npm projects)
npm run install:all

# 2. Start Postgres (and MailHog for email) in Docker
npm run db:up

# 3. Configure environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 4. Apply migrations and (optionally) seed sample data
cd apps/api
npx prisma migrate dev
npm run seed
cd ../..

# 5. Run both apps
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:4000/api (health check: `/api/health`)
- MailHog inbox: http://localhost:8025

To create an admin user:

```bash
cd apps/api
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='choose-a-password' npx ts-node create-admin.ts
```

## Project structure

```
learners-hub/
├── apps/
│   ├── api/                # NestJS API
│   │   ├── prisma/         # schema, migrations, seed
│   │   └── src/            # admin/, instructor/, student/, dashboard/ modules
│   └── web/                # Next.js app (src/app routes, src/components, src/hooks)
├── docs/                   # deployment and reference docs
├── docker-compose.yml      # local Postgres + MailHog
└── render.yaml             # API deployment (Render Blueprint)
```

## Environment variables

**API** (`apps/api/.env`); see [`.env.example`](apps/api/.env.example):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | Token signing secret (required in production) |
| `CLIENT_ORIGIN` | Allowed frontend origins, comma-separated |
| `PORT` | Defaults to 4000 |
| `SMTP_*` | Optional outgoing email |

**Web** (`apps/web/.env.local`):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | API base URL **including `/api`**, e.g. `http://localhost:4000/api` |

## Commands

Run from the repo root:

| Command | What it does |
|---|---|
| `npm run dev` | API and web in watch mode |
| `npm run build` | Production build of both apps (web build type-checks and lints) |
| `npm run lint` | Lint both apps |
| `npm run prisma:migrate` | Apply pending migrations (`migrate deploy`) |
| `npm run prisma:studio` | Browse the database |

## API testing (Postman)

The [`postman/`](postman/) folder has collections covering every API area (131 requests):

| Collection | Covers | Requests |
|---|---|---|
| `1-auth-health` | Health check, login for each role, signup, profile, change password | 11 |
| `2-student` | Tasks and submissions, enrolling by invitation code, semesters, schedule | 19 |
| `3-instructor` | Courses, students and invitations, tasks, grading, schedule and templates, announcements, modules, materials, calendar | 56 |
| `4-admin` | Stats, users, courses, enrollments | 16 |
| `5-dashboard` | Tasks, schedule, announcements, enrollments, activities, courses | 29 |

**How to run them**

1. Start the API locally (see [Local development](#local-development)).
2. In Postman, import every file in `postman/`, including `learners-hub-local.postman_environment.json`, and select the **Learners Hub - Local** environment.
3. Fill in the email and password variables for each role (from your seeded data or `create-admin.ts`).
4. Run the login requests in `1-auth-health` first. They save each role's token into the environment, and the other collections use those tokens automatically.
5. Run requests one by one or with the Collection Runner. IDs such as `courseId` and `taskId` are stored in environment variables, so fill them in as you create data.

## Deployment

API on Render, web on Vercel. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## License

MIT
