begin;

alter table public.reach_people
  add column if not exists title text;

alter table public.reach_outreach_log
  add column if not exists message text;

commit;
