begin;

create or replace function public.get_recent_daily_unique_outreach_activity(
  start_on date,
  day_count integer default 10,
  timezone_name text default 'UTC'
)
returns table (
  activity_date date,
  unique_contacts integer
)
language sql
stable
security invoker
set search_path = public
as $$
  with bounds as (
    select greatest(1, least(coalesce(day_count, 10), 31))::integer as safe_day_count
  ),
  days as (
    select generate_series(
      start_on,
      start_on + (bounds.safe_day_count - 1),
      interval '1 day'
    )::date as activity_date
    from bounds
  ),
  scoped_logs as (
    select
      rol.person_id,
      (rol."timestamp" at time zone timezone_name)::date as activity_date
    from public.reach_outreach_log as rol
    cross join bounds
    where rol."timestamp" >= (start_on::timestamp at time zone timezone_name)
      and rol."timestamp" < ((start_on + bounds.safe_day_count)::timestamp at time zone timezone_name)
  )
  select
    days.activity_date,
    count(distinct scoped_logs.person_id)::integer as unique_contacts
  from days
  left join scoped_logs
    on scoped_logs.activity_date = days.activity_date
  group by days.activity_date
  order by days.activity_date;
$$;

grant execute on function public.get_recent_daily_unique_outreach_activity(date, integer, text)
  to anon, authenticated;

commit;
