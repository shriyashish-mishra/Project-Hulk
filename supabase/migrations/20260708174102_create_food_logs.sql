-- Meal sections are a fixed set for this milestone (Breakfast/Lunch/Snacks/Dinner).
create type meal_type as enum ('breakfast', 'lunch', 'snacks', 'dinner');

create table food_logs (
  id uuid primary key default gen_random_uuid(),
  meal_type meal_type not null,
  name text not null check (btrim(name) <> ''),
  quantity numeric(7, 2) not null check (quantity > 0),
  unit text not null check (btrim(unit) <> ''),
  calories integer not null check (calories >= 0),
  protein_grams numeric(6, 2) not null check (protein_grams >= 0),
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
