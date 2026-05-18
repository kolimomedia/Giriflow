-- Web reference links attached to a post (research, source URLs, brand
-- guidelines, etc.). Stored as a jsonb array of {url, label?} objects so
-- we can attach a friendly title without a second table.
--
-- Safe to re-run.

alter table public.posts
  add column if not exists reference_links jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'posts_reference_links_is_array'
  ) then
    alter table public.posts
      add constraint posts_reference_links_is_array
      check (jsonb_typeof(reference_links) = 'array');
  end if;
end$$;

comment on column public.posts.reference_links is
  'Array of {url: text, label?: text} reference links displayed alongside the post.';
