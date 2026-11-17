-- Signups are not confirmed automatically. A person must open the email link.

drop trigger if exists confirm_on_signup on auth.users;
drop function if exists private.confirm_new_user();
