# Contact form UI kit

Hi-fi recreation of `/contact`, based on `components/app/contact/ContactForm.tsx` from [`ruizTechServices/luis_ruiz_2 @ GioClaw-Edit`](https://github.com/ruizTechServices/luis_ruiz_2/tree/GioClaw-Edit).

## What it covers

- **Left rail** — eyebrow + h1 + lead, availability badge, contact meta list (email / phone / location / GitHub), short testimonial.
- **Form card** — all fields from the production form:
  - first name, last name (required, min length 2)
  - email (required, format check)
  - phone, company (optional)
  - subject (required, single-select)
  - message (required, with live char counter, 2000 cap)
  - collapsible "Add scope details" panel: budget select, timeline select, preferred contact method (radio group)
  - newsletter opt-in (checkbox)
  - submit with sending / sent states
- Validation runs on submit. Inline errors highlight in red. Sent state swaps icon and label, then auto-resets.

## Sources of truth

- `components/app/contact/ContactForm.tsx` — field structure + label phrasing
- `lib/validation/contact.ts` — zod schema (mirrored here as inline rules, not imported)
- `app/api/contact/route.ts` — submission endpoint (not actually called from this kit)

## Notes

- Production form uses shadcn `Form` / `Select` / `RadioGroup` / `Checkbox`. This static kit reproduces the visuals with plain HTML controls so the kit is dependency-free.
- The "Add scope details" panel mirrors the production `<Collapsible>` open/close pattern.
- Phone field is optional in the schema; the on-screen "(optional)" tag is added here for clarity.
