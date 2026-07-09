-- Workout logging follows the exact same free-form philosophy as food
-- logging: one entry per day, raw text only. Claude interprets sets,
-- reps, and weight during nightly analysis — no structured exercise
-- form here.
create table workout_logs (
  id uuid primary key default gen_random_uuid(),
  raw_text text not null check (btrim(raw_text) <> ''),
  logged_on date not null,
  created_at timestamptz not null default now(),
  unique (logged_on)
);

create index workout_logs_logged_on_idx on workout_logs (logged_on);

alter table workout_logs enable row level security;

-- No auth yet (deferred to a future milestone): open policy so the
-- publishable key can read/write. Replace with a user_id = auth.uid()
-- predicate once accounts ship.
create policy "workout_logs_open_access"
on workout_logs
for all
to anon, authenticated
using (true)
with check (true);
