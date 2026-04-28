begin;

drop function if exists public.get_daily_job_application_count(timestamptz, timestamptz);
drop function if exists public.get_recent_daily_job_application_activity(date, integer, text);
drop function if exists public.get_recent_daily_job_application_elapsed_hours(date, integer, text);

drop table if exists public.reach_job_application_log;

create table if not exists public.reach_job_application_log (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.reach_companies (id) on delete cascade,
  title text not null,
  location text,
  submitted_resume text,
  job_post_url text,
  notes text,
  "timestamp" timestamptz not null default now()
);

create index if not exists reach_job_application_log_company_id_idx
  on public.reach_job_application_log (company_id);

create index if not exists reach_job_application_log_timestamp_idx
  on public.reach_job_application_log ("timestamp" desc);

alter table public.reach_job_application_log enable row level security;

create policy "open access reach_job_application_log"
  on public.reach_job_application_log
  for all
  to anon, authenticated
  using (true)
  with check (true);

create or replace function public.get_daily_job_application_count(
  start_at timestamptz,
  end_at timestamptz
)
returns integer
language sql
stable
security invoker
set search_path = public
as $$
  select count(*)::integer
  from public.reach_job_application_log as rjal
  where rjal."timestamp" >= start_at
    and rjal."timestamp" < end_at;
$$;

grant execute on function public.get_daily_job_application_count(timestamptz, timestamptz)
  to anon, authenticated;

create or replace function public.get_recent_daily_job_application_activity(
  start_on date,
  day_count integer default 10,
  timezone_name text default 'UTC'
)
returns table (
  activity_date date,
  application_count integer
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
  scoped_applications as (
    select
      (rjal."timestamp" at time zone timezone_name)::date as activity_date
    from public.reach_job_application_log as rjal
    cross join bounds
    where rjal."timestamp" >= (start_on::timestamp at time zone timezone_name)
      and rjal."timestamp" < ((start_on + bounds.safe_day_count)::timestamp at time zone timezone_name)
  )
  select
    days.activity_date,
    count(scoped_applications.activity_date)::integer as application_count
  from days
  left join scoped_applications
    on scoped_applications.activity_date = days.activity_date
  group by days.activity_date
  order by days.activity_date;
$$;

grant execute on function public.get_recent_daily_job_application_activity(date, integer, text)
  to anon, authenticated;

create or replace function public.get_recent_daily_job_application_elapsed_hours(
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
  scoped_applications as (
    select
      (rjal."timestamp" at time zone timezone_name)::date as activity_date,
      rjal."timestamp"
    from public.reach_job_application_log as rjal
    cross join bounds
    where rjal."timestamp" >= (start_on::timestamp at time zone timezone_name)
      and rjal."timestamp" < ((start_on + bounds.safe_day_count)::timestamp at time zone timezone_name)
  ),
  daily_spans as (
    select
      scoped_applications.activity_date,
      round(
        (
          extract(
            epoch from max(scoped_applications."timestamp") - min(scoped_applications."timestamp")
          ) / 3600.0
        )::numeric,
        1
      )::double precision as elapsed_hours
    from scoped_applications
    group by scoped_applications.activity_date
  )
  select
    days.activity_date,
    coalesce(daily_spans.elapsed_hours, 0)::double precision as elapsed_hours
  from days
  left join daily_spans
    on daily_spans.activity_date = days.activity_date
  order by days.activity_date;
$$;

grant execute on function public.get_recent_daily_job_application_elapsed_hours(date, integer, text)
  to anon, authenticated;

commit;
