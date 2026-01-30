# Supabase RLS Policies (Nucleus Bot)

This folder contains SQL migrations for Nucleus Bot tables.

Applied policies:
- `nucleus_profiles`: only the owner (`auth.uid() = id`) can read their profile.
- `nucleus_credit_transactions`: only the owner (`auth.uid() = user_id`) can read their transactions.
- `nucleus_usage_logs`: only the owner (`auth.uid() = user_id`) can read their usage logs.

Notes:
- Inserts/updates are performed by server-side API routes using the service role key,
  which bypasses RLS. Client-side access remains read-only for user-owned data.
