-- Cached MET (Metabolic Equivalent of Task) classification per exercise,
-- used by the workout-session calorie estimate instead of the flat "5 kcal
-- per set / 6 kcal per cardio minute" placeholder (same MET value for a
-- goblet squat as a bicep curl). Classified once per exercise via a single
-- Gemini call the first time it's actually used in a session
-- (ensureExerciseMetValue, src/lib/exercise-library/met.ts), then cached
-- here permanently — every later set/rep/weight/duration change, including
-- a "+Variation" entry, scales this cached value with deterministic local
-- arithmetic (src/lib/workout-sessions/estimate.ts), never a repeat call.
-- Nullable: absent until first classified, or if classification failed —
-- the estimate falls back to the flat formula for that one exercise rather
-- than blocking on it.
alter table exercise_library
  add column met_value numeric check (met_value is null or met_value > 0);
