-- The program-site password link was removed.
-- A visitor's password is checked only against this market.

drop function if exists public.link_program_admin(text, text);
drop function if exists private.link_program_admin(text, text);

create or replace function private.protect_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and private.current_role() is distinct from 'admin' then
    if new.role is distinct from old.role then
      raise exception 'role change not allowed';
    end if;
    if old.requested_role is not null and new.requested_role is distinct from old.requested_role then
      raise exception 'request already filed';
    end if;
    if new.requested_role is not null and new.requested_role not in ('buyer', 'seller') then
      raise exception 'invalid request';
    end if;
  end if;
  return new;
end;
$$;
