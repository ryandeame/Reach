begin;

create or replace function public.get_daily_unique_outreach_contact_count(
  start_at timestamptz,
  end_at timestamptz
)
returns integer
language sql
stable
security invoker
set search_path = public
as $$
  select count(distinct rol.person_id)::integer
  from public.reach_outreach_log as rol
  where rol."timestamp" >= start_at
    and rol."timestamp" < end_at;
$$;

grant execute on function public.get_daily_unique_outreach_contact_count(timestamptz, timestamptz)
  to anon, authenticated;

commit;
