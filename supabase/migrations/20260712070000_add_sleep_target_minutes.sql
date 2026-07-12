-- Mirrors water_logs.target_glasses: a per-day personalized target, seeded
-- automatically from the profile (age-banded, see lib/profile/targets.ts)
-- when the first sleep log of a day is created — never entered by the user.
alter table sleep_logs
  add column target_minutes integer not null default 480;
