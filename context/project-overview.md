# Project Overview — Luis-Ruiz Master Hub

## Project Identity

Repository:

```txt
ruizTechServices/luis_ruiz_2
```

Primary branch for this work:

```txt
GioClaw-Edit
```

Website:

```txt
https://luis-ruiz.com
```

Owner:

```txt
Luis Giovanni Ruiz, preferred name Gio
Founder of ruizTechServices LLC
```

## Primary Goal

Refactor `luis-ruiz.com` into Gio's master dashboard and branching hub.

This does **not** mean the public homepage becomes a private dashboard.

It means the domain becomes a layered command system:

```txt
Public site       → credibility, services, portfolio, contact, proof-of-work
Owner dashboard   → Gio's private operating system
Client dashboard  → future customer portal
Supabase          → system of record
GitHub/Vercel     → code and deployment pipeline
External apps     → branches from the hub
```

## Product Layers

### Layer 1 — Public Website

Purpose:

- present Gio professionally
- sell ruizTechServices services
- display projects and case studies
- show active systems/products
- capture leads
- route visitors to contact/hire flows

Important public routes:

```txt
/
/services
/systems
/projects
/blog
/contact
/login
```

### Layer 2 — Owner-Only Master Dashboard

Purpose:

- manage projects
- manage leads
- manage clients
- track money/P&L
- track decisions
- track content
- link to active systems
- provide quick operational actions

Main route:

```txt
/gio_dash
```

The existing `/gio_dash` already protects access with Supabase auth and owner-email authorization. Preserve this pattern.

### Layer 3 — Client/User Dashboard

Purpose:

- future customer portal
- client project status
- deliverables
- invoices/payment state
- messages/updates

Main route:

```txt
/dashboard
```

Existing behavior redirects owner users from `/dashboard` to `/gio_dash`. Preserve that behavior.

## Current Repo Capabilities To Preserve

The codebase is not just a simple portfolio. It already includes:

- blog system
- project/case-study surface
- contact/lead intake
- owner dashboard
- photo/media management through Supabase Storage
- Ollama local chat
- multi-model round-robin discussion surface
- Nucleus API product with credit/subscription logic
- Supabase auth/database/storage
- AI provider integrations
- Stripe integration

The master-dashboard refactor should improve organization and usefulness without breaking these systems.

## Strategic Direction

The strongest business direction is:

```txt
Make ruizTechServices look real, sellable, and operational.
```

The site should help Gio move toward revenue by supporting:

- service packages
- lead capture
- case studies
- project proof
- client tracking
- operational discipline
- money tracking

## MVP Definition

The first useful version is complete when:

1. `/` looks like a public master hub, not just a generic portfolio.
2. `/gio_dash` looks and behaves like a private command center.
3. Core dashboard records can be persisted in Supabase.
4. Projects, leads, money, decisions, and system links are visible in the owner dashboard.
5. The progress tracker reflects what was implemented and verified.

## Out of Scope For This Refactor Unless Explicitly Requested

- Nucleus product redesign
- Nucleus billing rewrite
- round-robin orchestration rewrite
- Ollama/RAG/memory rewrite
- full CRM implementation
- full accounting system
- advanced analytics
- mobile app implementation
- major auth-provider replacement
- database provider replacement

## Current Implementation Order

Follow feature-specs in this order:

```txt
001-public-home-master-hub.md
002-owner-dashboard-shell.md
003-master-dashboard-data-layer.md
004-dashboard-projects-leads-money.md
005-system-links-and-decisions.md
006-client-dashboard-foundation.md
007-cleanup-legacy-docs-context.md
```
