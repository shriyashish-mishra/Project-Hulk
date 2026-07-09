-- Product direction change: capture quickly, analyze deeply.
-- Food logging no longer asks for quantity/calories/macros during the
-- day — it only records the meal type and exactly what the user typed.
-- Claude derives structured nutrition data from raw_text in a later
-- milestone (nightly report import), so raw_text is the source of truth.
drop table if exists food_logs;

create table food_logs (
  id uuid primary key default gen_random_uuid(),
  meal_type meal_type not null,
  raw_text text not null check (btrim(raw_text) <> ''),
  logged_on date not null,
  created_at timestamptz not null default now()
);

create index food_logs_logged_on_idx on food_logs (logged_on);

alter table food_logs enable row level security;

-- No auth yet (deferred to a future milestone): open policy so the
-- publishable key can read/write. Replace with a user_id = auth.uid()
-- predicate once accounts ship.
create policy "food_logs_open_access"
on food_logs
for all
to anon, authenticated
using (true)
with check (true);
