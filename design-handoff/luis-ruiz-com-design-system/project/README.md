# ruizTechServices · Luis-ruiz.com Design System

> The design system for **Luis-ruiz.com**, the personal operating hub, portfolio, and business command center for **Luis "Gio" Ruiz**, founder of **ruizTechServices LLC**.

This system documents the visual + content language for a multi-surface product: a public master hub that sells credibility, a private owner command center (`/gio_dash`), an AI experimentation lab (Ollama, Round-Robin, Nucleus), a public build log, and a future client portal.

---

## Source material

This design system is derived from real product code, not invented from a brief.

- **GitHub repo (active branch):** [`ruizTechServices/luis_ruiz_2` @ `GioClaw-Edit`](https://github.com/ruizTechServices/luis_ruiz_2/tree/GioClaw-Edit)
  - Public homepage modules — `components/app/home/*`
  - Owner command center — `components/app/master_dashboard/*`
  - Legacy admin tools — `components/app/gio_dashboard/*`
  - Round-robin / AI tooling — `components/round-robin/*`, `app/ollama/*`
  - Nucleus API product — `app/api/nucleus/*`, `lib/nucleus/*`
  - Tailwind tokens — `app/globals.css`
- **Authoritative system briefs** in the repo:
  - `Agents.md` — system architecture and product layers
  - `CLAUDE.md` — refactor direction (portfolio → master hub)
- **Brand inputs / uploaded assets** — wordmark variants, founder portraits, project thumbnails, abstract circuit/data backgrounds.

**For the reader:** to extend this system faithfully, open the repo and read the components above. Component-level decisions (gradient stops, exact spacing, badge phrasing, lucide-react icon choices) are easier to audit at source than to re-derive from screenshots.

---

## Product surfaces in scope

Routes the system must serve well, in priority order:

| Route | Purpose | Audience |
|---|---|---|
| `/` | Public master hub — hero, status, services, systems, projects, CTA | Prospective clients, peers |
| `/services` | ruizTechServices service catalog | Prospective clients |
| `/projects` | Public case studies (Supabase-backed) | Hiring managers, prospects |
| `/blog` | Build log + technical writing | Peers, community |
| `/contact` | Lead capture (Zod-validated → `contactlist`) | Prospective clients |
| `/dashboard` | Future client portal | Existing clients (planned) |
| `/gio_dash` | Owner-only command center | Gio only |
| `/ollama` | Local-model chat surface | Gio + curious visitors |
| `/round-robin` | Multi-model discussion tool | Gio + curious visitors |
| `/nucleus` (`/api/nucleus/*`) | Paid API product | Developers |

The system has to look credible to a small-business buyer **and** dense/operational to an owner running a one-person company. Those needs are reconciled by **dark-first surface treatment + strong grid + restrained accent color**, not by two separate visual languages.

---

## Content fundamentals

The voice is **direct, technical, founder-led, calm**. Not hype. Not corporate. Not playful.

### Tone rules

- **Concrete > aspirational.** "Turn messy workflows into clean dashboards." — not "Unlock your potential."
- **Founder-as-narrator.** First-name framing ("Luis Ruiz", "Gio") on the public site. Owner-area UI uses *neutral declarative phrasing* ("Today Focus", "Open Leads", "No lead records connected yet") — never cheerful microcopy.
- **Honest about state.** When data isn't connected, the UI literally says so: *"Placeholder until the dashboard data layer is connected."* This honesty is part of the brand — the system shows its seams.
- **You vs I.** Public marketing uses third-person about Gio ("Luis Ruiz builds…") and second-person to the reader ("Start with Gio"). The owner dashboard uses **imperative + label nouns** ("New Post", "Review public intake").
- **No buzzwords.** Banned: *revolutionary, cutting-edge, unlock, supercharge, AI-powered (alone), seamlessly, world-class*. Allowed and encouraged: *practical, useful, working, shipped, building, paused, blocked*.

### Casing

- **Headlines** — sentence case. ("Practical builds for people who need the system to work.")
- **Card titles** — Title Case ("Today Focus", "Open Leads", "Revenue Snapshot").
- **Status badges** — lowercase ("active", "paused", "shipped", "in progress").
- **Eyebrows / kickers** — UPPERCASE with `letter-spacing: 0.18em` ("PUBLIC FOCUS AREAS", "SERVICES").
- **Buttons** — Title Case verbs ("View Services", "See Projects", "Start with Gio").

### Emoji & decoration

- **No emoji** in production UI. The brand reads as a technical operator's tool — emoji breaks that posture.
- **Unicode arrows** are used sparingly (→) only for inline links inside paragraphs.
- **Iconography is Lucide React** (single-line, 1.5-stroke). See [ICONOGRAPHY](#iconography).

### Example copy

| Surface | Sample |
|---|---|
| Hero h1 | *Luis Ruiz builds practical AI, web, and automation systems for small businesses, creators, and operators.* |
| Hero supporting | *Through ruizTechServices, Gio turns messy workflows into clean digital systems: dashboards, automations, AI assistants, websites, and internal tools.* |
| Section eyebrow | *PUBLIC FOCUS AREAS* |
| Service card | *Practical assistants that answer questions, streamline tasks, and connect to useful context.* |
| Dashboard label | *Primary focus → Refactor luis-ruiz.com into master hub* |
| Empty state | *No lead records connected yet.* |
| CTA | *Start with Gio* / *Review public intake* |

---

## Visual foundations

A refined dark-mode command-center aesthetic. Think: SaaS dashboard meets technical founder portfolio meets AI operations console.

### Color

- **Dark-first.** Default canvas is a slate gradient from `#020617` → `#111827` → `#062f2f`. Light mode is supported but is the secondary theme. (See `colors_and_type.css`.)
- **Primary CTA** — `#2563EB` (blue-600). The CTA color across forms, hero buttons, primary actions.
- **Electric accent** — `#38BDF8` (sky-400) for highlights and info states.
- **Indigo / Purple** — `#4F46E5` / `#7C3AED` for AI-tooling surfaces (Round-Robin, Nucleus).
- **In-product teal** — the existing codebase consistently uses `teal-200/300/700` as the "operator" accent (eyebrows, hover borders, status pills, glow rails). It coexists with the blue/indigo primary. The teal is what makes the surfaces feel like a console rather than a generic SaaS.
- **Status palette** — green/yellow/red for active/paused/blocked, sky for shipped, violet for testing, slate for archived. See `preview/colors-status.html`.

### Typography

- **Geist Sans** (UI body + headings) and **Geist Mono** (code, tokens, terminal-like UI) in production.
- For static design artifacts, this DS substitutes **Inter** + **JetBrains Mono** — close metric match, free, easy to ship in HTML mockups.
- **One family family per surface.** No serifs in UI. The serif LR wordmark is the only display-serif moment and is treated as artwork.
- **Tight tracking on display sizes** (`-0.025em`), normal everywhere else. Eyebrow kickers are uppercase, `0.18em` letter-spacing, teal-300.

### Backgrounds

- **Solid dark slate** for most pages — never gradient noise behind content.
- **Diagonal 3-stop gradient** for hero panels (light mode) and the `/gio_dash` shell (dark): `linear-gradient(135deg, #020617 0%, #111827 48%, #062f2f 100%)`. The teal hint in the bottom-right is intentional — it's a low-volume identity cue.
- **Radial blue flare** at the top center of hero areas (sky-400 at 25% alpha, blurred 3xl). Used sparingly — once per page.
- **Hairline accent line** above hero sections: `linear-gradient(90deg, transparent, teal-300, transparent)` — 1px, full width, no shadow.
- **Imagery** — cool blue/slate palette dominates: the circuit/data abstract `bg-circuit-blue.jpg`, the hand-drawn sketch `sketch-globe.png`, founder portraits on neutral grounds. No warm-toned, lifestyle, or stock-people imagery.
- **Subtle grain / noise** is *not* used.

### Layout & spacing

- **12-column grid** on public pages, max width `1280px`, page padding `32–48px` desktop / `16–20px` mobile.
- **Sidebar + main** on `/gio_dash`. Sidebar fixed; main is grid.
- **Dashboard overview** — `grid-cols-12` desktop, with cards typically `col-span-4` (three across) for KPIs and `col-span-6/7/5` for content rows.
- **Section gaps** — `64–96px` on public pages, `24px` between dashboard cards.
- **Card padding** — `20–24px` (`p-5` / `p-6`).

### Corners

- **`rounded-2xl` (16px)** is the default card. Confirmed in code (`MasterHero`, `TodayFocusCard`, `ServiceCards`).
- **`rounded-xl` (12px)** for inner panels nested inside a card.
- **`rounded-md` (6–8px)** for buttons, inputs, badges, icon chips.
- **`rounded-pill`** only for status pills and signal bars.
- Never `rounded-full` on rectangular cards. Never `rounded-3xl` except for hero "panels" that read as artwork.

### Borders

- **Hairlines, not heavy strokes.** `1px solid rgba(255,255,255,0.08)` on dark; `1px solid #E2E8F0` on light.
- **Hover state** strengthens the border to teal (`teal-300/40`) rather than thickening it.
- **No double borders.** Card + inner panel use the same border weight.

### Shadows

- **Light shadow on cards** (`shadow-sm`). The dark theme leans on inset highlights more than drop shadows.
- **Inset top hairline** (`inset 0 1px 0 rgba(255,255,255,0.04)`) gives panels a subtle elevation on dark.
- **Hero shadow** is heavier: `0 24px 70px rgba(0,0,0,0.32)`.
- **Glow** is reserved for AI-tooling surfaces (Round-Robin, Nucleus) — a ringed teal/blue glow on focused elements. Used sparingly.

### Transparency / blur

- **Glass panels** (`backdrop-filter: blur(20px)` + `rgba(255,255,255,0.04)`) for the hero side card and dropdown popovers.
- **Never blur over body text** — only over solid color or image grounds.

### Animation

- **Restrained.** No bounce, no spring overshoot. The brand reads as a calm operator.
- **Hover** — `transition: background-color, border-color, transform 150ms ease`. Cards lift `translateY(-4px)` on hover and gain a teal border.
- **Press** — buttons darken background by one step; no shrink/scale.
- **Page enter** — slight `fadeInUp` (`opacity 0→1, translateY 20px→0`, 300ms). Defined in `globals.css`.
- **Respect `prefers-reduced-motion`** — all of the above collapse to instant changes.

### Iconography

See [ICONOGRAPHY](#iconography) section below.

---

## Iconography

The production app uses **Lucide React** (`lucide-react`, version `^0.536.0` in `package.json`). It is the single icon system across surfaces.

- **Style** — single-line, 1.5px stroke, square caps, no fill. This matches the calm/technical posture.
- **Default size** — 16px (`h-4 w-4`) inline, 20px (`h-5 w-5`) in icon chips, 24px (`h-6 w-6`) in heroes.
- **Icon chips** — `40×40` square (`h-10 w-10`), `rounded-xl`, dark inverse (slate-950 bg, white icon) on light mode or (white bg, slate-950 icon) on dark.
- **No multi-color icon glyphs.** Lucide's monoline aesthetic is the contract.

Confirmed icons in use across the codebase (representative set):

```
ArrowRight  ArrowUpRight  Activity  Bot  Building  Building2
CalendarDays  ChartNoAxesCombined  CheckCircle2  CircleDollarSign
Cpu  FilePlus2  FileText  FolderKanban  Gauge  Github  ImagePlus
Inbox  Link2  Mail  MessageSquareText  MonitorCog  Newspaper
PlusCircle  Sparkles  Target  Waypoints  Wrench
```

Use them via the official CDN for static prototypes:

```html
<script src="https://unpkg.com/lucide@latest"></script>
<i data-lucide="arrow-right"></i>
<script>lucide.createIcons();</script>
```

**Emoji and unicode** — not used as UI iconography. The only unicode glyph in regular use is the en-arrow → inside running text. **PNG/SVG icons authored in-house** — none in this codebase; everything routes through Lucide.

The brand mark `LR` (see `assets/logo-lr.png`) is a serif wordmark and is treated as **artwork, not an icon**. Don't recolor it; don't shrink it below 24px; pair it with sufficient padding.

---

## Files in this project (index)

```
README.md                  ← this file
SKILL.md                   ← Agent-Skill-compatible loader for downstream use
colors_and_type.css        ← all design tokens (colors, type, spacing, radii, shadows)

assets/                    ← logos, brand imagery, project thumbnails, photos of Gio
  logo-lr.png              ← primary LR serif wordmark
  logo-lr-alt.png
  avatar-placeholder.png
  luis-portrait.png        ← founder portrait, isolated
  luis-photo-2.png
  luis-businessman.png
  bg-circuit-blue.jpg      ← signature abstract background
  sketch-globe.png         ← hand-drawn globe motif
  photo-globe.jpg
  splash-water.jpg
  project-code-combinator.png
  project-web-component-gpt.jpg
  project-bootstrap-lit.png
  photo-apps.jpg
  photo-form.jpg
  photo-luis-it.jpg
  photo-pc-support.jpg
  photo-hand-screen.jpg

preview/                   ← Design-System-tab cards (each one a small HTML file)
  colors-*.html
  type-*.html
  spacing-*.html
  components-*.html
  brand-*.html

ui_kits/
  public_site/             ← hi-fi recreation of luis-ruiz.com (homepage)
    index.html
    *.jsx
    README.md
  gio_dash/                ← hi-fi recreation of /gio_dash owner command center
    index.html
    *.jsx
    README.md
  blog/                    ← /blog index + post detail (votes + comments)
    index.html
    README.md
  contact/                 ← /contact project-inquiry form (Zod-shaped)
    index.html
    README.md
  round_robin/             ← /round-robin multi-model discussion surface
    index.html
    README.md
  soundboard/              ← Gio voice-clip pads (audio from public/sounds/)
    index.html
    README.md
  ollama/                  ← Ollama lab: local-model chat workspace
    index.html
    README.md
  projects/                ← /projects/[slug] case-study detail
    index.html
    README.md
  auth/                    ← /login + /signup combined flow
    index.html
    README.md
```

---

## How to use this system

- **For a static mock / deck** — load `colors_and_type.css`, pull icons via the Lucide CDN, copy any image you need out of `assets/`, and follow the visual + content rules above.
- **For production work** — open `ruizTechServices/luis_ruiz_2` @ `GioClaw-Edit` and treat the components in `components/app/home/*` and `components/app/master_dashboard/*` as the source of truth. Tailwind v4 token names live in `app/globals.css`.
- **Don't invent new accent colors, new icon styles, or new card shapes** without checking the relevant component first. The system is small on purpose.
