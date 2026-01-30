# UX/UI Improvements - January 30, 2026

Portfolio polish tasks to improve usability, accessibility, and visual cohesion.

---

## HIGH PRIORITY

### 1. Streamline the Hero Section
**File:** `components/app/landing_page/Hero.tsx`

Current issues:
- "Booked" badge on avatar card adds visual clutter
- Too many icons distract from CTAs
- Missing clear value proposition tagline

**Tasks:**
- [x] Remove or simplify the "booked" badge
- [x] Add a brief tagline (e.g. "Building fast, scalable web experiences")
- [x] Reduce icon count to focus attention on CTAs
- [ ] Consider replacing avatar card with simple photo/illustration

---

### 2. Consolidate Metrics into Highlights Section
**Files:** `components/app/landing_page/Hero.tsx` or new component

Current issues:
- Stats like "5+ Projects" and "100% Resilient" are scattered
- No context or explanations for metrics
- Not linked to supporting evidence

**Tasks:**
- [x] Group metrics into a single "Highlights" section below intro
- [x] Add explanatory captions (e.g. "100% uptime on deployed apps")
- [x] Link each metric to relevant case studies or project pages

---

### 3. Enhance Contrast and Accessibility
**Files:** Various components, `app/globals.css`, Tailwind config

Current issues:
- Purple gradient headlines may not meet WCAG contrast guidelines
- Pastel pink contact page backgrounds reduce readability
- Mobile users and those with visual impairments affected

**Tasks:**
- [ ] Audit text colors against WCAG AA standards (4.5:1 ratio)
- [x] Adjust gradient text colors or add subtle drop shadows
- [x] Fix contact page background/text contrast
- [ ] Test with browser accessibility tools (Lighthouse, axe)

---

### 4. Consistent CTA Button Styling
**Files:** `components/ui/button.tsx`, various page components

Current issues:
- Multiple button styles used inconsistently (solid purple, outline, text links)
- Unclear visual hierarchy for actions

**Tasks:**
- [x] Define primary button style for main actions (cta variant)
- [x] Define secondary style for less important links (cta-outline variant)
- [x] Audit all pages and apply consistent button usage
- [ ] Document button usage guidelines

---

## MEDIUM PRIORITY

### 5. Add Navigation Aids
**Files:** `components/app/`, layout files

Current issues:
- No back-to-top button
- No sticky section navigation
- Long scroll on Projects page causes fatigue

**Tasks:**
- [x] Add floating "back to top" arrow button
- [ ] Consider mini table-of-contents on Projects page
- [x] Add smooth scroll behavior to anchor links

---

### 6. Polish Project Cards
**Files:** `app/projects/`, project-related components

Current issues:
- Visual weight flips between left-content/right-iframe inconsistently
- Embedded iframes make page very long
- Not easily scannable

**Tasks:**
- [x] Create consistent card layout: thumbnail, synopsis, "View project" button
- [x] Collapse iframes behind a "Preview" button
- [ ] Open full demos in modal instead of inline embedding
- [x] Ensure responsive behavior is consistent

---

### 7. Make Blog Tags and Filters Interactive
**Files:** `app/blog/`, blog-related components

Current issues:
- Tag pills don't appear clickable
- No visual feedback when filter is applied
- No way to clear filters

**Tasks:**
- [x] Make tag pills clickable filter links
- [x] Add hover/active states to tags
- [x] Show visual feedback when filter is active
- [x] Add "Clear filters" button
- [x] Consider URL-based filtering for shareability

---

### 8. Streamline Contact Form
**Files:** `app/contact/`, contact form components

Current issues:
- Collects too much info upfront (budget, timeline, contact method)
- High cognitive load may reduce conversions
- No direct scheduling option

**Tasks:**
- [x] Move optional fields behind "More details" accordion
- [x] Keep only essential fields visible (name, email, message)
- [ ] Add embedded scheduling widget (Calendly or similar)
- [x] Consider progressive disclosure for complex inquiries

---

## LOW PRIORITY

### 9. Reduce Footer/Nav Repetition
**Files:** Layout components

Current issues:
- Full nav bar and footer repeat on every page
- Could feel redundant on single-page flows

**Tasks:**
- [ ] Evaluate if simplified nav is appropriate for some pages
- [ ] Consider condensed footer variant for longer pages

---

## Summary

| Priority | Count | Focus Area |
|----------|-------|------------|
| HIGH | 4 | Hero, metrics, accessibility, CTAs |
| MEDIUM | 4 | Navigation, projects, blog, contact |
| LOW | 1 | Layout optimization |

**Recommended order:**
1. Accessibility fixes (#3) - impacts all users
2. CTA consistency (#4) - quick win, improves conversions
3. Hero streamlining (#1) - first impression matters
4. Metrics consolidation (#2) - complements hero changes
5. Navigation aids (#5) - improves UX across site
6. Contact form (#8) - reduces friction for leads
7. Project cards (#6) - better showcase of work
8. Blog filters (#7) - enhances content discovery
