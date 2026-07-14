-- A period is now a range (started_on, optionally ended_on), not just a
-- single point — needed so "mark as over" is a real, user-reported fact
-- instead of always assuming a fixed 5-day length.
alter table period_logs
  add column ended_on date;

alter table period_logs
  add constraint period_logs_ended_after_started
  check (ended_on is null or ended_on >= started_on);
