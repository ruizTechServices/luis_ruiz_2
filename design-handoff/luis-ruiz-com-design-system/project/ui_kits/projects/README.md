# Projects / case-study UI kit

Hi-fi recreation of `/projects/[slug]` (case-study detail), based on `app/projects/page.tsx` from [`ruizTechServices/luis_ruiz_2 @ GioClaw-Edit`](https://github.com/ruizTechServices/luis_ruiz_2/tree/GioClaw-Edit).

## Covered

- **Hero** — breadcrumbs, category pill, h1, lede, cover image with stack chips strip.
- **Two-column body** — long-form case study (Context / Problem / Approach / Decisions / Outcomes / Current status), sticky sidebar with project facts (status pill, role, started/shipped, repo + live links), related blog posts, and a CTA panel.
- **Outcomes** — KPI cards using the design system metric pattern.
- **Approach** — small architecture diagram built from styled nodes + arrows (no SVG required).
- **Decisions** — 3-up "card deck" recording specific design calls.
- **More case studies** row at the bottom — uses real project thumbnails from `assets/`.

## Sources of truth

- `app/projects/page.tsx` — hero copy, proof-points framing, filter chip language ("AI systems · Web products · Public build work · Client-adjacent execution")
- Supabase migration `20260412_195500_expand_projects_for_case_studies.sql` — the field set: `summary`, `status`, `category`, `featured`, `stack`, `role`, `context`, `problem`, `constraints`, `approach`, `architecture`, `decisions`, `outcomes`, `current_status`, `repo_url`, `live_url`, `cover_image_url`, `started_at`, `completed_at`, `slug`
- `Agents.md` — case-study-as-proof-of-work framing

## Notes

- The "Nucleus API" content here is illustrative — same shape the production records take, but the words are written to demonstrate the format.
- Metrics shown (2,840 requests / $1.42 per 1k / 99.6% / 3 providers) are example values; the production page shows real numbers when wired to Supabase.
