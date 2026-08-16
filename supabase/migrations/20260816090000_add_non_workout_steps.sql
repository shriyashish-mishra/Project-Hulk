-- Non-workout step count, entered directly by the user rather than inferred
-- by the AI from free-text workout logs. The nightly-report pipeline used
-- to rely on the model noticing a "16k steps" line buried in raw_text and
-- itemizing it itself — it repeatedly missed doing so entirely (see
-- 7222e15), or itemized it but estimated its calorie cost from nothing.
-- Structured input removes the model from this number's existence
-- altogether: the app reads it directly and computes its calorie
-- contribution with the same deterministic per-1,000-steps formula
-- already used elsewhere (profile/targets.ts), so it can never again be
-- silently dropped or guessed.
alter table workout_logs
  add column non_workout_steps integer check (non_workout_steps is null or non_workout_steps >= 0);
