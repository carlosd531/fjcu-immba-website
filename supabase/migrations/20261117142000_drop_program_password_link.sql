-- Stop accepting a visitor password for any program-site account link.

drop function if exists public.link_program_admin(text, text);
drop function if exists private.link_program_admin(text, text);
