-- =============================================================================
-- NUCLEUS BOT RLS POLICIES
-- Enables row-level security on user-owned tables and limits reads to auth.uid()
-- =============================================================================

-- Profiles
alter table public.nucleus_profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.nucleus_profiles
  for select
  using (auth.uid() = id);

-- Credit transactions
alter table public.nucleus_credit_transactions enable row level security;

create policy "Credit transactions are viewable by owner"
  on public.nucleus_credit_transactions
  for select
  using (auth.uid() = user_id);

-- Usage logs
alter table public.nucleus_usage_logs enable row level security;

create policy "Usage logs are viewable by owner"
  on public.nucleus_usage_logs
  for select
  using (auth.uid() = user_id);
