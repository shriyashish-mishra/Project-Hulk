-- Nightly AI feedback loop: the user manually pastes Claude's response
-- (generated from a prompt exported by the app) back in, and the app
-- extracts + stores the structured JSON. parsed_json is the source of
-- truth; the score/summary columns are denormalized for fast reads on
-- the dashboard and report list without unpacking JSON each time.
-- One report per day: re-importing a fresh response replaces it.
create table daily_ai_reports (
  id uuid primary key default gen_random_uuid(),
  report_date date not null,
  prompt_markdown text not null,
  raw_response text not null,
  parsed_json jsonb not null,
  nutrition_score integer not null check (nutrition_score between 0 and 100),
  workout_score integer not null check (workout_score between 0 and 100),
  overall_score integer not null check (overall_score between 0 and 100),
  coach_summary text not null check (btrim(coach_summary) <> ''),
  created_at timestamptz not null default now(),
  unique (report_date)
);

create index daily_ai_reports_report_date_idx on daily_ai_reports (report_date);

alter table daily_ai_reports enable row level security;

-- No auth yet (deferred to a future milestone): open policy so the
-- publishable key can read/write. Replace with a user_id = auth.uid()
-- predicate once accounts ship.
create policy "daily_ai_reports_open_access"
on daily_ai_reports
for all
to anon, authenticated
using (true)
with check (true);
