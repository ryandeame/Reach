begin;

create table if not exists public.reach_social_post_log (
  id uuid primary key default gen_random_uuid(),
  target_entity text not null,
  vector text not null,
  details text,
  "timestamp" timestamptz not null default now(),
  constraint reach_social_post_log_target_entity_check
    check (target_entity in ('LinkedIn', 'Instagram', 'Facebook', 'Twitter/X')),
  constraint reach_social_post_log_vector_check
    check (vector in ('Post', 'Reel', 'Story'))
);

create index if not exists reach_social_post_log_timestamp_idx
  on public.reach_social_post_log ("timestamp" desc);

alter table public.reach_social_post_log enable row level security;

create policy "open access reach_social_post_log"
  on public.reach_social_post_log
  for all
  to anon, authenticated
  using (true)
  with check (true);

create or replace function public.get_daily_social_post_count(
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
  from public.reach_social_post_log as rspl
  where rspl."timestamp" >= start_at
    and rspl."timestamp" < end_at;
$$;

grant execute on function public.get_daily_social_post_count(timestamptz, timestamptz)
  to anon, authenticated;

commit;
