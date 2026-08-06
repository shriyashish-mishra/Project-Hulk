-- Every "what day/hour is it right now" computation in the app previously
-- assumed a single hardcoded timezone (Asia/Kolkata) because there was
-- only ever one real user. Going toward real signups, each account needs
-- its own timezone so "today" and "it's getting late" resolve correctly
-- for whoever is actually signed in. Captured at signup via the browser's
-- own Intl timezone detection, not asked as a manual picker step.
-- Nullable + no backfill: existing rows (and any pre-signup edge case)
-- fall back to the app's flat default in code, exactly matching current
-- behavior until a real value is set.
alter table public.profiles add column timezone text;
