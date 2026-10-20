-- Run this once in the Supabase SQL editor (Project → SQL).
-- Teaching demo: anon can read and write. Add Auth later for production.

create table if not exists public.announcements (
  slug text primary key,
  date date,
  url text default '',
  display_order integer default 1,
  status text default 'published' check (status in ('published', 'draft')),
  top boolean default false,
  tag text default '',
  tag_zh text default '',
  title text not null default '',
  title_zh text not null default '',
  body text default '',
  body_zh text default '',
  images jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);

alter table public.announcements enable row level security;

drop policy if exists announcements_select on public.announcements;
drop policy if exists announcements_insert on public.announcements;
drop policy if exists announcements_update on public.announcements;
drop policy if exists announcements_delete on public.announcements;

create policy announcements_select on public.announcements
  for select to anon, authenticated using (true);

create policy announcements_insert on public.announcements
  for insert to anon, authenticated with check (true);

create policy announcements_update on public.announcements
  for update to anon, authenticated using (true) with check (true);

create policy announcements_delete on public.announcements
  for delete to anon, authenticated using (true);

grant select, insert, update, delete on public.announcements to anon, authenticated;
