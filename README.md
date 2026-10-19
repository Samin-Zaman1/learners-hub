# Learners Hub - Learning Management System

[![Tests](https://github.com/Samin-Zaman1/learners-hub/actions/workflows/tests.yml/badge.svg)](https://github.com/Samin-Zaman1/learners-hub/actions/workflows/tests.yml)

A full-stack learning management system for students, instructors and admins: courses, tasks and grading, schedules, announcements and course materials.

Learners Hub doubles as a QA portfolio project: it's being tested layer by layer, from unit tests up to end-to-end browser tests. See [TESTING.md](TESTING.md) for the strategy, coverage and defects found.

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
├── .github/workflows/      # CI: runs the test suite
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
| `npm test` | API unit tests |
| `npm run test:cov` | API unit tests with a coverage report |
| `npm run lint` | Lint both apps |
| `npm run prisma:migrate` | Apply pending migrations (`migrate deploy`) |
| `npm run prisma:studio` | Browse the database |

## Testing

Unit tests run on every push and pull request in GitHub Actions. [TESTING.md](TESTING.md) covers the test strategy, what each suite checks, the techniques used, defects found, and what comes next (API integration, database and Playwright end-to-end tests).

## Deployment

API on Render, web on Vercel. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## License

MIT
