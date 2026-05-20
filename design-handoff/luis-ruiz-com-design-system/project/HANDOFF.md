# Resume prompt — ruizTechServices Design System

If we run out of room mid-build, open a new chat in this same project and paste the prompt below verbatim. The new conversation will land in this project, have access to every file already on disk, and pick up where we left off.

---

## Paste this into the new chat

> Continue building out the ruizTechServices / Luis-ruiz.com Design System in this project. Read `README.md`, `SKILL.md`, and `HANDOFF.md` first — they contain the full system context, content rules, and current state. Then read `ui_kits/` to see which surfaces are already built.
>
> **Confirmed decisions:**
> - Font: Inter substitute is fine (Geist not required).
> - Accent: teal is the in-product accent across all surfaces, including blog (already migrated from violet).
> - Soundboard audio files live in `public/sounds/` and the soundboard already auto-tries `/sounds/<id>.mp3` before falling back to synthesized tones.
> - Recreate Ollama chat, Projects / case-study detail, and Login + Signup flows. Do **not** recreate Nucleus. Don't break behavior — these are design artifacts, not production code.
>
> **What's already done:**
> - `colors_and_type.css`, `README.md`, `SKILL.md`, full preview card set (33 cards, 5 groups) registered for the Design System tab.
> - UI kits at `ui_kits/public_site/`, `ui_kits/gio_dash/`, `ui_kits/blog/`, `ui_kits/contact/`, `ui_kits/round_robin/`, `ui_kits/soundboard/`.
> - Asset library in `assets/`.
>
> **What's left:**
> 1. `ui_kits/ollama/` — local chat workspace. Source: `app/ollama/page.tsx` + `app/ollama/OllamaChatClient.tsx` in `ruizTechServices/luis_ruiz_2 @ GioClaw-Edit`. Two-pane layout: conversation on the left (h-[420–520px] scroll region, user bubbles right / assistant left), model settings + retrieval panel on the right. Status pills for `Ollama ready / offline` and `DB persist on/off`. Streaming caret.
> 2. `ui_kits/projects/` — case-study detail. Source: `app/projects/page.tsx` and `components/app/projects/project.tsx`. Hero with eyebrow "Proof of work, not portfolio theater" + h1, three proof-point cards, then a long-form case study with problem / approach / architecture / outcomes sections, stack chips, role, current status, live URL + repo URL, related blog links, cover image.
> 3. `ui_kits/auth/` — combined Login + Signup flow. Source: `app/login/page.tsx` and `app/signup/page.tsx`. Centered card on the dark hero gradient, "Continue with Google" button at the top, divider, email + password form, link to switch between sign-in and sign-up. Sign-up has an optional username field and a "min 6 chars" hint. Show success + error states (Supabase-style copy).
>
> **After building each kit:**
> - Use `register_assets` so the kit's index.html shows up in the Design System tab. Use group "Components" and pick a viewport that fits.
> - Write a short README.md inside each kit folder noting source files and any substitutions.
> - Update the file index at the bottom of `README.md` to list the new kits.
>
> **System rules:**
> - Dark-first, teal accent for "operator" cues, blue for primary CTAs, hairline borders, `rounded-2xl` cards, eyebrow kickers uppercase + tracked, Lucide icons via `https://unpkg.com/lucide@latest`. Never invent new colors or icon styles.
> - Static HTML kits, no React build step. Use plain HTML controls that visually match shadcn primitives (already proven in the contact + blog kits).
> - No emoji.
>
> Call `done` when each kit lands, then `fork_verifier_agent` once the whole batch is in.

---

## State checkpoint (for the human, not the agent)

| Surface | Status |
|---|---|
| Tokens & previews (33 cards) | ✅ |
| Public homepage | ✅ |
| Gio dashboard | ✅ |
| Blog reader | ✅ (teal accent) |
| Contact form | ✅ |
| Round-Robin | ✅ |
| Soundboard | ✅ (loads from `public/sounds/`) |
| Ollama chat | ⏳ next |
| Projects / case study | ⏳ next |
| Login / Signup | ⏳ next |
| Nucleus | ❌ intentionally skipped |
