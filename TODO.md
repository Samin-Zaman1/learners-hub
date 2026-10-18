# Champius TODO

## 1. Make the API build again
- [x] Fix the 30 API type errors caused by the schema rewrite
- [x] Migrations for the schema change, written to carry existing data across (tested on old-shape data)
- [x] Local DB synced and migrations marked applied (existing users kept)

## 2. Fix the broken frontend API calls
- [x] Admin, schedule-templates and submissions pages use the shared `api` client
- [x] Grading URLs fixed; broken `@tanstack` import fixed
- [x] `NEXT_PUBLIC_API_URL` fallbacks include `/api`

## 3. Remove unneeded files
- [x] Design exports, stray folders, codemods, duplicate assets, Netlify/Vercel leftovers
- [x] `create-admin.ts` reads the password from `ADMIN_PASSWORD`

## 4. Consolidate
- [x] npm only: separate lockfiles for root, `apps/api`, `apps/web`; no workspaces
- [x] Deploy: API on Render (`render.yaml`), web on Vercel; removed `railway.json`, `Dockerfile`, `.vercelignore`
- [x] Docs merged into `docs/DEPLOYMENT.md`; README rewritten
- [x] Root `.gitignore` covers `node_modules/`, `dist/`, `.next/`, `*.zip`
- [x] `nodemailer` declared in the API's dependencies
- [x] One JWT config (fixes token verification across modules; JWT_SECRET required in production)

## 5. Frontend quality
- [x] 0 web type errors; build no longer ignores type/lint errors
- [x] Fixed conditional hooks crash on the instructor calendar page
- [x] Removed unused components

## Next
- [ ] Before the next Render deploy, check how the production DB was created (see "db push" note in docs/DEPLOYMENT.md)
- [ ] Rename `JWT_ACCESS_SECRET` to `JWT_SECRET` in your local `apps/api/.env`
- [ ] Replace the ~100 `any` types (now lint warnings), then make `no-explicit-any` an error again
- [ ] Guards return 403 for a missing token; 401 would let the frontend redirect to login
- [ ] `dashboard/course.controller.ts` is mounted at `/api/api/courses`; unused by the frontend, so remove or rename it
- [ ] Remove the debug `console.log`s in `jwt-auth.guard.ts` (they log token payloads)
- [ ] Replace placeholder stats on student pages (e.g. attendance) with real data
