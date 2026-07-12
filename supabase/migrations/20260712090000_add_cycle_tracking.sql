-- Entirely opt-in: no row here means the feature is simply unused for that
-- user. One row per period start (mirrors weight_logs' one-event-per-row
-- pattern) rather than a single mutable "last period" field on profiles,
-- so history is preserved and an average cycle length can eventually be
-- computed from real data instead of a guess.
create table period_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  started_on date not null,
  created_at timestamptz not null default now(),
  unique (user_id, started_on)
);

create index period_logs_user_started_idx on period_logs (user_id, started_on);

alter table period_logs enable row level security;

create policy period_logs_select_own on period_logs
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy period_logs_insert_own on period_logs
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy period_logs_update_own on period_logs
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy period_logs_delete_own on period_logs
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- User-adjustable estimate, used until enough period_logs history exists
-- to compute a real average. Nullable — absence just means "use the
-- default assumption," never a forced field.
alter table profiles
  add column average_cycle_length_days integer;
