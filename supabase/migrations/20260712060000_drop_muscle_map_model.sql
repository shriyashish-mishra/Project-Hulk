-- Muscle map is now strictly derived from biological_sex (product decision
-- after testing: no independent choice) — a separate column would only be
-- able to drift out of sync with biological_sex, so it's removed rather
-- than kept in lockstep manually.
alter table profiles drop column muscle_map_model;
