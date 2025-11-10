# Windsurf Analysis Checklist

Solo dev: Gio (Luis Giovanni Ruiz)
Reviewed by: Ada (Cascade AI)
Repo: luis_ruiz_2
Date: <!-- Fill when review completed -->

## How to use this document
- Each checklist item includes an intent, impact, and suggested action.
- Mark items as you complete them.
- Prioritize addressing **High** impact first, then **Medium**, then **Low**.
- Re-review items periodically to ensure your fixes hold.


---

## Executive Summary
- [ ] ☐ **Document review date and sign off**  
  _Intent_: Capture when this audit was last reviewed.  
  _Impact_: Keeps the checklist relevant.

### Systemic Cohesion
- [ ] ☐ **Align data flow diagrams with current code behavior** (**Medium**)  
  _Intent_: Ensure architecture docs match reality.  
  _Impact_: Prevents drift when you onboard future contractors or revisit features.

- [ ] ☐ **Add a high-level architecture README** (**Medium**)  
  _Intent_: Explain how modules (app/, components/, lib/, supabase, pinecone, etc.) fit together.  
  _Impact_: Makes future maintenance and scoped changes easier.

### Security & Vulnerabilities
- [ ] ☐ **Gate `/api/photos`, `/api/photos/upload`, `/api/photos/seed-hero`, `/api/photos/restore` behind owner auth** (**High**)  
  _Intent_: Prevent anonymous uploads/deletions to your Supabase bucket.  
  _Impact_: Avoids abuse (malicious content, bandwidth costs, storage tampering).

- [ ] ☐ **Stop hardcoding `anonymous@example.com` in `/api/votes`** (**High**)  
  _Intent_: Enforce authenticated voting and track real users.  
  _Impact_: Otherwise anyone can spam votes without accountability.

- [ ] ☐ **Validate and sanitize comment form inputs** (**High**)  
  _Intent_: Current API blindly accepts user_email/content; risk of XSS or injection.  
  _Impact_: Malicious users can inject HTML/JS into blog comments.

- [ ] ☐ **Restrict `/api/projects` to owner-only access** (**High**)  
  _Intent_: Anonymous users can upsert portfolio entries.  
  _Impact_: Allows defacement or spam entries.

- [ ] ☐ **Add auth guards to `/api/site_settings/availability`** (**High**)  
  _Intent_: Protect site availability banner from anonymous edits.  
  _Impact_: Public misinformation on your contact state.

- [ ] ☐ **Review `.env.local` for secrets committed accidentally** (**Medium**)  
  _Intent_: Current file in repo leaks service keys locally.  
  _Impact_: If pushed public or synced with backups, your keys are compromised.

- [ ] ☐ **Avoid client-side exposure of service role key** (**Medium**)  
  _Intent_: Verify no client bundle imports server-only env vars.  
  _Impact_: Prevents catastrophic key leakage.

- [ ] ☐ **Rate-limit and log sensitive API routes** (**Medium**)  
  _Intent_: Add throttling and audit logs for uploads, comments, votes.  
  _Impact_: Detect and mitigate abuse early.

- [ ] ☐ **Ensure Supabase policies lock down tables** (**Medium**)  
  _Intent_: Rely on row-level security (RLS) for tables touched by APIs.  
  _Impact_: Defense-in-depth even if API guardrails fail.

- [ ] ☐ **Verify all third-party API keys are optional in prod builds** (**Low**)  
  _Intent_: Try running without optional keys and confirm graceful fallbacks.  
  _Impact_: Avoid production crashes when a key rotates or is missing.

### Modularity & Separation of Concerns
- [ ] ☐ **Refactor `/app/api` routes to shared auth utilities** (**High**)  
  _Intent_: DRY authorization logic (owner checks, session fetching).  
  _Impact_: Fewer mistakes when adding new routes.

- [ ] ☐ **Introduce domain services in `lib/` for posts, votes, projects** (**High**)  
  _Intent_: Keep API handlers thin; move DB access + business rules into services.  
  _Impact_: Easier testing and consistent logic reuse.

- [ ] ☐ **Consolidate Supabase client creation** (**Medium**)  
  _Intent_: Avoid direct env access in routes; dependency inject clients where possible.  
  _Impact_: Makes testing and server/client separation cleaner.

- [ ] ☐ **Audit components for single responsibility** (**Medium**)  
  _Intent_: Break monolithic UI components (e.g., in `components/app/`) into smaller composables.  
  _Impact_: Enables reuse and easier styling changes.

- [ ] ☐ **Introduce feature-based folders under `app/`** (**Medium**)  
  _Intent_: Group UI + API + lib utilities per feature (blog, dashboard, photos).  
  _Impact_: Improves discoverability as the project scales.

- [ ] ☐ **Document shared utilities (`lib/utils.ts`, hooks)** (**Low**)  
  _Intent_: Explain expected inputs/outputs + example usage.  
  _Impact_: Reduces misuse when future-you forgets intent.

---

## Detailed Findings & Action Items

### 1. Systemic Cohesion
- [ ] ☐ **Create architecture diagram** (**Medium**)  
  _Intent_: Visual map of Supabase ↔ API routes ↔ UI surfaces.  
  _Impact_: Accelerates planning for new features.

- [ ] ☐ **Inventory of environment variable usage** (**Medium**)  
  _Intent_: Document which modules depend on which env vars.  
  _Impact_: Prevents "mystery failures" when deploying to new environments.

- [ ] ☐ **Catalog third-party integrations** (**Low**)  
  _Intent_: Note which features use OpenAI, Anthropic, Pinecone, etc.  
  _Impact_: Helps future budgeting and feature toggles.

### 2. Security & Vulnerabilities
- [ ] ☐ **Implement session-based guard in middleware** (**High**)  
  _Intent_: Harden Supabase middleware to reject unauthenticated access to owner dashboards.  
  _Impact_: Keeps admin routes private.

- [ ] ☐ **Add CSRF protections on form POSTs** (**High**)  
  _Intent_: Use tokens or double-submit cookies for `/api/comments` and `/api/votes`.  
  _Impact_: Prevents remote sites from performing actions on behalf of logged-in users.

- [ ] ☐ **Server-side validation for file uploads** (**High**)  
  _Intent_: Enforce file type, size, and quotas before pushing to Supabase Storage.  
  _Impact_: Stops malicious file uploads and cost overruns.

- [ ] ☐ **Log security-sensitive actions** (**Medium**)  
  _Intent_: Record who uploaded/deleted photos, edited availability, etc.  
  _Impact_: Provides audit trail for incidents.

- [ ] ☐ **Purge unused OAuth providers in Supabase** (**Low**)  
  _Intent_: Disable providers you don't plan to support.  
  _Impact_: Limits attack surface.

- [ ] ☐ **Schedule key rotation reminders** (**Low**)  
  _Intent_: Set calendar reminders to rotate API keys quarterly.  
  _Impact_: Reduces long-term compromise risk.

### 3. Modularity & Separation of Concerns
- [ ] ☐ **Move business logic from API routes to `lib/services`** (**High**)  
  _Intent_: Example: `lib/services/photos.ts` handles storage logic; routes just call service.  
  _Impact_: Gains reuse between API and potential CLI/tools.

- [ ] ☐ **Introduce DTO schemas for request/response** (**Medium**)  
  _Intent_: Standardize validation via zod (already in use).  
  _Impact_: Enforces consistent shape and reduces serialization bugs.

- [ ] ☐ **Encapsulate Supabase storage helpers** (**Medium**)  
  _Intent_: Provide helper functions in `lib/supabase/storage.ts`.  
  _Impact_: Simplifies future storage buckets.

- [ ] ☐ **Add tests for services before refactors** (**Medium**)  
  _Intent_: Guard behavior before reorganizing modules.  
  _Impact_: Safe iteration while keeping features stable.

- [ ] ☐ **Establish lint rules for layering constraints** (**Low**)  
  _Intent_: Ensure `app/` cannot reach directly into `lib/clients/*` without going through services.  
  _Impact_: Maintains clean architecture boundaries.

---

## Appendix: Quick Wins
- [ ] ☐ **Remove `.env.local` from repo history (if committed)** (**High**)  
  _Intent_: Use `git filter-repo` or GitHub secret scanning to ensure no secrets leaked.  
  _Impact_: Avoids long-term credential exposure.

- [ ] ☐ **Add `.env.local` to `.gitignore` (already present, verify)** (**Medium**)  
  _Intent_: Ensure local secrets never get committed.  
  _Impact_: Prevents future mistakes.

- [ ] ☐ **Automate health check tests** (**Low**)  
  _Intent_: Convert `/api/health/deep` into a CLI script or scheduled check.  
  _Impact_: Early warning for integration failures.

- [ ] ☐ **Add reminder banner: “Take breaks”** (**Low**)  
  _Intent_: Personal well-being nudge per mantra.  
  _Impact_: Sustainability over grind.

---

## Notes
- Hydrate, stretch, and take breaks. You do not need more time, you need more effort—keep going, but stay healthy.
- Re-run this checklist after each major feature to prevent entropy.
