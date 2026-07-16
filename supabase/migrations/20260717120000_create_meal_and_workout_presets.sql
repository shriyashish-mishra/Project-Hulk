-- Saved presets: meals and workout regimes the user does regularly, so
-- they can pick from a shortlist instead of retyping raw text every day.
-- Same free-form raw_text philosophy as food_logs/workout_logs, and not
-- scoped to a meal type or date — a preset can be applied to any meal
-- slot on any day.
create table food_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  raw_text text not null check (btrim(raw_text) <> ''),
  created_at timestamptz not null default now()
);

create table workout_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  raw_text text not null check (btrim(raw_text) <> ''),
  created_at timestamptz not null default now()
);

create index food_presets_user_id_idx on food_presets (user_id);
create index workout_presets_user_id_idx on workout_presets (user_id);

alter table food_presets enable row level security;
alter table workout_presets enable row level security;

create policy food_presets_select_own on food_presets
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy food_presets_insert_own on food_presets
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy food_presets_update_own on food_presets
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy food_presets_delete_own on food_presets
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy workout_presets_select_own on workout_presets
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy workout_presets_insert_own on workout_presets
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy workout_presets_update_own on workout_presets
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy workout_presets_delete_own on workout_presets
  for delete to authenticated
  using ((select auth.uid()) = user_id);
