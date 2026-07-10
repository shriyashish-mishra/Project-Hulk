-- Auth is being introduced. This adds user_id as nullable so existing
-- unowned rows (logged before accounts existed) keep working under the
-- current open policies. Once the user has an account and existing
-- rows are backfilled to it, a follow-up migration makes user_id
-- NOT NULL and replaces these open policies with auth.uid() = user_id
-- ownership checks. Do not tighten RLS in this migration — that would
-- lock the user out of their own data before the backfill happens.
alter table food_logs
  add column user_id uuid references auth.users (id) on delete cascade;

alter table workout_logs
  add column user_id uuid references auth.users (id) on delete cascade;

alter table daily_ai_reports
  add column user_id uuid references auth.users (id) on delete cascade;

create index food_logs_user_id_idx on food_logs (user_id);
create index workout_logs_user_id_idx on workout_logs (user_id);
create index daily_ai_reports_user_id_idx on daily_ai_reports (user_id);

-- The "one entry per day" uniqueness was scoped to (meal_type, logged_on)
-- etc. with no user dimension — once more than one account can exist,
-- that would let two different users' same-day entries collide. Widen
-- each constraint to include user_id so it enforces "one per day, per
-- user" instead of "one per day, globally".
alter table food_logs
  drop constraint food_logs_meal_type_logged_on_key,
  add constraint food_logs_user_meal_date_key unique (user_id, meal_type, logged_on);

alter table workout_logs
  drop constraint workout_logs_logged_on_key,
  add constraint workout_logs_user_date_key unique (user_id, logged_on);

alter table daily_ai_reports
  drop constraint daily_ai_reports_report_date_key,
  add constraint daily_ai_reports_user_date_key unique (user_id, report_date);
