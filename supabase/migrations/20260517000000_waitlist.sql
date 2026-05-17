-- GiriFlow: waitlist signups
-- Run once in your Supabase project (SQL editor or `supabase db push`).

create extension if not exists "pgcrypto";

-- citext lives in a dedicated `extensions` schema (Supabase best practice).
create schema if not exists extensions;
create extension if not exists "citext" with schema extensions;

create table if not exists public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  source      text,
  referrer    text,
  user_agent  text,
  created_at  timestamptz not null default now()
);

-- Case-insensitive uniqueness via expression index. App normalises with
-- toLowerCase() before insert, but this protects against direct SQL paths.
create unique index if not exists waitlist_email_lower_key
  on public.waitlist (lower(email));

alter table public.waitlist enable row level security;

drop policy if exists "anyone can join waitlist" on public.waitlist;
create policy "anyone can join waitlist"
  on public.waitlist
  for insert
  to anon, authenticated
  with check (
    char_length(email) between 5 and 254
    and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  );

-- No SELECT / UPDATE / DELETE policies on purpose — only the service_role
-- (used in admin tooling or edge functions) can read or modify the list.

comment on table public.waitlist is 'Early-access signups from the marketing site.';
