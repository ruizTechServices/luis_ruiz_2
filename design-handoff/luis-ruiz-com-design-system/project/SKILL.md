---
name: ruiztechservices-design
description: Use this skill to generate well-branded interfaces and assets for ruizTechServices / Luis-ruiz.com — the personal operating hub and business command center for Luis "Gio" Ruiz. Contains the design system: dark-first command-center color palette, typography, tokens, brand assets (LR wordmark, founder portraits), Lucide iconography conventions, and React UI-kit recreations for the public master hub homepage and the private /gio_dash owner command center. Use it for production code or throwaway prototypes / mocks / decks targeting any luis-ruiz.com surface.
user-invocable: true
---

# ruizTechServices / Luis-ruiz.com Design Skill

Read `README.md` in this skill folder first — it contains the canonical content rules, visual foundations, and iconography guide. Then explore the rest:

- `colors_and_type.css` — all design tokens. Import this in any HTML mock.
- `assets/` — logos (`logo-lr.png`), founder portraits, signature backgrounds (`bg-circuit-blue.jpg`, `sketch-globe.png`), project thumbnails. Use these directly; do not redraw them.
- `preview/` — small HTML cards showing every color/type/spacing/component swatch in isolation. Open as reference while designing.
- `ui_kits/public_site/` — high-fidelity recreation of the public homepage at `/`. Section components (`MasterHero.jsx`, `ServiceCards.jsx`, `SystemsOverview.jsx`, etc.) are modular and copy-friendly.
- `ui_kits/gio_dash/` — recreation of the owner command center at `/gio_dash` (sidebar + topbar + dashboard cards).

## How to use this skill

### If creating visual artifacts (slides, mocks, throwaway prototypes)
1. Copy any assets you need out of `assets/` and reference them with relative paths.
2. Link `colors_and_type.css` in your HTML and use the CSS variables.
3. For icons, load `https://unpkg.com/lucide@latest` from CDN and use `<i data-lucide="icon-name">`.
4. Follow the dark-first command-center aesthetic. Cards = `rounded-2xl`, hairline borders, no heavy shadows. Eyebrows = uppercase, tracked, teal-300.
5. **Do not invent new accent colors or new icon styles.** Stay inside this system.

### If working on production code (Next.js 15 / Tailwind v4 / shadcn)
1. The live source is `ruizTechServices/luis_ruiz_2 @ GioClaw-Edit` on GitHub.
2. Public sections live under `components/app/home/*`; owner dashboard under `components/app/master_dashboard/*`.
3. Match existing Tailwind class patterns there. Don't introduce a new utility-token vocabulary.
4. Honor the protected systems: Nucleus, Round-Robin, Ollama, blog, projects, contact — do not redesign their internals without an explicit feature spec.

### If invoked with no other guidance
Ask the user:
1. **Which surface?** (public homepage, /services, /projects, /blog, /contact, /gio_dash, /ollama, /round-robin, /nucleus, /dashboard client portal)
2. **Fidelity?** (production code / hi-fi prototype / slide / static mock)
3. **Variation count?** (one direction or a few to compare)
4. **What does the user need it to do that the current site doesn't already do?**

Then act as an expert designer for this brand and output HTML artifacts or production code depending on the need. Default to the **calm operator** voice — direct, technical, no hype.

## Hard rules

- Never invent metrics that imply production proof (uptime, latency, scale) unless they're real.
- Never use emoji in UI.
- Never recreate this site's UI from screenshots alone if the GitHub repo is reachable — read the source.
- Never substitute another color for the teal accent or another icon library for Lucide.
- Always document substitutions (e.g. "Geist Sans not available, used Inter") in any deliverable.
