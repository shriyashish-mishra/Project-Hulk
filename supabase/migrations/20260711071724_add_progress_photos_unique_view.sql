-- One photo per view per day, matching the "replace" UX requirement and
-- the same one-entry-per-day convention already used by food/workout/
-- water/sleep/weight logs. No existing rows, safe to add directly.

alter table progress_photos
  add constraint progress_photos_user_captured_view_key
  unique (user_id, captured_on, view_type);
