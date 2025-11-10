# Gio’s ML Lab Platform — Full Plan & Execution Guide

> **Goal:** Keep `luis-ruiz.com` as your portfolio. Launch **`lab.luis-ruiz.com`** as a minimal, fast client that runs TF.js in the browser and talks to a **Python FastAPI** backend on **GCP Cloud Run**. Monetize with **PayPal subscriptions at $15/mo**. Offer **free access via promo codes** you control.

---

## Table of Contents

1. [Product Scope](#product-scope)
2. [Architecture (at a glance)](#architecture-at-a-glance)
3. [Security Model](#security-model)
4. [Pricing, Promo Codes, and Billing](#pricing-promo-codes-and-billing)
5. [Data Model](#data-model)
6. [HTTP API](#http-api)
7. [Frontend (Lab) Behavior](#frontend-lab-behavior)
8. [Repo Layout & Separation of Concerns](#repo-layout--separation-of-concerns)
9. [Implementation Phases (Priority Checklist)](#implementation-phases-priority-checklist)
10. [Pseudocode (end-to-end)](#pseudocode-end-to-end)
11. [Scaffold Commands (exact files and folders)](#scaffold-commands-exact-files-and-folders)
12. [Deployment (GCP + Vercel)](#deployment-gcp--vercel)
13. [Testing & Acceptance Criteria](#testing--acceptance-criteria)
14. [Operations, Monitoring, and On-Call](#operations-monitoring-and-on-call)
15. [Risks & Mitigations](#risks--mitigations)
16. [Roadmap (Post-MVP)](#roadmap-postmvp)
17. [TL;DR](#tldr)

---

## Product Scope

* **Portfolio:** `https://luis-ruiz.com` (existing Next.js, unchanged except for a “Launch ML Lab” link).
* **ML Lab:** `https://lab.luis-ruiz.com` — stateless UI:

  * Google Sign-In (mandatory).
  * TF.js **in-browser** model creation/training (WebGPU→CPU fallback).
  * Dataset upload via **GCS signed URLs**.
  * Model export & upload to **GCS**.
  * Subscription & billing via **PayPal** ($15/mo).
  * Free tier via **promo codes** you issue and control.
* **Backend:** FastAPI on Cloud Run:

  * Google OAuth 2.0 (server flow).
  * JWT access token (short-lived, memory-only) + httpOnly **refresh cookie**.
  * CSRF protection on state-changing routes.
  * PayPal Subscriptions + webhook verification.
  * Signed URLs (upload/download) for GCS.
  * Postgres (Cloud SQL) for metadata.

---

## Architecture (at a glance)

```mermaid
flowchart LR
  A[User Browser @ lab.luis-ruiz.com\nStatic Lab UI + TF.js] -- fetch --> B[FastAPI @ Cloud Run]
  B -- signed URL --> C[GCS Bucket (artifacts/datasets)]
  B -- SQL --> D[Cloud SQL (Postgres)]
  A -- Google OAuth start --> G[Google OAuth Server]
  G -- callback(code) --> B
  A -- PayPal buttons --> P[PayPal]
  P -- webhook --> B
  A ---|download model.json/weights| C
  A ---|upload dataset via signed PUT| C
```

**Key choices:**

* **Stateless client**: keeps only access token in memory; all truth on server.
* **Signed URLs**: no file streams through backend; low latency; cheaper egress.
* **Strict CORS**: only `luis-ruiz.com` + `lab.luis-ruiz.com` allowed.

---

## Security Model

* **Auth:**

  * Google OAuth 2.0 (web server flow) → backend sets **httpOnly+Secure** refresh cookie; returns short-lived **JWT access token** to client.
  * Access token lifetime ~10m. Refresh rotation on `/auth/refresh`.
* **CSRF:**

  * Server issues CSRF token via `/me`. Client must echo `X-CSRF-Token` on **mutations**.
* **Secrets:**

  * GCP **Secret Manager** for JWT secret, DB URL, OAuth client secret, PayPal creds.
* **Storage:**

  * **Signed URLs** (PUT/GET, 10m expiry). Server validates path prefixes per-user.
* **Hardening:**

  * Input validation (Pydantic), RBAC/scopes in JWT, rate limits, request size caps, **CSP** headers, audit logs on sensitive actions (keys, deletes).
* **Webhooks:**

  * PayPal signature verification + idempotency keys before state changes.

---

## Pricing, Promo Codes, and Billing

* **Price:** $15/month (PRO plan).
* **Promo codes (free tier):**

  * `promo_codes(code, kind, days, uses_left, expires_at)`
  * On use: set `trial_until = now + days` (no PayPal required) **or** create subscription with a PayPal trial if you prefer.
* **Source of truth:**

  * If subscription exists → PayPal webhooks decide `active|canceled`.
  * If trial only → DB `trial_until` gates access.
* **Billing UI:**

  * PayPal Subscription button on **Billing** tab.
  * Status surface via `/me` (DB + PayPal recon where needed).

---

## Data Model

```sql
-- users
id uuid pk, email text unique not null, name text, provider text default 'google',
password_hash text null, created_at timestamptz default now()

-- subscriptions
id uuid pk, user_id uuid fk, status text check (status in ('none','trial','active','canceled')) default 'none',
plan text default 'pro', trial_until timestamptz null,
paypal_sub_id text null, current_period_end timestamptz null, updated_at timestamptz default now()

-- promo_codes
code text pk, kind text check (kind in ('trial','comp')), days int default 7,
uses_left int default 100, expires_at timestamptz null

-- projects
id uuid pk, user_id uuid fk, name text, visibility text default 'private', created_at timestamptz default now()

-- models
id uuid pk, project_id uuid fk, name text, framework text default 'tfjs',
config_json jsonb, status text default 'ready', created_at timestamptz default now()

-- artifacts
id uuid pk, model_id uuid fk, gcs_path text, type text, size_bytes bigint, checksum text, created_at timestamptz default now()

-- datasets
id uuid pk, project_id uuid fk, name text, gcs_path text, schema_json jsonb, created_at timestamptz default now()

-- training_jobs
id uuid pk, model_id uuid fk, dataset_id uuid fk, params_json jsonb,
started_at timestamptz, finished_at timestamptz, status text, metrics_json jsonb, device text default 'client'

-- api_keys (future)
id uuid pk, user_id uuid fk, name text, hashed_key text, scopes text[], created_at timestamptz, last_used_at timestamptz
```

---

## HTTP API

**Auth**

* `GET /auth/google/login` → redirect to Google
* `GET /auth/google/callback?code=` → set refresh cookie + return/redirect
* `POST /auth/refresh` → rotate refresh → `{access_token}`
* `GET /me` → `{email, subscription, csrf}`

**Billing**

* `POST /payments/paypal/create-subscription` → returns approval link or id
* `POST /payments/paypal/webhook` → verify; update `subscriptions`

**Promo**

* `POST /promo/apply` `{code}` → validates, sets `trial_until` or comp

**Storage**

* `POST /signed/upload` `{object_name, content_type}` → `{url}`
* `GET /signed/download?object_name=...` → `{url}`

**Models/Datasets**

* `POST /models` `{project_id, name, config_json}`
* `POST /models/:id/artifacts` `{paths[]}`
* `POST /datasets` `{project_id, name, schema_json}`
* `GET /projects|/models|/datasets` (filters)

*All mutations require valid JWT + CSRF header.*

---

## Frontend (Lab) Behavior

* **Tabs:** Portfolio / ML Lab / Billing
* **Auth button:** “Continue with Google” → backend `/auth/google/login`.
* **ML Lab:**

  * Build a small TF.js model (sequential) with UI params.
  * Train on CSV or demo XOR data.
  * Export locally **and/or** upload to GCS via signed URLs.
* **Billing:**

  * Show status (trial, active, none).
  * Subscription button (PayPal) to activate $15/mo.
  * Promo code entry field → call `/promo/apply`.

---

## Repo Layout & Separation of Concerns

* **repo-frontend-portfolio** → `luis-ruiz.com` (Next.js).
* **repo-frontend-lab** → `lab.luis-ruiz.com` (static single-file or tiny Next.js app).
* **repo-backend** → FastAPI + Docker + deploy scripts.

Benefits: clean deploys, safer blast radius, simpler rollbacks, modular scaling.

---

## Implementation Phases (Priority Checklist)

**P0 (Blockers to launch):**

* [ ] **Domains:** Create `lab.luis-ruiz.com` project on Vercel and bind subdomain.
* [ ] **Backend MVP:** FastAPI with `/healthz`, CORS, Google OAuth login/callback, `/me`, CSRF, JWT+refresh, Cloud SQL connection.
* [ ] **Signed URLs:** `/signed/upload` & `/signed/download` with GCS.
* [ ] **Lab Frontend:** Single-file page: Google login, TF.js demo train, export, signed-upload.
* [ ] **Billing Core:** PayPal **Subscriptions** endpoint + **webhook** verification; set subscription status active/canceled.
* [ ] **Promo Codes:** Table + `/promo/apply`; set `trial_until`.
* [ ] **Security Baseline:** httpOnly refresh cookie, CSP, rate limits, request caps, input validation.

**P1 (MVP polish & payments UX):**

* [ ] Billing tab UI (status surface, PayPal button, promo entry).
* [ ] Projects/Models/Datasets CRUD (basic views, link after uploads).
* [ ] Basic metrics display from `training_jobs.metrics_json`.
* [ ] Observability: structured logs, request ids, error alerts.

**P2 (Scale & Nice-to-haves):**

* [ ] Server-side inference endpoint (CPU) optional.
* [ ] Google OAuth in **portfolio** header to mirror session.
* [ ] BigQuery analytics for training metrics (optional).
* [ ] API keys issuance (scoped) for external automation.
* [ ] WebContainers dev link in README for zero-install dev.

---

## Pseudocode (end-to-end)

```
// FRONTEND (lab)
onClick(GoogleLogin):
  window.location = API_HOST + "/auth/google/login"

afterRedirect:
  fetch /me -> {csrf, subscription}
  set in-memory access_token via /auth/refresh if needed

train():
  tf.load()
  build model from UI
  fit() with callbacks -> log console
  export -> files
  upload():
    POST /signed/upload for model.json
    PUT signed url with model.json
    POST /signed/upload for weights.bin
    PUT signed url with weights

subscribe():
  POST /payments/paypal/create-subscription
  approve in PayPal
  webhook → backend marks active
  refresh /me -> status=active

applyPromo(code):
  POST /promo/apply -> trial_until set
  /me -> status=trial
```

```
// BACKEND (FastAPI)
startup():
  load settings
  init DB engine
  configure CORS(origins=[luis-ruiz.com, lab.luis-ruiz.com])
  mount routers

/auth/google/login:
  redirect to Google with client_id, scopes, redirect_uri

/auth/google/callback?code:
  exchange code -> tokens
  decode id_token -> email, sub
  upsert user
  set httpOnly refresh cookie
  return access_token JSON or redirect to LAB

/auth/refresh:
  verify+rotate refresh
  return new access_token

/me:
  auth via access token
  load subscription status or trial info
  return {email, subscription, csrf}

/signed/upload:
  auth+csrf
  validate path prefix (per user)
  return signed PUT url

/payments/paypal/create-subscription:
  auth+csrf
  if promo/trial -> may short-circuit to trial
  else create subscription via PayPal API
  return approval link or id

/payments/paypal/webhook:
  verify signature
  upsert subscription -> status active/canceled
```

---

## Scaffold Commands (exact files and folders)

> **Creates minimal skeletons you’ll grow.** Paste the code from previous replies into these files after creation.

```bash
# === Monorepo root ===
mkdir -p ml-platform/{backend,lab-frontend,infra}

# === Backend ===
cd ml-platform/backend
mkdir -p app/{routers,core,db,models}
cat > app/main.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(title="Gio ML Backend")

app.add_middleware(CORSMiddleware,
    allow_origins=["https://luis-ruiz.com","https://lab.luis-ruiz.com","http://localhost:5173"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/healthz")
def healthz(): return {"ok": True}
EOF

cat > requirements.txt << 'EOF'
fastapi==0.115.6
uvicorn[standard]==0.32.0
sqlalchemy==2.0.36
psycopg2-binary==2.9.10
python-jose[cryptography]==3.3.0
passlib[argon2]==1.7.4
pydantic==2.9.2
httpx==0.27.2
google-cloud-storage==2.18.2
EOF

cat > Dockerfile << 'EOF'
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app /app/app
ENV PORT=8080
CMD ["uvicorn","app.main:app","--host","0.0.0.0","--port","8080"]
EOF

# (Add routers: oauth_google.py, paypal.py, signed_urls.py, plus config/db files.)

# === Lab Frontend (static single-file) ===
cd ../lab-frontend
cat > index.html << 'EOF'
<!-- paste the single-file lab HTML from previous reply, set API_URL & Google/PayPal IDs -->
EOF

# === Local preview for lab ===
python3 -m http.server 5173
```

---

## Deployment (GCP + Vercel)

**Cloud SQL (Postgres)**

* Create instance + database `mlweb`.
* Store `DATABASE_URL` in Secret Manager (postgresql://user:pass@host:5432/mlweb).

**Cloud Run (backend)**

```bash
gcloud builds submit --tag gcr.io/$PROJECT_ID/ml-backend
gcloud run deploy ml-backend \
  --image gcr.io/$PROJECT_ID/ml-backend \
  --region us-central1 --platform managed \
  --allow-unauthenticated \
  --set-secrets=DATABASE_URL=projects/$PROJECT_ID/secrets/DATABASE_URL:latest,JWT_SECRET=projects/$PROJECT_ID/secrets/JWT_SECRET:latest,PAYPAL_CLIENT_ID=projects/$PROJECT_ID/secrets/PAYPAL_CLIENT_ID:latest,PAYPAL_CLIENT_SECRET=projects/$PROJECT_ID/secrets/PAYPAL_CLIENT_SECRET:latest,GOOGLE_CLIENT_ID=projects/$PROJECT_ID/secrets/GOOGLE_CLIENT_ID:latest,GOOGLE_CLIENT_SECRET=projects/$PROJECT_ID/secrets/GOOGLE_CLIENT_SECRET:latest \
  --set-env-vars=GCP_PROJECT_ID=$PROJECT_ID,GCS_BUCKET=$BUCKET,GOOGLE_REDIRECT_URI=https://<RUN_URL>/auth/google/callback
```

**GCS**

* Create bucket (e.g., `gio-ml-artifacts`), uniform access, private by default.

**Vercel**

* New project → import `lab-frontend` (or serve the static `index.html`).
* Add domain → assign **`lab.luis-ruiz.com`** to this project.
* In portfolio project, add a **“Launch ML Lab”** nav link to `https://lab.luis-ruiz.com`.

---

## Testing & Acceptance Criteria

**Auth**

* [ ] Google login returns to lab, `/me` shows email.
* [ ] Access token expires → `/auth/refresh` rotates successfully.

**Billing**

* [ ] Subscribing sets `subscriptions.status=active` **only after webhook**.
* [ ] Cancel on PayPal → webhook flips to `canceled` within minutes.
* [ ] Promo code applies trial; `/me` shows `trial_until`.

**Storage**

* [ ] `/signed/upload` returns PUT URL that accepts `model.json` and `weights.bin`.
* [ ] Uploaded artifacts show in GCS with correct prefixes per user.

**ML**

* [ ] TF.js trains on demo XOR and CSV; loss decreases across epochs.
* [ ] Export local and upload-to-cloud succeed; model metadata persisted (P1).

**Security**

* [ ] CORS only allows known origins.
* [ ] CSRF required for all POST/PUT/DELETE.
* [ ] Request size limits enforced; bad inputs return 4xx.

---

## Operations, Monitoring, and On-Call

* **Logging:** JSON logs with request ids (`x-request-id`).
* **Alerts:** Cloud Monitoring on `5xx rate`, `latency p95`, and webhook failures.
* **WAF:** Enable Cloud Armor (basic rules).
* **Backups:** Daily Cloud SQL backup; versioned GCS (optional).

---

## Risks & Mitigations

* **OAuth redirect mismatch → login fails:** double-check exact redirect URI.
* **Webhook spoofing:** verify PayPal signature + event type; store idempotency keys.
* **Large uploads:** enforce size caps; stream on client; reject > limits with clear UI.
* **CORS/CSRF mistakes:** test from both domains and with expired tokens intentionally.

---

## Roadmap (Post-MVP)

* Server-side inference endpoints (CPU now, GPU later).
* BigQuery metrics for longer-term analysis.
* API keys and CLI client.
* Team/Org workspaces and RBAC.
* Templates for common models/datasets.

---

## TL;DR

* **Keep** portfolio at `luis-ruiz.com`. **Add** `lab.luis-ruiz.com` (Vercel project).
* **Backend**: FastAPI on Cloud Run + Cloud SQL + GCS. Google OAuth, JWT+refresh, CSRF, signed URLs, PayPal **Subscriptions** at **$15/mo**, promo codes for trials.
* **Frontend (Lab)**: simple stateless page with TF.js; train in-browser; upload artifacts via signed URLs.
* **Checklist**: P0 covers subdomain, backend MVP, signed URLs, lab UI, subscriptions+webhook, promo codes, baseline security.
* **You build in phases;** I gave the folder scaffolds and shell commands.
* **When ready**, we’ll drop in the full OAuth + PayPal webhook code and SQL migrations to go live.
