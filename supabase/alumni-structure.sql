-- Align alumni columns with alumni_sample_20_english.csv. Run in the SQL editor.
-- Name, Student ID, Department, Degree Program, Admission Year,
-- Graduation Year, Email, Phone, Current Company, Job Title
-- Degree Program: Bachelor's Program | Master's Program | Doctoral Program
-- Years are ROC academic years (e.g. 114).

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

alter table public.alumni alter column department set default '';
alter table public.alumni alter column degree_program set default 'Master''s Program';

create unique index if not exists alumni_student_id_uidx on public.alumni (student_id);
create index if not exists alumni_full_name_idx on public.alumni (full_name);
create index if not exists alumni_year_idx on public.alumni (graduation_year);
create index if not exists alumni_company_idx on public.alumni (company);
