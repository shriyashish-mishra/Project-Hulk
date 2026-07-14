-- Returns full period ranges (start + optional end) instead of just start
-- dates, so the app can tell whether the most recent period is still
-- ongoing (ended_on is null) and compute a real average period length.
create or replace function get_user_context()
returns jsonb
language sql
security invoker
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'profile', (
      select to_jsonb(p) from public.profiles p
      where p.id = (select auth.uid())
    ),
    'latest_weight', (
      select to_jsonb(w) from public.weight_logs w
      where w.user_id = (select auth.uid())
      order by w.measured_on desc
      limit 1
    ),
    'periods', (
      select coalesce(
        jsonb_agg(
          jsonb_build_object('started_on', pl.started_on, 'ended_on', pl.ended_on)
          order by pl.started_on asc
        ),
        '[]'::jsonb
      )
      from public.period_logs pl
      where pl.user_id = (select auth.uid())
    )
  );
$$;

grant execute on function get_user_context() to authenticated;
