-- Lets a user override any auto-computed nutrition/recovery target, the
-- same pattern the existing protein_target_g column already uses: null
-- means "keep using the automatic calculation," a value means "use
-- exactly this number." calorie_target_kcal stores a single number (the
-- +/-100kcal range shown elsewhere is still derived from it, not stored
-- separately). Purely additive — every existing row gets null in all six
-- columns, identical behavior to today.
alter table public.profiles
  add column calorie_target_kcal integer,
  add column carbs_target_g integer,
  add column fat_target_g integer,
  add column fiber_target_g integer,
  add column hydration_target_glasses integer,
  add column sleep_target_minutes integer;
