# Auth UI kit

Hi-fi recreation of `/login` and `/signup`, combined into a single tabbed surface. Based on `app/login/page.tsx` and `app/signup/page.tsx` from [`ruizTechServices/luis_ruiz_2 @ GioClaw-Edit`](https://github.com/ruizTechServices/luis_ruiz_2/tree/GioClaw-Edit).

## Covered

- **Tabbed card** — `Sign in` / `Create account` segmented control at the top.
- **OAuth button** — "Continue with Google" with the real Google G mark inline. Triggers a redirecting state.
- **Email + password form** — autocomplete-aware, focused-state ring (`#2563EB`), inline password reveal toggle, password strength meter (4 levels, color-coded) that only appears in signup mode, "Remember me" + "Forgot password?" row that only appears in signin mode.
- **Side rail** — context panel explaining what one account unlocks: client portal, Ollama lab, Nucleus credits, build-log comments. Includes the `Supabase · OAuth + email/password` stamp.
- **Error and success banners** — error in restrained red, success in emerald with the exact Supabase-style copy ("Account created. Check your email to confirm your address, then sign in.").

## Sources of truth

- `app/login/page.tsx` — Google OAuth + email/password handlers, error display, redirect to `/dashboard`
- `app/signup/page.tsx` — signup with optional username, 6-char minimum, success copy
- The production app keeps these as **two separate pages**. I combined them here so the design system has a single surface that documents the entire auth aesthetic; in production each tab maps to its real route.

## Notes

- The Google OAuth call in production is `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/auth/callback' }})`. The button here only simulates that redirect.
- Password strength rules are illustrative; production validation is the bare `min 6` rule from the live form.
- The `Sign up with Google` label mirrors the signin/signup mode but the underlying Supabase call is the same `signInWithOAuth` either way.
