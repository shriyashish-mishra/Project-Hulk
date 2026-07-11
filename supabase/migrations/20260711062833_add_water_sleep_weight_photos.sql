-- New tables for Project Hulk's daily-signals milestone: water, sleep,
-- weight, and progress photos. Brand new tables (no historical data to
-- backfill), so user_id goes straight to NOT NULL with real ownership
-- policies from the start, unlike the two-phase rollout the original
-- tables needed.

create table water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  glass_count integer not null default 0,
  glass_size_ml integer not null default 250,
  target_glasses integer not null default 8,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create table sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  duration_minutes integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create table weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  measured_on date not null,
  weight_kg numeric(5, 2) not null,
  created_at timestamptz not null default now(),
  unique (user_id, measured_on)
);

create table progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  captured_on date not null,
  view_type text not null check (view_type in ('front', 'side', 'back')),
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index water_logs_user_date_idx on water_logs (user_id, date);
create index sleep_logs_user_date_idx on sleep_logs (user_id, date);
create index weight_logs_user_measured_idx on weight_logs (user_id, measured_on);
create index progress_photos_user_captured_idx on progress_photos (user_id, captured_on);

alter table water_logs enable row level security;
alter table sleep_logs enable row level security;
alter table weight_logs enable row level security;
alter table progress_photos enable row level security;

create policy water_logs_select_own on water_logs
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy water_logs_insert_own on water_logs
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy water_logs_update_own on water_logs
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy water_logs_delete_own on water_logs
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy sleep_logs_select_own on sleep_logs
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy sleep_logs_insert_own on sleep_logs
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy sleep_logs_update_own on sleep_logs
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy sleep_logs_delete_own on sleep_logs
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy weight_logs_select_own on weight_logs
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy weight_logs_insert_own on weight_logs
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy weight_logs_update_own on weight_logs
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy weight_logs_delete_own on weight_logs
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy progress_photos_select_own on progress_photos
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy progress_photos_insert_own on progress_photos
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy progress_photos_update_own on progress_photos
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy progress_photos_delete_own on progress_photos
  for delete to authenticated
  using ((select auth.uid()) = user_id);
