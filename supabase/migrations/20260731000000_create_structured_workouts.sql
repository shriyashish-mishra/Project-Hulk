-- Structured workout logging: a reusable library of exercises, templates
-- built from them, and live sessions that track sets/reps/weight as they
-- happen. None of this replaces workout_logs — completing a session
-- writes a canonical free-text summary through the same saveWorkoutLog
-- upsert the manual entry form already uses, so the AI report pipeline
-- (src/lib/nightly-report/*) needs zero changes and never learns a
-- template was involved. Same user_id-scoped RLS shape as
-- food_presets/workout_presets (20260717120000).

create table exercise_library (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (btrim(name) <> ''),
  category text not null check (category in ('strength', 'cardio')),
  default_unit text not null default 'kg' check (default_unit in ('kg', 'lbs')),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table workout_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (btrim(name) <> ''),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One row per exercise on a template. default_weight_unit is its own
-- column (not just read from exercise_library) so a template can pin a
-- unit independent of the library's default.
create table template_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  template_id uuid not null references workout_templates (id) on delete cascade,
  exercise_id uuid not null references exercise_library (id) on delete restrict,
  position integer not null,
  default_sets integer,
  default_reps integer,
  default_weight numeric,
  default_weight_unit text check (default_weight_unit in ('kg', 'lbs')),
  default_rest_seconds integer,
  default_duration_minutes integer,
  default_incline_percent numeric,
  default_speed_kph numeric,
  notes text
);

-- One row per "Start Workout" click. template_name_snapshot survives the
-- source template being renamed or deleted later.
create table workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  template_id uuid references workout_templates (id) on delete set null,
  template_name_snapshot text not null,
  logged_on date not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  total_calories integer,
  created_at timestamptz not null default now()
);

-- The live, editable rows behind the Active Workout Session page. Cardio
-- rows use sets_planned = 1 / sets_completed 0|1 as their single
-- completion toggle rather than a separate boolean column.
create table workout_session_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_id uuid not null references workout_sessions (id) on delete cascade,
  exercise_id uuid not null references exercise_library (id) on delete restrict,
  position integer not null,
  sets_planned integer,
  sets_completed integer not null default 0,
  reps integer,
  weight numeric,
  weight_unit text check (weight_unit in ('kg', 'lbs')),
  duration_minutes integer,
  incline_percent numeric,
  speed_kph numeric,
  notes text
);

create index exercise_library_user_id_idx on exercise_library (user_id);
create index workout_templates_user_id_idx on workout_templates (user_id);
create index template_exercises_template_id_idx on template_exercises (template_id);
create index template_exercises_user_id_idx on template_exercises (user_id);
create index workout_sessions_logged_on_idx on workout_sessions (logged_on);
create index workout_sessions_user_id_idx on workout_sessions (user_id);
create index workout_session_exercises_session_id_idx on workout_session_exercises (session_id);
create index workout_session_exercises_user_id_idx on workout_session_exercises (user_id);

alter table exercise_library enable row level security;
alter table workout_templates enable row level security;
alter table template_exercises enable row level security;
alter table workout_sessions enable row level security;
alter table workout_session_exercises enable row level security;

create policy exercise_library_select_own on exercise_library
  for select to authenticated using ((select auth.uid()) = user_id);
create policy exercise_library_insert_own on exercise_library
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy exercise_library_update_own on exercise_library
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy exercise_library_delete_own on exercise_library
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy workout_templates_select_own on workout_templates
  for select to authenticated using ((select auth.uid()) = user_id);
create policy workout_templates_insert_own on workout_templates
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy workout_templates_update_own on workout_templates
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy workout_templates_delete_own on workout_templates
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy template_exercises_select_own on template_exercises
  for select to authenticated using ((select auth.uid()) = user_id);
create policy template_exercises_insert_own on template_exercises
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy template_exercises_update_own on template_exercises
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy template_exercises_delete_own on template_exercises
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy workout_sessions_select_own on workout_sessions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy workout_sessions_insert_own on workout_sessions
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy workout_sessions_update_own on workout_sessions
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy workout_sessions_delete_own on workout_sessions
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy workout_session_exercises_select_own on workout_session_exercises
  for select to authenticated using ((select auth.uid()) = user_id);
create policy workout_session_exercises_insert_own on workout_session_exercises
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy workout_session_exercises_update_own on workout_session_exercises
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy workout_session_exercises_delete_own on workout_session_exercises
  for delete to authenticated using ((select auth.uid()) = user_id);
