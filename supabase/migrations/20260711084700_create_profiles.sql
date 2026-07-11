-- Profiles: the foundation the rest of the product personalizes against.
-- 1:1 with auth.users — `id` is both PK and FK, no separate user_id column.
-- Weight is deliberately NOT stored here; weight_logs remains the sole
-- source of truth for "latest weight" (see lib/weight/queries.ts).
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  date_of_birth date,
  biological_sex text check (biological_sex in ('female', 'male')),
  -- Independent from biological_sex on purpose: sex feeds BMR math,
  -- muscle_map_model only ever selects which SVG body asset renders.
  muscle_map_model text not null default 'female'
    check (muscle_map_model in ('female', 'male')),
  height_cm numeric(5, 1),
  primary_goal text
    check (primary_goal in ('lose_fat', 'build_muscle', 'recomposition', 'maintain')),
  target_weight_kg numeric(5, 2),
  activity_level text
    check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  training_frequency text
    check (training_frequency in ('0_1', '2_3', '4_5', '6_plus')),
  protein_target_g integer,
  units_preference text not null default 'metric'
    check (units_preference in ('metric', 'imperial')),
  -- null = onboarding incomplete. This is the flag requireOnboardedUser() checks.
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy profiles_select_own on profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy profiles_insert_own on profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

create policy profiles_update_own on profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy profiles_delete_own on profiles
  for delete to authenticated
  using ((select auth.uid()) = id);
