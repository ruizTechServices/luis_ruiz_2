# Public site — luis-ruiz.com homepage UI kit

Hi-fi recreation of the public master hub at `/`, based on `components/app/home/*` from [`ruizTechServices/luis_ruiz_2 @ GioClaw-Edit`](https://github.com/ruizTechServices/luis_ruiz_2/tree/GioClaw-Edit).

## Sections covered

- `<Navbar />` — sticky transparent nav with LR mark
- `<MasterHero />` — h1, supporting line, three CTAs, glass status side card
- `<PublicStatusPanel />` — 5-up focus tiles ("Public focus areas")
- `<ServiceCards />` — 6-up Tailwind-style service grid
- `<SystemsOverview />` — 5 systems with eyebrow
- `<FeaturedProjects />` — 3 project cards
- `<CaseStudyPreview />` — labeled rows (problem / system / tools / result)
- `<HomeCTA />` — closing CTA + secondary link
- `<Footer />`

## Sources of truth

- `components/app/home/MasterHero.tsx`
- `components/app/home/PublicStatusPanel.tsx`
- `components/app/home/ServiceCards.tsx`
- `components/app/home/SystemsOverview.tsx`
- `components/app/home/FeaturedProjects.tsx`
- `components/app/home/CaseStudyPreview.tsx`
- `components/app/home/HomeCTA.tsx`
- `components/app/home/home-data.ts`

This is a cosmetic recreation, not a port. State, links, and Supabase reads are stubbed.
