create or replace function private.auto_confirm_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is null then
    new.email_confirmed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists auto_confirm_auth_user on auth.users;
create trigger auto_confirm_auth_user
  before insert on auth.users
  for each row
  execute function private.auto_confirm_auth_user();
