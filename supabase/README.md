# Supabase RLS Policies (Nucleus Bot)

This folder contains SQL migrations for the project.

## Nucleus

Applied Nucleus policies:
- `nucleus_profiles`: only the owner (`auth.uid() = id`) can read their profile.
- `nucleus_credit_transactions`: only the owner (`auth.uid() = user_id`) can read their transactions.
- `nucleus_usage_logs`: only the owner (`auth.uid() = user_id`) can read their usage logs.

Notes:
- Inserts/updates are performed by server-side API routes using the service role key,
  which bypasses RLS. Client-side access remains read-only for user-owned data.
- The local Nucleus migrations currently include RLS policies and atomic credit helper functions. They do not fully create every Nucleus runtime table, so add explicit create-table migrations before treating local migrations as a complete Nucleus schema source.

## Owner Dashboard

`20260519_create_master_dashboard_tables.sql` creates the private owner operational tables:

- `dashboard_projects`
- `dashboard_leads`
- `dashboard_clients`
- `dashboard_money_entries`
- `dashboard_decisions`
- `dashboard_system_links`

These tables intentionally have RLS enabled with no public policies. Server-side owner verification must happen before using a service-role Supabase client to read or write them.
