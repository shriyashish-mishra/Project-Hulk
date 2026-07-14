-- Combines the 2-4 separate round-trips getUserContext() previously made
-- (profile, latest weight, latest period log, all period logs) into one.
-- security invoker (not definer) means this runs with the CALLING role's
-- privileges — RLS on profiles/weight_logs/period_logs still applies
-- exactly as if the client queried them directly, no privilege escalation,
-- no service-role key involved.
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
    'period_starts', (
      select coalesce(jsonb_agg(pl.started_on order by pl.started_on asc), '[]'::jsonb)
      from public.period_logs pl
      where pl.user_id = (select auth.uid())
    )
  );
$$;

grant execute on function get_user_context() to authenticated;
