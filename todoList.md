# TODO List >>[todoList.md]

**User Profile Management**
- [ ] create a way for users to view their profile with Luis Ruiz
- [ ] create a way for users to update their account information with Luis Ruiz
- [ ] create a way for users to delete their account with Luis Ruiz

  - Implementation details
    - Tables: `profiles (id uuid default auth.uid(), display_name text, phone text, avatar_url text, created_at, updated_at)`
    - RLS: SELECT/UPDATE own row (`id = auth.uid()`); INSERT for authenticated users or auto-create on signup
    - API: `GET /api/profile` (current user), `PATCH /api/profile` (update allowed fields)
    - Pages: `app/profile/page.tsx` (read-only card), `app/profile/edit/page.tsx` (form with ShadCN `form`, `input`, avatar upload via Supabase Storage)
    - Components: `components/app/profile/*` (profile form, avatar uploader)
    - Delete account: `DELETE /api/account/delete` using Supabase Admin (GoTrue) with confirm dialog (`components/ui/alert-dialog`)
    - Integration: Show `email`/`avatar_url` in `app/layout.tsx` header when logged in
    - Tests: API contract + form validation and optimistic UI

**Appointment Management**
- [ ] create a way for users to view a schedule of availability for Luis Ruiz
- [ ] create a way for users to book an appointment with Luis Ruiz
	- [ ] create a way for users to pay for the appointment
- [ ] create a way for users to cancel an appointment with Luis Ruiz
- [ ] create a way for users to reschedule an appointment with Luis Ruiz

  - Implementation details
    - Tables:
      - `availability (id bigint identity, provider_id uuid, start_at timestamptz, end_at timestamptz, is_open bool)`
      - `appointments (id bigint identity, user_id uuid, provider_id uuid, start_at timestamptz, end_at timestamptz, status text, payment_intent_id text, amount_cents int, currency text)`
    - Status flow: `pending_payment -> confirmed -> completed` (or `canceled` / `rescheduled`)
    - RLS:
      - `availability`: public SELECT; provider-only INSERT/UPDATE
      - `appointments`: user/provider can SELECT their rows; user INSERT own row; role-limited UPDATE (cancel/reschedule rules)
    - API:
      - `GET /api/availability?from=&to=` list open slots
      - `POST /api/appointments` create (atomic slot check → insert `pending_payment`)
      - `PATCH /api/appointments/[id]` cancel/reschedule per policy
    - Pages:
      - `app/appointments/page.tsx` (calendar/list, ShadCN `calendar`, booking modal)
      - `app/appointments/manage/page.tsx` (list + cancel/reschedule)
    - Payments (see Stripe below): after booking, redirect to Checkout; webhook confirms → mark `confirmed`
    - Notifications: optional email via Supabase Edge Functions
    - Tests: booking happy path, double-book prevention, cancel/reschedule permissions

**Review and Rating System**
- [ ] create a way for users to rate their experience with Luis Ruiz
- [ ] create a way for users to leave a review for Luis Ruiz

  - Implementation details
    - Table: `reviews (id bigint identity, appointment_id bigint, reviewer_user_id uuid, rating int check 1..5, comment text, created_at)`
    - RLS: INSERT only if reviewer owns the appointment and appointment is `completed`; SELECT public or limited to reviewer/provider
    - API: `GET /api/reviews` (user’s reviews), `POST /api/reviews` (create)
    - Pages: `app/reviews/page.tsx` (list), action to “Leave a review” on appointment detail
    - Integration: aggregate rating shown on provider/service cards
    - Tests: insertion rules, average rating calculation

**History and Payment Tracking**
- [ ] create a way for users to view their appointment history with Luis Ruiz
- [ ] create a way for users to view their payment history with Luis Ruiz

  - Implementation details
    - Data sources: `appointments` (status/times) and Stripe (via `payment_intent_id`) or a `payments` table
    - API: `GET /api/history/appointments`, `GET /api/history/payments`
    - Pages: `app/history/appointments/page.tsx`, `app/history/payments/page.tsx`
    - Integration: links to manage (cancel/reschedule) and to leave reviews after completion
    - Tests: pagination, auth gating, empty states

**Contact and Chat**
- [x] create a way for users to contact Luis Ruiz (email, phone, etc.)
- [ ] create a way for users to chat with Luis Ruiz live with web chat to sms method.

  - Notes (contact): Implemented via `app/contact/page.tsx` and `app/contact/ContactFormClient.tsx`
  - Chat-to-SMS (Twilio):
    - Tables: `chat_sessions (id, user_id, phone, created_at)`, `chat_messages (id, session_id, direction in|out, body, created_at)`
    - API: `POST /api/sms/send` (outbound via Twilio), `POST /api/sms/inbound` (Twilio webhook with signature verification)
    - Page: `app/chat/page.tsx` (web chat UI bound to a phone session)
    - Integration: optional AI assist via existing `app/ollama/*` pipeline
    - Tests: webhook signature, message threading, auth

**Project and Service Showcase**
- [x] create a way for users to view LR's current projects
- [ ] create a way for users to view LR's current services

  - Notes (projects): Implemented via `app/projects/page.tsx` + `lib/db/projects.ts` (Supabase)
  - Services module:
    - Table: `services (id bigint identity, slug text, title text, description text, price_cents int, created_at, updated_at)`
    - RLS: public SELECT; provider/admin INSERT/UPDATE
    - Page: `app/services/page.tsx` (cards with ShadCN `card`)
    - Integration: “Book now” → prefill appointment duration/price
    - Tests: rendering, sorting, empty state