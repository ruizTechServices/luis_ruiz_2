alter table public.projects
  add column if not exists slug text,
  add column if not exists summary text,
  add column if not exists status text not null default 'active',
  add column if not exists category text not null default 'project',
  add column if not exists featured boolean not null default false,
  add column if not exists visibility text not null default 'public',
  add column if not exists stack text[] not null default '{}',
  add column if not exists role text,
  add column if not exists context text,
  add column if not exists problem text,
  add column if not exists constraints text,
  add column if not exists approach text,
  add column if not exists architecture text,
  add column if not exists decisions text,
  add column if not exists outcomes text,
  add column if not exists current_status text,
  add column if not exists repo_url text,
  add column if not exists live_url text,
  add column if not exists cover_image_url text,
  add column if not exists started_at timestamptz,
  add column if not exists completed_at timestamptz;

update public.projects
set slug = coalesce(
  nullif(slug, ''),
  lower(
    regexp_replace(
      coalesce(nullif(title, ''), split_part(regexp_replace(url, '^https?://', ''), '/', 1)),
      '[^a-zA-Z0-9]+',
      '-',
      'g'
    )
  )
)
where slug is null or slug = '';

alter table public.projects
  alter column slug set not null;

create unique index if not exists projects_slug_key
  on public.projects (slug);

create index if not exists projects_featured_idx
  on public.projects (featured, created_at desc);

create index if not exists projects_category_idx
  on public.projects (category);

create index if not exists projects_status_idx
  on public.projects (status);

alter table public.projects
  add constraint projects_status_check
  check (status in ('draft', 'active', 'complete', 'archived'));

alter table public.projects
  add constraint projects_category_check
  check (category in ('project', 'product', 'client', 'experiment'));

alter table public.projects
  add constraint projects_visibility_check
  check (visibility in ('public', 'unlisted', 'private'));
