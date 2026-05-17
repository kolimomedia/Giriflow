-- GiriFlow: waitlist signups
-- Run once in your Supabase project (SQL editor or `supabase db push`).

create extension if not exists "pgcrypto";

create table if not exists public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       citext not null,
  source      text,
  referrer    text,
  user_agent  text,
  created_at  timestamptz not null default now()
);

-- Email should be unique once normalised; citext handles case-insensitive equality.
create extension if not exists "citext";
do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'waitlist_email_key'
  ) then
    create unique index waitlist_email_key on public.waitlist (email);
  end if;
end$$;

-- RLS: anyone (anon) can insert their own row; nobody can read except service_role.
alter table public.waitlist enable row level security;

drop policy if exists "anyone can join waitlist" on public.waitlist;
create policy "anyone can join waitlist"
  on public.waitlist
  for insert
  to anon, authenticated
  with check (true);

-- No select / update / delete policies on purpose — only the service_role
-- (used in admin tooling or edge functions) can read or modify the list.

comment on table public.waitlist is 'Early-access signups from the marketing site.';
