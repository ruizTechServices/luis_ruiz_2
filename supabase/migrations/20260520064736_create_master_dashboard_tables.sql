-- =============================================================================
-- MASTER DASHBOARD OPERATIONAL TABLES
-- Private owner-only tables that back the /gio_dash command center.
-- These are NOT publicly readable. Access is mediated by owner-only API routes
-- and server components using the project's existing ownership checks.
-- =============================================================================

-- Generic updated_at helper. Created here because the repo did not previously
-- have one. Safe to re-create; later migrations can reuse public.set_updated_at.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- dashboard_projects: Gio's operational project tracker.
-- Separate from the public.projects portfolio/case-study table.
-- -----------------------------------------------------------------------------
create table if not exists public.dashboard_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  type text not null default 'internal',
  status text not null default 'idea',
  priority int not null default 3,
  repo_url text,
  live_url text,
  description text,
  next_action text,
  revenue_potential numeric default 0,
  last_touched_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists dashboard_projects_status_idx
  on public.dashboard_projects(status);
create index if not exists dashboard_projects_priority_idx
  on public.dashboard_projects(priority);

drop trigger if exists set_dashboard_projects_updated_at on public.dashboard_projects;
create trigger set_dashboard_projects_updated_at
  before update on public.dashboard_projects
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- dashboard_leads: Open prospect / lead pipeline tracking.
-- -----------------------------------------------------------------------------
create table if not exists public.dashboard_leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  business_name text,
  email text,
  phone text,
  source text,
  problem text,
  budget numeric,
  status text not null default 'new',
  next_follow_up_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists dashboard_leads_status_idx
  on public.dashboard_leads(status);
create index if not exists dashboard_leads_next_follow_up_idx
  on public.dashboard_leads(next_follow_up_at);

drop trigger if exists set_dashboard_leads_updated_at on public.dashboard_leads;
create trigger set_dashboard_leads_updated_at
  before update on public.dashboard_leads
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- dashboard_clients: Active and historical client records.
-- -----------------------------------------------------------------------------
create table if not exists public.dashboard_clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  business_name text,
  status text not null default 'active',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists set_dashboard_clients_updated_at on public.dashboard_clients;
create trigger set_dashboard_clients_updated_at
  before update on public.dashboard_clients
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- dashboard_money_entries: Money in/out per project or client.
-- -----------------------------------------------------------------------------
create table if not exists public.dashboard_money_entries (
  id uuid primary key default gen_random_uuid(),
  entry_type text not null,
  category text not null,
  description text,
  amount numeric not null,
  occurred_on date not null default current_date,
  project_id uuid references public.dashboard_projects(id) on delete set null,
  client_id uuid references public.dashboard_clients(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists dashboard_money_entries_occurred_on_idx
  on public.dashboard_money_entries(occurred_on);

-- -----------------------------------------------------------------------------
-- dashboard_decisions: Operational decision log.
-- -----------------------------------------------------------------------------
create table if not exists public.dashboard_decisions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  decision text not null,
  reason text,
  project_id uuid references public.dashboard_projects(id) on delete set null,
  status text not null default 'active',
  revisit_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists dashboard_decisions_status_idx
  on public.dashboard_decisions(status);

drop trigger if exists set_dashboard_decisions_updated_at on public.dashboard_decisions;
create trigger set_dashboard_decisions_updated_at
  before update on public.dashboard_decisions
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- dashboard_system_links: Owner-curated system/tool index.
-- -----------------------------------------------------------------------------
create table if not exists public.dashboard_system_links (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  description text,
  type text not null default 'system',
  status text not null default 'active',
  priority int not null default 3,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists dashboard_system_links_status_idx
  on public.dashboard_system_links(status);

drop trigger if exists set_dashboard_system_links_updated_at on public.dashboard_system_links;
create trigger set_dashboard_system_links_updated_at
  before update on public.dashboard_system_links
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- ACCESS POLICY
-- These are private operational tables. Enable RLS with no permissive public
-- policy so the only callers that can read/write are server-side service-role
-- contexts (used by the owner-only API routes and server components).
-- The application layer still enforces owner authorization via lib/auth.
-- -----------------------------------------------------------------------------
alter table public.dashboard_projects     enable row level security;
alter table public.dashboard_leads        enable row level security;
alter table public.dashboard_clients      enable row level security;
alter table public.dashboard_money_entries enable row level security;
alter table public.dashboard_decisions    enable row level security;
alter table public.dashboard_system_links enable row level security;
