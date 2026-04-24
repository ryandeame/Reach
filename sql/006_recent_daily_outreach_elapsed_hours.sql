begin;

create or replace function public.get_recent_daily_outreach_elapsed_hours(
  start_on date,
  day_count integer default 10,
  timezone_name text default 'UTC'
)
returns table (
  activity_date date,
  elapsed_hours double precision
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
      (rol."timestamp" at time zone timezone_name)::date as activity_date,
      rol."timestamp"
    from public.reach_outreach_log as rol
    cross join bounds
    where rol."timestamp" >= (start_on::timestamp at time zone timezone_name)
      and rol."timestamp" < ((start_on + bounds.safe_day_count)::timestamp at time zone timezone_name)
  ),
  daily_spans as (
    select
      scoped_logs.activity_date,
      round(
        (extract(epoch from max(scoped_logs."timestamp") - min(scoped_logs."timestamp")) / 3600.0)::numeric,
        1
      )::double precision as elapsed_hours
    from scoped_logs
    group by scoped_logs.activity_date
  )
  select
    days.activity_date,
    coalesce(daily_spans.elapsed_hours, 0)::double precision as elapsed_hours
  from days
  left join daily_spans
    on daily_spans.activity_date = days.activity_date
  order by days.activity_date;
$$;

grant execute on function public.get_recent_daily_outreach_elapsed_hours(date, integer, text)
  to anon, authenticated;

commit;
