-- Private bucket for progress photos. Never public — access is always via
-- short-lived signed URLs generated server-side. Path convention is
-- {user_id}/{captured_on}_{view_type}_{uuid}.jpg, so ownership can be
-- enforced by matching the first path segment against auth.uid(), the
-- same ownership-predicate pattern used everywhere else in this schema.

insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

create policy progress_photos_storage_select_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy progress_photos_storage_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy progress_photos_storage_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy progress_photos_storage_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
