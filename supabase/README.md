# Supabase Migrations

This folder contains SQL migrations for the project.

## Owner Dashboard

`20260519_create_master_dashboard_tables.sql` creates the private owner operational tables:

- `dashboard_projects`
- `dashboard_leads`
- `dashboard_clients`
- `dashboard_money_entries`
- `dashboard_decisions`
- `dashboard_system_links`

These tables intentionally have RLS enabled with no public policies. Server-side owner verification must happen before using a service-role Supabase client to read or write them.
