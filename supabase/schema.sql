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

-- Administrator profile details for the approval dashboard
alter table public.profiles add column if not exists full_name text not null default '';
alter table public.profiles add column if not exists reviewed_at timestamptz;
alter table public.profiles add column if not exists reviewed_by uuid;

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
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    assigned
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = case
          when excluded.full_name <> '' then excluded.full_name
          else public.profiles.full_name
        end;
  return new;
end;
$$;

grant update (role, updated_at, reviewed_at, reviewed_by, full_name) on public.profiles to authenticated;

-- Alumni database (multi-admin back office)
-- Required fields match alumni_sample_20_english.csv:
-- Name, Student ID, Department, Degree Program, Admission Year,
-- Graduation Year, Email, Phone, Current Company, Job Title
-- Degree Program values: Bachelor's Program | Master's Program | Doctoral Program
-- Years are ROC academic years (e.g. 114).
-- Any approved admin may add, edit, delete, and import.
-- Triggers write an audit row: who, when, what changed.

create table if not exists public.alumni (
  id uuid primary key default gen_random_uuid(),
  full_name text not null default '',
  student_id text unique,
  department text not null default '',
  degree_program text not null default 'Master''s Program',
  admission_year integer,
  graduation_year integer,
  email text not null default '',
  phone text not null default '',
  company text not null default '',
  job_title text not null default '',
  notes text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid,
  updated_by uuid
);

-- Align an existing alumni table with the course field list.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'alumni' and column_name = 'alumni_no'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'alumni' and column_name = 'student_id'
  ) then
    alter table public.alumni rename column alumni_no to student_id;
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'alumni' and column_name = 'name'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'alumni' and column_name = 'full_name'
  ) then
    alter table public.alumni rename column name to full_name;
  end if;
end $$;

alter table public.alumni add column if not exists full_name text not null default '';
alter table public.alumni add column if not exists student_id text;
alter table public.alumni add column if not exists department text not null default '';
alter table public.alumni add column if not exists degree_program text not null default 'Master''s Program';
alter table public.alumni add column if not exists admission_year integer;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'alumni' and column_name = 'program'
  ) then
    update public.alumni
      set department = program
      where coalesce(department, '') in ('', 'imMBA') and coalesce(program, '') <> '';
  end if;
end $$;

alter table public.alumni drop column if exists alumni_no;
alter table public.alumni drop column if exists name;
alter table public.alumni drop column if exists name_zh;
alter table public.alumni drop column if exists program;
alter table public.alumni drop column if exists industry;
alter table public.alumni drop column if exists city;
alter table public.alumni drop column if exists country;

create unique index if not exists alumni_student_id_uidx on public.alumni (student_id);
create index if not exists alumni_full_name_idx on public.alumni (full_name);
create index if not exists alumni_year_idx on public.alumni (graduation_year);
create index if not exists alumni_company_idx on public.alumni (company);

create table if not exists public.alumni_audit (
  id uuid primary key default gen_random_uuid(),
  alumni_id uuid,
  action text not null check (action in ('insert', 'update', 'delete')),
  actor_id uuid,
  actor_email text not null default '',
  changed_at timestamptz not null default now(),
  before_data jsonb,
  after_data jsonb,
  changes jsonb not null default '{}'::jsonb
);

create index if not exists alumni_audit_changed_at_idx on public.alumni_audit (changed_at desc);
create index if not exists alumni_audit_alumni_id_idx on public.alumni_audit (alumni_id);

create or replace function public.alumni_changes(before_row jsonb, after_row jsonb)
returns jsonb
language plpgsql
immutable
as $$
declare
  result jsonb := '{}'::jsonb;
  k text;
begin
  for k in
    select jsonb_object_keys(coalesce(before_row, '{}'::jsonb) || coalesce(after_row, '{}'::jsonb))
  loop
    if k in ('updated_at', 'created_at', 'created_by', 'updated_by') then
      continue;
    end if;
    if coalesce(before_row -> k, 'null'::jsonb) is distinct from coalesce(after_row -> k, 'null'::jsonb) then
      result := result || jsonb_build_object(
        k,
        jsonb_build_object('from', before_row -> k, 'to', after_row -> k)
      );
    end if;
  end loop;
  return result;
end;
$$;

create or replace function public.alumni_audit_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  actor_mail text := '';
  before_row jsonb;
  after_row jsonb;
begin
  select email into actor_mail from public.profiles where id = actor;
  if actor_mail is null then
    actor_mail := coalesce(auth.jwt() ->> 'email', '');
  end if;

  if tg_op = 'INSERT' then
    after_row := to_jsonb(new);
    insert into public.alumni_audit (alumni_id, action, actor_id, actor_email, before_data, after_data, changes)
    values (new.id, 'insert', actor, actor_mail, null, after_row, public.alumni_changes('{}'::jsonb, after_row));
    return new;
  elsif tg_op = 'UPDATE' then
    before_row := to_jsonb(old);
    after_row := to_jsonb(new);
    insert into public.alumni_audit (alumni_id, action, actor_id, actor_email, before_data, after_data, changes)
    values (new.id, 'update', actor, actor_mail, before_row, after_row, public.alumni_changes(before_row, after_row));
    return new;
  else
    before_row := to_jsonb(old);
    insert into public.alumni_audit (alumni_id, action, actor_id, actor_email, before_data, after_data, changes)
    values (old.id, 'delete', actor, actor_mail, before_row, null, public.alumni_changes(before_row, '{}'::jsonb));
    return old;
  end if;
end;
$$;

drop trigger if exists alumni_audit_aiud on public.alumni;
create trigger alumni_audit_aiud
  after insert or update or delete on public.alumni
  for each row execute function public.alumni_audit_row();

alter table public.alumni enable row level security;
alter table public.alumni_audit enable row level security;

drop policy if exists alumni_admin_all on public.alumni;
drop policy if exists alumni_audit_select on public.alumni_audit;

create policy alumni_admin_all on public.alumni
  for all to authenticated
  using (public.is_content_admin())
  with check (public.is_content_admin());

create policy alumni_audit_select on public.alumni_audit
  for select to authenticated
  using (public.is_content_admin());

grant select, insert, update, delete on public.alumni to authenticated;
grant select on public.alumni_audit to authenticated;
grant execute on function public.alumni_changes(jsonb, jsonb) to authenticated;
