begin;

alter table public.reach_people
  add column if not exists location text;

commit;
