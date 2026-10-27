-- Incremental alumni + admin-profile SQL. Paste into the Supabase SQL editor and Run.

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

create table if not exists public.alumni (
  id uuid primary key default gen_random_uuid(),
  alumni_no text unique,
  name text not null default '',
  name_zh text not null default '',
  graduation_year integer,
  program text not null default 'imMBA',
  email text not null default '',
  phone text not null default '',
  company text not null default '',
  job_title text not null default '',
  industry text not null default '',
  city text not null default '',
  country text not null default '',
  notes text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists alumni_name_idx on public.alumni (name);
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
