create extension if not exists "pgcrypto";

-- =========================
-- TABLE: content_items
-- =========================
create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),

  type text not null check (type in ('video','lesson','case_blueprint','case_full','template')),
  domain text not null default 'ops',
  difficulty text not null default 'intermediate' check (difficulty in ('beginner','intermediate','advanced')),

  title text not null,
  summary text,
  content_json jsonb not null default '{}'::jsonb,

  external_url text,
  storage_path text,

  tags text[] not null default '{}'::text[],

  status text not null default 'draft' check (status in ('draft','published')),

  created_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_content_items_type on public.content_items(type);
create index if not exists idx_content_items_domain on public.content_items(domain);
create index if not exists idx_content_items_status on public.content_items(status);
create index if not exists idx_content_items_tags_gin on public.content_items using gin(tags);

-- updated_at trigger function (create if not exists isn't supported for functions reliably, so we "replace")
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create trigger only if it doesn't exist
do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'trg_content_items_updated_at'
  ) then
    create trigger trg_content_items_updated_at
    before update on public.content_items
    for each row execute function public.set_updated_at();
  end if;
end;
$$;

-- =========================
-- TABLE: datasets
-- =========================
create table if not exists public.datasets (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,

  format text not null default 'json' check (format in ('json','csv')),
  dataset_json jsonb not null default '[]'::jsonb,
  schema_json jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index if not exists idx_datasets_content_item_id on public.datasets(content_item_id);

-- =========================
-- TABLE: program_week_content_map
-- =========================
create table if not exists public.program_week_content_map (
  id uuid primary key default gen_random_uuid(),

  program_id text not null,
  week_no int not null check (week_no >= 0 and week_no <= 9),

  content_item_id uuid not null references public.content_items(id) on delete cascade,

  order_index int not null default 0,
  required boolean not null default true,

  created_at timestamptz not null default now()
);

create index if not exists idx_week_map_program_week on public.program_week_content_map(program_id, week_no);
create index if not exists idx_week_map_content_item on public.program_week_content_map(content_item_id);

-- =========================
-- RLS (Permissive for build speed)
-- =========================
alter table public.content_items enable row level security;
alter table public.datasets enable row level security;
alter table public.program_week_content_map enable row level security;

-- Policies: create only if missing
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='content_items' and policyname='content_items_read_all_build') then
    create policy "content_items_read_all_build"
    on public.content_items
    for select
    to authenticated
    using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='content_items' and policyname='content_items_write_all_build') then
    create policy "content_items_write_all_build"
    on public.content_items
    for all
    to authenticated
    using (true)
    with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='datasets' and policyname='datasets_read_all_build') then
    create policy "datasets_read_all_build"
    on public.datasets
    for select
    to authenticated
    using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='datasets' and policyname='datasets_write_all_build') then
    create policy "datasets_write_all_build"
    on public.datasets
    for all
    to authenticated
    using (true)
    with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='program_week_content_map' and policyname='week_map_read_all_build') then
    create policy "week_map_read_all_build"
    on public.program_week_content_map
    for select
    to authenticated
    using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='program_week_content_map' and policyname='week_map_write_all_build') then
    create policy "week_map_write_all_build"
    on public.program_week_content_map
    for all
    to authenticated
    using (true)
    with check (true);
  end if;
end;
$$;
