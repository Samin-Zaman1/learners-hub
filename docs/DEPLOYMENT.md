# Deployment

Learners Hub deploys as two services:

| Part | Host | Config |
|---|---|---|
| API (`apps/api`, NestJS + Prisma) | Render web service + Render Postgres | [`render.yaml`](../render.yaml) |
| Web (`apps/web`, Next.js) | Vercel | Vercel project settings (below) |

Each app is a standalone npm project with its own `package-lock.json`; there are no workspaces.

## 1. API on Render

`render.yaml` is a Render Blueprint. In Render: **New → Blueprint**, pick this repo, and it creates:

- `champius-api`: builds in `apps/api` with `npm ci && npm run build`, and starts with `npx prisma migrate deploy && npm run start:prod`
- `champius-db`: Postgres, wired to `DATABASE_URL`

Render generates `JWT_SECRET`. Set these in the Render dashboard (they're marked `sync: false`):

| Variable | Value |
|---|---|
| `CLIENT_ORIGIN` | The Vercel URL(s), comma-separated, e.g. `https://champius.vercel.app` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Optional, for outgoing email |

The API refuses to start in production if `JWT_SECRET` is missing.

Health check: `GET https://<service>.onrender.com/api/health` returns `{"status":"ok", "database":"connected", ...}`.

### Migrations

Migrations run automatically on every deploy (`prisma migrate deploy`). Create new ones locally:

```bash
cd apps/api
npx prisma migrate dev -n describe_the_change
```

Review the generated SQL before committing. Prisma doesn't backfill data: when a change adds a required column or changes a column's type, edit the SQL to carry existing rows across (see `20261018120100_schema_refactor` for an example).

> **Databases created with `prisma db push`** have no migration history, and `migrate deploy` will fail on them because the tables already exist. Compare the database to the schema with `npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --script`. If it's empty, mark each migration as applied: `npx prisma migrate resolve --applied <migration_name>`.

## 2. Web on Vercel

Project settings:

| Setting | Value |
|---|---|
| Framework Preset | Next.js |
| Root Directory | `apps/web` |
| Install Command | `npm install` (default) |
| Build Command | `npm run build` (default) |

Environment variable (Production and Preview):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | The API URL **including `/api`**, e.g. `https://champius-api.onrender.com/api` |

`NEXT_PUBLIC_*` values are baked in at build time, so redeploy after changing it.

The build type-checks and lints, so a failing `npm run build` locally will fail on Vercel too.

## 3. After deploying

1. Add the Vercel URL to `CLIENT_ORIGIN` on Render (otherwise the browser gets CORS errors).
2. Create an admin account against the production database:
   ```bash
   cd apps/api
   DATABASE_URL="<render external connection string>" ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='<strong password>' npx ts-node create-admin.ts
   ```

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| CORS error in the browser | Vercel URL missing from `CLIENT_ORIGIN` |
| Every request 404s | `NEXT_PUBLIC_API_URL` is missing the `/api` suffix |
| 403 on every authenticated request | Token signed with a different `JWT_SECRET` (e.g. after rotating it); log in again |
| Render deploy fails at `migrate deploy` | Database created with `db push`; see the note under Migrations |
