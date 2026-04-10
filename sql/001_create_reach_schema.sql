begin;

create extension if not exists pgcrypto;

drop table if exists public.reach_outreach_log;
drop table if exists public.reach_people;
drop table if exists public.reach_companies;

create table if not exists public.reach_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  phone text,
  website text
);

create table if not exists public.reach_people (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  linkedin text,
  company_id uuid references public.reach_companies (id) on delete set null
);

create table if not exists public.reach_outreach_log (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.reach_people (id) on delete cascade,
  comm_type text not null,
  "timestamp" timestamptz not null default now()
);

create index if not exists reach_people_company_id_idx
  on public.reach_people (company_id);

create index if not exists reach_outreach_log_person_id_idx
  on public.reach_outreach_log (person_id);

create index if not exists reach_outreach_log_timestamp_idx
  on public.reach_outreach_log ("timestamp" desc);

alter table public.reach_companies enable row level security;
alter table public.reach_people enable row level security;
alter table public.reach_outreach_log enable row level security;

create policy "open access reach_companies"
  on public.reach_companies
  for all
  to anon, authenticated
  using (true)
  with check (true);

create policy "open access reach_people"
  on public.reach_people
  for all
  to anon, authenticated
  using (true)
  with check (true);

create policy "open access reach_outreach_log"
  on public.reach_outreach_log
  for all
  to anon, authenticated
  using (true)
  with check (true);

commit;
