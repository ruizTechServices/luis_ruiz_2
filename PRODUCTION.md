# Production Readiness & Go-Live Guide

This document explains how to switch the app from local development to production using Vercel and Supabase. Auth is handled by Supabase OAuth (Google). Follow these steps in order.

## Overview
- Frontend: Next.js App Router
- Auth: Supabase OAuth
- Database/Storage: Supabase (no Prisma)
- Hosting: Vercel

---

## 0) Prerequisites
- A Vercel project linked to this repo.
- A Supabase project with a Postgres database and a Storage bucket (default: `photos`).
- Google Cloud OAuth 2.0 Client (Web application).

---

## 1) Environment variables
Set these in Vercel Project Settings → Environment Variables (Production). Also mirror in `.env.local` for local testing where applicable.

Required:
- `NEXT_PUBLIC_SITE_URL` = `https://your-domain.com`
- `SITE_URL` = `https://your-domain.com`
- `NEXT_PUBLIC_SUPABASE_URL` = `https://<your-project>.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `<supabase-anon-key>`
- `SUPABASE_URL` = `https://<your-project>.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` = `<service-role-key>` (server-only; never expose client-side)
- `SUPABASE_PHOTOS_BUCKET` = `photos` (or your bucket name)

Optional (tune as needed):
- `SUPABASE_SIGNED_URL_EXPIRES` = `3600` (in seconds; controls signed URL lifetime)
- Any model/API keys you’re using (e.g., `OPENAI_API_KEY`) set in Vercel (never commit).

Notes:
- Do NOT prefix server-only secrets with `NEXT_PUBLIC_`.
- Keep service role keys only in server env (Vercel) and server code paths.

---

## 2) Supabase Dashboard configuration
1. Auth → URL Configuration
   - **Site URL**: `https://your-domain.com`
   - **Redirect URLs**: add `https://your-domain.com/auth/callback`

2. Auth → Providers → Google
   - Ensure **Enable Sign in with Google** is ON.
   - Provide Google **Client ID** and **Client Secret** (from Google Cloud console).

3. Storage
   - Create bucket: `photos` (or use existing).
   - If you intend to serve images publicly, configure public access or rely on signed URLs (the app attempts signed URLs, with public fallback).

---

## 3) Google Cloud OAuth configuration
In Google Cloud Console → Credentials → Your OAuth 2.0 Client (Web application):
- **Authorized JavaScript origins**
  - `https://your-domain.com`
- **Authorized redirect URIs**
  - Use the Supabase callback URL for your project (visible in Supabase provider modal), e.g.
    - `https://<your-project-ref>.supabase.co/auth/v1/callback`

Notes:
- You do NOT set `https://your-domain.com/auth/callback` as a Google redirect URI (Supabase handles OAuth with Google, then returns to your app).
- Changes can take a few minutes to propagate.

---

## 4) Vercel configuration & deploy
1. Link your GitHub repo to Vercel (if not already).
2. Add the environment variables from Section 1 (Production environment).
3. Trigger a deploy (push to `main` or deploy from Vercel UI).
4. Attach your custom domain in Vercel (Domains → Add), and set it as primary.

> Tip: If deployment fails during `npm install` due to peer deps (e.g., zod/openai), ensure `zod@^3.23.8` is used, and push the updated lockfile.

---

## 5) Next.js configuration notes
- Image domains: ensure `next.config.ts` allows your Supabase Storage domain (already configured previously). If you change buckets or regions, update accordingly.
- We normalize redirects using `NEXT_PUBLIC_SITE_URL`/`SITE_URL`. Make sure both are correct and match your production domain.

---

## 6) Post-deploy smoke tests
Run these checks on production:
- **Auth flow**
  - Visit `/login` → Continue with Google → ensure redirect lands on `https://your-domain.com/` (not `0.0.0.0`).
- **Photos**
  - `/gio_dash/photos` loads list.
  - `/gio_dash/photos/upload` uploads a file and returns a viewable URL.
  - Homepage hero images load from Supabase Storage.
- **API endpoints**
  - `/api/site_settings/availability` returns JSON without errors.
  - `/api/photos?prefix=hero` returns JSON and valid URLs.

---

## 7) Security checklist
- Service role key only exists in server env (Vercel), not exposed client-side.
- Restrict Google OAuth origins to only production (and staging if needed).
- Supabase RLS policies (if enabled for tables) are correct for your usage.
- Storage: decide between public access vs signed URLs; signed is safer.

---

## 8) Rollback strategy
- Use Vercel’s Deployments page to “Promote” a previous successful deployment.
- Environment variable mistakes: fix in Vercel → redeploy. You can also clone a previous configuration with Vercel’s `Re-run with same variables`.

---

## 9) Troubleshooting
- **Redirect goes to `0.0.0.0`**
  - Confirm `NEXT_PUBLIC_SITE_URL` and `SITE_URL` are set to `https://your-domain.com`.
  - Ensure the server-side callback route (`/auth/callback`) uses normalized base (already implemented) and your Supabase Auth Site URL is set to the same domain.

- **Images not loading from Supabase**
  - Check that `next.config.ts` allows your Supabase Storage domain.
  - If the bucket is private, ensure signed URL logic is working and expiry is sufficient.

- **Vercel install fails (peer deps)**
  - Ensure `zod@^3.23.8` is in `package.json` and the lockfile is updated.

- **401/403 from Supabase in production**
  - Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct in Vercel.
  - Ensure the project reference matches the env keys.

---

## 10) Production checklist
- [ ] Domain configured in Vercel; resolves to production deployment.
- [ ] Env set in Vercel: `NEXT_PUBLIC_SITE_URL`, `SITE_URL`, Supabase URLs/keys, bucket name.
- [ ] Supabase Auth Site URL = production domain; Redirect URLs include `/auth/callback`.
- [ ] Google OAuth origins/redirects configured (origin = your domain, redirect = Supabase callback).
- [ ] Smoke tests pass for login, photos, and public pages.
- [ ] Secrets (service role) exist only in server env.

---

## 11) Commands (local)
- Dev:
  ```bash
  npm run dev
  ```
- Build locally:
  ```bash
  npm run build && npm start
  ```

If you need additional CI/CD with GitHub Actions, we can add a workflow that runs tests, type checks, and triggers Vercel deployments.
