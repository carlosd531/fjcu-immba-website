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

-- Faculty back office (AdminFaculty)
-- Required columns: id, name, title, education, research_fields, email, phone,
-- website, image_url, category (full-time / adjunct), sort_order.
-- Extra bilingual + department + status columns keep EN/ZH records together.

create table if not exists public.faculty (
  id text primary key,
  name text not null default '',
  name_zh text not null default '',
  title text default '',
  title_zh text default '',
  education text default '',
  education_zh text default '',
  research_fields text default '',
  research_fields_zh text default '',
  department text default '',
  department_zh text default '',
  email text default '',
  phone text default '',
  website text default '',
  image_url text default '',
  category text default 'full-time' check (category in ('full-time', 'adjunct')),
  sort_order integer default 1,
  status text default 'published' check (status in ('published', 'draft')),
  updated_at timestamptz default now()
);

create index if not exists faculty_sort_order_idx on public.faculty (sort_order);

alter table public.faculty enable row level security;

drop policy if exists faculty_select on public.faculty;
drop policy if exists faculty_insert on public.faculty;
drop policy if exists faculty_update on public.faculty;
drop policy if exists faculty_delete on public.faculty;

create policy faculty_select on public.faculty
  for select to anon, authenticated using (true);

create policy faculty_insert on public.faculty
  for insert to anon, authenticated with check (true);

create policy faculty_update on public.faculty
  for update to anon, authenticated using (true) with check (true);

create policy faculty_delete on public.faculty
  for delete to anon, authenticated using (true);

grant select, insert, update, delete on public.faculty to anon, authenticated;

-- Authentication (who are you?) + Authorization (what may you do?)
-- Roles: pending | admin | super_admin | rejected
-- Flow: register → verify email → pending → super_admin approves → admin
-- The first verified account becomes super_admin so someone can approve others.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  role text not null default 'pending' check (role in ('pending', 'admin', 'super_admin', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned text := 'pending';
begin
  if not exists (select 1 from public.profiles where role = 'super_admin') then
    assigned := 'super_admin';
  end if;
  insert into public.profiles (id, email, role)
  values (new.id, coalesce(new.email, ''), assigned)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_content_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'super_admin')
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'super_admin'
  );
$$;

alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_select_super on public.profiles;
drop policy if exists profiles_update_super on public.profiles;

create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_super_admin());

create policy profiles_update_super on public.profiles
  for update to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

grant select on public.profiles to authenticated;
grant update (role, updated_at) on public.profiles to authenticated;

-- Public may read content. Only approved admins may write.
drop policy if exists announcements_insert on public.announcements;
drop policy if exists announcements_update on public.announcements;
drop policy if exists announcements_delete on public.announcements;
drop policy if exists announcements_write on public.announcements;
drop policy if exists faculty_insert on public.faculty;
drop policy if exists faculty_update on public.faculty;
drop policy if exists faculty_delete on public.faculty;
drop policy if exists faculty_write on public.faculty;

create policy announcements_write on public.announcements
  for all to authenticated
  using (public.is_content_admin())
  with check (public.is_content_admin());

create policy faculty_write on public.faculty
  for all to authenticated
  using (public.is_content_admin())
  with check (public.is_content_admin());

revoke insert, update, delete on public.announcements from anon;
revoke insert, update, delete on public.faculty from anon;
grant select on public.announcements to anon, authenticated;
grant select on public.faculty to anon, authenticated;
grant insert, update, delete on public.announcements to authenticated;
grant insert, update, delete on public.faculty to authenticated;
grant execute on function public.is_content_admin() to authenticated;
grant execute on function public.is_super_admin() to authenticated;
