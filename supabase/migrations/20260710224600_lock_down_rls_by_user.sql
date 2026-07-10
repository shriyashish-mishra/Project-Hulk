-- Backfill of existing rows to the single account happened out-of-band
-- (one-time data migration, not schema). user_id is now populated on every
-- row, so it's safe to require it and replace the open policies with
-- real per-user ownership checks.

alter table food_logs alter column user_id set not null;
alter table workout_logs alter column user_id set not null;
alter table daily_ai_reports alter column user_id set not null;

drop policy if exists food_logs_open_access on food_logs;
drop policy if exists workout_logs_open_access on workout_logs;
drop policy if exists daily_ai_reports_open_access on daily_ai_reports;

create policy food_logs_select_own on food_logs
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy food_logs_insert_own on food_logs
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy food_logs_update_own on food_logs
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy food_logs_delete_own on food_logs
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy workout_logs_select_own on workout_logs
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy workout_logs_insert_own on workout_logs
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy workout_logs_update_own on workout_logs
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy workout_logs_delete_own on workout_logs
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy daily_ai_reports_select_own on daily_ai_reports
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy daily_ai_reports_insert_own on daily_ai_reports
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy daily_ai_reports_update_own on daily_ai_reports
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy daily_ai_reports_delete_own on daily_ai_reports
  for delete to authenticated
  using ((select auth.uid()) = user_id);
