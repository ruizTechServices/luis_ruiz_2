# UX/UI Improvements - January 30, 2026

Portfolio polish tasks to improve usability, accessibility, and visual cohesion.

---

## HIGH PRIORITY

### 1. Streamline the Hero Section
**File:** `components/app/landing_page/Hero.tsx`

Updated status:
- Hero has already been materially rewritten away from generic portfolio positioning
- Copy is now faster, more minimal, and oriented around public execution
- Carousel treatment was refined and supporting notes moved below the image

**Tasks:**
- [x] Remove or simplify the "booked" badge
- [x] Add a brief tagline
- [x] Reduce icon count to focus attention on CTAs
- [ ] Consider replacing avatar/card treatment with a simpler or more intentional visual system later

---

### 2. Consolidate Metrics into Highlights Section
**Files:** `components/app/landing_page/Hero.tsx` or new component

Updated status:
- Old vanity metrics were removed from the public direction
- Highlights was repurposed into a site-purpose / routing section instead of a stats block

**Tasks:**
- [x] Remove weak scattered metrics
- [x] Replace them with a stronger Highlights section aligned to site direction
- [ ] Revisit whether a future proof section should include stronger evidence cards instead of metrics

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

Updated status:
- Projects page has been substantially rewritten
- Cards are more intentional and now support linked Blog / Build Log context
- Inline preview behavior is still present, but overall framing is much stronger

**Tasks:**
- [x] Create a more consistent project card layout
- [x] Collapse iframes behind a "Preview" button
- [ ] Decide whether modal preview is actually better than new-tab behavior
- [x] Ensure responsive behavior is more consistent

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
