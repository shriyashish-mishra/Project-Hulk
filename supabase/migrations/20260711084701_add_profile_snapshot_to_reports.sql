-- Minimal historical-context anchor: what the user's goal/targets were on
-- the day this report was generated, so a later goal change never silently
-- reinterprets an already-generated report. Not full event sourcing — just
-- the small set of profile fields that actually change coaching meaning.
alter table daily_ai_reports
  add column profile_snapshot jsonb;
